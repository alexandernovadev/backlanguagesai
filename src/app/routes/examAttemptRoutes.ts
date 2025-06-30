import { Router } from "express";
import { ExamAttemptController } from "../controllers/examAttemptController";
import { validateExamAccess, validateAttemptAccess, validateAttemptState } from "../middlewares/examAttemptMiddleware";

const router = Router();
const examAttemptController = new ExamAttemptController();

// Iniciar intento
router.post('/start', validateExamAccess, examAttemptController.startAttempt.bind(examAttemptController));

// Obtener intento en progreso
router.get('/in-progress/:examId', examAttemptController.getInProgressAttempt.bind(examAttemptController));

// Enviar respuestas
router.post('/:id/submit', validateAttemptAccess, validateAttemptState(['in_progress']), examAttemptController.submitAttempt.bind(examAttemptController));

// Calificar con AI
router.post('/:id/grade', validateAttemptAccess, validateAttemptState(['submitted']), examAttemptController.gradeWithAI.bind(examAttemptController));

// Obtener intentos del usuario
router.get('/user/:userId', examAttemptController.getUserAttempts.bind(examAttemptController));

// Obtener detalles de un intento
router.get('/:id', validateAttemptAccess, examAttemptController.getAttemptDetails.bind(examAttemptController));

// Abandonar intento
router.post('/:id/abandon', validateAttemptAccess, validateAttemptState(['in_progress']), examAttemptController.abandonAttempt.bind(examAttemptController));

// Obtener estadísticas de intentos
router.get('/stats/:userId', examAttemptController.getAttemptStats.bind(examAttemptController));

export default router; 