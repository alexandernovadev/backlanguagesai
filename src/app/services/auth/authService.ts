// import bcrypt from "bcryptjs"; // Por ahora no se usa
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

export const AuthService = {
  // Generate a JWT token
  generateToken: (username: string) => {
    return jwt.sign({ username }, JWT_SECRET, { expiresIn: "7d" });
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
};
