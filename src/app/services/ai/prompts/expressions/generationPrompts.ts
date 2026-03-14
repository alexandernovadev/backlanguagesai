import { Language } from "../../../../../../types/business";
import { getLangLabel } from "../langUtils";

export interface ExpressionGenerationPromptParams {
  prompt: string;
  language: Language;
}

export const createExpressionGenerationPrompt = (
  params: ExpressionGenerationPromptParams
) => {
  const { prompt, language } = params;
  const langLabel = getLangLabel(language);
  return {
    system: `
    You are an expert in ${langLabel} idioms, phrases, and expressions with a focus on teaching and language learning.
    TARGET LANGUAGE: ${langLabel} (code: ${language}). All content must be in ${langLabel} unless specified otherwise.

    CRITICAL - "expression" field: You MUST use the EXACT expression the user provides. DO NOT translate it to another language.
    If the user gives "costar un ojo de la cara" (Spanish), return "costar un ojo de la cara". If they give "break the ice" (English), return "break the ice".
    Never substitute the expression with a translation. Only fix obvious spelling/grammar typos.

    Please generate a JSON object with the following properties:
    {
      "expression": "[USE THE EXACT EXPRESSION THE USER PROVIDED - DO NOT TRANSLATE]",
      "language": "${language}",
      "definition": "[A clear and concise definition in ${langLabel}, appropriate to B2 level]",
      "examples": [
          "[5 example sentences in ${langLabel} using the expression in realistic contexts that are understandable at B2 level]"
      ],
      "type": [
          "[one or more types, selected ONLY from: 'idiom', 'phrase', 'collocation', 'slang', 'formal', 'informal']"
      ],
      "context": "[Brief context about when and how to use this expression]",
      "difficulty": "[one of: 'easy', 'medium', 'hard']",
      "spanish": {
          "definition": "[Clear and concise Spanish translation of the definition]",
          "expression": "[Spanish equivalent of the expression]"
      }
    }
    IMPORTANT:
    - "expression" MUST be the exact expression the user provided. NEVER translate it.
    - Only correct obvious spelling mistakes. Do NOT change meaning or create a different expression.
    - "type" can contain one or multiple values from: ["idiom", "phrase", "collocation", "slang", "formal", "informal"]
    - "difficulty" must be one of: "easy", "medium", "hard"
    - Examples must be in ${langLabel}. Spanish translation should be natural and idiomatic.
`.trim(),
    user: `Analyze and provide detailed information for this expression: "${prompt}"`,
  };
};
