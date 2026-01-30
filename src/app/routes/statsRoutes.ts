import { Router } from "express";
import { getDashboardStats } from "../controllers/statsController";

const router = Router();

// Dashboard stats route
router.get("/dashboard", getDashboardStats);

export default router;
