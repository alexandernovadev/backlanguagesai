import multer from "multer";

// Base multer configuration
const baseConfig = {
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
};

// JSON file configuration
export const jsonUpload = multer({
  ...baseConfig,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/json") {
      cb(null, true);
    } else {
      cb(new Error("Only JSON files are allowed"));
    }
  },
});

// Image file configuration
export const imageUpload = multer({
  ...baseConfig,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// ZIP file configuration
export const zipUpload = multer({
  ...baseConfig,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/zip" ||
      file.mimetype === "application/x-zip-compressed"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only ZIP files are allowed"));
    }
  },
});

// Error handling middleware for multer
export const handleMulterError = (
  error: any,
  req: any,
  res: any,
  next: any
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 10MB",
      });
    }
  }

  if (error.message.includes("Only")) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next(error);
};

// Helper functions for different file types
export const createJsonUploadMiddleware = () => {
  return [jsonUpload.single("file"), handleMulterError];
};

export const createImageUploadMiddleware = () => {
  return [imageUpload.single("image"), handleMulterError];
};

export const createZipUploadMiddleware = () => {
  return [zipUpload.single("file"), handleMulterError];
};

/**
 * Validates that a buffer actually contains JSON, regardless of the declared
 * MIME type. Checks that the first non-whitespace character is `{` or `[`,
 * preventing binary files or scripts disguised as JSON from being parsed.
 */
export function validateJsonBuffer(buffer: Buffer): boolean {
  const firstChar = buffer.toString("utf-8", 0, 512).trimStart()[0];
  return firstChar === "{" || firstChar === "[";
}

/** Maximum number of items allowed in a single JSON import. */
export const MAX_IMPORT_ITEMS = 5_000;
