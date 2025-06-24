import { Router } from "express";
import multer from "multer";
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
  importWordsFromFile,
} from "../controllers/wordController";

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json') {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'));
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB'
      });
    }
  }
  
  if (error.message === 'Only JSON files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only JSON files are allowed'
    });
  }
  
  next(error);
};

router.get("/get-cards-anki", getRecentHardOrMediumWords);
router.get("/export-json", exportWordsToJSON);
router.get("/", getWords);
router.get("/:id", getWordById);
router.get("/word/:word", getWordByName);

router.post("/", createWord);
router.post("/import-file", upload.single('file'), handleMulterError, importWordsFromFile);

router.put("/:id/level", updateWordLevel);
router.put("/:id/increment-seen", updateIncrementWordSeens);

router.put("/:id", updateWord);

router.delete("/:id", deleteWord);

export default router;
