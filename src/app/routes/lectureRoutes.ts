import { Router } from "express";
import multer from "multer";
import {
  createLecture,
  getLectureById,
  updateLecture,
  deleteLecture,
  getAllLectures,
  updateImageLecureById,
  updateUrlAudioLectureByIdByGPT,
  exportLecturesToJSON,
  importLecturesFromFile,
} from "../controllers/LectureController";

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

router.post("/generateAudio/:idlecture", updateUrlAudioLectureByIdByGPT);

router.get("/export-json", exportLecturesToJSON);
router.get("/", getAllLectures);
router.get("/:id", getLectureById);

router.post("/", createLecture);

router.put("/:id", updateLecture);
router.put("/image/:id", updateImageLecureById);

router.delete("/:id", deleteLecture);

router.post("/import-file", upload.single('file'), handleMulterError, importLecturesFromFile);

export default router;
