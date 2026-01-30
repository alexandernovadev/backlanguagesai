import { Router } from "express";
import { 
  createAdminUser,
  sendBackupByEmailHandler,
  deleteAllWords,
  deleteAllExpressions,
  deleteAllLectures
} from "../controllers/labsController";

const routes = Router();

// User management
routes.post("/users/create-admin", createAdminUser);

// Backup and maintenance
routes.post("/backup/send-email", sendBackupByEmailHandler);

// Data Management - Dangerous Operations ⚠️
routes.delete("/data/words/delete-all", deleteAllWords);
routes.delete("/data/expressions/delete-all", deleteAllExpressions);
routes.delete("/data/lectures/delete-all", deleteAllLectures);

export default routes;