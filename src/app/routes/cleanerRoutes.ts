import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { CleanerController } from "../controllers/cleanerController";

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Borrar todos los intentos de examen
router.delete("/exam-attempts", CleanerController.cleanExamAttempts);

// Borrar todos los exámenes
router.delete("/exams", CleanerController.cleanExams);

// Borrar todas las preguntas
router.delete("/questions", CleanerController.cleanQuestions);

export default router; 