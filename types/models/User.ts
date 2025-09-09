import { Document } from "mongoose";
import { Language, UserRole } from "../business";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  image?: string;
  language: Language;
  isActive: boolean;
  address?: string;
  phone?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
