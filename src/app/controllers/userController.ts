import { Request, Response } from "express";
import { UserService } from "../services/users/userService";
import { UserAuditService } from "../services/users/userAuditService";
import { successResponse, errorResponse } from "../utils/responseHelpers";

const userService = new UserService();

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getUsers(req.query);
    return successResponse(res, "Users listed successfully", users);
  } catch (error) {
    return errorResponse(res, "Error listing users", 500, error);
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return errorResponse(res, "User not found", 404);
    return successResponse(res, "User found", user);
  } catch (error) {
    return errorResponse(res, "Error getting user", 500, error);
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.createUser(req.body, req, req.user?._id?.toString());
    return successResponse(res, "User created successfully", user, 201);
  } catch (error) {
    return errorResponse(res, "Error creating user", 400, error);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req, req.user?._id?.toString());
    if (!user) return errorResponse(res, "User not found", 404);
    return successResponse(res, "User updated successfully", user);
  } catch (error) {
    return errorResponse(res, "Error updating user", 400, error);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.deleteUser(req.params.id, req, req.user?._id?.toString());
    if (!user) return errorResponse(res, "User not found", 404);
    return successResponse(res, "User deleted successfully", user);
  } catch (error) {
    return errorResponse(res, "Error deleting user", 400, error);
  }
};

export const getUserAuditLogs = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const logs = await UserAuditService.getUserAuditLogs(
      userId,
      Number(page),
      Number(limit)
    );
    
    return successResponse(res, "User audit logs retrieved successfully", logs);
  } catch (error) {
    return errorResponse(res, "Error getting user audit logs", 500, error);
  }
};

export const getAuditLogsByAction = async (req: Request, res: Response) => {
  try {
    const { action } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    if (!["CREATE", "UPDATE", "DELETE", "LOGIN"].includes(action)) {
      return errorResponse(res, "Invalid action type", 400);
    }
    
    const logs = await UserAuditService.getAuditLogsByAction(
      action as "CREATE" | "UPDATE" | "DELETE" | "LOGIN",
      Number(page),
      Number(limit)
    );
    
    return successResponse(res, "Audit logs retrieved successfully", logs);
  } catch (error) {
    return errorResponse(res, "Error getting audit logs", 500, error);
  }
}; 