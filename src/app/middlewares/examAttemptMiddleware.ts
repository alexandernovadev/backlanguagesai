import { Request, Response, NextFunction } from "express";
import Exam from "../db/models/Exam";
import ExamAttempt from "../db/models/ExamAttempt";
import { errorResponse } from "../utils/responseHelpers";

export const validateExamAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // For /start route, examId is in body; for other routes, it's in params
    const examId = req.params.examId || req.body.examId;
      // @ts-ignore
    const userId = req.user?.id || req.user?._id;

    if (!examId) {
      return errorResponse(res, "Exam ID is required", 400);
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return errorResponse(res, "Exam not found", 404);
    }

    // Verificar límite de intentos
    const attempts = await ExamAttempt.countDocuments({
      exam: examId,
      user: userId,
      status: { $in: ["submitted", "graded"] },
    });

    if (exam.maxAttempts && attempts >= exam.maxAttempts) {
      return errorResponse(res, `Maximum attempts (${exam.maxAttempts}) reached for this exam`, 403);
    }

    next();
  } catch (error) {
    console.error("Error in validateExamAccess:", error);
    return errorResponse(res, "Internal server error", 500, error);
  }
};

export const validateAttemptAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
      // @ts-ignore
    const userId = req.user?.id || req.user?._id;

    if (!id) {
      return errorResponse(res, "Attempt ID is required", 400);
    }

    const attempt = await ExamAttempt.findById(id);
    if (!attempt) {
      return errorResponse(res, "Attempt not found", 404);
    }

    // Verificar que el usuario sea el propietario del intento
    if (attempt.user.toString() !== userId) {
      return errorResponse(res, "Access denied: You can only access your own attempts", 403);
    }

    next();
  } catch (error) {
    console.error("Error in validateAttemptAccess:", error);
    return errorResponse(res, "Internal server error", 500, error);
  }
};

export const validateAttemptState = (allowedStates: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const attempt = await ExamAttempt.findById(id);
      if (!attempt) {
        return errorResponse(res, "Attempt not found", 404);
      }

      if (!allowedStates.includes(attempt.status)) {
        return errorResponse(res, `Invalid attempt state. Allowed states: ${allowedStates.join(", ")}`, 400);
      }

      next();
    } catch (error) {
      console.error("Error in validateAttemptState:", error);
      return errorResponse(res, "Internal server error", 500, error);
    }
  };
};
