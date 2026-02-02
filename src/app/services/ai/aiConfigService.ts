/**
 * AI Configuration Service
 * Manages user-specific AI provider configurations
 * Direct DB calls, no caching
 */

import AIConfig from "../../db/models/AIConfig";
import { TextProvider } from "../../../config/aiConfig";
import { AIFeature, AIOperation } from "../../../../types/models";

// Defaults del sistema
const DEFAULT_CONFIGS: Record<AIFeature, Record<string, TextProvider>> = {
  word: {
    generate: "openai",
    examples: "openai",
    codeSwitching: "openai",
    types: "openai",
    synonyms: "openai",
    chat: "openai",
    image: "openai", // Imágenes siempre usan OpenAI (DALL-E)
  },
  expression: {
    generate: "openai",
    chat: "openai",
    image: "openai", // Imágenes siempre usan OpenAI (DALL-E)
  },
  lecture: {
    text: "deepseek",
    topic: "deepseek",
    image: "openai", // Imágenes siempre usan OpenAI (DALL-E)
  },
};

export class AIConfigService {
  /**
   * Obtiene el provider configurado para una operación
   * Llamada directa a DB, sin caché
   * Si falla, retorna el default
   * Las imágenes siempre usan OpenAI (DeepSeek no soporta imágenes)
   */
  static async getProvider(
    userId: string | null | undefined,
    feature: AIFeature,
    operation: AIOperation
  ): Promise<TextProvider> {
    // Las imágenes siempre usan OpenAI (DeepSeek no soporta imágenes)
    if (operation === "image") {
      return "openai";
    }

    const normalizedUserId = userId || null;
    
    try {
      // Buscar en DB directamente
      const config = await AIConfig.findOne({
        userId: normalizedUserId,
        feature,
        operation,
      });

      if (config) {
        // Validar que las imágenes no usen DeepSeek
        if (operation === "image" && config.provider === "deepseek") {
          return "openai";
        }
        return config.provider as TextProvider;
      }
    } catch (error) {
      // Si falla la consulta, usar default
      console.error("Error getting AI config from DB:", error);
    }

    // Usar default del sistema si no hay config o si falló
    return DEFAULT_CONFIGS[feature]?.[operation] || "openai";
  }

  /**
   * Guarda o actualiza una configuración
   * Llamada directa a DB, sin caché
   */
  static async saveConfig(
    userId: string | null | undefined,
    feature: AIFeature,
    operation: AIOperation,
    provider: TextProvider
  ) {
    const normalizedUserId = userId || null;
    
    const config = await AIConfig.findOneAndUpdate(
      { userId: normalizedUserId, feature, operation },
      { provider },
      { upsert: true, new: true }
    );

    return config;
  }

  /**
   * Obtiene todas las configuraciones de un usuario (sin caché, para UI)
   */
  static async getAllConfigs(userId: string | null | undefined) {
    const normalizedUserId = userId || null;
    return await AIConfig.find({ userId: normalizedUserId }).sort({ feature: 1, operation: 1 });
  }

  /**
   * Elimina una configuración específica
   */
  static async deleteConfig(
    userId: string | null | undefined,
    feature: AIFeature,
    operation: AIOperation
  ) {
    const normalizedUserId = userId || null;
    const result = await AIConfig.findOneAndDelete({
      userId: normalizedUserId,
      feature,
      operation,
    });

    return result;
  }

  /**
   * Obtiene los defaults del sistema
   */
  static getDefaults(): typeof DEFAULT_CONFIGS {
    return DEFAULT_CONFIGS;
  }
}
