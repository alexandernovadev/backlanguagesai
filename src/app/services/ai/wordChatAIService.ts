import { generateText } from "./textAIService";
import {
  createInitialMessagePrompt,
  createChatResponsePrompt,
  createCorrectionPrompt,
  createTitlePrompt,
  WordSummary,
} from "./prompts/wordChat/chatPrompts";

export async function generateInitialMessage(
  words: WordSummary[],
  language: string
): Promise<string> {
  const prompt = createInitialMessagePrompt(words, language);
  const res = await generateText("openai", prompt, undefined, {
    temperature: 0.8,
    maxTokens: 300,
  });
  return res.choices?.[0]?.message?.content?.trim() || "Let's practice these words!";
}

export async function generateChatResponse(
  words: WordSummary[],
  wordsUsed: string[],
  messages: Array<{ role: string; content: string }>,
  language: string
): Promise<string> {
  const prompt = createChatResponsePrompt(words, wordsUsed, messages, language);
  const res = await generateText("openai", prompt, undefined, {
    temperature: 0.8,
    maxTokens: 400,
  });
  return res.choices?.[0]?.message?.content?.trim() || "Keep going!";
}

export async function generateCorrection(userMessage: string, language: string): Promise<string> {
  const prompt = createCorrectionPrompt(userMessage, language);
  const res = await generateText("openai", prompt, undefined, {
    temperature: 0.3,
    maxTokens: 200,
  });
  return res.choices?.[0]?.message?.content?.trim() || "";
}

export async function generateChatTitle(messages: Array<{ role: string; content: string }>): Promise<string> {
  if (messages.length === 0) return "Chat";
  const prompt = createTitlePrompt(messages);
  const res = await generateText("openai", prompt, undefined, {
    temperature: 0.5,
    maxTokens: 50,
  });
  return res.choices?.[0]?.message?.content?.trim() || "Chat";
}
