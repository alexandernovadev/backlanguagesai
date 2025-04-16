import { Request, Response } from "express";
import { AuthService } from "../services/auth/authService";
import { errorResponse, successResponse } from "../utils/responseHelpers";

export const AuthController = {
  login: (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
      if (!username || !password) {
        return errorResponse(res, "Username and password are required", 400);
      }

      if (AuthService.validateUser(username, password)) {
        const token = AuthService.generateToken(username);
        return successResponse(res, "Login successful", { token });
      } else {
        return errorResponse(res, "Invalid credentials", 401);
      }
    } catch (error) {
      return errorResponse(res, "Authentication failed", 500,error);
    }
  },
};
