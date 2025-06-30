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
    const { userId, examId, attemptNumber } = req.body;
    
    if (!userId || !examId) {
      return errorResponse(res, "userId and examId are required", 400);
    }

    const newAttempt = await examAttemptService.createExamAttempt(
      userId,
      examId,
      attemptNumber || 1
    );
    
    return successResponse(res, "Exam attempt created successfully", newAttempt, 201);
  } catch (error) {
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
    } = req.query;

    const filters = {
      page: Number(page),
      limit: Number(limit),
      user: user as string,
      exam: exam as string,
      status: status as string,
      passed: passed === 'true' ? true : passed === 'false' ? false : undefined,
      startedAfter: startedAfter as string,
      startedBefore: startedBefore as string,
      submittedAfter: submittedAfter as string,
      submittedBefore: submittedBefore as string,
    };

    const result = await examAttemptService.getExamAttempts(filters);
    
    return successResponse(res, "Exam attempts retrieved successfully", result);
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
    const deleted = await examAttemptService.deleteExamAttempt(id);
    
    if (!deleted) {
      return errorResponse(res, "Exam attempt not found", 404);
    }

    return successResponse(res, "Exam attempt deleted successfully", { deleted: true });
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
    const attempts = await examAttemptService.getAttemptsByUserAndExam(userId, examId);
    
    return successResponse(res, "Attempts retrieved successfully", attempts);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving attempts",
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
    const attempts = await examAttemptService.getAttemptsByStatus(status);
    
    return successResponse(res, "Attempts retrieved successfully", attempts);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving attempts",
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
    const attempts = await examAttemptService.getPassedAttempts();
    
    return successResponse(res, "Passed attempts retrieved successfully", attempts);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving passed attempts",
      500,
      error
    );
  }
};

export const submitAnswer = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { questionId, answer } = req.body;
    
    if (!questionId || answer === undefined) {
      return errorResponse(res, "questionId and answer are required", 400);
    }

    const updatedAttempt = await examAttemptService.submitAnswer(
      id,
      questionId,
      answer
    );
    
    if (!updatedAttempt) {
      return errorResponse(res, "Exam attempt not found", 404);
    }

    return successResponse(res, "Answer submitted successfully", updatedAttempt);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while submitting the answer",
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

export const getAttemptStats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const stats = await examAttemptService.getAttemptStats();
    
    return successResponse(res, "Attempt statistics retrieved successfully", stats);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving attempt statistics",
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
    
    return successResponse(res, "User statistics retrieved successfully", stats);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving user statistics",
      500,
      error
    );
  }
};

export const checkCanCreateAttempt = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { userId, examId } = req.params;
    
    // For now, always allow creating attempts
    // This can be enhanced later with proper validation
    const canCreate = {
      canCreate: true,
      currentAttempts: 0,
      maxAttempts: 999,
      nextAttemptNumber: 1,
      message: "Can create new attempt"
    };
    
    return successResponse(res, "Attempt creation check completed", canCreate);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while checking attempt creation",
      500,
      error
    );
  }
}; 