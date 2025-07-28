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
  exportQuestionsToJSON,
  importQuestionsFromFile,
} from "../controllers/questionController";
import { createJsonUploadMiddleware } from "../middlewares/uploadMiddleware";

const router = Router();

// Basic CRUD routes
router.get("/", getQuestions);
router.get("/stats", getQuestionStats);

// Export/Import routes
router.get("/export-file", exportQuestionsToJSON);
router.post("/import-file", ...createJsonUploadMiddleware(), importQuestionsFromFile);

// Specialized routes (deben ir antes que las rutas con parámetros dinámicos)
router.get("/level/:level", getQuestionsForLevel);
router.get("/level/:level/type/:type", getQuestionsByLevelAndType);
router.get("/topic/:topic", getQuestionsByTopic);
router.get("/tags/:tags", getQuestionsByTags);
router.get("/random/:level/:type", getRandomQuestions);

// Rutas con parámetros dinámicos al final
router.get("/:id", getQuestionById);

router.post("/", createQuestion);

router.put("/:id", updateQuestion);

router.delete("/:id", deleteQuestion);

export default router; 