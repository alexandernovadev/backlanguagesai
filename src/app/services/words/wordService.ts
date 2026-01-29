import Word from "../../db/models/Word";
import { IWord, ChatMessage } from "../../../../types/models";

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export class WordService {
  // Create a new word
  async createWord(wordData: IWord): Promise<IWord> {
    const word = new Word(wordData);
    return await word.save();
  }

  // Get a word by ID
  async getWordById(id: string): Promise<IWord | null> {
    return await Word.findById(id);
  }

  // Get all words with pagination, ordered by creation date
  async getWords(
    filters: {
      page?: number;
      limit?: number;
      wordUser?: string;
      difficulty?: string | string[];
      language?: string | string[];
      type?: string | string[];
      seenMin?: number;
      seenMax?: number;
      sortBy?: string;
      sortOrder?: string;
      definition?: string;
      IPA?: string;
      hasImage?: string;
      hasExamples?: string;
      hasSynonyms?: string;
      hasCodeSwitching?: string;
      spanishWord?: string;
      spanishDefinition?: string;
      createdAfter?: string;
      createdBefore?: string;
      updatedAfter?: string;
      updatedBefore?: string;
    } = {}
  ): Promise<PaginatedResult<IWord>> {
    const {
      page = 1,
      limit = 10,
      wordUser,
      difficulty,
      language,
      type,
      seenMin,
      seenMax,
      sortBy = "createdAt",
      sortOrder = "desc",
      definition,
      IPA,
      hasImage,
      hasExamples,
      hasSynonyms,
      hasCodeSwitching,
      spanishWord,
      spanishDefinition,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
    } = filters;

    const filter: Record<string, unknown> & { $or?: unknown[] } = {};

    const addOrConditions = (conditions: unknown[]) => {
      if (filter.$or && Array.isArray(filter.$or)) {
        (filter.$or as unknown[]).push(...conditions);
      } else {
        filter.$or = conditions;
      }
    };

    // Filtro por palabra (existente)
    if (wordUser) {
      filter.word = { $regex: wordUser, $options: "i" };
    }

    // Nuevo filtro por nivel
    if (difficulty) {
      if (Array.isArray(difficulty)) {
        // Múltiples dificultades
        const validDifficulties = difficulty.filter((d) =>
          ["easy", "medium", "hard"].includes(d)
        );
        if (validDifficulties.length > 0) {
          filter.difficulty = { $in: validDifficulties };
        }
      } else {
        // Una sola dificultad
        if (["easy", "medium", "hard"].includes(difficulty)) {
          filter.difficulty = difficulty;
        }
      }
    }

    // Nuevo filtro por idioma (anclado a códigos exactos)
    if (language) {
      if (Array.isArray(language)) {
        filter.language = { $in: language };
      } else {
        filter.language = { $in: [language] };
      }
    }

    // Nuevo filtro por tipo gramatical
    if (type) {
      if (Array.isArray(type)) {
        // Múltiples tipos
        filter.type = { $in: type };
      } else {
        // Un solo tipo
        filter.type = { $in: [type] };
      }
    }

    // Nuevo filtro por rango de vistas
    if (seenMin !== undefined || seenMax !== undefined) {
      const seenFilter: Record<string, number> = {};
      if (seenMin !== undefined) {
        seenFilter.$gte = seenMin;
      }
      if (seenMax !== undefined) {
        seenFilter.$lte = seenMax;
      }
      filter.seen = seenFilter;
    }

    // Nuevo filtro por definición
    if (definition) {
      filter.definition = { $regex: definition, $options: "i" };
    }

    // Nuevo filtro por IPA
    if (IPA) {
      filter.IPA = { $regex: IPA, $options: "i" };
    }

    // Nuevo filtro por palabras con/sin imagen
    if (hasImage === "true") {
      filter.img = { $exists: true, $nin: [null, ""] };
    } else if (hasImage === "false") {
      addOrConditions([
        { img: { $exists: false } },
        { img: null },
        { img: "" },
      ]);
    }

    // Nuevo filtro por palabras con/sin ejemplos
    if (hasExamples === "true") {
      filter.examples = { $exists: true, $ne: [] };
    } else if (hasExamples === "false") {
      addOrConditions([{ examples: { $exists: false } }, { examples: [] }]);
    }

    // Nuevo filtro por palabras con/sin sinónimos
    if (hasSynonyms === "true") {
      filter.sinonyms = { $exists: true, $ne: [] };
    } else if (hasSynonyms === "false") {
      addOrConditions([{ sinonyms: { $exists: false } }, { sinonyms: [] }]);
    }

    // Nuevo filtro por palabras con/sin code-switching
    if (hasCodeSwitching === "true") {
      filter.codeSwitching = { $exists: true, $ne: [] };
    } else if (hasCodeSwitching === "false") {
      addOrConditions([
        { codeSwitching: { $exists: false } },
        { codeSwitching: [] },
      ]);
    }

    // Nuevo filtro por palabra en español
    if (spanishWord) {
      filter["spanish.word"] = { $regex: spanishWord, $options: "i" };
    }

    // Nuevo filtro por definición en español
    if (spanishDefinition) {
      filter["spanish.definition"] = {
        $regex: spanishDefinition,
        $options: "i",
      };
    }

    // Filtros de fecha para createdAt
    if (createdAfter || createdBefore) {
      const createdAtFilter: Record<string, Date> = {};
      if (createdAfter) {
        createdAtFilter.$gte = new Date(createdAfter);
      }
      if (createdBefore) {
        createdAtFilter.$lte = new Date(createdBefore);
      }
      filter.createdAt = createdAtFilter;
    }

    // Filtros de fecha para updatedAt
    if (updatedAfter || updatedBefore) {
      const updatedAtFilter: Record<string, Date> = {};
      if (updatedAfter) {
        updatedAtFilter.$gte = new Date(updatedAfter);
      }
      if (updatedBefore) {
        updatedAtFilter.$lte = new Date(updatedBefore);
      }
      filter.updatedAt = updatedAtFilter;
    }

    const total = await Word.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    // Configurar ordenamiento
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy] = sortDirection as 1 | -1;

    const data = await Word.find(filter)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return { data, total, page, pages };
  }

  async updateWord(
    id: string,
    updateData: Partial<IWord>
  ): Promise<IWord | null> {
    return await Word.findByIdAndUpdate(id, updateData, { new: true });
  }

  async updateWordDifficulty(
    id: string,
    difficulty: string
  ): Promise<{ difficulty?: string } | null> {
    return await Word.findByIdAndUpdate(
      id,
      { difficulty },
      { new: true, projection: { difficulty: 1 } }
    );
  }

  async updateWordExamples(
    id: string,
    examples: string[]
  ): Promise<{ examples?: string[] } | null> {
    return await Word.findByIdAndUpdate(
      id,
      { examples },
      { new: true, projection: { examples: 1 } }
    );
  }

  async updateWordCodeSwitching(
    id: string,
    codeSwitching: string[]
  ): Promise<{ codeSwitching?: string[] } | null> {
    return await Word.findByIdAndUpdate(
      id,
      { codeSwitching },
      { new: true, projection: { codeSwitching: 1 } }
    );
  }

  async updateWordSynonyms(
    id: string,
    synonyms: string[]
  ): Promise<{ sinonyms?: string[] } | null> {
    return await Word.findByIdAndUpdate(
      id,
      { sinonyms: synonyms },
      { new: true, projection: { sinonyms: 1 } }
    );
  }

  async updateWordType(
    id: string,
    type: string[]
  ): Promise<{ type?: string[] } | null> {
    return await Word.findByIdAndUpdate(
      id,
      { type },
      { new: true, projection: { type: 1 } }
    );
  }

  async updateWordImg(
    id: string,
    img: string
  ): Promise<{ img?: string } | null> {
    return await Word.findByIdAndUpdate(
      id,
      { img },
      { new: true, projection: { img: 1 } }
    );
  }

  async incrementWordSeen(id: string): Promise<{ seen?: number } | null> {
    return await Word.findByIdAndUpdate(
      id,
      { $inc: { seen: 1 } },
      { new: true, projection: { seen: 1 } }
    );
  }

  async deleteWord(id: string): Promise<IWord | null> {
    return await Word.findByIdAndDelete(id);
  }

  async findWordByWord(word: string): Promise<IWord | null> {
    return await Word.findOne({ word });
  }



  // Método para actualizar el progreso de repaso de una palabra
  async updateWordReview(
    wordId: string,
    difficulty: number,
    quality: number // 1-5, donde 1 es "olvidé completamente" y 5 es "muy fácil"
  ): Promise<IWord | null> {
    const word = await Word.findById(wordId);
    if (!word) return null;

    // Actualizar solo los campos que existen en el modelo actual
    const updateData: any = {
      difficulty:
        difficulty === 1 ? "easy" : difficulty === 2 ? "medium" : "hard",
      seen: (word.seen || 0) + 1,
    };

    // Actualizar palabra
    const updatedWord = await Word.findByIdAndUpdate(wordId, updateData, {
      new: true,
    });

    return updatedWord;
  }

  // Método unificado para obtener tarjetas Anki
  async getAnkiCards(options: {
    mode?: 'random' | 'review';
    limit?: number;
    difficulty?: string[];
  } = {}): Promise<IWord[]> {
    const { mode = 'random', limit = 30, difficulty = ['hard', 'medium'] } = options;

    if (mode === 'random') {
      // Modo aleatorio: obtener palabras aleatorias (comportamiento original de get-cards-anki)
      return (await Word.aggregate([
        { $match: { difficulty: { $in: difficulty } } },
        { $addFields: { randomSort: { $rand: {} } } },
        { $sort: { randomSort: 1 } },
        { $limit: limit },
        { $project: { randomSort: 0 } },
      ])) as unknown as IWord[];
    } else {
      // Modo review: obtener palabras para repaso inteligente (comportamiento original de get-words-for-review)
      return (await Word.find({
        difficulty: { $in: difficulty },
      })
        .sort({
          difficulty: -1,
          seen: 1,
          createdAt: -1,
        })
        .limit(limit)
        .lean()) as unknown as IWord[];
    }
  }


  async getLastEasyWords(): Promise<IWord[]> {
    return (await Word.find({ difficulty: "easy" })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()) as unknown as IWord[];
  }


  async getWordsByTypeOptimized(
    type: string,
    limit: number = 10,
    search?: string,
    fields?: string
  ): Promise<{ word: string }[]> {
    const query: any = { type: { $in: [type] } };

    if (search) {
      query.word = { $regex: search, $options: "i" };
    }

    const projection = fields ? { word: 1 } : { word: 1, _id: 0 };

    return await Word.find(query)
      .select(projection)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }


  async getAllWordsForExport(): Promise<IWord[]> {
    return (await Word.find({}).sort({ createdAt: -1 }).lean().exec()) as unknown as IWord[];
  }

  // Chat methods
  async addChatMessage(wordId: string, message: string): Promise<IWord | null> {
    // Este método ahora solo agrega el mensaje del usuario
    // Las respuestas se manejan via streaming en el controlador
    return await this.addUserMessage(wordId, message);
  }

  async addUserMessage(wordId: string, message: string): Promise<IWord | null> {
    const word = await Word.findById(wordId);
    if (!word) return null;

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    word.chat = word.chat || [];
    word.chat.push(userMessage);
    return await word.save();
  }

  async addAssistantMessage(
    wordId: string,
    message: string
  ): Promise<IWord | null> {
    const word = await Word.findById(wordId);
    if (!word) return null;

    const assistantMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: "assistant",
      content: message,
      timestamp: new Date(),
    };

    word.chat = word.chat || [];
    word.chat.push(assistantMessage);
    return await word.save();
  }

  async getChatHistory(wordId: string): Promise<ChatMessage[]> {
    const word = await Word.findById(wordId);
    if (!word) return [];
    return word.chat || [];
  }

  async clearChatHistory(wordId: string): Promise<IWord | null> {
    const word = await Word.findById(wordId);
    if (!word) return null;

    word.chat = [];
    return await word.save();
  }
}

export default new WordService();
