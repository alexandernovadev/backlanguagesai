import { Request, Response } from "express";
import { AIConfigService } from "../services/ai/aiConfigService";
import { errorResponse, successResponse } from "../utils/responseHelpers";
import { AIFeature, AIOperation } from "../../../types/models";
import { TextProvider } from "../../config/aiConfig";
import logger from "../utils/logger";

/**
 * Obtiene todas las configuraciones del usuario actual
 */
export const getAIConfigs = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id || req.user?.id || null;
    const configs = await AIConfigService.getAllConfigs(userId);
    const defaults = AIConfigService.getDefaults();

    return successResponse(res, "AI configurations retrieved successfully", {
      configs,
      defaults,
    });
  } catch (error: any) {
    logger.error("Error getting AI configs:", error);
    return errorResponse(res, "Error retrieving AI configurations", 500, error);
  }
};

/**
 * Obtiene una configuración específica
 */
export const getAIConfig = async (req: Request, res: Response) => {
  try {
    const { feature, operation } = req.params as { feature: AIFeature; operation: AIOperation };
    const userId = req.user?._id || req.user?.id || null;

    if (!feature || !operation) {
      return errorResponse(res, "Feature and operation are required", 400);
    }

    const provider = await AIConfigService.getProvider(userId, feature, operation);
    const defaults = AIConfigService.getDefaults();

    return successResponse(res, "AI configuration retrieved successfully", {
      feature,
      operation,
      provider,
      default: defaults[feature]?.[operation] || "openai",
    });
  } catch (error: any) {
    logger.error("Error getting AI config:", error);
    return errorResponse(res, "Error retrieving AI configuration", 500, error);
  }
};

/**
 * Crea o actualiza una configuración
 */
export const saveAIConfig = async (req: Request, res: Response) => {
  try {
    const { feature, operation, provider } = req.body as {
      feature: AIFeature;
      operation: AIOperation;
      provider: TextProvider;
    };
    const userId = req.user?._id || req.user?.id || null;

    if (!feature || !operation || !provider) {
      return errorResponse(res, "Feature, operation, and provider are required", 400);
    }

    if (!['word', 'expression', 'lecture'].includes(feature)) {
      return errorResponse(res, "Invalid feature. Must be 'word', 'expression', or 'lecture'", 400);
    }

    if (!['openai', 'deepseek'].includes(provider)) {
      return errorResponse(res, "Invalid provider. Must be 'openai' or 'deepseek'", 400);
    }

    const config = await AIConfigService.saveConfig(userId, feature, operation, provider);

    return successResponse(res, "AI configuration saved successfully", config);
  } catch (error: any) {
    logger.error("Error saving AI config:", error);
    return errorResponse(res, "Error saving AI configuration", 500, error);
  }
};

/**
 * Elimina una configuración (restaura al default)
 */
export const deleteAIConfig = async (req: Request, res: Response) => {
  try {
    const { feature, operation } = req.params as { feature: AIFeature; operation: AIOperation };
    const userId = req.user?._id || req.user?.id || null;

    if (!feature || !operation) {
      return errorResponse(res, "Feature and operation are required", 400);
    }

    const result = await AIConfigService.deleteConfig(userId, feature, operation);

    if (!result) {
      return errorResponse(res, "Configuration not found", 404);
    }

    return successResponse(res, "AI configuration deleted successfully", result);
  } catch (error: any) {
    logger.error("Error deleting AI config:", error);
    return errorResponse(res, "Error deleting AI configuration", 500, error);
  }
};

/**
 * Obtiene los defaults del sistema
 */
export const getDefaults = async (req: Request, res: Response) => {
  try {
    const defaults = AIConfigService.getDefaults();
    return successResponse(res, "Default configurations retrieved successfully", defaults);
  } catch (error: any) {
    logger.error("Error getting defaults:", error);
    return errorResponse(res, "Error retrieving default configurations", 500, error);
  }
};
