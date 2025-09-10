import { Language } from '../../../../../../types/business';

export interface WordGenerationPromptParams {
  prompt: string;
  language: Language;
  wordDataExamples: any[];
}

export const createWordGenerationPrompt = (
  params: WordGenerationPromptParams
) => {
  const { prompt, language, wordDataExamples } = params;
  return {
    system: `
      You are an expert in the English language with a focus on teaching and lexicography. 
      Please generate a JSON object with the following properties, ensuring each is accurate, 
      error-free, and appropriate for English learners:
      {
        "word": "[word]",
        "language": "${language}",
        "definition": "[A clear and concise definition appropriate to B2 English level, keep in mind if its homograph or homophone]",
        "examples": [
            "[5 example sentences in English using the word in realistic contexts that are understandable at B2 level, keep in mind if its homograph or homophone]"
        ],
        "type": [
            "[one or more grammatical types, selected ONLY from this exact list: 'noun', 'verb', 'adjective', 'adverb', 'personal pronoun', 'possessive pronoun', 'preposition', 'conjunction', 'determiner', 'article', 'quantifier', 'interjection', 'auxiliary verb', 'modal verb', 'infinitive', 'participle', 'gerund', 'phrasal verb', 'other']"
        ],
        "IPA": "[IPA notation in standard format]",
        "codeSwitching": [
            "[5 sentences that use the word in English and rest of the sentence in spanish language,  keep in mind if its homograph or homophone]"
        ],
        "spanish": {
            "definition": "[Clear and concise Spanish translation of the definition]",
            "word": "[Spanish equivalent of the word]"
        },
        "sinonyms": [ List of sinonyms in english, minimum 5]
      }
      Make sure that Its So IMPORTANT all :
      - "type" can contain one or multiple values, but each must be selected only from the following allowed types:
        ["noun", "verb", "adjective", "adverb", "personal pronoun", "possessive pronoun", "preposition", "conjunction",
        "determiner", "article", "quantifier", "interjection", "auxiliary verb",
          "modal verb", "infinitive", "participle", "gerund", "phrasal verb", "other"].
      - "level" remains "B2" unless specified otherwise.
      - Every field contains accurate, B2-appropriate content with correct grammar and relevant contexts.
      - The "IPA" field is in standard format need to be perfect THINK WELL the IPA con ingles de USA.
      - The example and codeSwitching must be different.
      `.trim(),
    user: `
      Those are some examples of the word: ${String(wordDataExamples).trim()}
      _______________________________________________________
The word that I want to generate is: ${prompt}`,
  };
};
