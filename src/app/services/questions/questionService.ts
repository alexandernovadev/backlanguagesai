import Question, { IQuestion } from "../../db/models/Question";

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export class QuestionService {
  // Create a new question
  async createQuestion(questionData: IQuestion): Promise<IQuestion> {
    const question = new Question(questionData);
    return await question.save();
  }

  // Get a question by ID
  async getQuestionById(id: string): Promise<IQuestion | null> {
    return await Question.findById(id);
  }

  // Get all questions with pagination and filters
  async getQuestions(
    filters: {
      page?: number;
      limit?: number;
      level?: string | string[];
      type?: string | string[];
      topic?: string;
      tags?: string[];
      difficulty?: number | { min: number; max: number };
      hasMedia?: boolean;
      sortBy?: string;
      sortOrder?: string;
      createdAfter?: string;
      createdBefore?: string;
    } = {}
  ): Promise<PaginatedResult<IQuestion>> {
    try {
      const {
        page = 1,
        limit = 10,
        level,
        type,
        topic,
        tags,
        difficulty,
        hasMedia,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        createdAfter,
        createdBefore
      } = filters;

      const filter: Record<string, any> = {};

      // Filter by level
      if (level) {
        if (Array.isArray(level)) {
          filter.level = { $in: level };
        } else {
          filter.level = level;
        }
      }

      // Filter by type
      if (type) {
        if (Array.isArray(type)) {
          filter.type = { $in: type };
        } else {
          filter.type = type;
        }
      }

      // Filter by topic
      if (topic) {
        filter.topic = { $regex: topic, $options: 'i' };
      }

      // Filter by tags
      if (tags && tags.length > 0) {
        filter.tags = { $in: tags };
      }

      // Filter by difficulty
      if (difficulty) {
        if (typeof difficulty === 'number') {
          filter.difficulty = difficulty;
        } else {
          filter.difficulty = { $gte: difficulty.min, $lte: difficulty.max };
        }
      }

      // Filter by media presence
      if (hasMedia !== undefined) {
        if (hasMedia) {
          filter.$or = [
            { 'media.audio': { $exists: true, $ne: '' } },
            { 'media.image': { $exists: true, $ne: '' } },
            { 'media.video': { $exists: true, $ne: '' } }
          ];
        } else {
          filter.$and = [
            { 'media.audio': { $exists: false } },
            { 'media.image': { $exists: false } },
            { 'media.video': { $exists: false } }
          ];
        }
      }

      // Date filters
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

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // Execute queries sequentially like in wordService
      const total = await Question.countDocuments(filter);
      const pages = Math.ceil(total / limit);

      const data = await Question.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec();

      return {
        data,
        total,
        page,
        pages
      };
    } catch (error) {
      console.error('Error in getQuestions:', error);
      throw error;
    }
  }

  // Update a question
  async updateQuestion(
    id: string,
    updateData: Partial<IQuestion>
  ): Promise<IQuestion | null> {
    return await Question.findByIdAndUpdate(id, updateData, { new: true });
  }

  // Delete a question
  async deleteQuestion(id: string): Promise<IQuestion | null> {
    return await Question.findByIdAndDelete(id);
  }

  // Find questions by level and type
  async findByLevelAndType(level: string, type: string): Promise<IQuestion[]> {
    return await Question.find({ level, type });
  }

  // Find questions by topic
  async findByTopic(topic: string): Promise<IQuestion[]> {
    return await Question.find({ topic: { $regex: topic, $options: 'i' } });
  }

  // Find questions by tags
  async findByTags(tags: string[]): Promise<IQuestion[]> {
    return await Question.find({ tags: { $in: tags } });
  }

  // Get questions for a specific exam level
  async getQuestionsForLevel(level: string, limit: number = 10): Promise<IQuestion[]> {
    return await Question.find({ level }).limit(limit).sort({ createdAt: -1 });
  }

  // Get random questions for practice
  async getRandomQuestions(level: string, type: string, limit: number = 5): Promise<IQuestion[]> {
    return await Question.aggregate([
      { $match: { level, type } },
      { $sample: { size: limit } }
    ]);
  }

  // Utility methods
  getDifficultyLabel(difficulty: number): string {
    const labels = ['', 'Muy Fácil', 'Fácil', 'Intermedio', 'Difícil', 'Muy Difícil'];
    return labels[difficulty] || 'No definido';
  }

  hasMedia(question: IQuestion): boolean {
    return !!(question.media?.audio || question.media?.image || question.media?.video);
  }

  // Get question statistics
  async getQuestionStats(): Promise<{
    total: number;
    byLevel: Record<string, number>;
    byType: Record<string, number>;
    withMedia: number;
  }> {
    const [total, byLevel, byType, withMedia] = await Promise.all([
      Question.countDocuments(),
      Question.aggregate([
        { $group: { _id: '$level', count: { $sum: 1 } } }
      ]),
      Question.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Question.countDocuments({
        $or: [
          { 'media.audio': { $exists: true, $ne: '' } },
          { 'media.image': { $exists: true, $ne: '' } },
          { 'media.video': { $exists: true, $ne: '' } }
        ]
      })
    ]);

    return {
      total,
      byLevel: byLevel.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      withMedia
    };
  }

  // Export all questions for backup/transfer
  async getAllQuestionsForExport(): Promise<IQuestion[]> {
    return await Question.find({})
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  // Import questions from JSON data
  async importQuestions(questions: any[], config: {
    duplicateStrategy: 'skip' | 'overwrite' | 'error' | 'merge';
    batchSize?: number;
  }): Promise<{
    totalItems: number;
    totalInserted: number;
    totalUpdated: number;
    totalSkipped: number;
    totalErrors: number;
    batches: any[];
    summary: {
      success: boolean;
      message: string;
      duration: number;
    };
  }> {
    const startTime = Date.now();
    const batches: any[] = [];
    let totalInserted = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    const batchSize = config.batchSize || 10;

    for (let i = 0; i < questions.length; i += batchSize) {
      const batchQuestions = questions.slice(i, i + batchSize);
      const batchIndex = Math.floor(i / batchSize);
      let batchInserted = 0;
      let batchUpdated = 0;
      let batchSkipped = 0;
      let batchErrors = 0;

      for (const questionData of batchQuestions) {
        try {
          // Check for duplicates by text and type
          const existingQuestion = await Question.findOne({
            $and: [
              { text: questionData.text },
              { type: questionData.type }
            ]
          });

          if (existingQuestion) {
            switch (config.duplicateStrategy) {
              case 'error':
                batchErrors++;
                totalErrors++;
                break;
              case 'skip':
                batchSkipped++;
                totalSkipped++;
                break;
              case 'overwrite':
              case 'merge':
                // Remove _id to avoid conflicts
                const { _id, ...updateData } = questionData;
                await Question.findByIdAndUpdate(existingQuestion._id, updateData, { new: true });
                batchUpdated++;
                totalUpdated++;
                break;
            }
          } else {
            // Create new question
            const newQuestion = new Question(questionData);
            await newQuestion.save();
            batchInserted++;
            totalInserted++;
          }
        } catch (error) {
          batchErrors++;
          totalErrors++;
        }
      }

      batches.push({
        batchIndex,
        processed: batchQuestions.length,
        inserted: batchInserted,
        updated: batchUpdated,
        skipped: batchSkipped,
        errors: batchErrors,
      });
    }

    const duration = Date.now() - startTime;
    return {
      totalItems: questions.length,
      totalInserted,
      totalUpdated,
      totalSkipped,
      totalErrors,
      batches,
      summary: {
        success: totalErrors === 0,
        message: `Import completed. ${totalInserted} inserted, ${totalUpdated} updated, ${totalSkipped} skipped, ${totalErrors} errors`,
        duration,
      },
    };
  }
}

export default new QuestionService(); 