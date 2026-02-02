import { Request, Response } from "express";
import { ExpressionService } from "../services/expressions/expressionService";
import {
  generateExpressionData,
  generateExpressionChat,
} from "../services/ai/expressionAIService";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "../services/cloudinary/cloudinaryService";
import { createExpressionImagePrompt } from "../services/ai/prompts";
import { successResponse, errorResponse } from "../utils/responseHelpers";
import logger from "../utils/logger";
import { generateImage } from "../services/ai/imageAIService";

const expressionService = new ExpressionService();

// Create a new expression
export const createExpression = async (req: Request, res: Response) => {
  try {
    const expression = await expressionService.createExpression(req.body);
    return successResponse(
      res,
      "Expression created successfully",
      expression,
      201
    );
  } catch (error: any) {
    logger.error("Error creating expression:", error);
    return errorResponse(res, error.message, 400, error);
  }
};

// Get an expression by ID
export const getExpressionById = async (req: Request, res: Response) => {
  try {
    const expression = await expressionService.getExpressionById(req.params.id);
    if (!expression) {
      return errorResponse(res, "Expression not found", 404);
    }
    return successResponse(
      res,
      "Expression retrieved successfully",
      expression
    );
  } catch (error: any) {
    logger.error("Error getting expression by ID:", error);
    return errorResponse(res, error.message, 500, error);
  }
};

// Get all expressions with filters
export const getExpressions = async (req: Request, res: Response) => {
  try {
    const filters = req.query;
    const result = await expressionService.getExpressions(filters);
    return successResponse(res, "Expressions retrieved successfully", result);
  } catch (error: any) {
    logger.error("Error getting expressions:", error);
    return errorResponse(res, error.message, 500, error);
  }
};

// Update an expression
export const updateExpression = async (req: Request, res: Response) => {
  try {
    const expression = await expressionService.updateExpression(
      req.params.id,
      req.body
    );
    if (!expression) {
      return errorResponse(res, "Expression not found", 404);
    }
    return successResponse(res, "Expression updated successfully", expression);
  } catch (error: any) {
    logger.error("Error updating expression:", error);
    return errorResponse(res, error.message, 400, error);
  }
};

// Delete an expression
export const deleteExpression = async (req: Request, res: Response) => {
  try {
    const expression = await expressionService.deleteExpression(req.params.id);
    if (!expression) {
      return errorResponse(res, "Expression not found", 404);
    }
    return successResponse(res, "Expression deleted successfully", {});
  } catch (error: any) {
    logger.error("Error deleting expression:", error);
    return errorResponse(res, error.message, 500, error);
  }
};

// Find expression by expression text
export const getExpressionByExpression = async (
  req: Request,
  res: Response
) => {
  try {
    const expression = await expressionService.findExpressionByExpression(
      req.params.expression
    );
    if (!expression) {
      return errorResponse(res, "Expression not found", 404);
    }
    return successResponse(
      res,
      "Expression retrieved successfully",
      expression
    );
  } catch (error: any) {
    logger.error("Error finding expression by expression text:", error);
    return errorResponse(res, error.message, 500, error);
  }
};

// Get expressions by type
export const getExpressionsByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { limit = 10, search } = req.query;
    const expressions = await expressionService.getExpressionsByType(
      type,
      Number(limit),
      search as string
    );
    return successResponse(
      res,
      `Expressions of type ${type} retrieved successfully`,
      expressions
    );
  } catch (error: any) {
    logger.error("Error getting expressions by type:", error);
    return errorResponse(res, error.message, 500, error);
  }
};

// Get expressions only (for performance)
export const getExpressionsOnly = async (req: Request, res: Response) => {
  try {
    const filters = req.query;
    const result = await expressionService.getExpressionsOnly(filters);
    return successResponse(res, "Expressions retrieved successfully", result);
  } catch (error: any) {
    logger.error("Error getting expressions only:", error);
    return errorResponse(res, error.message, 500, error);
  }
};

// Export expressions to JSON
export const exportExpressionsToJSON = async (req: Request, res: Response) => {
  try {
    const expressions = await expressionService.getAllExpressionsForExport();

    // Set headers for file download
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `expressions-export-${timestamp}.json`;

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Send the JSON data
    return res.json({
      success: true,
      message: `Exported ${expressions.length} expressions successfully`,
      data: {
        totalExpressions: expressions.length,
        exportDate: new Date().toISOString(),
        expressions: expressions,
      },
    });
  } catch (error: any) {
    logger.error("Error exporting expressions:", error);
    return errorResponse(res, error.message, 500, error);
  }
};

// Import expressions from JSON file
export const importExpressionsFromFile = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.file) {
      return errorResponse(res, "No file uploaded", 400);
    }

    // Parse the JSON file content
    let fileData: any;
    try {
      const fileContent = req.file.buffer.toString("utf-8");
      fileData = JSON.parse(fileContent);
    } catch (parseError) {
      return errorResponse(res, "Invalid JSON file format", 400);
    }

    // Validate file structure - handle both direct and nested structures
    let expressions: any[] = [];

    // Try to find expressions in different possible structures
    if (
      fileData.data?.expressions &&
      Array.isArray(fileData.data.expressions)
    ) {
      // Direct structure: data.expressions
      expressions = fileData.data.expressions;
    } else if (
      fileData.data?.data?.expressions &&
      Array.isArray(fileData.data.data.expressions)
    ) {
      // Nested structure: data.data.expressions (from export)
      expressions = fileData.data.data.expressions;
    } else if (fileData.expressions && Array.isArray(fileData.expressions)) {
      // Root level: expressions
      expressions = fileData.expressions;
    } else {
      return errorResponse(
        res,
        "Invalid file structure. Expected 'data.expressions' or 'data.data.expressions' array",
        400
      );
    }
    const {
      duplicateStrategy = "skip",
      validateOnly = false,
      batchSize = 10,
    } = req.query;

    // Validate duplicateStrategy
    const validStrategies = ["skip", "overwrite", "error", "merge"];
    if (!validStrategies.includes(duplicateStrategy as string)) {
      return errorResponse(
        res,
        `Invalid duplicateStrategy. Must be one of: ${validStrategies.join(
          ", "
        )}`,
        400
      );
    }

    // Validate batchSize
    const batchSizeNum = parseInt(batchSize as string);
    if (isNaN(batchSizeNum) || batchSizeNum < 1 || batchSizeNum > 100) {
      return errorResponse(
        res,
        "Invalid batchSize. Must be a number between 1 and 100",
        400
      );
    }

    // Convert validateOnly to boolean
    const validateOnlyBool = validateOnly === "true";

    // If validateOnly is true, just validate without importing
    if (validateOnlyBool) {
      const validationResults = expressions.map(
        (expression: any, index: number) => ({
          index,
          data: expression,
          status:
            expression.expression && expression.definition
              ? "valid"
              : "invalid",
          errors: !expression.expression
            ? ["Expression is required"]
            : !expression.definition
            ? ["Definition is required"]
            : [],
        })
      );

      const validCount = validationResults.filter(
        (r: any) => r.status === "valid"
      ).length;
      const invalidCount = validationResults.filter(
        (r: any) => r.status === "invalid"
      ).length;

      return successResponse(res, "Validation completed", {
        totalExpressions: expressions.length,
        valid: validCount,
        invalid: invalidCount,
        validationResults,
        message: `Validation completed. ${validCount} valid, ${invalidCount} invalid`,
      });
    }

    // Import expressions
    const importResult = await expressionService.importExpressions(
      expressions,
      {
        duplicateStrategy: duplicateStrategy as
          | "skip"
          | "overwrite"
          | "error"
          | "merge",
        batchSize: batchSizeNum,
      }
    );

    return successResponse(res, "Import completed successfully", importResult);
  } catch (error: any) {
    logger.error("Error importing expressions:", error);
    return errorResponse(res, error.message, 500, error);
  }
};

// Chat methods
export const addChatMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return errorResponse(res, "Message is required", 400);
    }

    const expression = await expressionService.addChatMessage(
      id,
      message
    );
    if (!expression) {
      return errorResponse(res, "Expression not found", 404);
    }

    return successResponse(res, "Chat message added successfully", {
      expression,
    });
  } catch (error: any) {
    logger.error("Error adding chat message:", error);
    return errorResponse(res, error.message, 500, error);
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const chatHistory = await expressionService.getChatHistory(id);
    return successResponse(
      res,
      "Chat history retrieved successfully",
      chatHistory
    );
  } catch (error: any) {
    logger.error("Error getting chat history:", error);
    return errorResponse(res, error.message, 500, error);
  }
};

export const clearChatHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const expression = await expressionService.clearChatHistory(id);
    if (!expression) {
      return errorResponse(res, "Expression not found", 404);
    }
    return successResponse(res, "Chat history cleared successfully", {});
  } catch (error: any) {
    logger.error("Error clearing chat history:", error);
    return errorResponse(res, error.message, 500, error);
  }
};

// Streaming chat response (AI)
export const streamChatResponse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    if (!message) {
      return errorResponse(res, "Message is required", 400);
    }
    const expression = await expressionService.getExpressionById(id);
    if (!expression) {
      return errorResponse(res, "Expression not found", 404);
    }
    await expressionService.addUserMessage(id, message);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    const chatHistory = expression.chat || [];
    const params = {
      expressionText: expression.expression,
      expressionDefinition: expression.definition,
      userMessage: message,
      chatHistory,
    };
    const userId = req.user?._id || req.user?.id || null;
    const stream = await generateExpressionChat(params, { stream: true, userId });
    let fullResponse = "";
    for await (const chunk of stream as any) {
      const content = chunk.choices?.[0]?.delta?.content || "";
      if (content) {
        fullResponse += content;
        res.write(content);
      }
    }
    await expressionService.addAssistantMessage(id, fullResponse);
    res.end();
  } catch (error: any) {
    logger.error("Error streaming chat response:", error);
    return errorResponse(res, error.message, 500, error);
  }
};

// Nueva función para generar expresiones con AI
export const generateExpression = async (req: Request, res: Response) => {
  try {
    const { prompt, language = "en", options = {} } = req.body;
    const userId = req.user?._id || req.user?.id || null;
    if (!prompt) {
      return errorResponse(res, "Prompt is required", 400);
    }
    const data = await generateExpressionData({ prompt, language }, { ...options, userId });
    return successResponse(res, "Expression generated successfully", data);
  } catch (error: any) {
    logger.error("Error generating expression:", error);
    return errorResponse(res, error.message, 500, error);
  }
};

// ===== AI IMAGE GENERATION FOR EXPRESSIONS =====

export const updateImageExpression = async (req: Request, res: Response) => {
  const { expressionString, imgOld } = req.body;
  const IDExpression = req.params.id;

  if (!expressionString) {
    return errorResponse(res, "Expression prompt is required.", 400);
  }

  try {
    // Generate image
    const imageBase64 = await generateImage(
      "openai",
      createExpressionImagePrompt(expressionString)
    );
    if (!imageBase64) {
      return errorResponse(res, "Failed to generate image.", 400);
    }

    let deleteOldImagePromise: Promise<void> = Promise.resolve();

    if (imgOld && imgOld.includes("res.cloudinary.com")) {
      const parts = imgOld.split("/");
      let publicId = parts.pop() as string;

      if (publicId && publicId.includes(".")) {
        publicId = publicId.split(".")[0];
      }

      deleteOldImagePromise = deleteImageFromCloudinary(
        "languagesai/expressions/" + publicId
      ).then(() => {});
    }

    const [_, urlImage] = await Promise.all([
      deleteOldImagePromise,
      uploadImageToCloudinary(imageBase64, "expressions"),
    ]);

    const updatedExpression = await expressionService.updateExpressionImg(
      IDExpression,
      urlImage as string
    );

    return successResponse(
      res,
      "Expression image updated successfully",
      updatedExpression
    );
  } catch (error) {
    return errorResponse(res, "Error generating expression image", 500, error);
  }
};
