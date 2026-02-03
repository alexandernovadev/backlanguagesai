import { Request, Response } from "express";
import { createReadStream } from "fs";
import zlib from "zlib";
import { successResponse, errorResponse } from "../utils/responseHelpers";
import { LogsService } from "../services/logs/logsService";
import logger from "../utils/logger";

const logsService = new LogsService();

/**
 * LOGS CONTROLLER - Log Management Endpoints
 * 
 * GET /api/labs/logs - Get list of available logs
 * GET /api/labs/logs/:logName - Get log content with filters
 * GET /api/labs/logs/:logName/download - Download log file
 * DELETE /api/labs/logs/:logName - Clear log file
 * DELETE /api/labs/logs - Clear all log files
 */

/**
 * Get list of available log files
 * GET /api/labs/logs
 */
export const getLogsList = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const result = await logsService.getLogsList();
    return successResponse(res, "Logs list retrieved successfully", result);
  } catch (error: any) {
    logger.error("Error getting logs list:", error);
    return errorResponse(res, "Error retrieving logs list", 500, error);
  }
};

/**
 * Get log content with pagination and filters
 * GET /api/labs/logs/:logName
 */
export const getLogContent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { logName } = req.params;
    const { lines, page, search, level, startDate, endDate } = req.query;

    const params = {
      lines: lines ? parseInt(lines as string, 10) : undefined,
      page: page ? parseInt(page as string, 10) : undefined,
      search: search as string | undefined,
      level: level as string | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
    };

    const result = await logsService.getLogContent(logName, params);
    return successResponse(res, "Log content retrieved successfully", result);
  } catch (error: any) {
    logger.error("Error getting log content:", error);
    
    if (error.message.includes("Invalid log name")) {
      return errorResponse(res, error.message, 400);
    }
    if (error.message.includes("not found")) {
      return errorResponse(res, error.message, 404);
    }
    if (error.message.includes("too large")) {
      return errorResponse(res, error.message, 413);
    }
    
    return errorResponse(res, "Error retrieving log content", 500, error);
  }
};

/**
 * Download log file
 * GET /api/labs/logs/:logName/download
 */
export const downloadLog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { logName } = req.params;
    const { compress } = req.query;

    // Validate log name
    if (!logsService.validateLogName(logName)) {
      res.status(400).json({
        success: false,
        message: `Invalid log name. Available: app, errors, exceptions, rejections`,
      });
      return;
    }

    // Check if file exists
    const exists = await logsService.logFileExists(logName);
    if (!exists) {
      res.status(404).json({
        success: false,
        message: "Log file not found",
      });
      return;
    }

    const filePath = logsService.getLogFilePath(logName);
    const stats = await logsService.getLogFileStats(logName);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${logName}-${timestamp}.log`;

    if (compress === "true") {
      // Compressed download
      res.setHeader("Content-Type", "application/gzip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}.gz"`
      );
      res.setHeader("Content-Encoding", "gzip");

      const fileStream = createReadStream(filePath);
      const gzip = zlib.createGzip();
      fileStream.pipe(gzip).pipe(res);
    } else {
      // Regular download
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Length", stats.size.toString());

      const fileStream = createReadStream(filePath);
      fileStream.pipe(res);
    }
  } catch (error: any) {
    logger.error("Error downloading log:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading log",
      error: error.message,
    });
  }
};

/**
 * Delete log file
 * DELETE /api/labs/logs/:logName
 */
export const deleteLog = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { logName } = req.params;
    const userId = req.user?.id || req.user?._id;

    await logsService.deleteLog(logName, userId);

    return successResponse(
      res,
      `Log file "${logName}" cleared successfully`,
      {
        logName,
        clearedAt: new Date().toISOString(),
      }
    );
  } catch (error: any) {
    logger.error("Error deleting log:", error);
    
    if (error.message.includes("Invalid log name")) {
      return errorResponse(res, error.message, 400);
    }
    if (error.message.includes("not found")) {
      return errorResponse(res, error.message, 404);
    }
    
    return errorResponse(res, "Error clearing log file", 500, error);
  }
};

/**
 * Delete all log files
 * DELETE /api/labs/logs
 */
export const deleteAllLogs = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?.id || req.user?._id;
    const clearedLogs = await logsService.deleteAllLogs(userId);

    return successResponse(
      res,
      `Cleared ${clearedLogs.length} log file(s) successfully`,
      {
        clearedLogs,
        totalCleared: clearedLogs.length,
        clearedAt: new Date().toISOString(),
      }
    );
  } catch (error: any) {
    logger.error("Error deleting all logs:", error);
    return errorResponse(res, "Error clearing log files", 500, error);
  }
};
