import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  language: string; // NUEVO: idioma preferido del usuario
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    firstName: { type: String },
    lastName: { type: String },
    language: { 
      type: String, 
      default: "es", // Español por defecto
      enum: ["es", "en", "fr", "de", "it", "pt"] // Idiomas soportados
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

export default mongoose.model<IUser>("User", UserSchema);
