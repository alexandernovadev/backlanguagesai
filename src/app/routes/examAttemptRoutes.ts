import { Router } from "express";
import { ExamAttemptController } from "../controllers/examAttemptController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateExamAccess, validateAttemptAccess, validateAttemptState } from "../middlewares/examAttemptMiddleware";

const router = Router();
const examAttemptController = new ExamAttemptController();

// Iniciar intento
router.post('/start', authMiddleware, validateExamAccess, examAttemptController.startAttempt);

// Obtener intento en progreso
router.get('/in-progress/:examId', authMiddleware, examAttemptController.getInProgressAttempt);

// Enviar respuestas
router.post('/:id/submit', authMiddleware, validateAttemptAccess, validateAttemptState(['in_progress']), examAttemptController.submitAttempt);

// Calificar con AI
router.post('/:id/grade', authMiddleware, validateAttemptAccess, validateAttemptState(['submitted']), examAttemptController.gradeWithAI);

// Obtener intentos del usuario
router.get('/user/:userId', authMiddleware, examAttemptController.getUserAttempts);

// Obtener detalles de un intento
router.get('/:id', authMiddleware, validateAttemptAccess, examAttemptController.getAttemptDetails);

// Abandonar intento
router.post('/:id/abandon', authMiddleware, validateAttemptAccess, validateAttemptState(['in_progress']), examAttemptController.abandonAttempt);

// Obtener estadísticas de intentos
router.get('/stats/:userId', authMiddleware, examAttemptController.getAttemptStats);

export default router; 