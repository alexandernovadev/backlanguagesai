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
  gradeExamAttempt,
  getAttemptStats,
  getUserStats,
  submitAnswer,
  checkCanCreateAttempt,
} from "../controllers/examAttemptController";

const router = Router();

// Basic CRUD routes
router.get("/", getExamAttempts);
router.get("/stats", getAttemptStats);
router.get("/:id", getExamAttemptById);

router.post("/", createExamAttempt);

router.put("/:id", updateExamAttempt);

router.delete("/:id", deleteExamAttempt);

// Specialized routes (must come before dynamic routes)
router.get("/status/:status", getAttemptsByStatus);
router.get("/passed", getPassedAttempts);

// User and exam specific routes
router.get("/user/:userId/exam/:examId", getAttemptsByUserAndExam);
router.get("/user/:userId/stats", getUserStats);
router.get("/user/:userId/exam/:examId/can-create", checkCanCreateAttempt);

// Action routes
router.post("/:id/submit", submitExamAttempt);
router.post("/:id/submit-answer", submitAnswer);
router.post("/:id/grade", gradeExamAttempt);

export default router; 