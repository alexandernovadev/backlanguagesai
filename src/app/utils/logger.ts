// logger.ts
import { createLogger, format, transports } from "winston";
import path from "path";

const { combine, timestamp, printf, errors } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level.toUpperCase()}:\n${
    stack || message
  }\n-----------------------------------`;
});

const NODE_ENV = process.env.NODE_ENV || "development";

// Build transports array - Console only in development
const transportsList = [];

if (NODE_ENV === "development") {
  transportsList.push(new transports.Console());
}

transportsList.push(
  new transports.File({
    filename: path.join(__dirname, "../../../logs/app.log"),
  }),
  new transports.File({
    filename: path.join(__dirname, "../../../logs/errors.log"),
    level: "error",
  })
);

const logger = createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat
  ),
  transports: transportsList,
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
