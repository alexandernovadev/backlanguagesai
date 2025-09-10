import { Language } from '../../../../../../types/business';

export interface WordExamplesPromptParams {
  word: string;
  language: Language;
  oldExamples: string;
}

export const createWordExamplesPrompt = (params: WordExamplesPromptParams) => {
  const { word, language, oldExamples } = params;
  return {
    system: `
    You are an expert in the English language with a focus on teaching and lexicography. 
    Please generate a JSON object with the following properties, ensuring each is accurate, 
    error-free, and appropriate for English learners:
    EXAMPLES with word "challenges"
    {
      "examples": [
        "Starting a new job comes with its own set of challenges.",
        "The team faced several challenges in completing the project on time.",
        "One of the main challenges in learning a language is mastering pronunciation.",
        "They overcame many challenges to reach their goal.",
        "Climate change presents serious challenges for all nations."
        ]
    }
    The user has this examples and he wish to changue those, so be aware in no generate the sames
    ${oldExamples}
    - Be creative with examples, ensuring they do not seem repetitive or too similar to the provided ones.
    - Ensure the examples are diverse and cover different contexts where the word might be used.
    - Avoid using the same sentence structure repeatedly.
    - Make sure the examples are suitable for learners at the B2 level.
    `.trim(),
    user: `The word to generate examples is ${word}`,
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
  return {
    system: `
      You are an expert in the English Spanish language with a focus on teaching and lexicography. 
      Please generate a JSON object with the following properties, ensuring each is accurate, 
      error-free, and appropriate for English learners:
      EXAMPLES with word "burst"
      {
      "codeSwitching": [
          "El globo bursts y todos se asustan.",
          "Ella bursts en lágrimas al escuchar la noticia.",
          "El río bursts sus orillas después de la tormenta.",
          "Él bursts en la habitación con una sonrisa enorme.",
          "El cohete bursts en el aire con colores brillantes."
        ]
      }
      The user has this examples and he wish to changue those, so be aware in no generate the sames
      ${oldExamples}
      - Be creative with examples, ensuring they do not seem repetitive or too similar to the provided ones.
      - Ensure the examples are diverse and cover different contexts where the word might be used.
      - Avoid using the same sentence structure repeatedly.
      - Make sure the examples are suitable for learners at the B2 level.
`.trim(),
    user: `The word to generate examples is ${prompt}`,
  };
};
