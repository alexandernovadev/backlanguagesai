/**
 * Centralized AI providers configuration
 * Allows easy switching between OpenAI, DeepSeek, Google, etc.
 */

// Available model types
export type ChatGPTModel = 
  | "gpt-4o"
  | "gpt-4o-mini"
  | "gpt-4-turbo"
  | "gpt-4"
  | "gpt-3.5-turbo"
  | "o1-preview"
  | "o1-mini";

export type DeepSeekModel = 
  | "deepseek-chat"      // DeepSeek-V3.1 (modo no-thinking)
  | "deepseek-reasoner"   // DeepSeek-V3.1 (modo thinking)
  | "deepseek-coder";     // Especializado en código

export type DalleModel = 
  | "dall-e-3"
  | "dall-e-2";

export type GoogleImagenModel = 
  | "imagen-3"
  | "imagen-2"
  | "imagen-1";

// Providers configuration
export const AI_CONFIG = {
  providers: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://api.openai.com/v1",
      models: {
        text: "gpt-4o-2024-08-06" as ChatGPTModel,
        topic: "gpt-4o-mini" as ChatGPTModel,
        chat: "gpt-4o-2024-08-06" as ChatGPTModel,
        image: "dall-e-3" as DalleModel
      }
    },
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
      models: {
        text: "deepseek-chat" as DeepSeekModel,
        chat: "deepseek-chat" as DeepSeekModel,
        reasoner: "deepseek-reasoner" as DeepSeekModel,
        code: "deepseek-coder" as DeepSeekModel
      }
    },
    google: {
      apiKey: process.env.GOOGLE_API_KEY,
      baseURL: "https://generativelanguage.googleapis.com/v1beta",
      models: {
        image: "imagen-3" as GoogleImagenModel
      }
    }
  }
} as const;

// Provider types
export type AIProvider = keyof typeof AI_CONFIG.providers;
export type TextProvider = 'openai' | 'deepseek';
export type ImageProvider = 'openai' | 'google';
