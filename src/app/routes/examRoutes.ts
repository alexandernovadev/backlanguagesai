import { Router } from "express";
import {
  createExam,
  getExamById,
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
} from "../controllers/examController";

const router = Router();

// Basic CRUD routes
router.get("/", getExams);
router.get("/with-attempts", getExamsWithAttempts); // Nueva ruta para exámenes con intentos
router.post("/", createExam);
router.post("/with-questions", createExamWithQuestions);

// Specialized routes (must come before dynamic routes)
router.get("/stats", getExamStats);
router.post("/generate", generateExamFromQuestions);

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
router.get("/:id", getExamById);
router.put("/:id", updateExam);
router.delete("/:id", deleteExam);

export default router; 