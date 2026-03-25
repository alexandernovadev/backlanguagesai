import mongoose, { Schema } from "mongoose";
import { IUser } from "../../../../types/models";
import {
  systemRolesList,
  languagesList,
  contentLanguagesList,
} from "../../data/bussiness/shared";

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
      default: "en",
      enum: contentLanguagesList,
    },
    explainsLanguage: {
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

UserSchema.pre("validate", function (next) {
  const doc = this as unknown as { language?: string };
  if (doc.language === "es") {
    doc.language = "en";
  }
  next();
});

const coerceContentLanguage = (_doc: unknown, ret: Record<string, unknown>) => {
  if (ret.language === "es") {
    ret.language = "en";
  }
  return ret;
};

UserSchema.set("toJSON", { transform: coerceContentLanguage });
UserSchema.set("toObject", { transform: coerceContentLanguage });

export default mongoose.model<IUser>("User", UserSchema);
