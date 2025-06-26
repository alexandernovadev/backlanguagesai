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
} from "../controllers/examController";

const router = Router();

// Basic CRUD routes
router.get("/", getExams);
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

// Dynamic routes (must come last)
router.get("/:id", getExamById);
router.put("/:id", updateExam);
router.delete("/:id", deleteExam);

export default router; 