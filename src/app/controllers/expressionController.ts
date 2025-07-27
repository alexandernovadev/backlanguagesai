import { Request, Response } from "express";
import { ExpressionService } from "../services/expressions/expressionService";
import logger from "../utils/logger";

const expressionService = new ExpressionService();

// Create a new expression
export const createExpression = async (req: Request, res: Response) => {
  try {
    const expression = await expressionService.createExpression(req.body);
    res.status(201).json(expression);
  } catch (error: any) {
    logger.error("Error creating expression:", error);
    res.status(400).json({ message: error.message });
  }
};

// Get an expression by ID
export const getExpressionById = async (req: Request, res: Response) => {
  try {
    const expression = await expressionService.getExpressionById(req.params.id);
    if (!expression) {
      return res.status(404).json({ message: "Expression not found" });
    }
    res.json(expression);
  } catch (error: any) {
    logger.error("Error getting expression by ID:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all expressions with filters
export const getExpressions = async (req: Request, res: Response) => {
  try {
    const filters = req.query;
    const result = await expressionService.getExpressions(filters);
    res.json(result);
  } catch (error: any) {
    logger.error("Error getting expressions:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update an expression
export const updateExpression = async (req: Request, res: Response) => {
  try {
    const expression = await expressionService.updateExpression(req.params.id, req.body);
    if (!expression) {
      return res.status(404).json({ message: "Expression not found" });
    }
    res.json(expression);
  } catch (error: any) {
    logger.error("Error updating expression:", error);
    res.status(400).json({ message: error.message });
  }
};

// Delete an expression
export const deleteExpression = async (req: Request, res: Response) => {
  try {
    const expression = await expressionService.deleteExpression(req.params.id);
    if (!expression) {
      return res.status(404).json({ message: "Expression not found" });
    }
    res.json({ message: "Expression deleted successfully" });
  } catch (error: any) {
    logger.error("Error deleting expression:", error);
    res.status(500).json({ message: error.message });
  }
};

// Find expression by expression text
export const getExpressionByExpression = async (req: Request, res: Response) => {
  try {
    const expression = await expressionService.findExpressionByExpression(req.params.expression);
    if (!expression) {
      return res.status(404).json({ message: "Expression not found" });
    }
    res.json(expression);
  } catch (error: any) {
    logger.error("Error finding expression by expression text:", error);
    res.status(500).json({ message: error.message });
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
    res.json(expressions);
  } catch (error: any) {
    logger.error("Error getting expressions by type:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get expressions only (for performance)
export const getExpressionsOnly = async (req: Request, res: Response) => {
  try {
    const filters = req.query;
    const result = await expressionService.getExpressionsOnly(filters);
    res.json(result);
  } catch (error: any) {
    logger.error("Error getting expressions only:", error);
    res.status(500).json({ message: error.message });
  }
};

// Export expressions to JSON
export const exportExpressionsToJSON = async (req: Request, res: Response) => {
  try {
    const expressions = await expressionService.getAllExpressionsForExport();
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename=expressions-${new Date().toISOString().split('T')[0]}.json`);
    res.json(expressions);
  } catch (error: any) {
    logger.error("Error exporting expressions:", error);
    res.status(500).json({ message: error.message });
  }
};

// Import expressions from JSON file
export const importExpressionsFromFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileContent = req.file.buffer.toString();
    const expressions = JSON.parse(fileContent);

    if (!Array.isArray(expressions)) {
      return res.status(400).json({ message: "Invalid file format. Expected an array of expressions." });
    }

    const results = [];
    const errors = [];

    for (const expressionData of expressions) {
      try {
        const expression = await expressionService.createExpression(expressionData);
        results.push(expression);
      } catch (error: any) {
        errors.push({
          expression: expressionData.expression,
          error: error.message
        });
      }
    }

    res.json({
      message: `Import completed. ${results.length} expressions imported successfully.`,
      imported: results.length,
      errors: errors.length,
      errorDetails: errors
    });
  } catch (error: any) {
    logger.error("Error importing expressions:", error);
    res.status(500).json({ message: error.message });
  }
};

// Chat methods
export const addChatMessage = async (req: Request, res: Response) => {
  try {
    const { expressionId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const expression = await expressionService.addChatMessage(expressionId, message);
    if (!expression) {
      return res.status(404).json({ message: "Expression not found" });
    }

    res.json({ 
      message: "Chat message added successfully",
      expression 
    });
  } catch (error: any) {
    logger.error("Error adding chat message:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const { expressionId } = req.params;
    const chatHistory = await expressionService.getChatHistory(expressionId);
    res.json(chatHistory);
  } catch (error: any) {
    logger.error("Error getting chat history:", error);
    res.status(500).json({ message: error.message });
  }
};

export const clearChatHistory = async (req: Request, res: Response) => {
  try {
    const { expressionId } = req.params;
    const expression = await expressionService.clearChatHistory(expressionId);
    if (!expression) {
      return res.status(404).json({ message: "Expression not found" });
    }
    res.json({ message: "Chat history cleared successfully" });
  } catch (error: any) {
    logger.error("Error clearing chat history:", error);
    res.status(500).json({ message: error.message });
  }
}; 