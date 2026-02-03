import { Router } from "express";
import {
  getLogsList,
  getLogContent,
  downloadLog,
  deleteLog,
  deleteAllLogs,
} from "../controllers/logsController";

const router = Router();

// Get list of logs
router.get("/", getLogsList);

// Download log (must be before /:logName to avoid route conflict)
router.get("/:logName/download", downloadLog);

// Get log content
router.get("/:logName", getLogContent);

// Delete single log
router.delete("/:logName", deleteLog);

// Delete all logs (must be after /:logName to avoid route conflict)
router.delete("/", deleteAllLogs);

export default router;
