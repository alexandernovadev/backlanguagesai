import { Router } from "express";
import {
  createQuestion,
  getQuestionById,
  getQuestions,
  updateQuestion,
  deleteQuestion,
  getQuestionsByLevelAndType,
  getQuestionsByTopic,
  getQuestionsByTags,
  getRandomQuestions,
  getQuestionStats,
  getQuestionsForLevel,
} from "../controllers/questionController";

const router = Router();

// Basic CRUD routes
router.get("/", getQuestions);
router.get("/stats", getQuestionStats);
router.get("/:id", getQuestionById);

router.post("/", createQuestion);

router.put("/:id", updateQuestion);

router.delete("/:id", deleteQuestion);

// Specialized routes
router.get("/level/:level", getQuestionsForLevel);
router.get("/level/:level/type/:type", getQuestionsByLevelAndType);
router.get("/topic/:topic", getQuestionsByTopic);
router.get("/tags/:tags", getQuestionsByTags);
router.get("/random/:level/:type", getRandomQuestions);

export default router; 