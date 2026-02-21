import { generateText, generateChat } from "./textAIService";
import {
  createExamGenerationPrompt,
  createExamValidationPrompt,
  createExamQuestionChatPrompt,
} from "./prompts/exams";

export interface GenerateExamParams {
  language: string;
  grammarTopics: string[];
  difficulty: string;
  questionCount: number;
  questionTypes?: string[];
  topic?: string;
}

/**
 * Generates an exam via AI. Returns JSON with title and questions.
 * questionTypes cycles if shorter than questionCount (e.g. ["multiple","fillInBlank"] x 6 = 3 each).
 * @param params - language, grammarTopics, difficulty, questionCount, questionTypes?, topic?
 * @returns { title, questions: [{ type, text, options?, correctIndex?, correctAnswer?, grammarTopic, explanation }] }
 */
export const generateExam = async (
  params: GenerateExamParams,
  options?: { userId?: string | null }
) => {
  const questionTypes = params.questionTypes?.length
    ? params.questionTypes
    : ["multiple"];
  const promptData = createExamGenerationPrompt({
    ...params,
    questionTypes: questionTypes as any,
  });
  const fullPrompt = `${promptData.system}\n\n${promptData.user}`;

  const response = await generateText("openai", fullPrompt, undefined, {
    responseFormat: "json_object",
    temperature: 0.6,
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) throw new Error("Exam generation returned empty content");

  return JSON.parse(content);
};

/**
 * Validates an exam via AI (acts as a teacher reviewer).
 * @param examJson - Stringified exam object
 * @returns { valid, score, feedback, issues, suggestions, thumbsUp }
 */
export const validateExam = async (examJson: string) => {
  const promptData = createExamValidationPrompt(examJson);
  const fullPrompt = `${promptData.system}\n\n${promptData.user}`;

  const response = await generateText("openai", fullPrompt, undefined, {
    responseFormat: "json_object",
    temperature: 0.3,
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) throw new Error("Validation returned empty content");

  return JSON.parse(content);
};

export interface ExamQuestionChatParams {
  questionText: string;
  questionType: string;
  grammarTopic?: string;
  difficulty?: string;
  options?: string[];
  correctIndex?: number;
  correctAnswer?: string;
  explanation: string;
  userAnswer: number | string;
  userMessage: string;
  chatHistory: Array<{ role: string; content: string }>;
  language: string;
}

/**
 * Generates AI chat response for a failed question. Uses question context + user message + chat history.
 * Handles both multiple-choice (options, correctIndex) and text-based (correctAnswer) types.
 */
export const generateExamQuestionChat = async (params: ExamQuestionChatParams) => {
  const { messages } = createExamQuestionChatPrompt(params);

  const response = await generateChat("openai", messages, undefined, {
    temperature: 0.7,
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) throw new Error("Chat returned empty content");

  return content;
};
