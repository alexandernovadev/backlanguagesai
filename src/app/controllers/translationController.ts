import { Request, Response } from "express";
import { translationControllerService } from "../services/translation/translationControllerService"; // Import the new service
import logger from "../utils/logger";
import { successResponse, errorResponse } from "../utils/responseHelpers"; // Import response helpers

/**
 * Get preloaded configurations for translation trainer
 * GET /api/translation/configs
 */
export const getConfigs = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, "User not authenticated", 401);
    }

    logger.info("Getting translation trainer configs", { userId });

    const configs = await translationControllerService.getConfigs(userId);

    logger.info("Configs loaded successfully", { userId });

    return successResponse(res, "Configs loaded successfully", configs);
  } catch (error) {
    logger.error("Failed to get translation trainer configs:", error);
    return errorResponse(res, "Failed to load configurations", 500, error);
  }
};

/**
 * Generate training text with streaming
 * POST /api/translation/generate-text
 */
export const generateText = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, "User not authenticated", 401);
    }

    const { config, chatId } = req.body;

    // Validate config exists
    if (!config) {
      return errorResponse(res, "Configuration is required", 400);
    }

    logger.info("Generating training text", { userId, config, chatId });

    // Set headers for streaming
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    // Generate text and save to database via service
    const { generatedTextContent, newGeneratedTextId } =
      await translationControllerService.generateText(userId, config, chatId);

    // Send only the text content, not the whole object
    res.write(generatedTextContent);
    res.end();

    logger.info("Training text generated and saved successfully", {
      userId,
      textId: newGeneratedTextId,
      chatId,
    });

    // successResponse for streaming is not applicable here as res.end() is called.
  } catch (error) {
    logger.error("Failed to generate training text:", error);

    if (!res.headersSent) {
      return errorResponse(res, "Failed to generate training text", 500, error);
    } else {
      // If headers already sent, try to send error as text
      res.write(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      res.end();
    }
  }
};

/**
 * Process user translation and provide feedback
 * POST /api/translation/translate
 */
export const processTranslation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, "User not authenticated", 401);
    }

    const {
      originalText,
      userTranslation,
      textId,
      chatId,
      sourceLanguage = "spanish",
      targetLanguage = "english",
    } = req.body;

    if (!originalText || !userTranslation) {
      return errorResponse(
        res,
        "Original text and user translation are required",
        400
      );
    }

    logger.info("Processing user translation", { userId, textId, chatId });

    const analysisResult =
      await translationControllerService.processTranslation(
        userId,
        originalText,
        userTranslation,
        textId,
        chatId,
        sourceLanguage,
        targetLanguage
      );

    logger.info("Translation processed and saved successfully", {
      userId,
      textId,
      chatId,
      translationId: analysisResult._id, // Now analysisResult includes _id
      score: analysisResult.score,
    });

    return successResponse(
      res,
      "Translation processed successfully",
      analysisResult
    );
  } catch (error) {
    logger.error("Failed to process translation:", error);
    return errorResponse(res, "Failed to process translation", 500, error);
  }
};

/**
 * Get all translation chats for user
 * GET /api/translation/chats
 */
export const getChats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, "User not authenticated", 401);
    }

    logger.info("Getting translation chats", { userId });

    const chats = await translationControllerService.getChats(userId);

    logger.info("Translation chats retrieved successfully", {
      userId,
      count: chats.length,
    });

    return successResponse(
      res,
      "Translation chats retrieved successfully",
      chats
    );
  } catch (error) {
    logger.error("Failed to get translation chats:", error);
    return errorResponse(res, "Failed to retrieve chats", 500, error);
  }
};

/**
 * Create new translation chat
 * POST /api/translation/chat
 */
export const createChat = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, "User not authenticated", 401);
    }

    logger.info("Creating new translation chat", { userId });

    const newChat = await translationControllerService.createChat(userId);

    logger.info("Translation chat created successfully", {
      userId,
      chatId: newChat.id,
    });

    return successResponse(
      res,
      "Translation chat created successfully",
      newChat
    );
  } catch (error) {
    logger.error("Failed to create translation chat:", error);
    return errorResponse(res, "Failed to create chat", 500, error);
  }
};

/**
 * Get chat details and messages
 * GET /api/translation/chat/:chatId
 */
export const getChat = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { chatId } = req.params;

    if (!userId) {
      return errorResponse(res, "User not authenticated", 401);
    }

    if (!chatId) {
      return errorResponse(res, "Chat ID is required", 400);
    }

    logger.info("Getting chat details", { userId, chatId });

    const chat = await translationControllerService.getChat(userId, chatId);

    if (!chat) {
      return errorResponse(
        res,
        "Chat not found",
        404,
        "The requested chat does not exist or you do not have access to it"
      );
    }

    logger.info("Chat details retrieved successfully", { userId, chatId });

    return successResponse(res, "Chat details retrieved successfully", chat);
  } catch (error) {
    logger.error("Failed to get chat details:", error);
    return errorResponse(res, "Failed to retrieve chat", 500, error);
  }
};

export const updateChatConfig = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { chatId } = req.params;
    const { config } = req.body;

    if (!userId) {
      return errorResponse(res, "User not authenticated", 401);
    }

    if (!chatId) {
      return errorResponse(res, "Chat ID is required", 400);
    }

    if (!config) {
      return errorResponse(res, "Configuration is required", 400);
    }

    logger.info("Updating chat configuration", { userId, chatId, config });

    const updated = await translationControllerService.updateChatConfig(
      userId,
      chatId,
      config
    );

    if (!updated) {
      return errorResponse(
        res,
        "Chat not found",
        404,
        "The requested chat does not exist or you do not have access to it"
      );
    }

    logger.info("Chat configuration updated successfully", { userId, chatId });
    return successResponse(res, "Chat configuration updated successfully", {
      success: true,
    });
  } catch (error) {
    logger.error("Failed to update chat configuration:", error);
    return errorResponse(
      res,
      "Failed to update chat configuration",
      500,
      error
    );
  }
};

export const deleteChat = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, "User not authenticated", 401);
    }

    logger.info("Deleting chat", { userId, chatId });

    const deleted = await translationControllerService.deleteChat(
      userId,
      chatId
    );

    if (!deleted) {
      return errorResponse(
        res,
        "Chat not found",
        404,
        "The requested chat does not exist or you do not have access to it"
      );
    }

    logger.info("Chat deleted successfully", { userId, chatId });
    return successResponse(res, "Chat deleted successfully", { success: true });
  } catch (error) {
    logger.error("Failed to delete chat:", error);
    return errorResponse(res, "Failed to delete chat", 500, error);
  }
};
