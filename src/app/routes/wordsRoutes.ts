import { Router } from "express";
import {
  createWord,
  getWordById,
  getWords,
  updateWord,
  deleteWord,
  getWordByName,
  updateWordLevel,
  getAnkiCards,
  updateIncrementWordSeens,
  exportWordsToJSON,
  importWordsFromFile,
  updateWordReview,
  getWordsByType,
  getWordsByTypeOptimized,
  getWordsOnly,
  addChatMessage,
  getChatHistory,
  clearChatHistory,
  streamChatResponse,
  // AI Generation functions
  generateWordJson,
  generateWordExamplesJson,
  generateWordExamplesCodeSwitchingJson,
  generateWordTypesJson,
  generateWordSynomymsJson,
  updateImageWord,
} from "../controllers/wordController";
import { createJsonUploadMiddleware } from "../middlewares/uploadMiddleware";

const router = Router();

// Import/Export routes (MUST BE BEFORE DYNAMIC ROUTES)
router.get("/export-file", exportWordsToJSON);
router.post("/import-file", ...createJsonUploadMiddleware(), importWordsFromFile);

// Static routes
// Ruta unificada para tarjetas Anki
router.get("/anki-cards", getAnkiCards);
router.get("/by-type/:type", getWordsByType);
router.get("/by-type-optimized", getWordsByTypeOptimized);
router.get("/words-only", getWordsOnly);

// Dynamic routes with parameters
router.get("/:word/word", getWordByName);
router.post("/:wordId/update-review", updateWordReview);

// Chat routes
router.post("/:wordId/chat", addChatMessage);
router.post("/:wordId/chat/stream", streamChatResponse);
router.get("/:wordId/chat", getChatHistory);
router.delete("/:wordId/chat", clearChatHistory);

// AI Generation routes
router.post("/generate", generateWordJson);
router.post("/:idword/generate-examples", generateWordExamplesJson);
router.post("/:idword/generate-code-switching", generateWordExamplesCodeSwitchingJson);
router.post("/:idword/generate-types", generateWordTypesJson);
router.post("/:idword/generate-synonyms", generateWordSynomymsJson);
router.post("/:idword/generate-image", updateImageWord);

// CRUD routes (MUST BE LAST)
router.get("/:id", getWordById);
router.get("/", getWords);
router.post("/", createWord);
router.put("/:id", updateWord);
router.delete("/:id", deleteWord);
router.put("/:id/level", updateWordLevel);
router.put("/:id/increment-seen", updateIncrementWordSeens);

export default router;
