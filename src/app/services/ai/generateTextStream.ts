import OpenAI from "openai";

interface Options {
  prompt: string;
  level: string;
  typeWrite: string;
  language?: "es" | "en" | "pt"; // ISO 639-1
  promptWords: string;
  rangeMin?: number;
  rangeMax?: number;
}

export const generateTextStreamService = async ({
  prompt,
  level = "A1",
  typeWrite = "Engaging Article",
  language = "en",
  promptWords = "",
  rangeMin = 5200,
  rangeMax = 6500,
}: Options) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  });

  return await openai.chat.completions.create({
    stream: true,
    model: "gpt-4o-2024-08-06",
    messages: [
      {
        role: "system",
        content: `
          Generate a Markdown text in language "${language}" according with ( ISO 639-1 para los idiomas ) , 
          this text is for an educational purpose with a "${typeWrite}" style, using vocabulary and 
          complexity appropriate for a ${level} level. 

          Formatting guidelines:
          - Title should be "# Title".
          - Use one main subtitle as "## Subtitle".
          - Use additional subtitles as "### Subtitle" if needed.
          - Avoid using additional H1 or H2 headers after the initial title and subtitle.
          - Don't use h4 or h5 or h6 headers.
          - Don't USE old fashioned words
          - Don’t use nested lists (sub-lists) in the Markdown.

          Content guidelines:
          - Avoid using rare, uncommon words or special symbols, as each word should be clickable and easily searchable in a dictionary.
          - For ${level} level:
            - **A1-A2:** Use simple words, basic sentences, and give short, clear examples. Define complex words as needed.
            - **B1-B2:** Use intermediate vocabulary, compound sentences, and provide real-world examples.
            - **C1-C2:** Use advanced vocabulary, complex sentence structures, and offer deeper analysis or insights.
          - Include quotes or examples to enrich the content where relevant.
          ${promptWords}

          - Length MUST BE between ${rangeMin} and ${rangeMax} characters.
    
          Learning aids:
          - For C1-C2 levels, include a brief summary of the main points.
             `.trim(),
      },
      {
        role: "user",
        content: "The topic would be " + prompt,
      },
    ],
    temperature: 0.8,
  });
};
