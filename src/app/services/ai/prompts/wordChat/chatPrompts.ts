export interface WordSummary {
  word: string;
  definition: string;
  examples?: string[];
}

import { getLangLabel } from "../langUtils";
const getTargetLang = getLangLabel;

export function createInitialMessagePrompt(
  words: WordSummary[],
  language: string
): string {
  const targetLang = getTargetLang(language);
  const wordsJson = JSON.stringify(words, null, 2);

  return `You are a friendly language teacher. Start a natural conversation to help the student practice vocabulary.

WORDS TO USE (introduce them naturally over the conversation, one or two per message):
${wordsJson}

RULES:
- Write in ${targetLang}. Be conversational and engaging.
- Choose a topic that fits the words (work, travel, daily life, etc.).
- Introduce 1-2 words per message. Don't list them all at once.
- When all words have been used, end with a brief summary: "We've covered all the words! Great practice."
- Keep messages 2-4 sentences. Be natural.

Respond with ONLY the message text (no JSON, no markdown code blocks).`;
}

export function createChatResponsePrompt(
  words: WordSummary[],
  wordsUsed: string[],
  messages: Array<{ role: string; content: string }>,
  language: string
): string {
  const targetLang = getTargetLang(language);
  const wordsJson = JSON.stringify(words, null, 2);
  const remaining = words.filter((w) => !wordsUsed.includes(w.word)).map((w) => w.word);

  const history = messages.slice(-6).map((m) => `${m.role}: ${m.content}`).join("\n");

  return `You are a friendly language teacher. Continue the conversation.

WORDS (use naturally): ${wordsJson}
ALREADY USED: ${wordsUsed.join(", ") || "none"}
STILL TO USE: ${remaining.join(", ") || "all done"}

Chat history:
${history}

RULES:
- Respond in ${targetLang}. Be conversational.
- If possible, introduce 1-2 words from STILL TO USE.
- When all words are used: end with "We've covered all the words! Great practice." and set status completed.
- Keep messages 2-4 sentences. Be natural.

Respond with ONLY the message text (no JSON, no markdown).`;
}

export function createCorrectionPrompt(
  userMessage: string,
  language: string,
  explainsLanguage: string = "es"
): string {
  const targetLang = getTargetLang(language);
  const explainLang = getTargetLang(explainsLanguage);

  return `You are a language teacher. Correct the student's ${targetLang} message.

Student wrote: "${userMessage}"

Provide:
1. The corrected version (in ${targetLang})
2. Brief explanation of errors in ${explainLang} (1-2 sentences)

Format: "**Corrección:** [corrected text]\n\n**Explicación:** [brief explanation]"

Respond ONLY with the correction and explanation. No JSON.`;
}

export function createTitlePrompt(messages: Array<{ role: string; content: string }>): string {
  const preview = messages.slice(0, 3).map((m) => m.content).join(" ").slice(0, 150);

  return `Generate a short chat title (max 6 words) from this conversation preview: "${preview}..."

Respond with ONLY the title, no quotes.`;
}
