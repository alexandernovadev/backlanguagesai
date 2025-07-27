import { Router } from "express";
import {
  createExpression, getExpressionById, getExpressions, updateExpression, deleteExpression,
  getExpressionByExpression, getExpressionsByType, getExpressionsOnly,
  exportExpressionsToJSON, importExpressionsFromFile,
  addChatMessage, getChatHistory, clearChatHistory, generateExpression,
} from "../controllers/expressionController";
import { createJsonUploadMiddleware } from "../middlewares/uploadMiddleware";

const router = Router();

// Chat routes
router.post("/:expressionId/chat", addChatMessage);
router.get("/:expressionId/chat", getChatHistory);
router.delete("/:expressionId/chat", clearChatHistory);

// AI Generation route
router.post("/generate", generateExpression);

// Filter and search routes
router.get("/by-type/:type", getExpressionsByType);
router.get("/expressions-only", getExpressionsOnly);
router.get("/:expression/expression", getExpressionByExpression);

// CRUD routes
router.get("/:id", getExpressionById);
router.get("/", getExpressions);
router.post("/", createExpression);
router.put("/:id", updateExpression);
router.delete("/:id", deleteExpression);

// Import/Export routes
router.get("/export/json", exportExpressionsToJSON);
router.post("/import/json", ...createJsonUploadMiddleware(), importExpressionsFromFile);

export default router; 