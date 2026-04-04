import { Router } from "express";
import {
  createAdminUser,
  sendBackupByEmailHandler,
  deleteAllWords,
  deleteAllExpressions,
  deleteAllLectures,
  migrateSinonymsToSynonyms
} from "../controllers/labsController";

const routes = Router();

// User management
routes.post("/users/create-admin", createAdminUser);

// Backup and maintenance
routes.post("/backup/send-email", sendBackupByEmailHandler);

// Migrations
routes.post("/migrations/sinonyms-to-synonyms", migrateSinonymsToSynonyms);

// Data Management - Dangerous Operations ⚠️
routes.delete("/data/words/delete-all", deleteAllWords);
routes.delete("/data/expressions/delete-all", deleteAllExpressions);
routes.delete("/data/lectures/delete-all", deleteAllLectures);

export default routes;