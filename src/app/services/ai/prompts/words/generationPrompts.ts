import { Language } from '../../../../../../types/business';
import { getLangLabel } from '../langUtils';

export interface WordGenerationPromptParams {
  prompt: string;
  language: Language;
  wordDataExamples: any[];
}

export const createWordGenerationPrompt = (
  params: WordGenerationPromptParams
) => {
  const { prompt, language, wordDataExamples } = params;
  const langLabel = getLangLabel(language);
  return {
    system: `
      You are an expert in the ${langLabel} language with a focus on teaching and lexicography.
      TARGET LANGUAGE: ${langLabel} (code: ${language}). All content must be in ${langLabel} unless specified otherwise.

      CRITICAL - "word" field: You MUST use the EXACT word the user provides. DO NOT translate it to another language.
      If the user gives "Desempenho" (Portuguese), return "Desempenho". If they give "hello" (English), return "hello".
      Never substitute the word with a translation.

      Please generate a JSON object with the following properties:
      {
        "word": "[USE THE EXACT WORD THE USER PROVIDED - DO NOT TRANSLATE]",
        "language": "${language}",
        "definition": "[A clear and concise definition in ${langLabel}, appropriate to B2 level, keep in mind if its homograph or homophone]",
        "examples": [
            "[5 example sentences in ${langLabel} using the word in realistic contexts that are understandable at B2 level, keep in mind if its homograph or homophone]"
        ],
        "type": [
            "[one or more grammatical types, selected ONLY from this exact list: 'noun', 'verb', 'adjective', 'adverb', 'personal pronoun', 'possessive pronoun', 'preposition', 'conjunction', 'determiner', 'article', 'quantifier', 'interjection', 'auxiliary verb', 'modal verb', 'infinitive', 'participle', 'gerund', 'phrasal verb', 'other']"
        ],
        "IPA": "[IPA notation in standard format for the word in ${langLabel}]",
        "codeSwitching": [
            "[5 sentences that use the word in ${langLabel} and the rest of the sentence in Spanish, keep in mind if its homograph or homophone]"
        ],
        "spanish": {
            "definition": "[Clear and concise Spanish translation of the definition]",
            "word": "[Spanish equivalent of the word]"
        },
        "sinonyms": [ "List of synonyms in ${langLabel}, minimum 5" ]
      }
      Make sure that Its So IMPORTANT all :
      - "word" MUST be the exact word the user provided. NEVER translate it.
      - "type" can contain one or multiple values, but each must be selected only from the following allowed types:
        ["noun", "verb", "adjective", "adverb", "personal pronoun", "possessive pronoun", "preposition", "conjunction",
        "determiner", "article", "quantifier", "interjection", "auxiliary verb",
          "modal verb", "infinitive", "participle", "gerund", "phrasal verb", "other"].
      - "level" remains "B2" unless specified otherwise.
      - Every field contains accurate, B2-appropriate content with correct grammar and relevant contexts.
      - The "IPA" field must be correct for the word in ${langLabel}.
      - The example and codeSwitching must be different.
      `.trim(),
    user: `
      Those are some examples of the word: ${String(wordDataExamples).trim()}
      _______________________________________________________
The word that I want to generate is: ${prompt}`,
  };
};
