import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { 
  cleanExamAttempts,
  cleanExams,
  cleanQuestions
} from "../controllers/labsController";

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Borrar todos los intentos de examen
router.delete("/exam-attempts", cleanExamAttempts);

// Borrar todos los exámenes
router.delete("/exams", cleanExams);

// Borrar todas las preguntas
router.delete("/questions", cleanQuestions);

export default router; 