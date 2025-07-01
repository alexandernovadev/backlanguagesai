import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utils/responseHelpers";
import { CleanerService } from "../services/cleanerService";

export class CleanerController {
  // Borrar todos los intentos de examen del usuario
  static async cleanExamAttempts(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      // Verificar que el usuario solo puede borrar sus propios datos
      if (req.user?._id.toString() !== userId) {
        return errorResponse(res, "No tienes permisos para realizar esta acción", 403);
      }

      const result = await CleanerService.cleanExamAttempts(userId);
      
      return successResponse(res, "Intentos de examen eliminados exitosamente", {
        deletedCount: result.deletedCount,
        message: `Se eliminaron ${result.deletedCount} intentos de examen`
      });
    } catch (error) {
      console.error("Error cleaning exam attempts:", error);
      return errorResponse(res, "Error al eliminar los intentos de examen", 500, error);
    }
  }

  // Borrar todos los exámenes del usuario
  static async cleanExams(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      // Verificar que el usuario solo puede borrar sus propios datos
      if (req.user?._id.toString() !== userId) {
        return errorResponse(res, "No tienes permisos para realizar esta acción", 403);
      }

      const result = await CleanerService.cleanExams(userId);
      
      return successResponse(res, "Exámenes eliminados exitosamente", {
        deletedExams: result.deletedExams,
        deletedAttempts: result.deletedAttempts,
        message: `Se eliminaron ${result.deletedExams} exámenes y ${result.deletedAttempts} intentos asociados`
      });
    } catch (error) {
      console.error("Error cleaning exams:", error);
      return errorResponse(res, "Error al eliminar los exámenes", 500, error);
    }
  }

  // Borrar todas las preguntas del usuario
  static async cleanQuestions(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      // Verificar que el usuario solo puede borrar sus propios datos
      if (req.user?._id.toString() !== userId) {
        return errorResponse(res, "No tienes permisos para realizar esta acción", 403);
      }

      const result = await CleanerService.cleanQuestions(userId);
      
      return successResponse(res, "Preguntas eliminadas exitosamente", {
        deletedCount: result.deletedCount,
        message: `Se eliminaron ${result.deletedCount} preguntas`
      });
    } catch (error) {
      console.error("Error cleaning questions:", error);
      return errorResponse(res, "Error al eliminar las preguntas", 500, error);
    }
  }
} 