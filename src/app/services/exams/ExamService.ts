import crypto from "crypto";
import mongoose from "mongoose";
import Exam from "../../db/models/Exam";
import { IExam } from "../../../../types/models";

/**
 * Exam CRUD service. Handles persistence of exams (title, questions, metadata).
 * Questions get a UUID if not provided; type defaults to "multiple" for backward compatibility.
 */
export class ExamService {
  /**
   * Creates an exam. Assigns UUID to each question and defaults type to "multiple".
   * @param data - Partial exam (title, language, difficulty, grammarTopics, questions, topic)
   * @returns Saved exam
   */
  async create(data: Partial<IExam>): Promise<IExam> {
    const questions = (data.questions || []).map((q: any) => ({
      ...q,
      id: q.id || crypto.randomUUID(),
      type: q.type || "multiple",
    }));
    const exam = new Exam({ ...data, questions });
    return exam.save();
  }

  /**
   * Fetches an exam by ID.
   * @param id - Exam MongoDB ObjectId
   */
  async getById(id: string): Promise<IExam | null> {
    return Exam.findById(id);
  }

  /**
   * Paginated list of exams, newest first.
   * When userId is provided, adds attemptCount (user's attempts per exam).
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @param userId - Optional. When set, adds attemptCount for this user.
   */
  async list(page = 1, limit = 20, userId?: string): Promise<{ data: (IExam & { attemptCount?: number })[]; total: number }> {
    const skip = (page - 1) * limit;
    const total = await Exam.countDocuments();

    if (!userId) {
      const data = await Exam.find().skip(skip).sort({ createdAt: -1 }).limit(limit).lean();
      return { data: data as unknown as IExam[], total };
    }

    const data = await Exam.aggregate([
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "examattempts",
          let: { examId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$examId", "$$examId"] },
                userId: new mongoose.Types.ObjectId(userId),
              },
            },
            { $count: "count" },
          ],
          as: "attemptCountResult",
        },
      },
      {
        $addFields: {
          attemptCount: {
            $ifNull: [{ $arrayElemAt: ["$attemptCountResult.count", 0] }, 0],
          },
        },
      },
      { $unset: "attemptCountResult" },
    ]);

    return { data, total };
  }

  /**
   * Deletes an exam by ID.
   * @param id - Exam MongoDB ObjectId
   */
  async delete(id: string): Promise<IExam | null> {
    return Exam.findByIdAndDelete(id);
  }
}
