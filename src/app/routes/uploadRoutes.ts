import express from 'express';
import upload from '../middlewares/multerUpload';
import { uploadImageHandler } from '../controllers/uploadController';

const router = express.Router();

// Dynamic endpoint for uploading images
// POST /api/upload-image/:entityType/:entityId
// Using 'any' to avoid type conflicts between Express and Multer
router.post('/upload-image/:entityType/:entityId', 
  upload.single('imageFile') as any, 
  uploadImageHandler as any
);

export default router;
