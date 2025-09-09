/**
 * Centralized service for AI text generation
 * Supports OpenAI and DeepSeek with dynamic configuration
 */

import OpenAI from "openai";
import { AI_CONFIG, TextProvider, ChatGPTModel, DeepSeekModel } from "../../../config/aiConfig";

// Create AI client
export const createTextClient = (provider: TextProvider) => {
  const config = AI_CONFIG.providers[provider];
  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL
  });
};

// Options for text generation
export interface TextGenerationOptions {
  temperature?: number;
  stream?: boolean;
  maxTokens?: number;
  responseFormat?: 'text' | 'json_object';
}

// Generate simple text
export const generateText = async (
  provider: TextProvider,
  prompt: string,
  model?: ChatGPTModel | DeepSeekModel,
  options: TextGenerationOptions = {}
) => {
  const client = createTextClient(provider);
  const defaultModel = AI_CONFIG.providers[provider].models.text;
  
  const requestOptions: any = {
    model: model || defaultModel,
    messages: [{ role: "user", content: prompt }],
    temperature: options.temperature || 0.7,
    stream: options.stream || false
  };

  if (options.maxTokens) {
    requestOptions.max_tokens = options.maxTokens;
  }

  if (options.responseFormat === 'json_object') {
    requestOptions.response_format = { type: "json_object" };
  }

  return client.chat.completions.create(requestOptions);
};

// Generate chat with history
export const generateChat = async (
  provider: TextProvider,
  messages: Array<{ role: string; content: string }>,
  model?: ChatGPTModel | DeepSeekModel,
  options: TextGenerationOptions = {}
) => {
  const client = createTextClient(provider);
  const defaultModel = AI_CONFIG.providers[provider].models.chat;
  
  const requestOptions: any = {
    model: model || defaultModel,
    messages,
    temperature: options.temperature || 0.7,
    stream: options.stream || false
  };

  if (options.maxTokens) {
    requestOptions.max_tokens = options.maxTokens;
  }

  if (options.responseFormat === 'json_object') {
    requestOptions.response_format = { type: "json_object" };
  }

  return client.chat.completions.create(requestOptions);
};

// Generate with reasoning (DeepSeek only)
export const generateReasoning = async (
  prompt: string,
  options: TextGenerationOptions = {}
) => {
  const client = createTextClient('deepseek');
  
  const requestOptions: any = {
    model: "deepseek-reasoner",
    messages: [{ role: "user", content: prompt }],
    temperature: options.temperature || 0.7,
    stream: options.stream || false
  };

  if (options.maxTokens) {
    requestOptions.max_tokens = options.maxTokens;
  }

  return client.chat.completions.create(requestOptions);
};

// Generate code (specialized)
export const generateCode = async (
  provider: TextProvider,
  prompt: string,
  model?: ChatGPTModel | DeepSeekModel,
  options: TextGenerationOptions = {}
) => {
  const client = createTextClient(provider);
  const codeModel = model || (provider === 'deepseek' ? AI_CONFIG.providers.deepseek.models.code : AI_CONFIG.providers.openai.models.text);
  
  const requestOptions: any = {
    model: codeModel,
    messages: [{ role: "user", content: prompt }],
    temperature: options.temperature || 0.3, // More deterministic for code
    stream: options.stream || false
  };

  if (options.maxTokens) {
    requestOptions.max_tokens = options.maxTokens;
  }

  return client.chat.completions.create(requestOptions);
};
