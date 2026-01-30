import { Request, Response } from "express";
import { StatsService } from "../services/stats/statsService";
import { successResponse, errorResponse } from "../utils/responseHelpers";

const statsService = new StatsService();

/**
 * Get dashboard statistics
 * GET /api/stats/dashboard
 */
export const getDashboardStats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const stats = await statsService.getDashboardStats();
    return successResponse(res, "Dashboard stats retrieved successfully", stats);
  } catch (error) {
    return errorResponse(res, "Error retrieving dashboard stats", 500, error);
  }
};
