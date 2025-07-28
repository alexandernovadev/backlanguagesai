import { Router } from "express";
import {
  createExam,
  getExamById,
  getExamBySlug,
  getExams,
  updateExam,
  deleteExam,
  getExamsByLevelAndLanguage,
  getExamsByTopic,
  getExamsByCreator,
  getExamsForLevel,
  addQuestionToExam,
  removeQuestionFromExam,
  getExamStats,
  generateExamFromQuestions,
  createExamWithQuestions,
  getExamsWithAttempts,
  getExamAttemptStats,
  exportExamsToJSON,
  importExamsFromFile,
} from "../controllers/examController";
import { createJsonUploadMiddleware } from "../middlewares/uploadMiddleware";

const router = Router();

// Basic CRUD routes
router.get("/", getExams);
router.get("/with-attempts", getExamsWithAttempts); // Nueva ruta para exámenes con intentos
router.post("/", createExam);
router.post("/with-questions", createExamWithQuestions);

// Specialized routes (must come before dynamic routes)
router.get("/stats", getExamStats);
router.post("/generate", generateExamFromQuestions);

// Export/Import routes
router.get("/export-file", exportExamsToJSON);
router.post("/import-file", ...createJsonUploadMiddleware(), importExamsFromFile);

// Level and language routes
router.get("/level/:level", getExamsForLevel);
router.get("/level/:level/language/:language", getExamsByLevelAndLanguage);

// Topic and creator routes
router.get("/topic/:topic", getExamsByTopic);
router.get("/creator/:creatorId", getExamsByCreator);

// Question management routes
router.post("/:examId/questions", addQuestionToExam);
router.delete("/:examId/questions/:questionId", removeQuestionFromExam);

// Attempt stats routes
router.get("/:id/attempt-stats", getExamAttemptStats);

// Dynamic routes (must come last)
router.get("/slug/:slug", getExamBySlug); // Ruta para obtener examen por slug
router.get("/:id", getExamById);
router.put("/:id", updateExam);
router.delete("/:id", deleteExam);

export default router; 