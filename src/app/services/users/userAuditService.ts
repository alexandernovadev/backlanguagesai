import UserAuditLog, { IUserAuditLog } from "../../db/models/UserAuditLog";
import { Request } from "express";

export class UserAuditService {
  static async logAction(
    userId: string,
    action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN",
    performedBy: string,
    req?: Request,
    field?: string,
    oldValue?: any,
    newValue?: any
  ) {
    try {
      const auditLog = new UserAuditLog({
        userId,
        action,
        field,
        oldValue,
        newValue,
        performedBy,
        ipAddress: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.headers["user-agent"],
        timestamp: new Date(),
      });

      await auditLog.save();
    } catch (error) {
      console.error("Error logging user audit:", error);
      // No lanzamos el error para no interrumpir el flujo principal
    }
  }

  static async getUserAuditLogs(
    userId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit;
    
    const logs = await UserAuditLog.find({ userId })
      .populate("performedBy", "username email")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await UserAuditLog.countDocuments({ userId });

    return {
      data: logs,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  static async getAuditLogsByAction(
    action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN",
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit;
    
    const logs = await UserAuditLog.find({ action })
      .populate("userId", "username email")
      .populate("performedBy", "username email")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await UserAuditLog.countDocuments({ action });

    return {
      data: logs,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }
} 