import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(), // Store temporarily in memory
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maximum
  },
  fileFilter: (req, file, cb: multer.FileFilterCallback) => {
    // Validate that it's an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export default upload;
