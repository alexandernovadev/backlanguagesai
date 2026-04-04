import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth/authService";
import { errorResponse } from "../utils/responseHelpers";
import logger from "../utils/logger";

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        _id?: string;
        [key: string]: any;
      };
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return errorResponse(res, "Token not provided", 401, "Token not provided in request");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = AuthService.verifyToken(token) as any;
    req.user = {
      id: decoded.user._id || decoded.user.id,
      _id: decoded.user._id || decoded.user.id,
      ...decoded.user,
    };
    logger.debug("Auth middleware - user authenticated", { userId: req.user._id });
    next();
  } catch (error) {
    logger.error("Auth middleware - invalid token", { error });
    return errorResponse(res, "Unauthorized access", 403, error);
  }
};
