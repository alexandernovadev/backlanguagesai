import { Request, Response } from "express";
import Exam, { IExam } from "../../db/models/Exam";
import Question from "../../db/models/Question";

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

  // Get exams with attempt information for a specific user
  async getExamsWithAttempts(
    userId: string,
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
  ): Promise<PaginatedResult<any>> {
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

    // Apply the same filters as getExams
    if (level) {
      if (Array.isArray(level)) {
        filter.level = { $in: level };
      } else {
        filter.level = level;
      }
    }

    if (language) {
      if (Array.isArray(language)) {
        filter.language = { $in: language };
      } else {
        filter.language = language;
      }
    }

    if (topic) {
      filter.topic = { $regex: topic, $options: 'i' };
    }

    if (source) {
      filter.source = source;
    }

    if (createdBy) {
      filter.createdBy = createdBy;
    }

    if (adaptive !== undefined) {
      filter.adaptive = adaptive;
    }

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

    // Execute queries with aggregation to include attempt information
    const [data, total] = await Promise.all([
      Exam.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'examattempts',
            let: { examId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$exam', '$$examId'] },
                      { $eq: ['$user', userId] }
                    ]
                  }
                }
              },
              {
                $sort: { startedAt: -1 }
              }
            ],
            as: 'userAttempts'
          }
        },
        {
          $addFields: {
            userAttempts: { $size: '$userAttempts' },
            lastAttemptDate: {
              $ifNull: [
                { $arrayElemAt: ['$userAttempts.startedAt', 0] },
                null
              ]
            },
            bestScore: {
              $max: {
                $map: {
                  input: '$userAttempts',
                  as: 'attempt',
                  in: {
                    $avg: [
                      '$$attempt.aiEvaluation.grammar',
                      '$$attempt.aiEvaluation.fluency',
                      '$$attempt.aiEvaluation.coherence',
                      '$$attempt.aiEvaluation.vocabulary'
                    ]
                  }
                }
              }
            }
          }
        },
        { $unset: 'userAttempts' },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit }
      ]),
      Exam.countDocuments(filter)
    ]);

    // Populate questions for each exam
    const populatedData = await Exam.populate(data, {
      path: 'questions.question',
      model: 'Question'
    });

    const pages = Math.ceil(total / limit);

    return {
      data: populatedData,
      total,
      page,
      pages
    };
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

    // Create exam with the created question IDs
    const exam = new Exam({
      ...examData,
      questions: createdQuestions.map((questionId, index) => ({
        question: questionId,
        weight: 1,
        order: index
      }))
    });

    return await exam.save();
  }
} 