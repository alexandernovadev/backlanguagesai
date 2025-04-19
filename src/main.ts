import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connectDB } from "./app/db/mongoConnection";

// Routes
import { generateRoutes } from "./app/routes/generatorIARoutes";
import LectureRoutes from "./app/routes/lectureRoutes";
import WordsRoutes from "./app/routes/wordsRoutes";
import Arreglosquick from "./app/routes/arreglosquick";
import StatisticsRoutes from "./app/routes/statisticsRoutes";
import LogsRoutes from "./app/routes/logRoutes";
import AuthRoutes from "./app/routes/authRoutes";

import { setupSwagger } from "../swagger/swaggerConfig";
import { errorResponse, successResponse } from "./app/utils/responseHelpers";
import { requestLogger } from "./app/utils/requestLogger";
import { authMiddleware } from "./app/middlewares/authMiddleware";

dotenv.config();

const app = express();
const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 3000;
const VERSION = process.env.VERSION || "V. March 8 2025 4:40 PM";

// Middleware to parse JSON
app.use(express.json());

// Middleware to handle CORS
app.use(cors());

// Middleware to log requests
app.use(requestLogger);

// Swagger Conf
setupSwagger(app);

// Connection to MongoDB
connectDB()
  .then(() => {
    console.info("Connection to MongoDB established successfully");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Servir archivos estáticos main
app.use("/audios", express.static("public/audios"));
app.use("/images", express.static("public/images"));

// Routes
app.use("/api/auth", AuthRoutes);
app.use("/api/ai", authMiddleware, generateRoutes);
app.use("/api/lectures", authMiddleware, LectureRoutes);
app.use("/api/words", authMiddleware, WordsRoutes);
app.use("/api/statistics", authMiddleware, StatisticsRoutes);

// Logs
app.use("/api/logs", authMiddleware, LogsRoutes);

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

app.listen(PORT, () => {
  console.info(`Server running on port ${PORT} - "${NODE_ENV}"`);
});
