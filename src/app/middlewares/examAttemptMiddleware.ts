import { Request, Response, NextFunction } from "express";
import Exam from "../db/models/Exam";
import ExamAttempt from "../db/models/ExamAttempt";

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
      return res.status(400).json({
        success: false,
        error: "Exam ID is required",
      });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: "Exam not found",
      });
    }

    // Verificar límite de intentos
    const attempts = await ExamAttempt.countDocuments({
      exam: examId,
      user: userId,
      status: { $in: ["submitted", "graded"] },
    });

    if (exam.maxAttempts && attempts >= exam.maxAttempts) {
      return res.status(403).json({
        success: false,
        error: `Maximum attempts (${exam.maxAttempts}) reached for this exam`,
      });
    }

    next();
  } catch (error) {
    console.error("Error in validateExamAccess:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
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
      return res.status(400).json({
        success: false,
        error: "Attempt ID is required",
      });
    }

    const attempt = await ExamAttempt.findById(id);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: "Attempt not found",
      });
    }

    // Verificar que el usuario sea el propietario del intento
    if (attempt.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Access denied: You can only access your own attempts",
      });
    }

    next();
  } catch (error) {
    console.error("Error in validateAttemptAccess:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const validateAttemptState = (allowedStates: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const attempt = await ExamAttempt.findById(id);
      if (!attempt) {
        return res.status(404).json({
          success: false,
          error: "Attempt not found",
        });
      }

      if (!allowedStates.includes(attempt.status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid attempt state. Allowed states: ${allowedStates.join(
            ", "
          )}`,
        });
      }

      next();
    } catch (error) {
      console.error("Error in validateAttemptState:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  };
};
