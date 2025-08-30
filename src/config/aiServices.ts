// AI Service Configuration
// Change this file to switch between different AI providers

export interface AIServiceConfig {
  provider: 'openai' | 'deepseek';
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens?: number;
}

// Current AI Service Configuration - CHANGE HERE TO SWITCH PROVIDERS
export const AI_SERVICE_CONFIG: AIServiceConfig = {
  provider: 'deepseek',
  apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || '',
  baseUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat'
};

// Alternative configurations for easy switching
export const AI_SERVICE_CONFIGS = {
  deepseek: {
    provider: 'deepseek' as const,
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat'
  },
  openai: {
    provider: 'openai' as const,
    apiKey: process.env.OPENAI_API_KEY || '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4'
  }
};

// Get current service config
export const getCurrentAIConfig = (): AIServiceConfig => {
  const serviceType = process.env.AI_SERVICE_PROVIDER || 'deepseek';
  return AI_SERVICE_CONFIGS[serviceType as keyof typeof AI_SERVICE_CONFIGS] || AI_SERVICE_CONFIG;
};
