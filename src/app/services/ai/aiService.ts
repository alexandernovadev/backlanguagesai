/**
 * Unified AI service
 * Main entry point for all AI services
 */

import { 
  generateText, 
  generateChat, 
  generateReasoning, 
  generateCode,
  TextGenerationOptions 
} from './textAIService';
import { 
  generateImage, 
  generateImageDalle, 
  generateImageGoogle,
  ImageGenerationOptions 
} from './imageAIService';
import { TextProvider, ImageProvider, ChatGPTModel, DeepSeekModel, DalleModel, GoogleImagenModel } from '../../../config/aiConfig';

// Re-export types for convenience
export type { TextGenerationOptions, ImageGenerationOptions };
export type { TextProvider, ImageProvider, ChatGPTModel, DeepSeekModel, DalleModel, GoogleImagenModel };

export { generateText };

/**
 * Unified AI service
 * Provides a consistent interface for all AI services
 */
export const AIService = {
  // Text services
  text: {
    generate: generateText,
    chat: generateChat,
    reasoning: generateReasoning,
    code: generateCode
  },
  
  // Image services
  image: {
    generate: generateImage,
    dalle: generateImageDalle,
    google: generateImageGoogle
  }
};

// Convenience functions for direct use
export const generateTextWithProvider = (
  provider: TextProvider,
  prompt: string,
  model?: ChatGPTModel | DeepSeekModel,
  options?: TextGenerationOptions
) => generateText(provider, prompt, model, options);

export const generateImageWithProvider = (
  provider: ImageProvider,
  prompt: string,
  model?: DalleModel | GoogleImagenModel,
  options?: ImageGenerationOptions
) => generateImage(provider, prompt, model, options);

export const generateChatWithProvider = (
  provider: TextProvider,
  messages: Array<{ role: string; content: string }>,
  model?: ChatGPTModel | DeepSeekModel,
  options?: TextGenerationOptions
) => generateChat(provider, messages, model, options);

// Helper function to determine the best provider based on task
export const getBestProvider = (task: 'text' | 'image' | 'code' | 'reasoning'): TextProvider | ImageProvider => {
  switch (task) {
    case 'text':
    case 'code':
      return 'deepseek'; // DeepSeek is more cost-effective for text
    case 'reasoning':
      return 'deepseek'; // Only DeepSeek has reasoning mode
    case 'image':
      return 'openai'; // DALL-E is more stable
    default:
      return 'openai';
  }
};
