import { Router } from "express";
import {
  createExamAttempt,
  getExamAttemptById,
  getExamAttempts,
  updateExamAttempt,
  deleteExamAttempt,
  getAttemptsByUserAndExam,
  getAttemptsByStatus,
  getPassedAttempts,
  submitExamAttempt,
  getAttemptStats,
  getUserStats,
  submitAnswer,
  checkCanCreateAttempt,
} from "../controllers/examAttemptController";

const router = Router();

// Basic CRUD routes
router.get("/", getExamAttempts);
router.post("/", createExamAttempt);
router.get("/:id", getExamAttemptById);
router.put("/:id", updateExamAttempt);
router.delete("/:id", deleteExamAttempt);

// Specific routes
router.get("/user/:userId/exam/:examId", getAttemptsByUserAndExam);
router.get("/status/:status", getAttemptsByStatus);
router.get("/passed/all", getPassedAttempts);

// Exam attempt actions
router.post("/:id/submit-answer", submitAnswer);
router.post("/:id/submit", submitExamAttempt);

// Statistics
router.get("/stats/overview", getAttemptStats);
router.get("/stats/user/:userId", getUserStats);

// Validation
router.get("/can-create/:userId/:examId", checkCanCreateAttempt);

export default router; 