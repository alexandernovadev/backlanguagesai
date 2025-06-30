import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth/authService";
import { errorResponse } from "../utils/responseHelpers";

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
  // Get token from Authorization header or query parameter
  const token =
    req.headers.authorization?.split(" ")[1] || // Bearer <token>
    (req.query.tokenAPI as string); // tokenAPI in query param

  if (!token) {
    return errorResponse(
      res,
      "Token not provided",
      401,
      "Token not provided in request"
    );
  }

  try {
    const decoded = AuthService.verifyToken(token) as any;
    // @ts-ignore
    req.user = {
      id: decoded.user._id || decoded.user.id,
      ...decoded.user
    };
    console.log('🔐 Auth middleware - User set:', { userId: req.user.id, user: req.user });
    next();
  } catch (error) {
    console.error('🔐 Auth middleware error:', error);
    return errorResponse(res, "Unauthorized access", 403, error);
  }
};
