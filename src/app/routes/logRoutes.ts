import { Router } from "express";
import { clearLogs, getLogs } from "../controllers/logController";

const router = Router();

router.get("/", getLogs);
router.get("/clear", clearLogs);

export default router;
