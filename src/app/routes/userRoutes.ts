import { Router } from "express";
import { getUsers, getUserById, createUser, updateUser, deleteUser, exportUsersToJSON, importUsersFromFile } from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { createJsonUploadMiddleware } from "../middlewares/uploadMiddleware";

const router = Router();

router.use(authMiddleware); // Proteger todas las rutas

// Export/Import routes (MUST BE BEFORE DYNAMIC ROUTES)
router.get("/export-file", exportUsersToJSON);
router.post("/import-file", ...createJsonUploadMiddleware(), importUsersFromFile);

// CRUD routes (MUST BE LAST)
router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router; 