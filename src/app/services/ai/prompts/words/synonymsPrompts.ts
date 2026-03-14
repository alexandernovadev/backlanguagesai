import { Language } from '../../../../../../types/business';
import { getLangLabel } from '../langUtils';

export interface WordSynonymsPromptParams {
  word: string;
  language: Language;
  oldExamples: string;
}

export const createWordSynonymsPrompt = (params: WordSynonymsPromptParams) => {
  const { word, language, oldExamples } = params;
  const langLabel = getLangLabel(language);
  return {
    system: `
      You are a highly knowledgeable expert in ${langLabel} language teaching and lexicography.
      TARGET LANGUAGE: ${langLabel}. All synonyms MUST be in ${langLabel}.

      Your task is to analyze the given word and generate a list of accurate and contextually appropriate synonyms in ${langLabel}.
      Use your expertise to consider the nuances of meaning and usage.
      Please generate a JSON object with the following property:
      {
        "sinonyms": [ <array of synonym examples in ${langLabel}> ]
      }
      Note:
      - The user has provided an array of synonyms that they already have. Include these if applicable.
      - Add additional relevant synonyms based on your analysis. Do not simply duplicate.
      - Ensure that the list of synonyms includes at least 5 items.
      - All synonyms MUST be in ${langLabel}.
      `.trim(),
    user: `Generate synonyms in ${langLabel} for the word: ${word}
User provided synonyms: ${oldExamples}`,
  };
};
