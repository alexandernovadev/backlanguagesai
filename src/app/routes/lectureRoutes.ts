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
} from "../controllers/LectureController";

const router = Router();

router.post("/generateAudio/:idlecture", updateUrlAudioLectureByIdByGPT);

router.get("/export-json", exportLecturesToJSON);
router.get("/", getAllLectures);
router.get("/:id", getLectureById);

router.post("/", createLecture);

router.put("/:id", updateLecture);
router.put("/image/:id", updateImageLecureById);

router.delete("/:id", deleteLecture);

export default router;
