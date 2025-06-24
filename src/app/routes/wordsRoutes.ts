import { Router } from "express";
import {
  createWord,
  getWordById,
  getWords,
  updateWord,
  deleteWord,
  getWordByName,
  updateWordLevel,
  getRecentHardOrMediumWords,
  updateIncrementWordSeens,
  exportWordsToJSON,
} from "../controllers/wordController";

const router = Router();

router.get("/get-cards-anki", getRecentHardOrMediumWords);
router.get("/export-json", exportWordsToJSON);
router.get("/", getWords);
router.get("/:id", getWordById);
router.get("/word/:word", getWordByName);

router.post("/", createWord);

router.put("/:id/level", updateWordLevel);
router.put("/:id/increment-seen", updateIncrementWordSeens);

router.put("/:id", updateWord);

router.delete("/:id", deleteWord);

export default router;
