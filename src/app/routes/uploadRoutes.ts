import express from "express";
import upload from "../middlewares/multerUpload";
import { handleMulterError } from "../middlewares/uploadMiddleware";
import { uploadImageHandler } from "../controllers/uploadController";

const router = express.Router();

/** Multer debe pasar errores (p. ej. LIMIT_FILE_SIZE) a handleMulterError. */
const uploadImageFile = (req: any, res: any, next: express.NextFunction) => {
  upload.single("imageFile")(req, res, (err: unknown) => {
    if (err) return handleMulterError(err, req, res, next);
    next();
  });
};

// POST /api/upload-image/:entityType/:entityId
router.post(
  "/upload-image/:entityType/:entityId",
  uploadImageFile as any,
  uploadImageHandler as any
);

export default router;
