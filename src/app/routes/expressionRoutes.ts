import { Router } from "express";
import {
  createExpression,
  getExpressionById,
  getExpressions,
  updateExpression,
  deleteExpression,
  getExpressionByExpression,
  getExpressionsByType,
  getExpressionsOnly,
  exportExpressionsToJSON,
  importExpressionsFromFile,
  addChatMessage,
  getChatHistory,
  clearChatHistory,
} from "../controllers/expressionController";
import { createJsonUploadMiddleware } from "../middlewares/uploadMiddleware";

const router = Router();

// Chat routes
router.post("/:expressionId/chat", addChatMessage);
router.get("/:expressionId/chat", getChatHistory);
router.delete("/:expressionId/chat", clearChatHistory);

// Expression routes
router.get("/by-type/:type", getExpressionsByType);
router.get("/expressions-only", getExpressionsOnly);
router.get("/:expression/expression", getExpressionByExpression);
router.get("/:id", getExpressionById);
router.get("/", getExpressions);
router.post("/", createExpression);
router.put("/:id", updateExpression);
router.delete("/:id", deleteExpression);

// Export/Import routes
router.get("/export/json", exportExpressionsToJSON);
router.post("/import/json", ...createJsonUploadMiddleware(), importExpressionsFromFile);

export default router; 