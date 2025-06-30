import { Request, Response } from "express";
import { ExamService } from "../services/exams/examService";
import { ExamValidator } from "../utils/validators/examValidator";
import { errorResponse, successResponse } from "../utils/responseHelpers";

const examService = new ExamService();

export const createExam = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const examData = req.body;

    // Validate exam data
    const validation = ExamValidator.validateExam(examData, 0);
    if (!validation.isValid) {
      return errorResponse(
        res,
        `Validation error: ${validation.errors.join(", ")}`,
        400
      );
    }

    const newExam = await examService.createExam(examData);
    return successResponse(res, "Exam created successfully", newExam, 201);
  } catch (error) {
    if (error.name === "ValidationError") {
      return errorResponse(res, "Validation error: " + error.message, 400);
    }
    return errorResponse(
      res,
      "An error occurred while creating the exam",
      500,
      error
    );
  }
};

export const getExamById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const exam = await examService.getExamById(id);

    if (!exam) {
      return errorResponse(res, "Exam not found", 404);
    }

    return successResponse(res, "Exam retrieved successfully", exam);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving the exam",
      500,
      error
    );
  }
};

export const getExams = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string) || 10, 1);

    // Filters
    const level = req.query.level as string;
    const language = req.query.language as string;
    const topic = req.query.topic as string;
    const source = req.query.source as string;
    const createdBy = req.query.createdBy as string;
    const adaptive = req.query.adaptive as string;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) || "desc";
    const createdAfter = req.query.createdAfter as string;
    const createdBefore = req.query.createdBefore as string;

    // Process filters that can have multiple values
    const levels = level ? level.split(",").map((l) => l.trim()) : undefined;
    const languages = language
      ? language.split(",").map((l) => l.trim())
      : undefined;

    // Process adaptive filter
    let adaptiveFilter: boolean | undefined;
    if (adaptive === "true") {
      adaptiveFilter = true;
    } else if (adaptive === "false") {
      adaptiveFilter = false;
    }

    const exams = await examService.getExams({
      page,
      limit,
      level: levels,
      language: languages,
      topic,
      source,
      createdBy,
      adaptive: adaptiveFilter,
      sortBy,
      sortOrder,
      createdAfter,
      createdBefore,
    });

    return successResponse(res, "Exams retrieved successfully", exams);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving exams",
      500,
      error
    );
  }
};

export const updateExam = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate update data
    const validation = ExamValidator.validateExam(updateData, 0);
    if (!validation.isValid) {
      return errorResponse(
        res,
        `Validation error: ${validation.errors.join(", ")}`,
        400
      );
    }

    const updatedExam = await examService.updateExam(id, updateData);
    if (!updatedExam) {
      return errorResponse(res, "Exam not found", 404);
    }

    return successResponse(res, "Exam updated successfully", updatedExam);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while updating the exam",
      500,
      error
    );
  }
};

export const deleteExam = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const deletedExam = await examService.deleteExam(id);

    if (!deletedExam) {
      return errorResponse(res, "Exam not found", 404);
    }

    return successResponse(res, "Exam deleted successfully", deletedExam);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while deleting the exam",
      500,
      error
    );
  }
};

export const getExamsByLevelAndLanguage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { level, language } = req.params;
    const exams = await examService.findByLevelAndLanguage(level, language);

    return successResponse(res, "Exams retrieved successfully", exams);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving exams",
      500,
      error
    );
  }
};

export const getExamsByTopic = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { topic } = req.params;
    const exams = await examService.findByTopic(topic);

    return successResponse(res, "Exams retrieved successfully", exams);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving exams",
      500,
      error
    );
  }
};

export const getExamsByCreator = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { creatorId } = req.params;
    const exams = await examService.findByCreator(creatorId);

    return successResponse(res, "Exams retrieved successfully", exams);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving exams",
      500,
      error
    );
  }
};

export const getExamsForLevel = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { level } = req.params;
    const limit = Math.max(parseInt(req.query.limit as string) || 10, 1);

    const exams = await examService.getExamsForLevel(level, limit);

    return successResponse(
      res,
      "Exams for level retrieved successfully",
      exams
    );
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving exams for level",
      500,
      error
    );
  }
};

export const addQuestionToExam = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { examId } = req.params;
    const { questionId, weight, order } = req.body;

    if (!questionId) {
      return errorResponse(res, "Question ID is required", 400);
    }

    const updatedExam = await examService.addQuestionToExam(
      examId,
      questionId,
      weight || 1,
      order
    );

    if (!updatedExam) {
      return errorResponse(res, "Exam not found", 404);
    }

    return successResponse(
      res,
      "Question added to exam successfully",
      updatedExam
    );
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while adding question to exam",
      500,
      error
    );
  }
};

export const removeQuestionFromExam = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { examId, questionId } = req.params;

    const updatedExam = await examService.removeQuestionFromExam(
      examId,
      questionId
    );

    if (!updatedExam) {
      return errorResponse(res, "Exam not found", 404);
    }

    return successResponse(
      res,
      "Question removed from exam successfully",
      updatedExam
    );
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while removing question from exam",
      500,
      error
    );
  }
};

export const getExamStats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const stats = await examService.getExamStats();

    return successResponse(
      res,
      "Exam statistics retrieved successfully",
      stats
    );
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving exam statistics",
      500,
      error
    );
  }
};

export const generateExamFromQuestions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { questions, ...examData } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return errorResponse(
        res,
        "Questions array is required and must not be empty",
        400
      );
    }

    // Validate exam data
    const validation = ExamValidator.validateExam(examData, 0);
    if (!validation.isValid) {
      return errorResponse(
        res,
        `Validation error: ${validation.errors.join(", ")}`,
        400
      );
    }

    const newExam = await examService.generateExamFromQuestions(
      questions,
      examData
    );

    return successResponse(
      res,
      "Exam generated from questions successfully",
      newExam,
      201
    );
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while generating exam from questions",
      500,
      error
    );
  }
};

export const createExamWithQuestions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { questions, ...examData } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return errorResponse(
        res,
        "Questions array is required and must not be empty",
        400
      );
    }

    // Validate exam data (without questions for now)
    const examValidation = ExamValidator.validateExam(examData, 0);
    if (!examValidation.isValid) {
      return errorResponse(
        res,
        `Exam validation error: ${examValidation.errors.join(", ")}`,
        400
      );
    }

    // Create exam with questions
    const newExam = await examService.createExamWithQuestions(
      questions,
      examData
    );

    return successResponse(
      res,
      "Exam with questions created successfully",
      newExam,
      201
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      return errorResponse(res, "Validation error: " + error.message, 400);
    }
    return errorResponse(
      res,
      "An error occurred while creating the exam with questions",
      500,
      error
    );
  }
};

// NUEVOS MÉTODOS PARA INTENTOS

export const getExamsWithAttempts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string) || 10, 1);
    // @ts-ignore
    const userId = req.user?.id; // Del middleware de auth

    // Filters
    const level = req.query.level as string;
    const language = req.query.language as string;
    const topic = req.query.topic as string;
    const source = req.query.source as string;
    const createdBy = req.query.createdBy as string;
    const adaptive = req.query.adaptive as string;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) || "desc";
    const createdAfter = req.query.createdAfter as string;
    const createdBefore = req.query.createdBefore as string;

    // Process filters that can have multiple values
    const levels = level ? level.split(",").map((l) => l.trim()) : undefined;
    const languages = language
      ? language.split(",").map((l) => l.trim())
      : undefined;

    // Process adaptive filter
    let adaptiveFilter: boolean | undefined;
    if (adaptive === "true") {
      adaptiveFilter = true;
    } else if (adaptive === "false") {
      adaptiveFilter = false;
    }

    const exams = await examService.getExamsWithAttempts({
      page,
      limit,
      level: levels,
      language: languages,
      topic,
      source,
      createdBy,
      adaptive: adaptiveFilter,
      sortBy,
      sortOrder,
      createdAfter,
      createdBefore,
      userId,
    });

    return successResponse(
      res,
      "Exams with attempts retrieved successfully",
      exams
    );
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving exams with attempts",
      500,
      error
    );
  }
};

export const getExamAttemptStats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    // @ts-ignore
    const userId = req.user?.id; // Del middleware de auth

    const stats = await examService.getExamAttemptStats(id, userId);

    return successResponse(
      res,
      "Exam attempt stats retrieved successfully",
      stats
    );
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving exam attempt stats",
      500,
      error
    );
  }
};
