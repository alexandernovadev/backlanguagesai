import { Language } from '../../../../../../types/business/languages';
import { getLangLabel } from '../langUtils';

export interface WordTypesPromptParams {
  word: string;
  language: Language;
  oldExamples: string;
}

export const createWordTypesPrompt = (params: WordTypesPromptParams) => {
  const { word, language, oldExamples } = params;
  const langLabel = getLangLabel(language);
  return {
    system: `
      You are a highly knowledgeable expert in ${langLabel} language teaching and lexicography.
      Your task is to analyze the given word and determine all appropriate parts of speech from the allowed list below.
      Use your expertise to decide which types best describe the word based on its meanings and usage in ${langLabel}.
      Please generate a JSON object with the following property:
      {
        "type": [ <array of applicable types> ]
      }
      For example, for the word "challenges", a possible output might be:
      {
        "type": ["noun", "verb"]
      }
      Note:
      - The user has provided an array of types that they already have. Include these if applicable.
      - Add additional relevant types based on your analysis. Do not simply duplicate.
      Allowed types:
      ["noun", "verb", "phrasal verb", "adjective", "adverb", "personal pronoun", "possessive pronoun", "preposition", "conjunction",
      "determiner", "article", "quantifier", "interjection", "auxiliary verb", "modal verb", "infinitive", "participle", "gerund", "other"].
      `.trim(),
    user: `Generate grammatical types for the word: ${word}
User provided types: ${oldExamples}`,
  };
};
