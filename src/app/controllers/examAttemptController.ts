import { Request, Response } from "express";
import { ExamAttemptService } from "../services/examAttempts/examAttemptService";
import { ExamAttemptValidator } from "../utils/validators/examAttemptValidator";
import { errorResponse, successResponse } from "../utils/responseHelpers";

const examAttemptService = new ExamAttemptService();

export const createExamAttempt = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const attemptData = req.body;
    
    // Validate attempt data
    const validation = ExamAttemptValidator.validateExamAttempt(attemptData, 0);
    if (!validation.isValid) {
      return errorResponse(res, `Validation error: ${validation.errors.join(', ')}`, 400);
    }

    const newAttempt = await examAttemptService.createExamAttempt(attemptData);
    return successResponse(res, "Exam attempt created successfully", newAttempt, 201);
  } catch (error) {
    if (error.name === "ValidationError") {
      return errorResponse(res, "Validation error: " + error.message, 400);
    }
    return errorResponse(
      res,
      "An error occurred while creating the exam attempt",
      500,
      error
    );
  }
};

export const getExamAttemptById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const attempt = await examAttemptService.getExamAttemptById(id);
    
    if (!attempt) {
      return errorResponse(res, "Exam attempt not found", 404);
    }

    return successResponse(res, "Exam attempt retrieved successfully", attempt);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving the exam attempt",
      500,
      error
    );
  }
};

export const getExamAttempts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string) || 10, 1);

    // Filters
    const examId = req.query.examId as string;
    const userId = req.query.userId as string;
    const status = req.query.status as string;
    const cefrEstimated = req.query.cefrEstimated as string;
    const passed = req.query.passed as string;
    const sortBy = req.query.sortBy as string || 'startedAt';
    const sortOrder = req.query.sortOrder as string || 'desc';
    const startedAfter = req.query.startedAfter as string;
    const startedBefore = req.query.startedBefore as string;

    // Process passed filter
    let passedFilter: boolean | undefined;
    if (passed === 'true') {
      passedFilter = true;
    } else if (passed === 'false') {
      passedFilter = false;
    }

    const attempts = await examAttemptService.getExamAttempts({
      page,
      limit,
      user: userId,
      exam: examId,
      status,
      cefrEstimated,
      passed: passedFilter,
      sortBy,
      sortOrder,
      startedAfter,
      startedBefore
    });

    return successResponse(res, "Exam attempts retrieved successfully", attempts);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving exam attempts",
      500,
      error
    );
  }
};

export const updateExamAttempt = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate update data
    const validation = ExamAttemptValidator.validateExamAttempt(updateData, 0);
    if (!validation.isValid) {
      return errorResponse(res, `Validation error: ${validation.errors.join(', ')}`, 400);
    }

    const updatedAttempt = await examAttemptService.updateExamAttempt(id, updateData);
    if (!updatedAttempt) {
      return errorResponse(res, "Exam attempt not found", 404);
    }

    return successResponse(res, "Exam attempt updated successfully", updatedAttempt);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while updating the exam attempt",
      500,
      error
    );
  }
};

export const deleteExamAttempt = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const deletedAttempt = await examAttemptService.deleteExamAttempt(id);
    
    if (!deletedAttempt) {
      return errorResponse(res, "Exam attempt not found", 404);
    }

    return successResponse(res, "Exam attempt deleted successfully", deletedAttempt);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while deleting the exam attempt",
      500,
      error
    );
  }
};

export const getAttemptsByUserAndExam = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { userId, examId } = req.params;
    const attempts = await examAttemptService.findByUserAndExam(userId, examId);
    
    return successResponse(res, "User exam attempts retrieved successfully", attempts);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving user exam attempts",
      500,
      error
    );
  }
};

export const getAttemptsByStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { status } = req.params;
    const attempts = await examAttemptService.findByStatus(status);
    
    return successResponse(res, "Exam attempts by status retrieved successfully", attempts);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving exam attempts by status",
      500,
      error
    );
  }
};

export const getPassedAttempts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const attempts = await examAttemptService.findPassedAttempts();
    
    return successResponse(res, "Passed exam attempts retrieved successfully", attempts);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving passed exam attempts",
      500,
      error
    );
  }
};

export const submitExamAttempt = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    
    const submittedAttempt = await examAttemptService.submitExamAttempt(id);
    
    if (!submittedAttempt) {
      return errorResponse(res, "Exam attempt not found", 404);
    }

    return successResponse(res, "Exam attempt submitted successfully", submittedAttempt);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while submitting the exam attempt",
      500,
      error
    );
  }
};

export const gradeExamAttempt = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { aiEvaluation, aiNotes, cefrEstimated } = req.body;
    
    const gradedAttempt = await examAttemptService.gradeExamAttempt(
      id, 
      aiEvaluation, 
      aiNotes, 
      cefrEstimated
    );
    
    if (!gradedAttempt) {
      return errorResponse(res, "Exam attempt not found", 404);
    }

    return successResponse(res, "Exam attempt graded successfully", gradedAttempt);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while grading the exam attempt",
      500,
      error
    );
  }
};

export const getAttemptStats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const stats = await examAttemptService.getAttemptStats();
    
    return successResponse(res, "Exam attempt statistics retrieved successfully", stats);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving exam attempt statistics",
      500,
      error
    );
  }
};

export const getUserStats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.params;
    const stats = await examAttemptService.getUserStats(userId);
    
    return successResponse(res, "User attempt statistics retrieved successfully", stats);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving user attempt statistics",
      500,
      error
    );
  }
}; 