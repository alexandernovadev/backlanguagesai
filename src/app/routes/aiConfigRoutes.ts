import { Router } from "express";
import {
  getAIConfigs,
  getAIConfig,
  saveAIConfig,
  deleteAIConfig,
  getDefaults,
} from "../controllers/AIConfigController";

const router = Router();

// Get all configs for current user
router.get("/", getAIConfigs);

// Get defaults
router.get("/defaults", getDefaults);

// Get specific config
router.get("/:feature/:operation", getAIConfig);

// Save/update config
router.post("/", saveAIConfig);

// Delete config (restore to default)
router.delete("/:feature/:operation", deleteAIConfig);

export default router;
