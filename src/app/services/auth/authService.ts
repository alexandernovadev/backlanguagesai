import jwt from "jsonwebtoken";
import User, { IUser } from "../../db/models/User";
import bcrypt from "bcryptjs";
import logger from "../../utils/logger";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret_key";

export const AuthService = {
  // Generate a JWT token
  generateToken: (user: IUser) => {
    return jwt.sign({ user }, JWT_SECRET, { expiresIn: "7d" });
  },

  // Generate a refresh token (longer expiration)
  generateRefreshToken: (user: IUser) => {
    return jwt.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, { expiresIn: "30d" });
  },

  // Verify a JWT token
  verifyToken: (token: string) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid token");
    }
  },

  // Verify a refresh token
  verifyRefreshToken: (refreshToken: string) => {
    try {
      return jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  },

  // Refresh access token using refresh token
  refreshAccessToken: async (refreshToken: string) => {
    try {
      const decoded = AuthService.verifyRefreshToken(refreshToken) as any;
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        throw new Error("User not found");
      }

      const newAccessToken = AuthService.generateToken(user);
      const newRefreshToken = AuthService.generateRefreshToken(user);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          image: user.image,
          language: user.language || 'es',
          isActive: user.isActive,
          address: user.address,
          phone: user.phone,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      };
    } catch (error) {
      throw new Error("Failed to refresh token");
    }
  },

  // Validate user credentials (for now, hardcoded)
  validateUser: (username: string, password: string) => {
    const envUser = process.env.USER_NOVA;
    const envPass = process.env.PASSWORD_NOVA;

    return username === envUser && password === envPass;
  },
  validateUserFromDB: async (identifier: string, password: string) => {
    try {
      // Find user by username or email
      const user = await User.findOne({
        $or: [{ username: identifier }, { email: identifier }],
      });

      if (!user) {
        logger.error("User not found", identifier);
        return null;
      }

      // Compare the provided password with the hashed password in the database
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        logger.error("UInvalid password");
        return null;
      }

      return user as IUser; // Return the user object if validation succeeds
    } catch (error) {
      logger.error(error.message || "Authentication failed");
      throw new Error(error.message || "Authentication failed");
    }
  },
};
