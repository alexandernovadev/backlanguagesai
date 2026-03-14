import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utils/responseHelpers";
import { WordChatService } from "../services/chats/WordChatService";

const chatService = new WordChatService();

export const list = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id?.toString();
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string) || 20, 1);
    const language = req.user?.language || "en";

    const result = await chatService.list(userId, page, limit, language);
    return successResponse(res, "Chats listed", result);
  } catch (error: any) {
    console.error("Chat list error:", error);
    return errorResponse(res, error.message || "Error listing chats", 500, error);
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id?.toString();
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const { wordSelectionType, language } = req.body;
    if (!wordSelectionType || !["last10", "hard10", "medium10", "easy10"].includes(wordSelectionType)) {
      return errorResponse(res, "wordSelectionType required: last10, hard10, medium10, easy10", 400);
    }

    const chat = await chatService.create(userId, wordSelectionType, language || req.user?.language || "en");
    return successResponse(res, "Chat created", chat, 201);
  } catch (error: any) {
    console.error("Chat create error:", error);
    return errorResponse(res, error.message || "Error creating chat", 500, error);
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id?.toString();
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const chat = await chatService.getById(req.params.id, userId);
    if (!chat) return errorResponse(res, "Chat not found", 404);

    return successResponse(res, "Chat retrieved", chat);
  } catch (error: any) {
    console.error("Chat getById error:", error);
    return errorResponse(res, error.message || "Error getting chat", 500, error);
  }
};

export const addMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id?.toString();
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const { content } = req.body;
    if (!content || typeof content !== "string") {
      return errorResponse(res, "content required (string)", 400);
    }

    const chat = await chatService.addMessage(req.params.id, userId, content.trim());
    if (!chat) return errorResponse(res, "Chat not found", 404);

    return successResponse(res, "Message added", chat);
  } catch (error: any) {
    console.error("Chat addMessage error:", error);
    return errorResponse(res, error.message || "Error adding message", 500, error);
  }
};

export const requestCorrection = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id?.toString();
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const messageIndex = parseInt(req.body?.messageIndex as string, 10);
    if (isNaN(messageIndex) || messageIndex < 0) {
      return errorResponse(res, "messageIndex required (non-negative number)", 400);
    }

    const explainsLanguage = req.user?.explainsLanguage || "es";
    const chat = await chatService.requestCorrection(
      req.params.id,
      userId,
      messageIndex,
      explainsLanguage
    );
    if (!chat) return errorResponse(res, "Chat not found or invalid message to correct", 404);

    return successResponse(res, "Correction saved", chat);
  } catch (error: any) {
    console.error("Chat requestCorrection error:", error);
    return errorResponse(res, error.message || "Error requesting correction", 500, error);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id?.toString();
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    const deleted = await chatService.delete(req.params.id, userId);
    if (!deleted) return errorResponse(res, "Chat not found", 404);

    return successResponse(res, "Chat deleted");
  } catch (error: any) {
    console.error("Chat delete error:", error);
    return errorResponse(res, error.message || "Error deleting chat", 500, error);
  }
};
