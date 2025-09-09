/**
 * Centralized AI services exports
 * Single entry point for all AI services
 */

// Main service
export { AIService, generateTextWithProvider, generateImageWithProvider, generateChatWithProvider, getBestProvider } from './aiService';

// Individual services
export { 
  createTextClient, 
  generateText, 
  generateChat, 
  generateReasoning, 
  generateCode 
} from './textAIService';

export { 
  generateImage, 
  generateImageDalle, 
  generateImageGoogle 
} from './imageAIService';

// Configuration
export { AI_CONFIG } from '../../../config/aiConfig';

// Types
export type { 
  TextProvider, 
  ImageProvider, 
  ChatGPTModel, 
  DeepSeekModel, 
  DalleModel, 
  GoogleImagenModel,
  TextGenerationOptions,
  ImageGenerationOptions
} from '../../../config/aiConfig';

// Prompts (already existing)
export * from './prompts';
