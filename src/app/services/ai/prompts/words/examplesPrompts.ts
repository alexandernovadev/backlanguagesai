import { Language } from '../../../../../../types/business';
import { getLangLabel } from '../langUtils';

export interface WordExamplesPromptParams {
  word: string;
  language: Language;
  oldExamples: string;
}

export const createWordExamplesPrompt = (params: WordExamplesPromptParams) => {
  const { word, language, oldExamples } = params;
  const langLabel = getLangLabel(language);
  return {
    system: `
    You are an expert in the ${langLabel} language with a focus on teaching and lexicography.
    TARGET LANGUAGE: ${langLabel} (code: ${language}). All examples MUST be in ${langLabel}.

    Please generate a JSON object with the following properties:
    {
      "examples": [
        "[5 example sentences in ${langLabel} using the word in realistic contexts, B2 level]"
      ]
    }
    The user has these examples and wishes to change them, so do NOT generate the same ones:
    ${oldExamples}
    - Be creative with examples, ensuring they do not seem repetitive or too similar to the provided ones.
    - Ensure the examples are diverse and cover different contexts where the word might be used.
    - Avoid using the same sentence structure repeatedly.
    - Make sure the examples are suitable for learners at the B2 level.
    - All examples MUST be in ${langLabel}.
    `.trim(),
    user: `Generate examples in ${langLabel} for the word: ${word}`,
  };
};

export interface WordCodeSwitchingPromptParams {
  prompt: string;
  language: Language;
  oldExamples: string;
}

export const createWordCodeSwitchingPrompt = (
  params: WordCodeSwitchingPromptParams
) => {
  const { prompt, language, oldExamples } = params;
  const langLabel = getLangLabel(language);
  return {
    system: `
      You are an expert in ${langLabel} and Spanish with a focus on teaching and lexicography.
      TARGET: Code-switching sentences = word in ${langLabel} + rest of sentence in Spanish.

      Generate a JSON object:
      {
        "codeSwitching": [
          "[5 sentences: use the word in ${langLabel}, rest of sentence in Spanish]"
        ]
      }
      Example format: "[${langLabel} word] + [rest in Spanish]" (e.g. "El globo burst y todos se asustan" for English "burst")

      The user has these examples and wishes to change them, so do NOT generate the same ones:
      ${oldExamples}
      - Be creative, diverse contexts, avoid repetitive structures.
      - Suitable for B2 level. All sentences: word in ${langLabel}, rest in Spanish.
`.trim(),
    user: `Generate code-switching examples (word in ${langLabel}, rest in Spanish) for: ${prompt}`,
  };
};
