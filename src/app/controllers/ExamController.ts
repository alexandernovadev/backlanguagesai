/**
 * Exam feature controller. Flow:
 * 1. generate -> AI returns exam JSON (no persist)
 * 2. validate -> AI reviews exam, returns thumbsUp/issues
 * 3. create -> persist exam
 * 4. startAttempt -> user begins exam
 * 5. submitAttempt -> evaluate answers, store results
 * 6. chatOnQuestion -> AI explains failed questions
 */
import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utils/responseHelpers";
import { generateExam, validateExam, correctExam, generateExamQuestionChat } from "../services/ai/examAIService";
import { ExamService } from "../services/exams/ExamService";
import { ExamAttemptService } from "../services/exams/ExamAttemptService";

const examService = new ExamService();
const attemptService = new ExamAttemptService();

/**
 * POST /api/exams/generate
 * Generates an exam via AI. Does not persist. Body: language, grammarTopics, difficulty, questionCount, questionTypes?, topic?
 */
export const generate = async (req: Request, res: Response) => {
  try {
    const { grammarTopics, difficulty, questionCount, questionTypes, topic } = req.body;
    const language = req.body.language || req.user?.language || "en";
    if (!grammarTopics?.length || !difficulty || !questionCount) {
      return errorResponse(res, "grammarTopics, difficulty, questionCount required", 400);
    }

    const result = await generateExam(
      { language, grammarTopics, difficulty, questionCount, questionTypes, topic },
      { userId: req.user?._id }
    );
    return successResponse(res, "Exam generated", result);
  } catch (error: any) {
    console.error("Exam generate error:", error);
    return errorResponse(res, error.message || "Error generating exam", 500, error);
  }
};

/**
 * POST /api/exams/validate
 * Validates an exam via AI (teacher review). Body: exam (object or stringified JSON).
 * Returns: valid, score, thumbsUp, issues, suggestions.
 */
export const validate = async (req: Request, res: Response) => {
  try {
    const examData = req.body.exam ?? req.body;
    const examJson = typeof examData === "string" ? examData : JSON.stringify(examData);
    if (!examJson || examJson === "{}") return errorResponse(res, "Exam data required", 400);

    const result = await validateExam(examJson);
    return successResponse(res, "Exam validated", result);
  } catch (error: any) {
    console.error("Exam validate error:", error);
    return errorResponse(res, error.message || "Error validating exam", 500, error);
  }
};

/**
 * POST /api/exams/correct
 * Corrects an exam based on validation feedback. Body: { exam, validation }.
 * Returns corrected exam { title, questions }.
 */
export const correct = async (req: Request, res: Response) => {
  try {
    const { exam, validation } = req.body;
    if (!exam || !validation) {
      return errorResponse(res, "exam and validation required", 400);
    }

    const result = await correctExam(exam, validation);
    return successResponse(res, "Exam corrected", result);
  } catch (error: any) {
    console.error("Exam correct error:", error);
    return errorResponse(res, error.message || "Error correcting exam", 500, error);
  }
};

/**
 * POST /api/exams
 * Persists an exam (e.g. after generate + validate). Body: title, language, difficulty, grammarTopics, questions, topic?
 */
export const create = async (req: Request, res: Response) => {
  try {
    const exam = await examService.create({
      ...req.body,
      language: req.body.language || req.user?.language || "en",
      createdBy: req.user?._id,
    });
    return successResponse(res, "Exam created", exam, 201);
  } catch (error: any) {
    return errorResponse(res, error.message || "Error creating exam", 500, error);
  }
};

/** GET /api/exams/:id - Fetches an exam by ID */
export const getById = async (req: Request, res: Response) => {
  try {
    const exam = await examService.getById(req.params.id);
    if (!exam) return errorResponse(res, "Exam not found", 404);
    return successResponse(res, "Exam found", exam);
  } catch (error: any) {
    return errorResponse(res, error.message || "Error getting exam", 500, error);
  }
};

/** GET /api/exams - Paginated list. Query: page?, limit? Includes attemptCount when user is authenticated. Filters by req.user.language. */
export const list = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const userId = req.user?._id?.toString() || req.user?.id;
    const language = req.user?.language;
    const result = await examService.list(page, limit, userId, language);
    return successResponse(res, "Exams listed", result);
  } catch (error: any) {
    return errorResponse(res, error.message || "Error listing exams", 500, error);
  }
};

/** DELETE /api/exams/:id - Deletes an exam */
export const remove = async (req: Request, res: Response) => {
  try {
    const exam = await examService.delete(req.params.id);
    if (!exam) return errorResponse(res, "Exam not found", 404);
    return successResponse(res, "Exam deleted", {});
  } catch (error: any) {
    return errorResponse(res, error.message || "Error deleting exam", 500, error);
  }
};

/**
 * POST /api/exams/:id/attempts
 * Starts an attempt. Creates empty attempt; answers filled on submit.
 */
export const startAttempt = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const attempt = await attemptService.create(req.params.id, userId.toString());
    return successResponse(res, "Attempt started", attempt, 201);
  } catch (error: any) {
    return errorResponse(res, error.message || "Error starting attempt", 500, error);
  }
};

/**
 * POST /api/exams/:id/attempts/:attemptId/submit
 * Submits answers. Body: { answers: (number|string)[] } - number for multiple/unique/fillInBlank (with options), string for translateText
 */
export const submitAttempt = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const { answers } = req.body;
    if (!Array.isArray(answers)) return errorResponse(res, "answers array required", 400);

    const explainsLanguage = req.user?.explainsLanguage || "es";
    const attempt = await attemptService.submit(
      req.params.attemptId,
      answers,
      userId.toString(),
      explainsLanguage
    );
    if (!attempt) return errorResponse(res, "Attempt not found", 404);
    return successResponse(res, "Attempt submitted", attempt);
  } catch (error: any) {
    return errorResponse(res, error.message || "Error submitting attempt", 500, error);
  }
};

/** DELETE /api/exams/:id/attempts/:attemptId - Deletes an attempt (owner only) */
export const deleteAttempt = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const deleted = await attemptService.delete(req.params.attemptId, userId.toString());
    if (!deleted) return errorResponse(res, "Attempt not found", 404);
    return successResponse(res, "Attempt deleted", {});
  } catch (error: any) {
    return errorResponse(res, error.message || "Error deleting attempt", 500, error);
  }
};

/** GET /api/exams/:id/attempts/:attemptId - Fetches an attempt with exam populated */
export const getAttempt = async (req: Request, res: Response) => {
  try {
    const attempt = await attemptService.getById(req.params.attemptId);
    if (!attempt) return errorResponse(res, "Attempt not found", 404);
    return successResponse(res, "Attempt found", attempt);
  } catch (error: any) {
    return errorResponse(res, error.message || "Error getting attempt", 500, error);
  }
};

/** GET /api/exams/:id/attempts - Lists attempts for a specific exam. Query: limit? */
export const listAttemptsByExam = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const limit = parseInt(req.query.limit as string) || 20;
    const attempts = await attemptService.getByExam(
      req.params.id,
      userId.toString(),
      limit
    );
    return successResponse(res, "Attempts listed", attempts);
  } catch (error: any) {
    return errorResponse(res, error.message || "Error listing attempts", 500, error);
  }
};

/** GET /api/exams/attempts/my - Lists current user's attempts. Query: limit? */
export const listAttempts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const limit = parseInt(req.query.limit as string) || 20;
    const attempts = await attemptService.getByUser(userId.toString(), limit);
    return successResponse(res, "Attempts listed", attempts);
  } catch (error: any) {
    return errorResponse(res, error.message || "Error listing attempts", 500, error);
  }
};

/**
 * POST /api/exams/:id/attempts/:attemptId/questions/:questionIndex/chat
 * Chat with AI on a failed question. Body: { message }. Only allowed for isCorrect=false questions.
 */
export const chatOnQuestion = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const { message } = req.body;
    if (!message?.trim()) return errorResponse(res, "message required", 400);

    const attempt = await attemptService.getById(req.params.attemptId);
    if (!attempt || attempt.userId.toString() !== userId.toString()) {
      return errorResponse(res, "Attempt not found", 404);
    }

    const exam = attempt.examId as any;
    if (!exam?.questions) return errorResponse(res, "Exam not found", 404);

    const questionIndex = parseInt(req.params.questionIndex);
    const q = exam.questions[questionIndex];
    const aq = attempt.attemptQuestions?.[questionIndex];
    if (!q || !aq) return errorResponse(res, "Question not found", 404);
    if (aq.isCorrect) return errorResponse(res, "Chat only for failed questions", 400);

    const explainsLanguage = req.user?.explainsLanguage || "es";
    const aiResponse = await generateExamQuestionChat({
      questionText: q.text,
      questionType: q.type || "multiple",
      grammarTopic: q.grammarTopic,
      difficulty: exam.difficulty,
      options: q.options,
      correctIndex: q.correctIndex,
      correctIndices: q.correctIndices,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      userAnswer: aq.userAnswer,
      userMessage: message.trim(),
      chatHistory: aq.chat || [],
      language: exam.language || "en",
      explainsLanguage,
    });

    await attemptService.addChatMessage(
      req.params.attemptId,
      questionIndex,
      "user",
      message.trim(),
      userId.toString()
    );
    await attemptService.addChatMessage(
      req.params.attemptId,
      questionIndex,
      "assistant",
      aiResponse,
      userId.toString()
    );

    return successResponse(res, "Chat message added", { response: aiResponse });
  } catch (error: any) {
    console.error("Exam chat error:", error);
    return errorResponse(res, error.message || "Error in chat", 500, error);
  }
};
