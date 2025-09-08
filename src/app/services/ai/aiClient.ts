import OpenAI from 'openai';
import { getCurrentAIConfig } from '../../../config/aiServices';
import logger from '../../utils/logger';

// Types
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionParams {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

// Create AI client instance (functional approach)
const createAIClient = () => {
  const config = getCurrentAIConfig();
  
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
  });

  logger.info('AI Client initialized', {
    provider: config.provider,
    model: config.model,
    baseUrl: config.baseUrl
  });

  return { client, config };
};

// Memoized client instance
let clientInstance: ReturnType<typeof createAIClient> | null = null;

const getClient = () => {
  if (!clientInstance) {
    clientInstance = createAIClient();
  }
  return clientInstance;
};

/**
 * Create chat completion using current AI service
 */
// TODO esto qu hace aca, no se supeone q cliente nomas ?
export const createChatCompletion = async (params: ChatCompletionParams) => {
  try {
    const { client, config } = getClient();
    
    const response = await client.chat.completions.create({
      model: config.model,
      messages: params.messages,
      temperature: params.temperature || 0.7,
      ...(params.maxTokens && { max_tokens: params.maxTokens })
    });

    logger.info('Chat completion successful', {
      provider: config.provider,
      model: config.model,
      tokensUsed: response.usage?.total_tokens
    });

    return response;

  } catch (error) {
    const { config } = getClient();
    
    logger.error('Chat completion failed', {
      provider: config.provider,
      model: config.model,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

/**
 * Get current provider info
 */
export const getProviderInfo = () => {
  const { config } = getClient();
  return {
    provider: config.provider,
    model: config.model,
    baseUrl: config.baseUrl
  };
};
