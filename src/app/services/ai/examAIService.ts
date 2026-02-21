import { generateText, generateChat } from "./textAIService";
import {
  createExamGenerationPrompt,
  createExamValidationPrompt,
  createExamCorrectionPrompt,
  createExamQuestionChatPrompt,
  createExamQuestionFeedbackPrompt,
  createExamEvaluateTranslationPrompt,
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
    temperature: 0.3,
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

  const response = await generateText("deepseek", fullPrompt, "deepseek-reasoner", {
    responseFormat: "json_object",
    temperature: 0.3,
    maxTokens: 4000,
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) throw new Error("Validation returned empty content");

  return JSON.parse(content);
};

/**
 * Corrects an exam based on validation feedback. AI applies fixes to issues and returns corrected exam.
 * @param exam - The exam object
 * @param validation - Validation result with issues, feedback, suggestions
 * @returns Corrected exam { title, questions }
 */
export const correctExam = async (exam: object, validation: object) => {
  const examJson = JSON.stringify(exam);
  const validationJson = JSON.stringify(validation);
  const promptData = createExamCorrectionPrompt({ examJson, validationJson });
  const fullPrompt = `${promptData.system}\n\n${promptData.user}`;

  const response = await generateText("deepseek", fullPrompt, "deepseek-reasoner", {
    responseFormat: "json_object",
    temperature: 0.3,
    maxTokens: 4000,
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) throw new Error("Correction returned empty content");

  return JSON.parse(content);
};

export interface ExamQuestionChatParams {
  questionText: string;
  questionType: string;
  grammarTopic?: string;
  difficulty?: string;
  options?: string[];
  correctIndex?: number;
  correctIndices?: number[];
  correctAnswer?: string;
  explanation: string;
  userAnswer: number | number[] | string;
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
    temperature: 0.3,
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) throw new Error("Chat returned empty content");

  return content;
};

export interface ExamQuestionFeedbackParams {
  questionText: string;
  questionType: string;
  grammarTopic?: string;
  difficulty?: string;
  options?: string[];
  correctIndex?: number;
  correctIndices?: number[];
  correctAnswer?: string;
  explanation: string;
  userAnswer: number | number[] | string;
  isCorrect: boolean;
  language: string;
}

/**
 * Generates AI feedback for a single exam question (correct or incorrect).
 * Returns 2-4 sentences of pedagogical feedback.
 */
export const generateExamQuestionFeedback = async (
  params: ExamQuestionFeedbackParams
): Promise<string> => {
  const { system, messages } = createExamQuestionFeedbackPrompt(params);
  const fullPrompt = `${system}\n\n${messages[0].content}`;

  const response = await generateText("openai", fullPrompt, undefined, {
    temperature: 0.3,
    maxTokens: 300,
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) throw new Error("Feedback returned empty content");

  return content.trim();
};

export interface EvaluateTranslationResult {
  score: number;
  reasoning: string;
  feedback: string;
}

/**
 * AI evaluates a translation answer with partial credit (0-100).
 * Only for translateText type.
 */
export const evaluateTranslationAnswer = async (params: {
  questionText: string;
  grammarTopic?: string;
  difficulty?: string;
  correctAnswer?: string;
  explanation: string;
  userAnswer: string;
  language: string;
}): Promise<EvaluateTranslationResult> => {
  const { system, user } = createExamEvaluateTranslationPrompt({
    ...params,
    questionType: "translateText",
  });
  const fullPrompt = `${system}\n\n${user}`;

  const response = await generateText("openai", fullPrompt, undefined, {
    responseFormat: "json_object",
    temperature: 0.3,
    maxTokens: 500,
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) throw new Error("Evaluate translation returned empty content");

  const parsed = JSON.parse(content) as { score?: number; reasoning?: string; feedback?: string };
  const score = Math.min(100, Math.max(0, Math.round(Number(parsed.score) || 0)));
  return {
    score,
    reasoning: String(parsed.reasoning || ""),
    feedback: String(parsed.feedback || "").trim(),
  };
};
