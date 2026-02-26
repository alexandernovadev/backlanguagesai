import { Router } from "express";
import { list, create, getById, addMessage, requestCorrection, remove } from "../controllers/ChatController";

const router = Router();

router.get("/", list);
router.post("/", create);
router.get("/:id", getById);
router.post("/:id/messages", addMessage);
router.post("/:id/correct", requestCorrection);
router.delete("/:id", remove);

export default router;
