import Word, { IWord } from "../../db/models/Word";
import {
  ImportConfig,
  ValidationResult,
  ProcessingResult,
  BatchResult,
  ImportResult,
} from "../../utils/importTypes";
import logger from "../../utils/logger";

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
      level?: string;
      language?: string;
      type?: string;
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
      level,
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

    // Filtro por palabra (existente)
    if (wordUser) {
      filter.word = { $regex: wordUser, $options: "i" };
    }

    // Nuevo filtro por nivel
    if (level && ['easy', 'medium', 'hard'].includes(level)) {
      filter.level = level;
    }

    // Nuevo filtro por idioma
    if (language) {
      filter.language = { $regex: language, $options: "i" };
    }

    // Nuevo filtro por tipo gramatical
    if (type) {
      filter.type = { $in: [type] };
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
      filter.$or = [
        { img: { $exists: false } },
        { img: null },
        { img: '' }
      ];
    }

    // Nuevo filtro por palabras con/sin ejemplos
    if (hasExamples === 'true') {
      filter.examples = { $exists: true, $ne: [], $size: { $gt: 0 } };
    } else if (hasExamples === 'false') {
      filter.$or = [
        { examples: { $exists: false } },
        { examples: [] },
        { examples: { $size: 0 } }
      ];
    }

    // Nuevo filtro por palabras con/sin sinónimos
    if (hasSynonyms === 'true') {
      filter.sinonyms = { $exists: true, $ne: [], $size: { $gt: 0 } };
    } else if (hasSynonyms === 'false') {
      filter.$or = [
        { sinonyms: { $exists: false } },
        { sinonyms: [] },
        { sinonyms: { $size: 0 } }
      ];
    }

    // Nuevo filtro por palabras con/sin code-switching
    if (hasCodeSwitching === 'true') {
      filter.codeSwitching = { $exists: true, $ne: [], $size: { $gt: 0 } };
    } else if (hasCodeSwitching === 'false') {
      filter.$or = [
        { codeSwitching: { $exists: false } },
        { codeSwitching: [] },
        { codeSwitching: { $size: 0 } }
      ];
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

  // Update a word by ID (full update)
  async updateWord(
    id: string,
    updateData: Partial<IWord>
  ): Promise<IWord | null> {
    return await Word.findByIdAndUpdate(id, updateData, { new: true });
  }

  // Update only the level of a word and return only the "level" field
  async updateWordLevel(
    id: string,
    level: string
  ): Promise<{ level?: string } | null> {
    return await Word.findByIdAndUpdate(id, { level }, { new: true })
      .select("level updatedAt")
      .lean();
  }

  // Update only examples
  async updateWordExamples(
    id: string,
    examples: string[]
  ): Promise<{ examples?: string[] } | null> {
    return await Word.findByIdAndUpdate(id, { examples }, { new: true })
      .select("examples updatedAt")
      .lean();
  }

  // Update only codeSwitching
  async updateWordCodeSwitching(
    id: string,
    codeSwitching: string[]
  ): Promise<{ codeSwitching?: string[] } | null> {
    return await Word.findByIdAndUpdate(id, { codeSwitching }, { new: true })
      .select("codeSwitching updatedAt")
      .lean();
  }

  // Update only synonyms
  async updateWordSynonyms(
    id: string,
    synonyms: string[]
  ): Promise<{ sinonyms?: string[] } | null> {
    return await Word.findByIdAndUpdate(
      id,
      { sinonyms: synonyms },
      { new: true }
    )
      .select("sinonyms updatedAt")
      .lean();
  }

  // Update only type
  async updateWordType(
    id: string,
    type: string[]
  ): Promise<{ type?: string[] } | null> {
    return await Word.findByIdAndUpdate(id, { type }, { new: true })
      .select("type updatedAt")
      .lean();
  }

  // Update only img
  async updateWordImg(
    id: string,
    img: string
  ): Promise<{ img?: string } | null> {
    return await Word.findByIdAndUpdate(id, { img }, { new: true })
      .select("img updatedAt")
      .lean();
  }

  // Increment seen count by 1
  async incrementWordSeen(id: string): Promise<{ seen?: number } | null> {
    return await Word.findByIdAndUpdate(
      id,
      { $inc: { seen: 1 } },
      { new: true }
    )
      .select("seen updatedAt")
      .lean();
  }

  // Delete a word by ID
  async deleteWord(id: string): Promise<IWord | null> {
    return await Word.findByIdAndDelete(id);
  }

  // Search for a word ignoring case sensitivity
  async findWordByWord(word: string): Promise<IWord | null> {
    const lowercaseWord = word.toLowerCase();
    return await Word.findOne({
      word: { $regex: `^${lowercaseWord}$`, $options: "i" },
    });
  }

  // Get 60 random words with level "hard" or "medium"
  async getRecentHardOrMediumWords(): Promise<IWord[]> {
    return await Word.aggregate([
      { $match: { level: { $in: ["hard", "medium"] } } },
      { $sample: { size: 60 } },
    ]);
  }

  // Get the last 30 words with level "easy" and seen < 49
  async getLastEasyWords(): Promise<IWord[]> {
    return await Word.aggregate([
      { $match: { level: "easy", seen: { $lt: 49 } } }, // Filter by level and seen
      { $sort: { createdAt: 1 } }, // Sort by oldest first
      { $limit: 100 }, // Select only the 100 oldest words
      { $sample: { size: 30 } }, // Randomly pick 30 from those 100
      { $project: { word: 1, _id: 0 } }, // Only return the "word" field
    ]);
  }

  // Get word counts by level (easy, medium, hard) and the total word count
  async getWordCountsByLevel(): Promise<{
    easy: number;
    medium: number;
    hard: number;
    total: number;
  }> {
    const result = await Word.aggregate([
      {
        // Using $facet to perform multiple operations in parallel
        $facet: {
          easy: [
            { $match: { level: "easy" } }, // Match only words with 'easy' level
            { $count: "count" }, // Count the number of documents
          ],
          medium: [
            { $match: { level: "medium" } }, // Match only words with 'medium' level
            { $count: "count" }, // Count the number of documents
          ],
          hard: [
            { $match: { level: "hard" } }, // Match only words with 'hard' level
            { $count: "count" }, // Count the number of documents
          ],
          total: [
            { $count: "count" }, // Count the total number of words
          ],
        },
      },
      {
        // Project the final result, setting default 0 count if not found
        $project: {
          easy: { $ifNull: [{ $arrayElemAt: ["$easy.count", 0] }, 0] },
          medium: { $ifNull: [{ $arrayElemAt: ["$medium.count", 0] }, 0] },
          hard: { $ifNull: [{ $arrayElemAt: ["$hard.count", 0] }, 0] },
          total: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
        },
      },
    ]);

    // Return the result with counts for each level and the total word count
    return result[0];
  }

  // Get all words for JSON export (without pagination)
  async getAllWordsForExport(): Promise<IWord[]> {
    return await Word.find({}).sort({ createdAt: -1 }).lean().exec();
  }

  // Validate a single word
  private validateWord(word: Partial<IWord>, index: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (
      !word.word ||
      typeof word.word !== "string" ||
      word.word.trim().length === 0
    ) {
      errors.push("Word is required and must be a non-empty string");
    }

    if (
      !word.definition ||
      typeof word.definition !== "string" ||
      word.definition.trim().length === 0
    ) {
      errors.push("Definition is required and must be a non-empty string");
    }

    if (
      !word.language ||
      typeof word.language !== "string" ||
      word.language.trim().length === 0
    ) {
      errors.push("Language is required and must be a non-empty string");
    }

    // Optional field validations
    if (
      word.seen !== undefined &&
      (typeof word.seen !== "number" || word.seen < 0)
    ) {
      errors.push("Seen must be a non-negative number");
    }

    // img is optional and can be empty
    if (
      word.img !== undefined &&
      word.img !== null &&
      typeof word.img !== "string"
    ) {
      errors.push("Img must be a string");
    }

    // Validate level if provided
    if (word.level && !["easy", "medium", "hard"].includes(word.level)) {
      errors.push("Level must be one of: easy, medium, hard");
    }

    // Validate type array if provided
    if (word.type && Array.isArray(word.type)) {
      const validTypes = [
        "noun",
        "verb",
        "adjective",
        "adverb",
        "personal pronoun",
        "possessive pronoun",
        "preposition",
        "conjunction",
        "determiner",
        "article",
        "quantifier",
        "interjection",
        "auxiliary verb",
        "modal verb",
        "infinitive",
        "participle",
        "gerund",
        "other",
        "phrasal verb",
      ];

      for (const type of word.type) {
        if (!validTypes.includes(type)) {
          errors.push(
            `Invalid type: ${type}. Must be one of: ${validTypes.join(", ")}`
          );
        }
      }
    }

    // Validate arrays are actually arrays
    if (word.examples && !Array.isArray(word.examples)) {
      errors.push("Examples must be an array");
    }

    if (word.sinonyms && !Array.isArray(word.sinonyms)) {
      errors.push("Synonyms must be an array");
    }

    if (word.codeSwitching && !Array.isArray(word.codeSwitching)) {
      errors.push("CodeSwitching must be an array");
    }

    // Validate spanish object if provided
    if (word.spanish) {
      if (typeof word.spanish !== "object") {
        errors.push("Spanish must be an object");
      } else {
        if (
          word.spanish.definition &&
          typeof word.spanish.definition !== "string"
        ) {
          errors.push("Spanish definition must be a string");
        }
        if (word.spanish.word && typeof word.spanish.word !== "string") {
          errors.push("Spanish word must be a string");
        }
      }
    }

    // Content length warnings
    if (word.definition && word.definition.length > 1000) {
      warnings.push("Definition is very long (>1,000 characters)");
    }

    if (word.word && word.word.length > 100) {
      warnings.push("Word is very long (>100 characters)");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Validate multiple words
  async validateWords(words: Partial<IWord>[]): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const validationResult = this.validateWord(word, i);

      results.push({
        index: i,
        lecture: word as any, // Using lecture field for compatibility
        status: validationResult.isValid ? "valid" : "invalid",
        validationResult,
      });
    }

    return results;
  }

  // Check for duplicate words
  private async checkDuplicate(word: Partial<IWord>): Promise<IWord | null> {
    if (!word.word) return null;

    // Check for exact word match (case insensitive)
    return await Word.findOne({
      word: { $regex: `^${word.word}$`, $options: "i" },
    });
  }

  // Process a single word based on duplicate strategy
  private async processWord(
    word: Partial<IWord>,
    index: number,
    config: ImportConfig
  ): Promise<ProcessingResult> {
    try {
      // Validate word
      const validationResult = this.validateWord(word, index);

      if (!validationResult.isValid) {
        logger.warn(`Word ${index} validation failed:`, {
          index,
          errors: validationResult.errors,
          warnings: validationResult.warnings,
          wordText: word.word,
        });

        return {
          index,
          lecture: word as any,
          status: "invalid",
          validationResult,
          action: "skipped",
        };
      }

      // Check for duplicates
      const existingWord = await this.checkDuplicate(word);

      if (existingWord) {
        logger.info(`Duplicate word found at index ${index}`, {
          index,
          existingId: existingWord._id,
          word: word.word,
          strategy: config.duplicateStrategy,
        });

        switch (config.duplicateStrategy) {
          case "error":
            logger.error(`Duplicate word error at index ${index}`, {
              index,
              existingId: existingWord._id,
              word: word.word,
            });
            return {
              index,
              lecture: word as any,
              status: "duplicate",
              validationResult,
              error: "Duplicate word found",
              action: "skipped",
            };

          case "skip":
            return {
              index,
              lecture: word as any,
              status: "duplicate",
              validationResult,
              action: "skipped",
            };

          case "overwrite":
            const updatedWord = await Word.findByIdAndUpdate(
              existingWord._id,
              { ...word, updatedAt: new Date() },
              { new: true }
            );
            logger.info(`Word ${index} overwritten`, {
              index,
              existingId: existingWord._id,
              word: word.word,
            });
            return {
              index,
              lecture: word as any,
              status: "valid",
              validationResult,
              action: "updated",
            };

          case "merge":
            // For merge, we could implement more sophisticated logic
            // For now, just overwrite
            await Word.findByIdAndUpdate(
              existingWord._id,
              { ...word, updatedAt: new Date() },
              { new: true }
            );
            logger.info(`Word ${index} merged`, {
              index,
              existingId: existingWord._id,
              word: word.word,
            });
            return {
              index,
              lecture: word as any,
              status: "valid",
              validationResult,
              action: "merged",
            };
        }
      }

      // Create new word
      const newWord = new Word(word);
      await newWord.save();

      logger.info(`Word ${index} inserted successfully`, {
        index,
        newId: newWord._id,
        word: word.word,
        level: word.level,
        language: word.language,
      });

      return {
        index,
        lecture: word as any,
        status: "valid",
        validationResult,
        action: "inserted",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error(`Error processing word ${index}:`, {
        index,
        error: errorMessage,
        stack: errorStack,
        word: word.word,
        wordData: {
          level: word.level,
          language: word.language,
          definition: word.definition?.substring(0, 100) + "...",
        },
      });

      return {
        index,
        lecture: word as any,
        status: "error",
        error: errorMessage,
        action: "skipped",
      };
    }
  }

  // Import words in batches
  async importWords(
    words: Partial<IWord>[],
    config: ImportConfig
  ): Promise<ImportResult> {
    const startTime = Date.now();
    const batches: BatchResult[] = [];

    logger.info("Starting word import process", {
      totalWords: words.length,
      config: {
        duplicateStrategy: config.duplicateStrategy,
        validateOnly: config.validateOnly,
        batchSize: config.batchSize,
      },
    });

    let totalValid = 0;
    let totalInvalid = 0;
    let totalDuplicates = 0;
    let totalErrors = 0;
    let totalInserted = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;

    // Process in batches
    for (let i = 0; i < words.length; i += config.batchSize) {
      const batchWords = words.slice(i, i + config.batchSize);
      const batchIndex = Math.floor(i / config.batchSize);

      logger.info(
        `Processing batch ${batchIndex + 1}/${Math.ceil(
          words.length / config.batchSize
        )}`,
        {
          batchIndex,
          batchSize: batchWords.length,
          startIndex: i,
          endIndex: i + batchWords.length - 1,
        }
      );

      const batchResults: ProcessingResult[] = [];
      let batchValid = 0;
      let batchInvalid = 0;
      let batchDuplicates = 0;
      let batchErrors = 0;
      let batchInserted = 0;
      let batchUpdated = 0;
      let batchSkipped = 0;

      // Process each word in the batch
      for (let j = 0; j < batchWords.length; j++) {
        const result = await this.processWord(batchWords[j], i + j, config);
        batchResults.push(result);

        // Update counters
        switch (result.status) {
          case "valid":
            batchValid++;
            totalValid++;
            break;
          case "invalid":
            batchInvalid++;
            totalInvalid++;
            break;
          case "duplicate":
            batchDuplicates++;
            totalDuplicates++;
            break;
          case "error":
            batchErrors++;
            totalErrors++;
            break;
        }

        switch (result.action) {
          case "inserted":
            batchInserted++;
            totalInserted++;
            break;
          case "updated":
            batchUpdated++;
            totalUpdated++;
            break;
          case "merged":
            batchUpdated++;
            totalUpdated++;
            break;
          case "skipped":
            batchSkipped++;
            totalSkipped++;
            break;
        }
      }

      logger.info(`Batch ${batchIndex + 1} completed`, {
        batchIndex,
        processed: batchWords.length,
        valid: batchValid,
        invalid: batchInvalid,
        duplicates: batchDuplicates,
        errors: batchErrors,
        inserted: batchInserted,
        updated: batchUpdated,
        skipped: batchSkipped,
      });

      batches.push({
        batchIndex,
        processed: batchWords.length,
        valid: batchValid,
        invalid: batchInvalid,
        duplicates: batchDuplicates,
        errors: batchErrors,
        inserted: batchInserted,
        updated: batchUpdated,
        skipped: batchSkipped,
      });
    }

    const duration = Date.now() - startTime;

    const summary = {
      success: totalErrors === 0,
      message: `Import completed. ${totalInserted} inserted, ${totalUpdated} updated, ${totalSkipped} skipped, ${totalErrors} errors`,
      duration,
    };

    logger.info("Word import process completed", {
      summary,
      totals: {
        totalWords: words.length,
        totalBatches: batches.length,
        totalValid,
        totalInvalid,
        totalDuplicates,
        totalErrors,
        totalInserted,
        totalUpdated,
        totalSkipped,
      },
      duration,
    });

    if (totalErrors > 0) {
      logger.error("Import completed with errors", {
        totalErrors,
        summary,
      });
    }

    return {
      totalLectures: words.length, // Using totalLectures for compatibility
      totalBatches: batches.length,
      totalValid,
      totalInvalid,
      totalDuplicates,
      totalErrors,
      totalInserted,
      totalUpdated,
      totalSkipped,
      batches,
      summary,
    };
  }
}

export default new WordService();
