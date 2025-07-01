import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utils/responseHelpers";
import { CleanerService } from "../services/cleanerService";

export class CleanerController {
  // Borrar TODOS los intentos de examen
  static async cleanExamAttempts(req: Request, res: Response) {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user?._id) {
        return errorResponse(res, "Usuario no autenticado", 401);
      }

      const result = await CleanerService.cleanExamAttempts();
      
      return successResponse(res, "TODOS los intentos de examen han sido eliminados exitosamente", {
        deletedCount: result.deletedCount,
        totalFound: result.totalFound,
        message: `Se eliminaron ${result.deletedCount} intentos de examen de un total de ${result.totalFound}`
      });
    } catch (error) {
      console.error("Error cleaning exam attempts:", error);
      return errorResponse(res, "Error al eliminar los intentos de examen", 500, error);
    }
  }

  // Borrar TODOS los exámenes
  static async cleanExams(req: Request, res: Response) {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user?._id) {
        return errorResponse(res, "Usuario no autenticado", 401);
      }

      const result = await CleanerService.cleanExams();
      
      return successResponse(res, "TODOS los exámenes han sido eliminados exitosamente", {
        deletedExams: result.deletedExams,
        deletedAttempts: result.deletedAttempts,
        totalExamsFound: result.totalExamsFound,
        totalAttemptsFound: result.totalAttemptsFound,
        message: `Se eliminaron ${result.deletedExams} exámenes y ${result.deletedAttempts} intentos asociados`
      });
    } catch (error) {
      console.error("Error cleaning exams:", error);
      return errorResponse(res, "Error al eliminar los exámenes", 500, error);
    }
  }

  // Borrar TODAS las preguntas
  static async cleanQuestions(req: Request, res: Response) {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user?._id) {
        return errorResponse(res, "Usuario no autenticado", 401);
      }

      const result = await CleanerService.cleanQuestions();
      
      return successResponse(res, "TODAS las preguntas han sido eliminadas exitosamente", {
        deletedCount: result.deletedCount,
        totalQuestionsBefore: result.totalQuestionsBefore,
        message: `Se eliminaron ${result.deletedCount} preguntas de un total de ${result.totalQuestionsBefore}`
      });
    } catch (error) {
      console.error("Error cleaning questions:", error);
      return errorResponse(res, "Error al eliminar las preguntas", 500, error);
    }
  }
} 