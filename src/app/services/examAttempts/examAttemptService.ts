import ExamAttempt, { IExamAttempt } from "../../db/models/ExamAttempt";
import Exam from "../../db/models/Exam";
import User from "../../db/models/User";
import mongoose from "mongoose";

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export class ExamAttemptService {
  // Create a new exam attempt
  async createExamAttempt(attemptData: IExamAttempt): Promise<IExamAttempt> {
    // Get the exam to check attemptsAllowed
    const exam = await Exam.findById(attemptData.exam);
    if (!exam) {
      throw new Error('Exam not found');
    }

    // Get existing attempts for this user and exam
    const existingAttempts = await ExamAttempt.find({
      user: attemptData.user,
      exam: attemptData.exam
    }).sort({ attemptNumber: -1 });

    // Calculate next attempt number
    const nextAttemptNumber = existingAttempts.length > 0 
      ? existingAttempts[0].attemptNumber + 1 
      : 1;

    // Check if user has exceeded attemptsAllowed
    if (exam.attemptsAllowed && nextAttemptNumber > exam.attemptsAllowed) {
      throw new Error(`Maximum attempts (${exam.attemptsAllowed}) exceeded for this exam`);
    }

    // Create the attempt with calculated attemptNumber
    const attempt = new ExamAttempt({
      ...attemptData,
      attemptNumber: nextAttemptNumber,
      status: 'in_progress',
      startedAt: new Date()
    });

    return await attempt.save();
  }

  // Get an exam attempt by ID
  async getExamAttemptById(id: string): Promise<IExamAttempt | null> {
    return await ExamAttempt.findById(id)
      .populate('user')
      .populate('exam')
      .populate('answers.question');
  }

  // Get all exam attempts with pagination and filters
  async getExamAttempts(
    filters: {
      page?: number;
      limit?: number;
      user?: string;
      exam?: string;
      status?: string;
      passed?: boolean;
      cefrEstimated?: string;
      sortBy?: string;
      sortOrder?: string;
      startedAfter?: string;
      startedBefore?: string;
      submittedAfter?: string;
      submittedBefore?: string;
    } = {}
  ): Promise<PaginatedResult<IExamAttempt>> {
    const {
      page = 1,
      limit = 10,
      user,
      exam,
      status,
      passed,
      cefrEstimated,
      sortBy = 'startedAt',
      sortOrder = 'desc',
      startedAfter,
      startedBefore,
      submittedAfter,
      submittedBefore
    } = filters;

    const filter: Record<string, any> = {};

    // Filter by user
    if (user) {
      filter.user = user;
    }

    // Filter by exam
    if (exam) {
      filter.exam = exam;
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by passed
    if (passed !== undefined) {
      filter.passed = passed;
    }

    // Filter by CEFR level
    if (cefrEstimated) {
      filter.cefrEstimated = cefrEstimated;
    }

    // Date filters for startedAt
    if (startedAfter || startedBefore) {
      const startedAtFilter: Record<string, Date> = {};
      if (startedAfter) {
        startedAtFilter.$gte = new Date(startedAfter);
      }
      if (startedBefore) {
        startedAtFilter.$lte = new Date(startedBefore);
      }
      filter.startedAt = startedAtFilter;
    }

    // Date filters for submittedAt
    if (submittedAfter || submittedBefore) {
      const submittedAtFilter: Record<string, Date> = {};
      if (submittedAfter) {
        submittedAtFilter.$gte = new Date(submittedAfter);
      }
      if (submittedBefore) {
        submittedAtFilter.$lte = new Date(submittedBefore);
      }
      filter.submittedAt = submittedAtFilter;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Execute queries
    const [data, total] = await Promise.all([
      ExamAttempt.find(filter)
        .populate('user')
        .populate('exam')
        .populate('answers.question')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      ExamAttempt.countDocuments(filter)
    ]);

    const pages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      pages
    };
  }

  // Update an exam attempt
  async updateExamAttempt(
    id: string,
    updateData: Partial<IExamAttempt>
  ): Promise<IExamAttempt | null> {
    return await ExamAttempt.findByIdAndUpdate(id, updateData, { new: true })
      .populate('user')
      .populate('exam')
      .populate('answers.question');
  }

  // Delete an exam attempt
  async deleteExamAttempt(id: string): Promise<IExamAttempt | null> {
    return await ExamAttempt.findByIdAndDelete(id);
  }

  // Find attempts by user and exam
  async findByUserAndExam(userId: string, examId: string): Promise<IExamAttempt[]> {
    return await ExamAttempt.find({ user: userId, exam: examId })
      .populate('user')
      .populate('exam')
      .populate('answers.question')
      .sort({ attemptNumber: -1 });
  }

  // Find attempts by status
  async findByStatus(status: string): Promise<IExamAttempt[]> {
    return await ExamAttempt.find({ status })
      .populate('user')
      .populate('exam')
      .populate('answers.question');
  }

  // Find passed attempts
  async findPassedAttempts(): Promise<IExamAttempt[]> {
    return await ExamAttempt.find({ passed: true })
      .populate('user')
      .populate('exam')
      .populate('answers.question');
  }

  // Get user statistics
  async getUserStats(userId: string): Promise<{
    totalAttempts: number;
    passedAttempts: number;
    avgScore: number;
    totalDuration: number;
    byExam: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const [totalAttempts, passedAttempts, avgScore, totalDuration, byExam, byStatus] = await Promise.all([
      ExamAttempt.countDocuments({ user: userId }),
      ExamAttempt.countDocuments({ user: userId, passed: true }),
      ExamAttempt.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, avgScore: { $avg: '$aiEvaluation.grammar' } } }
      ]),
      ExamAttempt.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, totalDuration: { $sum: '$duration' } } }
      ]),
      ExamAttempt.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$exam', count: { $sum: 1 } } }
      ]),
      ExamAttempt.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    return {
      totalAttempts,
      passedAttempts,
      avgScore: Math.round(avgScore[0]?.avgScore || 0),
      totalDuration: totalDuration[0]?.totalDuration || 0,
      byExam: byExam.reduce((acc, item) => ({ ...acc, [item._id.toString()]: item.count }), {}),
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {})
    };
  }

  // Submit an answer
  async submitAnswer(
    attemptId: string,
    questionId: string,
    answer: any,
    isCorrect?: boolean,
    score?: number,
    feedback?: string
  ): Promise<IExamAttempt | null> {
    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) return null;

    // Find existing answer or create new one
    const existingAnswerIndex = attempt.answers.findIndex(
      a => a.question.toString() === questionId
    );

    const answerData = {
      question: new mongoose.Types.ObjectId(questionId),
      answer,
      isCorrect,
      score,
      feedback,
      submittedAt: new Date()
    };

    if (existingAnswerIndex >= 0) {
      attempt.answers[existingAnswerIndex] = answerData;
    } else {
      attempt.answers.push(answerData);
    }

    return await attempt.save();
  }

  // Submit exam attempt
  async submitExamAttempt(attemptId: string): Promise<IExamAttempt | null> {
    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) return null;

    attempt.status = 'submitted';
    attempt.submittedAt = new Date();
    
    if (attempt.duration === undefined) {
      const duration = Math.floor((attempt.submittedAt.getTime() - attempt.startedAt.getTime()) / 1000);
      attempt.duration = duration;
    }

    return await attempt.save();
  }

  // Grade exam attempt
  async gradeExamAttempt(
    attemptId: string,
    aiEvaluation: {
      grammar?: number;
      fluency?: number;
      coherence?: number;
      vocabulary?: number;
      comments?: string;
    },
    aiNotes?: string,
    cefrEstimated?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  ): Promise<IExamAttempt | null> {
    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) return null;

    attempt.status = 'graded';
    attempt.aiEvaluation = aiEvaluation;
    attempt.aiNotes = aiNotes;
    attempt.cefrEstimated = cefrEstimated;

    // Calculate if passed (you can adjust this logic)
    const avgScore = this.getAverageAIScore(attempt);
    attempt.passed = avgScore >= 70; // 70% threshold

    return await attempt.save();
  }

  // Utility methods
  getTotalScore(attempt: IExamAttempt): number {
    if (!attempt.answers || attempt.answers.length === 0) return 0;
    const totalScore = attempt.answers.reduce((sum, answer) => sum + (answer.score || 0), 0);
    return Math.round(totalScore / attempt.answers.length);
  }

  getCorrectAnswersCount(attempt: IExamAttempt): number {
    if (!attempt.answers) return 0;
    return attempt.answers.filter(answer => answer.isCorrect).length;
  }

  getAccuracy(attempt: IExamAttempt): number {
    if (!attempt.answers || attempt.answers.length === 0) return 0;
    const correctCount = this.getCorrectAnswersCount(attempt);
    return Math.round((correctCount / attempt.answers.length) * 100);
  }

  getAverageAIScore(attempt: IExamAttempt): number {
    if (!attempt.aiEvaluation) return 0;
    const scores = [
      attempt.aiEvaluation.grammar,
      attempt.aiEvaluation.fluency,
      attempt.aiEvaluation.coherence,
      attempt.aiEvaluation.vocabulary
    ].filter(score => score !== undefined);
    
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }

  getDurationInMinutes(attempt: IExamAttempt): number {
    if (!attempt.duration) return 0;
    return Math.round(attempt.duration / 60);
  }

  isCompleted(attempt: IExamAttempt): boolean {
    return attempt.status === 'submitted' || attempt.status === 'graded';
  }

  isGraded(attempt: IExamAttempt): boolean {
    return attempt.status === 'graded';
  }

  hasAIEvaluation(attempt: IExamAttempt): boolean {
    return !!attempt.aiEvaluation;
  }

  // Get attempt statistics
  async getAttemptStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byCEFR: Record<string, number>;
    passed: number;
    averageScore: number;
    averageDuration: number;
  }> {
    const [total, byStatus, byCEFR, passed, avgScore, avgDuration] = await Promise.all([
      ExamAttempt.countDocuments(),
      ExamAttempt.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      ExamAttempt.aggregate([
        { $group: { _id: '$cefrEstimated', count: { $sum: 1 } } }
      ]),
      ExamAttempt.countDocuments({ passed: true }),
      ExamAttempt.aggregate([
        { $group: { _id: null, avgScore: { $avg: '$aiEvaluation.grammar' } } }
      ]),
      ExamAttempt.aggregate([
        { $group: { _id: null, avgDuration: { $avg: '$duration' } } }
      ])
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      byCEFR: byCEFR.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      passed,
      averageScore: Math.round(avgScore[0]?.avgScore || 0),
      averageDuration: Math.round(avgDuration[0]?.avgDuration || 0)
    };
  }

  // Check if user can create a new attempt for an exam
  async canCreateAttempt(userId: string, examId: string): Promise<{
    canCreate: boolean;
    currentAttempts: number;
    maxAttempts: number;
    nextAttemptNumber: number;
    message?: string;
  }> {
    const exam = await Exam.findById(examId);
    if (!exam) {
      return {
        canCreate: false,
        currentAttempts: 0,
        maxAttempts: 0,
        nextAttemptNumber: 1,
        message: 'Exam not found'
      };
    }

    const existingAttempts = await ExamAttempt.find({
      user: userId,
      exam: examId
    }).sort({ attemptNumber: -1 });

    const currentAttempts = existingAttempts.length;
    const maxAttempts = exam.attemptsAllowed || 999; // Default to high number if not set
    const nextAttemptNumber = currentAttempts + 1;

    const canCreate = nextAttemptNumber <= maxAttempts;

    return {
      canCreate,
      currentAttempts,
      maxAttempts,
      nextAttemptNumber,
      message: canCreate 
        ? `Can create attempt ${nextAttemptNumber} of ${maxAttempts}`
        : `Maximum attempts (${maxAttempts}) exceeded`
    };
  }
} 