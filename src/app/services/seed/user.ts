import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../../db/models/User";
import logger from "../../utils/logger";

dotenv.config();

export const seedAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL!);

    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      // DELETE THE ADMIN USER
      await User.deleteOne({ role: "admin", username: existingAdmin.username });
    }

    const hashedPassword = await bcrypt.hash(
      process.env.PASSWORD_NOVA || "adminpassword",
      10
    );

    const adminUser = new User({
      username: process.env.USER_NOVA || "admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      firstName: "System",
      lastName: "Administrator",
      isActive: true,
    });

    logger.info("Admin user seeded successfully.", adminUser);
    return await adminUser.save();
  } catch (error) {
    console.error("Error seeding admin user:", error);
    logger.error("Error seeding admin user:", error);
    throw new Error("Failed to seed admin user");
  } finally {
    mongoose.connection.close();
  }
};
