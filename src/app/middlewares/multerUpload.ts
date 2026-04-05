import multer from "multer";
import { MAX_FILE_SIZE_BYTES } from "../../config/constants";

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
});

export default upload;
