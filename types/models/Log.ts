import { Document } from "mongoose";

export interface ILog extends Document {
  errorMessage: string;
  statusCode: number;
  errorData?: any;
  stack?: string;
  createdAt: Date;
  updatedAt: Date;
}
