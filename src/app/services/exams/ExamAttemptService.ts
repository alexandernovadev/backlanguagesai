import ExamAttempt from "../../db/models/ExamAttempt";
import Exam from "../../db/models/Exam";
import { IExamAttempt, IAttemptQuestion } from "../../../../types/models";

/**
 * Manages exam attempts: create, submit answers, and chat on failed questions.
 * Flow: create (empty) -> user answers -> submit (evaluate & persist) -> optional chat per failed question.
 */
export class ExamAttemptService {
  /**
   * Creates a new attempt. attemptQuestions stays empty until submit;
   * we only need examId + userId to "lock in" the attempt and track start time.
   * @param examId - Exam to attempt
   * @param userId - User starting the attempt
   */
  async create(examId: string, userId: string): Promise<IExamAttempt> {
    const exam = await Exam.findById(examId);
    if (!exam) throw new Error("Exam not found");

    const startedAt = new Date();
    const attempt = new ExamAttempt({
      examId,
      userId,
      score: 0,
      startedAt,
      completedAt: startedAt,
      attemptQuestions: [],
    });
    return attempt.save();
  }

  /**
   * Submits answers and evaluates. answers[i] matches question i:
   * - multiple: number (0-3 index). Compare with correctIndex.
   * - unique/fillInBlank/completeText: string. Compare with correctAnswer (normalized).
   * We snapshot question data into attemptQuestions so results stay correct even if the exam changes later.
   * @param attemptId - Attempt to submit
   * @param answers - Array of answers: number for multiple, string for text-based types
   * @param userId - Must match attempt owner
   */
  async submit(
    attemptId: string,
    answers: (number | string)[],
    userId: string
  ): Promise<IExamAttempt | null> {
    const attempt = await ExamAttempt.findById(attemptId).populate("examId");
    if (!attempt || attempt.userId.toString() !== userId) return null;

    const exam = attempt.examId as any;
    if (!exam?.questions) return null;

    // Case-insensitive, trimmed comparison for text answers (unique/fillInBlank/completeText)
    const normalize = (s: string) => String(s || "").toLowerCase().trim();

    const attemptQuestions: IAttemptQuestion[] = exam.questions.map(
      (q: any, i: number) => {
        const rawAnswer = answers[i];
        const type = q.type || "multiple";

        let userAnswer: number | string;
        let isCorrect: boolean;

        if (type === "multiple") {
          userAnswer = typeof rawAnswer === "number" ? rawAnswer : -1;
          isCorrect = userAnswer === (q.correctIndex ?? -1);
        } else {
          userAnswer = rawAnswer != null ? String(rawAnswer) : "";
          isCorrect = normalize(userAnswer) === normalize(q.correctAnswer || "");
        }

        return {
          questionIndex: i,
          questionText: q.text,
          questionType: type,
          options: q.options,
          correctIndex: q.correctIndex,
          correctAnswer: q.correctAnswer,
          userAnswer,
          isCorrect,
          // Preserve any existing chat (e.g. from a previous partial save); usually empty at submit
          chat: attempt.attemptQuestions[i]?.chat || [],
        };
      }
    );

    const correctCount = attemptQuestions.filter((a) => a.isCorrect).length;
    const score = Math.round((correctCount / attemptQuestions.length) * 100);

    return ExamAttempt.findByIdAndUpdate(
      attemptId,
      {
        attemptQuestions,
        score,
        completedAt: new Date(),
      },
      { new: true }
    ).populate("examId");
  }

  /**
   * Fetches an attempt by ID with exam populated.
   * @param attemptId - Attempt MongoDB ObjectId
   */
  async getById(attemptId: string): Promise<IExamAttempt | null> {
    return ExamAttempt.findById(attemptId).populate("examId");
  }

  /**
   * Lists attempts for a user, most recent first.
   * @param userId - User MongoDB ObjectId
   * @param limit - Max attempts to return
   */
  async getByUser(userId: string, limit = 20): Promise<IExamAttempt[]> {
    return ExamAttempt.find({ userId })
      .populate("examId")
      .sort({ completedAt: -1 })
      .limit(limit);
  }

  /**
   * Appends a chat message to a failed question. Chat is stored per question
   * so the user can ask the AI to explain their mistake and get pedagogical feedback.
   * @param attemptId - Attempt containing the question
   * @param questionIndex - Index of the failed question
   * @param role - "user" or "assistant"
   * @param content - Message text
   * @param userId - Must match attempt owner
   */
  async addChatMessage(
    attemptId: string,
    questionIndex: number,
    role: string,
    content: string,
    userId: string
  ): Promise<IExamAttempt | null> {
    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt || attempt.userId.toString() !== userId) return null;

    const questions = [...(attempt.attemptQuestions || [])];
    const q = questions[questionIndex];
    if (!q) return null;

    q.chat = q.chat || [];
    q.chat.push({ role, content });

    return ExamAttempt.findByIdAndUpdate(
      attemptId,
      { attemptQuestions: questions },
      { new: true }
    ).populate("examId");
  }
}
