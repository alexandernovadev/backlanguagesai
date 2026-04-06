import { Router } from "express";
import { validateObjectId } from "../middlewares/validateObjectId";
import {
  generate,
  validate,
  correct,
  create,
  getById,
  list,
  remove,
  startAttempt,
  submitAttempt,
  getAttempt,
  deleteAttempt,
  listAttempts,
  listAttemptsByExam,
  chatOnQuestion,
} from "../controllers/examController";

const router = Router();
router.param("id", validateObjectId);
router.param("attemptId", validateObjectId);

// Generate, validate, correct (no persistence)
router.post("/generate", generate);
router.post("/validate", validate);
router.post("/correct", correct);

// Exam CRUD
router.get("/", list);
router.post("/", create);

// Attempts (static routes first to avoid :id conflict)
router.get("/attempts/my", listAttempts);

router.get("/:id", getById);
router.delete("/:id", remove);
router.get("/:id/attempts", listAttemptsByExam);
router.post("/:id/attempts", startAttempt);
router.get("/:id/attempts/:attemptId", getAttempt);
router.delete("/:id/attempts/:attemptId", deleteAttempt);
router.post("/:id/attempts/:attemptId/submit", submitAttempt);
router.post("/:id/attempts/:attemptId/questions/:questionIndex/chat", chatOnQuestion);

export default router;
