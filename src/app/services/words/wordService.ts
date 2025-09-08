import Word, { IWord, ChatMessage } from "../../db/models/Word";

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
      sortBy = 'createdAt',
      sortOrder = 'desc',
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
      updatedBefore
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
        const validDifficulties = difficulty.filter(d => ['easy', 'medium', 'hard'].includes(d));
        if (validDifficulties.length > 0) {
          filter.difficulty = { $in: validDifficulties };
        }
      } else {
        // Una sola dificultad
        if (['easy', 'medium', 'hard'].includes(difficulty)) {
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
    if (hasImage === 'true') {
      filter.img = { $exists: true, $nin: [null, ''] };
    } else if (hasImage === 'false') {
      addOrConditions([
        { img: { $exists: false } },
        { img: null },
        { img: '' }
      ]);
    }

    // Nuevo filtro por palabras con/sin ejemplos
    if (hasExamples === 'true') {
      filter.examples = { $exists: true, $ne: [] };
    } else if (hasExamples === 'false') {
      addOrConditions([
        { examples: { $exists: false } },
        { examples: [] }
      ]);
    }

    // Nuevo filtro por palabras con/sin sinónimos
    if (hasSynonyms === 'true') {
      filter.sinonyms = { $exists: true, $ne: [] };
    } else if (hasSynonyms === 'false') {
      addOrConditions([
        { sinonyms: { $exists: false } },
        { sinonyms: [] }
      ]);
    }

    // Nuevo filtro por palabras con/sin code-switching
    if (hasCodeSwitching === 'true') {
      filter.codeSwitching = { $exists: true, $ne: [] };
    } else if (hasCodeSwitching === 'false') {
      addOrConditions([
        { codeSwitching: { $exists: false } },
        { codeSwitching: [] }
      ]);
    }

    // Nuevo filtro por palabra en español
    if (spanishWord) {
      filter['spanish.word'] = { $regex: spanishWord, $options: "i" };
    }

    // Nuevo filtro por definición en español
    if (spanishDefinition) {
      filter['spanish.definition'] = { $regex: spanishDefinition, $options: "i" };
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
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
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

  async updateWordLevel(
    id: string,
    difficulty: string
  ): Promise<{ difficulty?: string } | null> {
    return await Word.findByIdAndUpdate(id, { difficulty }, { new: true, projection: { difficulty: 1 } });
  }

  async updateWordExamples(
    id: string,
    examples: string[]
  ): Promise<{ examples?: string[] } | null> {
    return await Word.findByIdAndUpdate(id, { examples }, { new: true, projection: { examples: 1 } });
  }

  async updateWordCodeSwitching(
    id: string,
    codeSwitching: string[]
  ): Promise<{ codeSwitching?: string[] } | null> {
    return await Word.findByIdAndUpdate(id, { codeSwitching }, { new: true, projection: { codeSwitching: 1 } });
  }

  async updateWordSynonyms(
    id: string,
    synonyms: string[]
  ): Promise<{ sinonyms?: string[] } | null> {
    return await Word.findByIdAndUpdate(id, { sinonyms: synonyms }, { new: true, projection: { sinonyms: 1 } });
  }

  async updateWordType(
    id: string,
    type: string[]
  ): Promise<{ type?: string[] } | null> {
    return await Word.findByIdAndUpdate(id, { type }, { new: true, projection: { type: 1 } });
  }

  async updateWordImg(
    id: string,
    img: string
  ): Promise<{ img?: string } | null> {
    return await Word.findByIdAndUpdate(id, { img }, { new: true, projection: { img: 1 } });
  }

  async incrementWordSeen(id: string): Promise<{ seen?: number } | null> {
    return await Word.findByIdAndUpdate(id, { $inc: { seen: 1 } }, { new: true, projection: { seen: 1 } });
  }

  async deleteWord(id: string): Promise<IWord | null> {
    return await Word.findByIdAndDelete(id);
  }

  async findWordByWord(word: string): Promise<IWord | null> {
    return await Word.findOne({ word });
  }

  async getRecentHardOrMediumWords(): Promise<IWord[]> {
    // Obtener 30 palabras medium y hard aleatorias para el juego Anki
    // Usar $sample + $sort con $random para máxima aleatorización
    return await Word.aggregate([
      { $match: { difficulty: { $in: ["hard", "medium"] } } },
      { $addFields: { randomSort: { $rand: {} } } }, // Agregar campo aleatorio
      { $sort: { randomSort: 1 } }, // Ordenar por el campo aleatorio
      { $limit: 30 }, // Limitar a 30 palabras para el juego
      { $project: { randomSort: 0 } } // Remover el campo aleatorio del resultado
    ]);
  }

  // Nuevo método para obtener palabras para repaso inteligente
  async getWordsForReview(limit: number = 20): Promise<IWord[]> {
    const now = new Date();
    
    // Obtener palabras que necesitan repaso (nextReview <= now) o nunca han sido revisadas
    const wordsForReview = await Word.find({
      $or: [
        { nextReview: { $lte: now } },
        { nextReview: null },
        { lastReviewed: null }
      ],
      difficulty: { $in: ["hard", "medium"] }
    })
    .sort({ 
      // Priorizar por: 1) Nunca revisadas, 2) Más tiempo sin revisar, 3) Más difíciles
      lastReviewed: 1,
      difficulty: -1,
      nextReview: 1
    })
    .limit(limit)
    .lean();

    // Si no hay suficientes palabras para repaso, agregar algunas nuevas
    if (wordsForReview.length < limit) {
      const remainingLimit = limit - wordsForReview.length;
      const additionalWords = await Word.find({
        difficulty: { $in: ["hard", "medium"] },
        _id: { $nin: wordsForReview.map(w => w._id) }
      })
      .sort({ createdAt: -1 })
      .limit(remainingLimit)
      .lean();

      return [...wordsForReview, ...additionalWords];
    }

    return wordsForReview;
  }

  // Método para actualizar el progreso de repaso de una palabra
  async updateWordReview(
    wordId: string, 
    difficulty: number, 
    quality: number // 1-5, donde 1 es "olvidé completamente" y 5 es "muy fácil"
  ): Promise<IWord | null> {
    const word = await Word.findById(wordId);
    if (!word) return null;

    const now = new Date();
    const oldEaseFactor = word.easeFactor || 2.5;
    const oldInterval = word.interval || 1;
    const oldReviewCount = word.reviewCount || 0;

    // Calcular nuevo factor de facilidad (algoritmo similar a Anki)
    let newEaseFactor = oldEaseFactor;
    if (quality >= 4) {
      // Respuesta correcta
      newEaseFactor = Math.max(1.3, oldEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    } else if (quality <= 2) {
      // Respuesta incorrecta
      newEaseFactor = Math.max(1.3, oldEaseFactor - 0.2);
    }

    // Calcular nuevo intervalo
    let newInterval: number;
    if (quality >= 4) {
      if (oldReviewCount === 0) {
        newInterval = 1;
      } else if (oldReviewCount === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(oldInterval * newEaseFactor);
      }
    } else {
      // Respuesta incorrecta, volver a 1 día
      newInterval = 1;
    }

    // Calcular próxima fecha de repaso
    const nextReviewDate = new Date(now);
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    // Actualizar palabra
    const updatedWord = await Word.findByIdAndUpdate(
      wordId,
      {
        lastReviewed: now,
        nextReview: nextReviewDate,
        reviewCount: oldReviewCount + 1,
        difficulty: difficulty,
        interval: newInterval,
        easeFactor: newEaseFactor,
        seen: (word.seen || 0) + 1
      },
      { new: true }
    );

    return updatedWord;
  }

  // Método para obtener estadísticas de repaso
  async getReviewStats(): Promise<{
    totalWords: number;
    wordsReviewedToday: number;
    wordsDueForReview: number;
    averageEaseFactor: number;
    averageInterval: number;
  }> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalWords,
      wordsReviewedToday,
      wordsDueForReview,
      averageEaseFactor,
      averageInterval
    ] = await Promise.all([
      Word.countDocuments({ level: { $in: ["hard", "medium"] } }),
      Word.countDocuments({ 
        difficulty: { $in: ["hard", "medium"] },
        lastReviewed: { $gte: startOfDay }
      }),
      Word.countDocuments({
        difficulty: { $in: ["hard", "medium"] },
        $or: [
          { nextReview: { $lte: now } },
          { nextReview: null },
          { lastReviewed: null }
        ]
      }),
      Word.aggregate([
        { $match: { difficulty: { $in: ["hard", "medium"] } } },
        { $group: { _id: null, avgEaseFactor: { $avg: "$easeFactor" } } }
      ]),
      Word.aggregate([
        { $match: { difficulty: { $in: ["hard", "medium"] } } },
        { $group: { _id: null, avgInterval: { $avg: "$interval" } } }
      ])
    ]);

    return {
      totalWords,
      wordsReviewedToday,
      wordsDueForReview,
      averageEaseFactor: averageEaseFactor[0]?.avgEaseFactor || 2.5,
      averageInterval: averageInterval[0]?.avgInterval || 1
    };
  }

  async getLastEasyWords(): Promise<IWord[]> {
    return await Word.find({ difficulty: "easy" })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
  }

  async getWordsByType(type: string, limit: number = 10, search?: string): Promise<IWord[]> {
    const query: any = { type: { $in: [type] } };
    
    if (search) {
      query.$or = [
        { word: { $regex: search, $options: 'i' } },
        { definition: { $regex: search, $options: 'i' } }
      ];
    }

    return await Word.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async getWordsByTypeOptimized(type: string, limit: number = 10, search?: string, fields?: string): Promise<{ word: string }[]> {
    const query: any = { type: { $in: [type] } };
    
    if (search) {
      query.word = { $regex: search, $options: 'i' };
    }

    const projection = fields ? { word: 1 } : { word: 1, _id: 0 };

    return await Word.find(query)
      .select(projection)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async getWordsOnly(filters: {
    page?: number;
    limit?: number;
    wordUser?: string;
    level?: string | string[];
    language?: string | string[];
    type?: string | string[];
    fields?: string;
  } = {}): Promise<PaginatedResult<{ word: string }>> {
    const {
      page = 1,
      limit = 10,
      wordUser,
      difficulty,
      language,
      type,
      fields
    } = filters;

    const filter: Record<string, unknown> = {};

    // Filtro por palabra
    if (wordUser) {
      filter.word = { $regex: wordUser, $options: "i" };
    }

    // Filtro por dificultad
    if (difficulty) {
      if (Array.isArray(difficulty)) {
        const validDifficulties = difficulty.filter(d => ['easy', 'medium', 'hard'].includes(d));
        if (validDifficulties.length > 0) {
          filter.difficulty = { $in: validDifficulties };
        }
      } else {
        if (['easy', 'medium', 'hard'].includes(difficulty)) {
          filter.difficulty = difficulty;
        }
      }
    }

    // Filtro por idioma
    if (language) {
      if (Array.isArray(language)) {
        const languageRegex = language.map(lang => new RegExp(lang, 'i'));
        filter.language = { $in: languageRegex };
      } else {
        filter.language = { $regex: language, $options: "i" };
      }
    }

    // Filtro por tipo
    if (type) {
      if (Array.isArray(type)) {
        filter.type = { $in: type };
      } else {
        filter.type = { $in: [type] };
      }
    }

    const projection = fields ? { word: 1 } : { word: 1, _id: 0 };

    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      Word.find(filter)
        .select(projection)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Word.countDocuments(filter)
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async getAllWordsForExport(): Promise<IWord[]> {
    return await Word.find({})
      .sort({ createdAt: -1 })
      .lean()
      .exec();
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
      timestamp: new Date()
    };

    word.chat = word.chat || [];
    word.chat.push(userMessage);
    return await word.save();
  }

  async addAssistantMessage(wordId: string, message: string): Promise<IWord | null> {
    const word = await Word.findById(wordId);
    if (!word) return null;

    const assistantMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: "assistant",
      content: message,
      timestamp: new Date()
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
