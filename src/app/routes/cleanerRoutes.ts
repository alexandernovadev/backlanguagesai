import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { CleanerController } from "../controllers/cleanerController";

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Borrar todos los intentos de examen del usuario
router.delete("/exam-attempts/:userId", CleanerController.cleanExamAttempts);

// Borrar todos los exámenes del usuario
router.delete("/exams/:userId", CleanerController.cleanExams);

// Borrar todas las preguntas del usuario
router.delete("/questions/:userId", CleanerController.cleanQuestions);

export default router; 