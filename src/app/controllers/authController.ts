import { Request, Response } from "express";
import { AuthService } from "../services/auth/authService";
import { errorResponse, successResponse } from "../utils/responseHelpers";
import { IUser } from "../db/models/User";

export const AuthController = {
  login: async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
      if (!username || !password) {
        return errorResponse(res, "Username and password are required", 400);
      }

      const user = await AuthService.validateUserFromDB(username, password);
      if (user) {
        const token = AuthService.generateToken(user);
        return successResponse(res, "Login successful", { token });
      } else {
        return errorResponse(res, "Invalid credentials", 401);
      }
    } catch (error) {
      return errorResponse(res, "Authentication failed", 500, error);
    }
  },
};
