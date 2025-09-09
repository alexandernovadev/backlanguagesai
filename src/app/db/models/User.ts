import mongoose, { Schema } from "mongoose";
import { IUser } from "../../../../types/models";

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "teacher", "student"], default: "student" },
    firstName: { type: String },
    lastName: { type: String },
    language: {
      type: String,
      default: "es",
      enum: ["es", "en", "fr", "de", "it", "pt"],
    },
    isActive: { type: Boolean, default: true },
    address: { type: String },
    phone: { type: String },
    lastLogin: { type: Date },
    image: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
