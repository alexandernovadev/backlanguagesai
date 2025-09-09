import { Language, CertificationLevel, ReadingType, GrammarTopic } from "../../../../../types/business";

export interface TextGenerationPromptParams {
  prompt?: string;
  level: CertificationLevel;
  typeWrite: ReadingType;
  language: Language;
  promptWords: string;
  rangeMin: number;
  rangeMax: number;
  grammarTopics: GrammarTopic[];
  selectedWords: string[];
}

export const createTextGenerationPrompt = (params: TextGenerationPromptParams) => {
  const {
    prompt,
    level,
    typeWrite,
    language,
    promptWords,
    rangeMin,
    rangeMax,
    grammarTopics,
    selectedWords,
  } = params;

  const selectedWordsInstructions = selectedWords.length > 0 
    ? `
🎯 SELECTED WORDS REQUIREMENT:
You MUST include these specific words naturally in the text: ${selectedWords.join(', ')}
- Use each word at least once in appropriate contexts
- Integrate them naturally into the narrative/story
- Do NOT create a separate vocabulary list or word bank
- Do NOT explain the meaning of these words
- These words should appear as part of the normal flow of the content
- Ensure the text feels natural while incorporating all selected words
`
    : "";

  const grammarInstructions = grammarTopics.length > 0 
    ? `
🎯 GRAMMAR TOPICS REQUIREMENT:
Use these grammar patterns implicitly in the sentences: ${grammarTopics.join(', ')}
- Integrate them NATURALLY in the narrative/dialogue; do NOT name or explain the grammar
- NO headings, subtitles, or paragraphs that mention the grammar names
- NO meta explanations, definitions, or tutorials about grammar
- The topic "${prompt}" (or a random one) is the main theme; grammar is only reflected in how sentences are written
- Vary sentence structures so the selected grammar appears multiple times, but always as part of the story/content
`
    : "";

  return {
    system: `
Generate a Markdown text in language "${language}" according to ISO 639-1 standards for languages. 
This text is for educational purposes with a "${typeWrite}" style, using vocabulary and 
complexity appropriate for a ${level} level. 

Formatting guidelines:
- Title should be "# Title".
- Use one main subtitle as "## Subtitle".
- Use additional subtitles as "### Subtitle" if needed.
- Avoid using additional H1 or H2 headers after the initial title and subtitle.
- Don't use h4 or h5 or h6 headers.
- Don't use old fashioned words
- Don't use nested lists (sub-lists) in the Markdown.

Content guidelines:
- Avoid using rare, uncommon words or special symbols, as each word should be clickable and easily searchable in a dictionary.
- For ${level} level:
  - **A1-A2:** Use simple words, basic sentences, and give short, clear examples. Define complex words as needed.
  - **B1-B2:** Use intermediate vocabulary, compound sentences, and provide real-world examples.
  - **C1-C2:** Use advanced vocabulary, complex sentence structures, and offer deeper analysis or insights.
- Include quotes or examples to enrich the content where relevant.
- If grammar topics are provided, REFLECT them only through sentence construction. Do NOT mention or explain grammar topics explicitly.
${promptWords}

- Length MUST BE between ${rangeMin} and ${rangeMax} characters.
- Must make a subtitle and not just put "subtitle" or "subtitle 1" or "subtitle 2".

Learning aids:
- For C1-C2 levels, include a brief summary of the main points.
${grammarInstructions}
${selectedWordsInstructions}
`.trim(),
    user: prompt && prompt.trim().length > 0
      ? "The topic would be " + prompt
      : "Generate a random everyday-life topic and write the text accordingly.",
  };
};
