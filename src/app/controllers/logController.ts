import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { parseAppLogs } from "./helpers/parseLogsApp";
import { errorResponse, successResponse } from "../utils/responseHelpers";
import { parseErrorLog } from "./helpers/parseLogErrors";

export const getLogs = (req: Request, res: Response) => {
  try {
    const logsPath = path.join(__dirname, "../../../logs");
    const errorLog = fs.readFileSync(
      path.join(logsPath, "errors.log"),
      "utf-8"
    );
    const appLog = fs.readFileSync(path.join(logsPath, "app.log"), "utf-8");

    // Parse app.log
    const formattedAppLog = parseAppLogs(appLog);
    const formattedErrorLog = parseErrorLog(errorLog);

    return successResponse(res, "Logs retrieved successfully", {
      errorLog: formattedErrorLog,
      appLog: formattedAppLog,
    });
  } catch (error) {
    return errorResponse(res, "Failed to retrieve log", 500, error);
  }
};

export const clearLogs = (req: Request, res: Response) => {
  try {
    const logsPath = path.join(__dirname, "../../../logs");
    const logFiles = [
      "app.log",
      "errors.log",
      "exceptions.log",
      "rejections.log",
    ];

    logFiles.forEach((file) => {
      const filePath = path.join(logsPath, file);
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, ""); // Clean all logs
      }
    });

    return successResponse(res, "All logs have been cleared successfully", {});
  } catch (error) {
    return errorResponse(res, "Failed to clear logs ", 500, error);
  }
};
