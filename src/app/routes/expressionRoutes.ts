import { Router } from "express";
import {
  createExpression, getExpressionById, getExpressions, updateExpression, deleteExpression,
  getExpressionByExpression, getExpressionsByType, getExpressionsOnly,
  exportExpressionsToJSON, importExpressionsFromFile,
  addChatMessage, getChatHistory, clearChatHistory, streamChatResponse, generateExpression,
} from "../controllers/expressionController";
import { updateImageExpression } from "../controllers/aiController";
import { createJsonUploadMiddleware } from "../middlewares/uploadMiddleware";

const router = Router();

// Import/Export routes (MUST BE BEFORE DYNAMIC ROUTES)
router.get("/export-file", exportExpressionsToJSON);
router.post("/import-file", ...createJsonUploadMiddleware(), importExpressionsFromFile);

// AI Generation route
router.post("/generate", generateExpression);

// Image update route
router.put("/:idexpression/image", updateImageExpression);

// Filter and search routes
router.get("/by-type/:type", getExpressionsByType);
router.get("/expressions-only", getExpressionsOnly);
router.get("/:expression/expression", getExpressionByExpression);

// Chat routes
router.post("/:expressionId/chat", addChatMessage);
router.post("/:expressionId/chat/stream", streamChatResponse);
router.get("/:expressionId/chat", getChatHistory);
router.delete("/:expressionId/chat", clearChatHistory);

// CRUD routes (MUST BE LAST)
router.get("/:id", getExpressionById);
router.get("/", getExpressions);
router.post("/", createExpression);
router.put("/:id", updateExpression);
router.delete("/:id", deleteExpression);

export default router; 