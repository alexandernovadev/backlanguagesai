import { Request, Response } from "express";
import { AuthService } from "../services/auth/authService";
import { errorResponse, successResponse } from "../utils/responseHelpers";
import User from "../db/models/User";
import { UserAuditService } from "../services/users/userAuditService";

export const AuthController = {
  login: async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
      if (!username || !password) {
        return errorResponse(res, "Username and password are required", 400);
      }

      const user = await AuthService.validateUserFromDB(username, password);
      if (user) {
        // Actualizar lastLogin
        user.lastLogin = new Date();
        await user.save();

        // Log de auditoría para login
        await UserAuditService.logAction(
          user._id.toString(),
          "LOGIN",
          user._id.toString(),
          req
        );

        const token = AuthService.generateToken(user);
        const refreshToken = AuthService.generateRefreshToken(user);

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
          address,
          phone,
          lastLogin,
        } = user;

        const userInfo = {
          _id: _id,
          username,
          email,
          role,
          firstName,
          lastName,
          image,
          language: user.language || 'es',
          isActive,
          address,
          phone,
          lastLogin,
          createdAt,
          updatedAt,
        };

        return successResponse(res, "Login successful", {
          token,
          refreshToken,
          user: userInfo,
        });
        
      } else {
        return errorResponse(res, "Invalid credentials", 401);
      }
    } catch (error) {
      return errorResponse(res, "Authentication failed", 500, error);
    }
  },

  refresh: async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    try {
      if (!refreshToken) {
        return errorResponse(res, "Refresh token is required", 400);
      }

      const result = await AuthService.refreshAccessToken(refreshToken);
      
      return successResponse(res, "Token refreshed successfully", result);
    } catch (error) {
      return errorResponse(res, "Failed to refresh token", 401, error);
    }
  },
};
