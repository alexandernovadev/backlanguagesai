import mongoose, { Schema, Document } from "mongoose";

export interface IUserAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN";
  field?: string;
  oldValue?: any;
  newValue?: any;
  performedBy: mongoose.Types.ObjectId;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const userAuditLogSchema = new Schema<IUserAuditLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: {
    type: String,
    enum: ["CREATE", "UPDATE", "DELETE", "LOGIN"],
    required: true,
  },
  field: {
    type: String,
    required: false,
  },
  oldValue: {
    type: Schema.Types.Mixed,
    required: false,
  },
  newValue: {
    type: Schema.Types.Mixed,
    required: false,
  },
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ipAddress: {
    type: String,
    required: false,
  },
  userAgent: {
    type: String,
    required: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Índices para mejorar el rendimiento de consultas
userAuditLogSchema.index({ userId: 1, timestamp: -1 });
userAuditLogSchema.index({ action: 1, timestamp: -1 });
userAuditLogSchema.index({ performedBy: 1, timestamp: -1 });

export default mongoose.model<IUserAuditLog>("UserAuditLog", userAuditLogSchema); 