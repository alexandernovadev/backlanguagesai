import { generateText } from "./aiService";
import { TextProvider } from "../../../config/aiConfig";
import {
  createExpressionGenerationPrompt,
  createExpressionChatPrompt,
  ExpressionGenerationPromptParams,
  ExpressionChatPromptParams,
} from "./prompts/expressions";
import { generateChat } from "./textAIService";

export interface ExpressionGenerationOptions {
  provider?: TextProvider;
  [key: string]: any;
}

export const generateExpressionData = async (
  params: ExpressionGenerationPromptParams,
  options: ExpressionGenerationOptions = {}
) => {
  const provider = options.provider || "openai";
  const promptData = createExpressionGenerationPrompt(params);
  const response = await generateText(
    provider,
    `${promptData.system}\n\n${promptData.user}`,
    undefined,
    {
      ...options,
      responseFormat: "json_object",
      temperature: options.temperature || 0.2,
    }
  );
  const content = response.choices[0].message.content;
  if (!content) throw new Error("Completion content is null");
  return JSON.parse(content);
};

export const generateExpressionChat = async (
  params: ExpressionChatPromptParams,
  options: ExpressionGenerationOptions = {}
) => {
  const provider = options.provider || "openai";
  const promptData = createExpressionChatPrompt(params);
  return generateChat(provider, promptData.messages, undefined, {
    ...options,
    temperature: options.temperature || 0.7,
    stream: options.stream || true,
  });
};
