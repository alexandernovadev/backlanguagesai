import { Router } from "express";
import { AuthController } from "../controllers/authController";

const router = Router();

router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refresh);

export default router;
