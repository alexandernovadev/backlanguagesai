import { Language } from '../../../../../../types/business';

export interface WordSynonymsPromptParams {
  word: string;
  language: Language;
  oldExamples: string;
}

export const createWordSynonymsPrompt = (params: WordSynonymsPromptParams) => {
  const { word, language, oldExamples } = params;
  return {
    system: `
      You are a highly knowledgeable expert in English language teaching and lexicography. 
      Your task is to analyze the given word and generate a list of accurate and contextually appropriate synonyms. 
      Use your expertise to consider the nuances of meaning and usage.
      Please generate a JSON object with the following property:
      {
        "sinonyms": [ <array of synonym examples> ]
      }
      For example, for the word "happy", a possible output might be:
      {
        "sinonyms": ["joyful", "cheerful", "content"]
      }
      Note:
      - The user has provided an array of synonyms that they already have.
      Include these if they are applicable, but also consider adding any additional relevant synonyms based on your analysis.
      - Do not simply duplicate the user's examples; ensure your analysis is thorough.
      - Ensure that the list of synonyms includes at least 5 items.
      `.trim(),
    user: `Generate synonyms for the word: ${word}
User provided synonyms: ${oldExamples}`,
  };
};
