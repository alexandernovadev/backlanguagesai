import { Request, Response, NextFunction } from "express";
import { isValidObjectId } from "mongoose";
import { errorResponse } from "../utils/responseHelpers";

/**
 * Express router.param() handler — validates that a route parameter is a
 * valid MongoDB ObjectId before the request reaches any controller.
 *
 * Usage in a router file:
 *   router.param("id", validateObjectId);
 *   router.param("attemptId", validateObjectId);
 */
export const validateObjectId = (
  req: Request,
  res: Response,
  next: NextFunction,
  value: string
) => {
  if (!isValidObjectId(value)) {
    return errorResponse(res, "Invalid ID format", 400);
  }
  next();
};
