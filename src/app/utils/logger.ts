// logger.ts
import { createLogger, format, transports } from "winston";
import path from "path";

const { combine, timestamp, printf, errors } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level.toUpperCase()}:\n${
    stack || message
  }\n-----------------------------------`;
});

const logger = createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    // new transports.Console(),
    new transports.File({
      filename: path.join(__dirname, "../../../logs/app.log"),
    }),
    new transports.File({
      filename: path.join(__dirname, "../../../logs/errors.log"),
      level: "error",
    }),
  ],
  exceptionHandlers: [
    new transports.File({
      filename: path.join(__dirname, "../../../logs/exceptions.log"),
    }),
  ],
  rejectionHandlers: [
    new transports.File({
      filename: path.join(__dirname, "../../../logs/rejections.log"),
    }),
  ],
});

export default logger;
