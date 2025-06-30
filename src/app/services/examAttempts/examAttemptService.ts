import mongoose from "mongoose";
import { ExamAttempt, IExamAttempt } from "../../db/models/ExamAttempt";

export class ExamAttemptService {
  // Create a new exam attempt
  async createExamAttempt(
    userId: string,
    examId: string,
    attemptNumber: number = 1
  ): Promise<IExamAttempt> {
    const attempt = new ExamAttempt({
      user: userId,
      exam: examId,
      attemptNumber,
      answers: [],
      startedAt: new Date(),
      status: 'in_progress'
    });

    return await attempt.save();
  }

  // Get exam attempt by ID
  async getExamAttemptById(id: string): Promise<IExamAttempt | null> {
    return await ExamAttempt.findById(id)
      .populate('exam')
      .populate('user', 'name email')
      .populate({
        path: 'answers.question',
        model: 'Question'
      });
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
      startedAfter?: string;
      startedBefore?: string;
      submittedAfter?: string;
      submittedBefore?: string;
    } = {}
  ): Promise<{
    data: IExamAttempt[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      user,
      exam,
      status,
      passed,
      startedAfter,
      startedBefore,
      submittedAfter,
      submittedBefore,
    } = filters;

    const filter: any = {};

    if (user) filter.user = user;
    if (exam) filter.exam = exam;
    if (status) filter.status = status;
    if (passed !== undefined) filter.passed = passed;

    if (startedAfter || startedBefore) {
      filter.startedAt = {};
      if (startedAfter) filter.startedAt.$gte = new Date(startedAfter);
      if (startedBefore) filter.startedAt.$lte = new Date(startedBefore);
    }

    if (submittedAfter || submittedBefore) {
      filter.submittedAt = {};
      if (submittedAfter) filter.submittedAt.$gte = new Date(submittedAfter);
      if (submittedBefore) filter.submittedAt.$lte = new Date(submittedBefore);
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      ExamAttempt.find(filter)
        .populate('exam', 'title level topic')
        .populate('user', 'name email')
        .sort({ startedAt: -1 })
        .skip(skip)
        .limit(limit),
      ExamAttempt.countDocuments(filter)
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Get attempts by user and exam
  async getAttemptsByUserAndExam(
    userId: string,
    examId: string
  ): Promise<IExamAttempt[]> {
    return await ExamAttempt.find({ user: userId, exam: examId })
      .populate('exam', 'title level topic')
      .sort({ startedAt: -1 });
  }

  // Get attempts by status
  async getAttemptsByStatus(status: string): Promise<IExamAttempt[]> {
    return await ExamAttempt.find({ status })
      .populate('exam', 'title level topic')
      .populate('user', 'name email')
      .sort({ startedAt: -1 });
  }

  // Get passed attempts
  async getPassedAttempts(): Promise<IExamAttempt[]> {
    return await ExamAttempt.find({ passed: true })
      .populate('exam', 'title level topic')
      .populate('user', 'name email')
      .sort({ submittedAt: -1 });
  }

  // Update exam attempt
  async updateExamAttempt(
    id: string,
    updates: Partial<IExamAttempt>
  ): Promise<IExamAttempt | null> {
    return await ExamAttempt.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
  }

  // Delete exam attempt
  async deleteExamAttempt(id: string): Promise<boolean> {
    const result = await ExamAttempt.findByIdAndDelete(id);
    return !!result;
  }

  // Submit an answer (simplified - no evaluation)
  async submitAnswer(
    attemptId: string,
    questionId: string,
    answer: any
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
      submittedAt: new Date()
    };

    if (existingAnswerIndex >= 0) {
      attempt.answers[existingAnswerIndex] = answerData;
    } else {
      attempt.answers.push(answerData);
    }

    const savedAttempt = await attempt.save();
    console.log(`✅ Respuesta guardada para pregunta: ${questionId}`);
    
    return savedAttempt;
  }

  // Submit exam attempt (simplified)
  async submitExamAttempt(attemptId: string): Promise<IExamAttempt | null> {
    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) return null;

    attempt.status = 'submitted';
    attempt.submittedAt = new Date();
    
    if (attempt.duration === undefined) {
      const duration = Math.floor((attempt.submittedAt.getTime() - attempt.startedAt.getTime()) / 1000);
      attempt.duration = duration;
    }

    const savedAttempt = await attempt.save();
    console.log(`📋 Examen enviado - pendiente de evaluación AI`);
    
    return savedAttempt;
  }

  // Get total score from answers (simplified - always 0 until AI evaluation)
  getTotalScore(attempt: IExamAttempt): number {
    // No individual scores until AI evaluation
    return 0;
  }

  // Get accuracy (simplified - always 0 until AI evaluation)
  getAccuracy(attempt: IExamAttempt): number {
    // No accuracy until AI evaluation
    return 0;
  }

  // Get user statistics (simplified)
  async getUserStats(userId: string): Promise<{
    totalAttempts: number;
    passedAttempts: number;
    avgScore: number;
    totalDuration: number;
    byExam: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const [totalAttempts, passedAttempts, totalDuration, byExam, byStatus] = await Promise.all([
      ExamAttempt.countDocuments({ user: userId }),
      ExamAttempt.countDocuments({ user: userId, passed: true }),
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
      avgScore: 0, // No scores until AI evaluation
      totalDuration: totalDuration[0]?.totalDuration || 0,
      byExam: byExam.reduce((acc, item) => ({ ...acc, [item._id.toString()]: item.count }), {}),
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {})
    };
  }

  // Get attempt statistics (simplified)
  async getAttemptStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    passed: number;
    averageScore: number;
    averageDuration: number;
  }> {
    const [total, byStatus, passed, avgDuration] = await Promise.all([
      ExamAttempt.countDocuments(),
      ExamAttempt.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      ExamAttempt.countDocuments({ passed: true }),
      ExamAttempt.aggregate([
        { $group: { _id: null, avgDuration: { $avg: '$duration' } } }
      ])
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      passed,
      averageScore: 0, // No scores until AI evaluation
      averageDuration: Math.round(avgDuration[0]?.avgDuration || 0)
    };
  }
} 