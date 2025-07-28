import { Router } from "express";
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
import { createJsonUploadMiddleware } from "../middlewares/uploadMiddleware";

const router = Router();

// Routes
router.post("/generateAudio/:idlecture", updateUrlAudioLectureByIdByGPT);

router.get("/export-file", exportLecturesToJSON);
router.get("/", getAllLectures);
router.get("/:id", getLectureById);

router.post("/", createLecture);

router.put("/:id", updateLecture);
router.put("/image/:id", updateImageLecureById);

router.delete("/:id", deleteLecture);

router.post(
  "/import-file",
  ...createJsonUploadMiddleware(),
  importLecturesFromFile
);

export default router;
