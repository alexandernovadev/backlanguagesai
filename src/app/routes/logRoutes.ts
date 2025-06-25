import { Router } from "express";
import { clearLogs, getLogs, getLogStatistics, exportLogs } from "../controllers/logController";

const router = Router();

router.get("/", getLogs);
router.get("/statistics", getLogStatistics);
router.get("/export", exportLogs);
router.get("/clear", clearLogs);

export default router;
