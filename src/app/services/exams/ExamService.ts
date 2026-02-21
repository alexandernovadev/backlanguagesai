import crypto from "crypto";
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
   * @param page - Page number (1-based)
   * @param limit - Items per page
   */
  async list(page = 1, limit = 20): Promise<{ data: IExam[]; total: number }> {
    const skip = (page - 1) * limit;
    const [total, data] = await Promise.all([
      Exam.countDocuments(),
      Exam.find().skip(skip).sort({ createdAt: -1 }).limit(limit),
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
