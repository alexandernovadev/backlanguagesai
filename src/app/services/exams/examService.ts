import { Request, Response } from "express";
import Exam, { IExam } from "../../db/models/Exam";
import Question from "../../db/models/Question";
import ExamAttempt from "../../db/models/ExamAttempt";
import { generateSlugFromTitle } from "../../utils/slugGenerator";

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export class ExamService {
  // Create a new exam
  async createExam(examData: IExam): Promise<IExam> {
    const exam = new Exam(examData);
    return await exam.save();
  }

  // Get an exam by ID
  async getExamById(id: string): Promise<IExam | null> {
    return await Exam.findById(id).populate('questions.question');
  }

  // Get an exam by slug
  async getExamBySlug(slug: string): Promise<IExam | null> {
    return await Exam.findOne({ slug }).populate('questions.question');
  }

  // Get all exams with pagination and filters
  async getExams(
    filters: {
      page?: number;
      limit?: number;
      level?: string | string[];
      language?: string | string[];
      topic?: string;
      source?: string;
      createdBy?: string;
      adaptive?: boolean;
      sortBy?: string;
      sortOrder?: string;
      createdAfter?: string;
      createdBefore?: string;
    } = {}
  ): Promise<PaginatedResult<IExam>> {
    const {
      page = 1,
      limit = 10,
      level,
      language,
      topic,
      source,
      createdBy,
      adaptive,
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

    // Filter by language
    if (language) {
      if (Array.isArray(language)) {
        filter.language = { $in: language };
      } else {
        filter.language = language;
      }
    }

    // Filter by topic
    if (topic) {
      filter.topic = { $regex: topic, $options: 'i' };
    }

    // Filter by source
    if (source) {
      filter.source = source;
    }

    // Filter by creator
    if (createdBy) {
      filter.createdBy = createdBy;
    }

    // Filter by adaptive
    if (adaptive !== undefined) {
      filter.adaptive = adaptive;
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

    // Execute queries
    const [data, total] = await Promise.all([
      Exam.find(filter).populate('questions.question').sort(sort).skip(skip).limit(limit),
      Exam.countDocuments(filter)
    ]);

    const pages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      pages
    };
  }

  // Update an exam
  async updateExam(
    id: string,
    updateData: Partial<IExam>
  ): Promise<IExam | null> {
    return await Exam.findByIdAndUpdate(id, updateData, { new: true }).populate('questions.question');
  }

  // Delete an exam
  async deleteExam(id: string): Promise<IExam | null> {
    return await Exam.findByIdAndDelete(id);
  }

  // Find exams by level and language
  async findByLevelAndLanguage(level: string, language: string): Promise<IExam[]> {
    return await Exam.find({ level, language }).populate('questions.question');
  }

  // Find exams by topic
  async findByTopic(topic: string): Promise<IExam[]> {
    return await Exam.find({ topic: { $regex: topic, $options: 'i' } }).populate('questions.question');
  }

  // Find exams by creator
  async findByCreator(creatorId: string): Promise<IExam[]> {
    return await Exam.find({ createdBy: creatorId }).populate('questions.question');
  }

  // Get exams for a specific level
  async getExamsForLevel(level: string, limit: number = 10): Promise<IExam[]> {
    return await Exam.find({ level }).populate('questions.question').limit(limit).sort({ createdAt: -1 });
  }

  // Add question to exam
  async addQuestionToExam(examId: string, questionId: string, weight: number = 1, order?: number): Promise<IExam | null> {
    const exam = await Exam.findById(examId);
    if (!exam) return null;

    const newOrder = order ?? exam.questions.length;
    
    exam.questions.push({
      question: questionId as any,
      weight,
      order: newOrder
    });

    return await exam.save();
  }

  // Remove question from exam
  async removeQuestionFromExam(examId: string, questionId: string): Promise<IExam | null> {
    return await Exam.findByIdAndUpdate(
      examId,
      { $pull: { questions: { question: questionId } } },
      { new: true }
    ).populate('questions.question');
  }

  // Utility methods
  getTotalQuestions(exam: IExam): number {
    return exam.questions.length;
  }

  getTotalWeight(exam: IExam): number {
    return exam.questions.reduce((total, q) => total + q.weight, 0);
  }

  getEstimatedDuration(exam: IExam): number {
    return exam.metadata?.estimatedDuration || exam.timeLimit || 30; // Default 30 min
  }

  isTimeLimited(exam: IExam): boolean {
    return !!exam.timeLimit;
  }

  isAdaptive(exam: IExam): boolean {
    return exam.adaptive;
  }

  // Get exam statistics
  async getExamStats(): Promise<{
    total: number;
    byLevel: Record<string, number>;
    byLanguage: Record<string, number>;
    bySource: Record<string, number>;
    adaptive: number;
    averageQuestions: number;
  }> {
    const [total, byLevel, byLanguage, bySource, adaptive, avgQuestions] = await Promise.all([
      Exam.countDocuments(),
      Exam.aggregate([
        { $group: { _id: '$level', count: { $sum: 1 } } }
      ]),
      Exam.aggregate([
        { $group: { _id: '$language', count: { $sum: 1 } } }
      ]),
      Exam.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ]),
      Exam.countDocuments({ adaptive: true }),
      Exam.aggregate([
        { $group: { _id: null, avgQuestions: { $avg: { $size: '$questions' } } } }
      ])
    ]);

    return {
      total,
      byLevel: byLevel.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      byLanguage: byLanguage.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      bySource: bySource.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      adaptive,
      averageQuestions: Math.round(avgQuestions[0]?.avgQuestions || 0)
    };
  }

  // Generate exam from questions
  async generateExamFromQuestions(
    questions: string[],
    examData: Partial<IExam>
  ): Promise<IExam> {
    const exam = new Exam({
      ...examData,
      questions: questions.map((questionId, index) => ({
        question: questionId,
        weight: 1,
        order: index
      }))
    });

    return await exam.save();
  }

  // Create exam with questions (creates questions first, then exam)
  async createExamWithQuestions(
    questionsData: any[],
    examData: Partial<IExam>
  ): Promise<IExam> {
    // Create questions first
    const createdQuestions = [];
    for (const questionData of questionsData) {
      const question = new Question(questionData);
      const savedQuestion = await question.save();
      createdQuestions.push(savedQuestion._id);
    }

    // Generate unique slug if not provided
    let slug = examData.slug;
    if (!slug && examData.title) {
      slug = await generateSlugFromTitle(examData.title);
    }

    // Create exam with the created question IDs
    const exam = new Exam({
      ...examData,
      slug,
      questions: createdQuestions.map((questionId, index) => ({
        question: questionId,
        weight: 1,
        order: index
      }))
    });

    return await exam.save();
  }

  // NUEVOS MÉTODOS PARA INTENTOS

  // Obtener exámenes con información de intentos
  async getExamsWithAttempts(
    filters: {
      page?: number;
      limit?: number;
      level?: string | string[];
      language?: string | string[];
      topic?: string;
      source?: string;
      createdBy?: string;
      adaptive?: boolean;
      sortBy?: string;
      sortOrder?: string;
      createdAfter?: string;
      createdBefore?: string;
      userId?: string; // Para obtener intentos del usuario
    } = {}
  ): Promise<PaginatedResult<IExam & { userAttempts?: any[] }>> {
    const {
      userId,
      ...otherFilters
    } = filters;

    const result = await this.getExams(otherFilters);

    // Si se especifica userId, agregar información de intentos
    if (userId) {
      const examIds = result.data.map(exam => exam._id);
      const attempts = await ExamAttempt.find({
        exam: { $in: examIds },
        user: userId
      }).sort({ createdAt: -1 });

      // Agrupar intentos por examen
      const attemptsByExam = attempts.reduce((acc, attempt) => {
        if (!acc[attempt.exam.toString()]) {
          acc[attempt.exam.toString()] = [];
        }
        acc[attempt.exam.toString()].push(attempt);
        return acc;
      }, {} as any);

      // Agregar intentos a cada examen
      result.data = result.data.map(exam => ({
        ...exam.toObject(),
        userAttempts: attemptsByExam[exam._id.toString()] || []
      }));
    }

    return result;
  }

  // Obtener estadísticas de intentos por examen
  async getExamAttemptStats(examId: string, userId?: string): Promise<any> {
    const filter: any = { exam: examId };
    if (userId) filter.user = userId;

    const attempts = await ExamAttempt.find(filter);
    
    return {
      totalAttempts: attempts.length,
      completedAttempts: attempts.filter(a => a.status === 'graded').length,
      inProgressAttempts: attempts.filter(a => a.status === 'in_progress').length,
      averageScore: attempts.length > 0 
        ? attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length 
        : 0,
      bestScore: attempts.length > 0 
        ? Math.max(...attempts.map(a => a.score || 0)) 
        : 0,
      lastAttempt: attempts.length > 0 
        ? attempts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        : null
    };
  }

  // Export all exams for backup/transfer
  async getAllExamsForExport(): Promise<IExam[]> {
    return await Exam.find({})
      .populate('questions.question')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  // Import exams from JSON data
  async importExams(exams: any[], config: {
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

    for (let i = 0; i < exams.length; i += batchSize) {
      const batchExams = exams.slice(i, i + batchSize);
      const batchIndex = Math.floor(i / batchSize);
      let batchInserted = 0;
      let batchUpdated = 0;
      let batchSkipped = 0;
      let batchErrors = 0;

      for (const examData of batchExams) {
        try {
          // Check for duplicates by title or slug
          const existingExam = await Exam.findOne({
            $or: [
              { title: examData.title },
              { slug: examData.slug }
            ]
          });

          if (existingExam) {
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
                const { _id, ...updateData } = examData;
                await Exam.findByIdAndUpdate(existingExam._id, updateData, { new: true });
                batchUpdated++;
                totalUpdated++;
                break;
            }
          } else {
            // Create new exam
            const newExam = new Exam(examData);
            await newExam.save();
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
        processed: batchExams.length,
        inserted: batchInserted,
        updated: batchUpdated,
        skipped: batchSkipped,
        errors: batchErrors,
      });
    }

    const duration = Date.now() - startTime;
    return {
      totalItems: exams.length,
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