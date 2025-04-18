import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth/authService";
import { errorResponse } from "../utils/responseHelpers";

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
    const decoded = AuthService.verifyToken(token);
    // @ts-ignore
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, "Unauthorized access", 403, error);
  }
};
