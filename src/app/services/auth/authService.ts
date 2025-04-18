import jwt from "jsonwebtoken";
import User, { IUser } from "../../db/models/User";
import bcrypt from "bcryptjs";
import logger from "../../utils/logger";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

export const AuthService = {
  // Generate a JWT token
  generateToken: (user: IUser) => {
    return jwt.sign({ user }, JWT_SECRET, { expiresIn: "7d" });
  },

  // Verify a JWT token
  verifyToken: (token: string) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid token");
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
