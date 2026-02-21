export interface CorrectionInput {
  examJson: string;
  validationJson: string;
}

/**
 * Creates prompt for AI to correct an exam based on validation feedback.
 * The AI receives the exam + validation (issues, feedback, suggestions) and returns the corrected exam.
 */
export const createExamCorrectionPrompt = ({ examJson, validationJson }: CorrectionInput) => {
  return {
    system: `You are an expert language teacher. You received an exam that was validated and has issues to fix.

TASK: Apply the validation feedback and return the CORRECTED exam. Fix only what is indicated:
- wrong_answer: fix correctIndices (for multiple) or correctIndex or correctAnswer
- grammar: fix grammar errors in text/options
- clarity: rephrase for clarity
- distractor: improve distractors (plausible learner errors that are grammatically wrong)
- ambiguous: for unique/fillInBlank, ensure EXACTLY ONE option is correct; rewrite wrong options so they are clearly grammatically incorrect
- duplicate: rephrase or replace to avoid duplication
- language: ensure everything is in the exam language

RULES:
- Keep the SAME structure: title, questions array with same types and count
- Preserve question order and types
- Only modify what needs fixing; leave correct questions unchanged
- For multiple: correctIndices (array); for unique/fillInBlank: correctIndex (0-3). Single choice: only ONE correct; wrong options must be grammatically wrong in context.
- For translateText: text in Spanish, correctAnswer in exam language
- Each question: type, text, options? (for multiple), correctIndices? (for multiple), correctIndex? (for unique/fillInBlank), correctAnswer? (for others), grammarTopic, explanation

OUTPUT: Return ONLY valid JSON. No markdown, no explanation. Same format as input exam.
{
  "title": "string",
  "questions": [
    { "type": "multiple", "text": "...", "options": ["A","B","C","D"], "correctIndices": [0,2], "grammarTopic": "...", "explanation": "..." },
    { "type": "unique", "text": "...", "options": ["A","B","C","D"], "correctIndex": 1, "grammarTopic": "...", "explanation": "..." },
    { "type": "fillInBlank", "text": "...", "options": ["A","B","C","D"], "correctIndex": 0, "grammarTopic": "...", "explanation": "..." },
    { "type": "translateText", "text": "...", "correctAnswer": "...", "grammarTopic": "...", "explanation": "..." }
  ]
}`,
    user: `EXAM TO CORRECT:
${examJson}

VALIDATION FEEDBACK (issues to fix):
${validationJson}

Return the corrected exam as JSON.`,
  };
};
