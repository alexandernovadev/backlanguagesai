import { Router } from "express";
import { 
  createAdminUser,
  sendBackupByEmailHandler
} from "../controllers/labsController";

const routes = Router();

// User management
routes.post("/users/create-admin", createAdminUser);

// Backup and maintenance
routes.post("/backup/send-email", sendBackupByEmailHandler);

export default routes;