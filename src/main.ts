import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connectDB } from "./app/db/mongoConnection";

// Servir archivos estáticos main
import path from "path";
import logger from "./app/utils/logger";

// Routes
import { generateRoutes } from "./app/routes/generatorIARoutes";
import LectureRoutes from "./app/routes/lectureRoutes";
import WordsRoutes from "./app/routes/wordsRoutes";
import QuestionRoutes from "./app/routes/questionRoutes";
import ExamRoutes from "./app/routes/examRoutes";
import ExamAttemptRoutes from "./app/routes/examAttemptRoutes";
import Arreglosquick from "./app/routes/arreglosquick";
import StatisticsRoutes from "./app/routes/statisticsRoutes";
import LogsRoutes from "./app/routes/logRoutes";
import AuthRoutes from "./app/routes/authRoutes";
import CleanerRoutes from "./app/routes/cleanerRoutes";

import { setupSwagger } from "../swagger/swaggerConfig";
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

// Middleware to parse JSON
app.use(express.json());

// Middleware to handle CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "https://languages-ai.alexandernova.pro"],
    credentials: true,
  })
);

// Middleware to log requests
app.use(requestLogger);

// Swagger Conf
setupSwagger(app);

const publicPath = path.join(__dirname, "..", "public");
app.use("/audios", express.static(path.join(publicPath, "audios")));
app.use("/images", express.static(path.join(publicPath, "images")));

// Routes
app.use("/api/auth", AuthRoutes);
app.use("/api/ai", authMiddleware, generateRoutes);
app.use("/api/lectures", authMiddleware, LectureRoutes);
app.use("/api/words", authMiddleware, WordsRoutes);
app.use("/api/questions", authMiddleware, QuestionRoutes);
app.use("/api/exams", authMiddleware, ExamRoutes);
app.use("/api/exam-attempts", authMiddleware, ExamAttemptRoutes);
app.use("/api/statistics", StatisticsRoutes);

// Logs
app.use("/api/logs", authMiddleware, LogsRoutes);

// Cleaner routes
app.use("/api/cleaner", CleanerRoutes);

// Just for testing purposes
app.use("/api/fixes", Arreglosquick);

app.use("/", (req, res) => {
  successResponse(res, "Server is running", {
    date: new Date().toISOString(),
    version: VERSION,
  });
});


// Error-handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  errorResponse(res, "Something went wrong: " + err, 500);
});

// Connection to MongoDB
connectDB()
  .then(() => {
    console.info("Connection to MongoDB established successfully");
    logger.info("Connection to MongoDB", {
      message: "Se conecto todo bn",
    });

    app.listen(PORT, () => {
      console.info(`Server running on port ${PORT} - "${NODE_ENV}"`);
      logger.info("Server running on port: ", {
        message: `${PORT} - "${NODE_ENV}`,
      });
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    logger.error("Error Response:", {
      message: error,
    });
  });
