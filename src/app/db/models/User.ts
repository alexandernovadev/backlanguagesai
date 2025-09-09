import mongoose, { Schema } from "mongoose";
import { IUser } from "../../../../types/models";
import { systemRolesList, languagesList } from "../../data/bussiness/shared";

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: systemRolesList, default: "student" },
    firstName: { type: String },
    lastName: { type: String },
    language: {
      type: String,
      default: "es",
      enum: languagesList,
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
