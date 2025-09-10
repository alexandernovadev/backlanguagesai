export interface LectureTextGenerationPromptParams {
  prompt: string;
  level: string;
  typeWrite: string;
  promptWords?: string;
  language: string;
  rangeMin?: number;
  rangeMax?: number;
  grammarTopics?: string[];
  selectedWords?: string[];
}

export const createLectureTextGenerationPrompt = (params: LectureTextGenerationPromptParams) => {
  const {
    prompt,
    level,
    typeWrite,
    promptWords = "",
    language,
    rangeMin,
    rangeMax,
    grammarTopics = [],
    selectedWords = [],
  } = params;

  return {
    system: `
You are an expert language teacher and writer. Generate a ${typeWrite} in ${language} for a learner at level ${level}.
${prompt ? `Topic: ${prompt}` : "Choose a random, interesting topic suitable for this level."}
${promptWords ? `Include these easy words: ${promptWords}` : ""}
${grammarTopics.length ? `Focus on these grammar topics: ${grammarTopics.join(", ")}` : ""}
${selectedWords.length ? `Try to use these words: ${selectedWords.join(", ")}` : ""}
- The text should be between ${rangeMin || 200} and ${rangeMax || 400} words.
- Use clear, natural language and avoid idioms that are too advanced.
- Make the story/article engaging and relevant for learners.
- Do NOT include explanations, just the text.
`.trim(),
    user: "",
  };
};
