import { Router } from "express";
import {
  getLogs,
  getLogStats,
  getLogById,
  deleteLogById,
  deleteLogs,
} from "../controllers/logsController";

const router = Router();

// Stats route (must be before /:id)
router.get("/stats", getLogStats);

// Get logs with filters
router.get("/", getLogs);

// Delete logs with filters (must be before /:id)
router.delete("/", deleteLogs);

// Get log by ID
router.get("/:id", getLogById);

// Delete log by ID
router.delete("/:id", deleteLogById);

export default router;
