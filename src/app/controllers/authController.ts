import { Request, Response } from "express";
import { AuthService } from "../services/auth/authService";
import { errorResponse, successResponse } from "../utils/responseHelpers";

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

        const {
          _id,
          username,
          email,
          role,
          firstName,
          lastName,
          image,
          isActive,
          createdAt,
          updatedAt,
        } = user;

        const userInfo = {
          id: _id,
          username,
          email,
          role,
          firstName,
          lastName,
          image,
          isActive,
          createdAt,
          updatedAt,
        };

        return successResponse(res, "Login successful", {
          token,
          user: userInfo,
        });
        
      } else {
        return errorResponse(res, "Invalid credentials", 401);
      }
    } catch (error) {
      return errorResponse(res, "Authentication failed", 500, error);
    }
  },
};
