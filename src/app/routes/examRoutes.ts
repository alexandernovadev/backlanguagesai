import { Router } from "express";
import {
  generate,
  validate,
  create,
  getById,
  list,
  remove,
  startAttempt,
  submitAttempt,
  getAttempt,
  listAttempts,
  chatOnQuestion,
} from "../controllers/ExamController";

const router = Router();

// Generate & validate (no persistence)
router.post("/generate", generate);
router.post("/validate", validate);

// Exam CRUD
router.get("/", list);
router.post("/", create);

// Attempts (static routes first to avoid :id conflict)
router.get("/attempts/my", listAttempts);

router.get("/:id", getById);
router.delete("/:id", remove);
router.post("/:id/attempts", startAttempt);
router.get("/:id/attempts/:attemptId", getAttempt);
router.post("/:id/attempts/:attemptId/submit", submitAttempt);
router.post("/:id/attempts/:attemptId/questions/:questionIndex/chat", chatOnQuestion);

export default router;
