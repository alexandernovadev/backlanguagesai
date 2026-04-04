import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";

import { connectDB } from "./app/db/mongoConnection";
import { initializeBackupScheduler } from "./app/services/backup/backupSchedulerService";
import logger from "./app/utils/logger";

// Routes
import LectureRoutes from "./app/routes/lectureRoutes";
import WordsRoutes from "./app/routes/wordsRoutes";
import ExpressionRoutes from "./app/routes/expressionRoutes";
import LabsRoutes from "./app/routes/labsRoutes";
import UploadRoutes from "./app/routes/uploadRoutes";
import AuthRoutes from "./app/routes/authRoutes";
import UserRoutes from "./app/routes/userRoutes";
import StatsRoutes from "./app/routes/statsRoutes";
import ExamRoutes from "./app/routes/examRoutes";
import AIConfigRoutes from "./app/routes/aiConfigRoutes";

// Utils
import { errorResponse, successResponse } from "./app/utils/responseHelpers";
import { requestLogger } from "./app/utils/requestLogger";
import { authMiddleware } from "./app/middlewares/authMiddleware";

// Import package.json for version
import packageJson from "../package.json";

dotenv.config();

const app = express();
const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 3000;
const VERSION = `v${packageJson.version}-${NODE_ENV}`;
const LABS_AUTH = (process.env.LABS_AUTH || "true").toLowerCase() === "true";
const CORS_ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// Security headers
app.use(helmet());

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests, please try again later" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many login attempts, please try again later" },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "AI request limit reached, please slow down" },
});

app.use(generalLimiter);

// Middleware to parse JSON
app.use(express.json());

// Middleware to handle CORS
app.use(
  cors({
    origin: CORS_ORIGINS,
    credentials: true,
  })
);

// Middleware to log requests
app.use(requestLogger);

// Static files
const publicPath = path.join(__dirname, "..", "public");
app.use("/audios", express.static(path.join(publicPath, "audios")));
app.use("/images", express.static(path.join(publicPath, "images")));

// Routes
app.use("/api/auth", authLimiter, AuthRoutes);
app.use("/api/lectures", authMiddleware, aiLimiter, LectureRoutes);
app.use("/api/words", authMiddleware, aiLimiter, WordsRoutes);
app.use("/api/expressions", authMiddleware, aiLimiter, ExpressionRoutes);
app.use("/api/users", authMiddleware, UserRoutes);
app.use("/api/stats", authMiddleware, StatsRoutes);
app.use("/api/exams", authMiddleware, aiLimiter, ExamRoutes);
app.use("/api/ai-config", authMiddleware, AIConfigRoutes);

// Labs routes (conditional auth)
if (LABS_AUTH) {
  app.use("/api/labs", authMiddleware, LabsRoutes);
} else {
  app.use("/api/labs", LabsRoutes);
}

// Upload routes (must be after labs to avoid conflict)
app.use("/api", authMiddleware, UploadRoutes);

app.get("/", (req: Request, res: Response) => {
  successResponse(res, "Server is running", {
    date: new Date().toISOString(),
    version: VERSION,
    environment: NODE_ENV,
  });
});

// Error-handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  errorResponse(res, "Internal server error", 500, err);
});

async function init() {
  // Connect DB and start server
  connectDB()
    .then(() => {
      console.info("Connection to MongoDB established successfully");
      logger.info("Connection to MongoDB", {
        message: "Se conectó todo bn",
      });

      app.listen(PORT, () => {
        console.info(`Server running on port ${PORT} - "${NODE_ENV}"`);
        logger.info("Server running on port: ", {
          message: `${PORT} - "${NODE_ENV}`,
        });

        // Initialize backup cron scheduler
        try {
          initializeBackupScheduler();
          logger.info("Backup cron scheduler initialized");
        } catch (error) {
          logger.error("Failed to initialize backup cron scheduler", { error });
        }
      });
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB:", error);
      logger.error("Error Response:", {
        message: error,
      });
    });
}

init();
