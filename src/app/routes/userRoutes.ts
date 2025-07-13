import { Router } from "express";
import { getUsers, getUserById, createUser, updateUser, deleteUser, getUserAuditLogs, getAuditLogsByAction } from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware); // Proteger todas las rutas

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

// Rutas de auditoría
router.get("/:userId/audit-logs", getUserAuditLogs);
router.get("/audit-logs/:action", getAuditLogsByAction);

export default router; 