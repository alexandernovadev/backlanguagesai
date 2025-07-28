import { Router } from "express";
import { ExamAttemptController } from "../controllers/examAttemptController";
import { validateExamAccess, validateAttemptAccess, validateAttemptState } from "../middlewares/examAttemptMiddleware";
import { createJsonUploadMiddleware } from "../middlewares/uploadMiddleware";

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

// Export/Import routes
router.get('/export-file', examAttemptController.exportExamAttemptsToJSON.bind(examAttemptController));
router.post('/import-file', ...createJsonUploadMiddleware(), examAttemptController.importExamAttemptsFromFile.bind(examAttemptController));

export default router; 