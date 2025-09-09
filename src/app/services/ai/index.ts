/**
 * Centralized AI services exports
 * Single entry point for all AI services
 */

// Main service
export {
  AIService,
  generateTextWithProvider,
  generateImageWithProvider,
  generateChatWithProvider,
  getBestProvider,
} from "./aiService";

// Individual services
export {
  createTextClient,
  generateText,
  generateChat,
  generateReasoning,
  generateCode,
} from "./textAIService";

export {
  generateImage,
  generateImageDalle,
  generateImageGoogle,
} from "./imageAIService";

// Word-specific services
export {
  generateWordData,
  generateWordExamples,
  generateWordCodeSwitching,
  generateWordTypes,
  generateWordSynonyms,
  generateWordChat,
} from "./wordAIService";

// Configuration
export { AI_CONFIG } from "../../../config/aiConfig";

// Types
export type {
  TextProvider,
  ImageProvider,
  ChatGPTModel,
  DeepSeekModel,
  DalleModel,
  GoogleImagenModel,
} from "../../../config/aiConfig";

export type { TextGenerationOptions } from "./textAIService";

export type { ImageGenerationOptions } from "./imageAIService";

// Prompts (already existing)
export * from "./prompts";
