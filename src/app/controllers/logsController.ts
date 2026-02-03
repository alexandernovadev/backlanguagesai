import { Request, Response } from "express";
import { LogsService, LogQueryParams } from "../services/logs/logsService";
import { successResponse, errorResponse } from "../utils/responseHelpers";

const logsService = new LogsService();

/**
 * LOGS CONTROLLER - Log Management Endpoints
 * 
 * GET /api/logs - Get logs with pagination and filters
 * GET /api/logs/stats - Get log statistics
 * GET /api/logs/:id - Get log by ID
 * DELETE /api/logs/:id - Delete log by ID
 * DELETE /api/logs - Delete logs with filters
 */

/**
 * Get logs with pagination and filters
 * GET /api/logs
 */
export const getLogs = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const {
      page,
      limit,
      statusCode,
      startDate,
      endDate,
      search,
    } = req.query;

    const params: LogQueryParams = {
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      statusCode: statusCode ? parseInt(statusCode as string, 10) : undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      search: search as string | undefined,
    };

    const result = await logsService.getLogs(params);
    return successResponse(res, "Logs retrieved successfully", result);
  } catch (error) {
    return errorResponse(res, "Error retrieving logs", 500, error);
  }
};

/**
 * Get log statistics
 * GET /api/logs/stats
 */
export const getLogStats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const stats = await logsService.getLogStats();
    return successResponse(res, "Log statistics retrieved successfully", stats);
  } catch (error) {
    return errorResponse(res, "Error retrieving log statistics", 500, error);
  }
};

/**
 * Get log by ID
 * GET /api/logs/:id
 */
export const getLogById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const log = await logsService.getLogById(id);
    return successResponse(res, "Log retrieved successfully", log);
  } catch (error: any) {
    if (error.message === "Log not found") {
      return errorResponse(res, error.message, 404);
    }
    return errorResponse(res, "Error retrieving log", 500, error);
  }
};

/**
 * Delete log by ID
 * DELETE /api/logs/:id
 */
export const deleteLogById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    await logsService.deleteLogById(id);
    return successResponse(res, "Log deleted successfully", { id });
  } catch (error: any) {
    if (error.message === "Log not found") {
      return errorResponse(res, error.message, 404);
    }
    return errorResponse(res, "Error deleting log", 500, error);
  }
};

/**
 * Delete logs with filters
 * DELETE /api/logs
 */
export const deleteLogs = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const {
      statusCode,
      startDate,
      endDate,
      search,
    } = req.query;

    const params: LogQueryParams = {
      statusCode: statusCode ? parseInt(statusCode as string, 10) : undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      search: search as string | undefined,
    };

    const result = await logsService.deleteLogs(params);
    return successResponse(
      res,
      `Deleted ${result.deletedCount} log(s) successfully`,
      result
    );
  } catch (error) {
    return errorResponse(res, "Error deleting logs", 500, error);
  }
};
