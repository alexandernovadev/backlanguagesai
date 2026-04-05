import express from "express";
import upload from "../middlewares/multerUpload";
import { handleMulterError } from "../middlewares/uploadMiddleware";
import { uploadImageHandler } from "../controllers/uploadController";

const router = express.Router();

/** Multer debe pasar errores (p. ej. LIMIT_FILE_SIZE) a handleMulterError. */
const uploadImageFile = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  upload.single("imageFile")(req, res, (err) => {
    if (err) return handleMulterError(err, req, res, next);
    next();
  });
};

// POST /api/upload-image/:entityType/:entityId
router.post(
  "/upload-image/:entityType/:entityId",
  uploadImageFile as express.RequestHandler,
  uploadImageHandler as express.RequestHandler
);

export default router;
