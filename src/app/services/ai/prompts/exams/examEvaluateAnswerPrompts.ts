import { getLangLabel } from "../langUtils";

export interface ExamEvaluateAnswerParams {
  questionText: string;
  questionType: string;
  grammarTopic?: string;
  difficulty?: string;
  correctAnswer?: string;
  explanation: string;
  userAnswer: string;
  language: string;
  explainsLanguage?: string;
}

/**
 * AI evaluates translation answers and assigns score 0-100 with partial credit.
 * Only used for translateText type.
 */
export const createExamEvaluateTranslationPrompt = (params: ExamEvaluateAnswerParams) => {
  const {
    questionText,
    grammarTopic = "",
    difficulty = "",
    correctAnswer,
    explanation,
    userAnswer,
    language,
    explainsLanguage = "es",
  } = params;

  const targetLang = getLangLabel(language);
  const feedbackLang = getLangLabel(explainsLanguage);

  const systemPrompt = `You are an expert language teacher evaluating a translation. Assign a score 0-100.

TEXT TO TRANSLATE (in Spanish): ${questionText}
REFERENCE CORRECT TRANSLATION (in ${targetLang}): ${correctAnswer || "N/A"}
STUDENT TRANSLATION: ${userAnswer}
${grammarTopic ? `GRAMMAR TOPIC: ${grammarTopic}\n` : ""}${difficulty ? `LEVEL: ${difficulty}\n` : ""}EXPLANATION: ${explanation}

SCORING: Perfect = 100. Minor errors (spelling, word order) = 70-90. Some correct vocabulary/grammar = 40-70. Major errors but attempt = 20-40. Wrong/irrelevant = 0. Be pedagogically fair for the level.

ACCEPT ALTERNATIVE VALID TRANSLATIONS:
- Accept synonyms, different verb forms (e.g. present perfect vs simple past when both acceptable), regional variants.
- Give full or high credit if the translation is semantically equivalent and grammatically correct.
- Do NOT penalize valid alternatives that differ from the reference but are correct.

FEEDBACK RULES:
- Write ALL feedback in ${feedbackLang}. Explain errors, corrections, and tips in ${feedbackLang}.
- Show the correct translation ONCE at the end: "**Traducción correcta:** [reference in ${targetLang}]" (or equivalent label in ${feedbackLang}).
- Use clear structure: separate paragraphs for different points. Use line breaks between sections. Use **bold**, \`code\`, lists where helpful.
- NO generic motivational phrases: do NOT say "Keep practicing", "Keep up the good work", "You're doing great", "Don't give up", or similar. Be concise and pedagogical only.

Respond ONLY valid JSON:
{
  "score": <0-100 integer>,
  "reasoning": "<1-2 sentences>",
  "feedback": "<Markdown feedback in ${feedbackLang}. Structure: 1-2 paragraphs for explanation, then correct translation. Use line breaks between paragraphs. 3-8 lines. No motivational filler.>"
}`;

  return { system: systemPrompt, user: "Evaluate this translation and return the JSON." };
};
