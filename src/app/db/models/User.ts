import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "admin" | "teacher" | "student";
  firstName?: string;
  lastName?: string;
  image?: string;
  language: string;
  isActive: boolean;
  address?: string;
  phone?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

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
