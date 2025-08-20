import { Request, Response } from 'express';
import { uploadWordImage, uploadLectureImage, uploadExpressionImage } from '../services/upload/uploadImageService';
import { successResponse, errorResponse } from '../utils/responseHelpers';

// Extend Request to include multer file
interface UploadRequest extends Request {
  file?: Express.Multer.File;
}

export const uploadImageHandler = async (req: UploadRequest, res: Response): Promise<void> => {
  try {
    const { entityType, entityId } = req.params;
    const imageFile = req.file;

    if (!imageFile) {
      errorResponse(res, 'No image file provided', 400);
      return;
    }

    if (!entityId) {
      errorResponse(res, 'Entity ID required', 400);
      return;
    }

    // Validate entity type
    if (!['word', 'lecture', 'expression'].includes(entityType)) {
      errorResponse(res, 'Invalid entity type', 400);
      return;
    }

    let result;

    // Upload image according to entity type
    switch (entityType) {
      case 'word':
        result = await uploadWordImage(entityId, imageFile.buffer);
        break;
      case 'lecture':
        result = await uploadLectureImage(entityId, imageFile.buffer);
        break;
      case 'expression':
        result = await uploadExpressionImage(entityId, imageFile.buffer);
        break;
      default:
        errorResponse(res, 'Unsupported entity type', 400);
        return;
    }

    successResponse(res, 'Image uploaded successfully', {
      img: result.img,
      entityId: result.entityId,
      entityType: result.entityType
    });

  } catch (error: any) {
    console.error('Error in uploadImageHandler:', error);
    
    if (error.message.includes('not found')) {
      errorResponse(res, error.message, 404);
      return;
    }
    
    errorResponse(res, 'Internal server error', 500, error);
  }
};
