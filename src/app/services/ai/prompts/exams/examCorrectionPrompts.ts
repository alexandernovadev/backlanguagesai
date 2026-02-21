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
- wrong_answer: fix correctIndex or correctAnswer
- grammar: fix grammar errors in text/options
- clarity: rephrase for clarity
- distractor: improve distractors (make them plausible learner errors)
- duplicate: rephrase or replace to avoid duplication
- language: ensure everything is in the exam language

RULES:
- Keep the SAME structure: title, questions array with same types and count
- Preserve question order and types
- Only modify what needs fixing; leave correct questions unchanged
- For multiple/unique/fillInBlank (with options): options array, correctIndex (0-3)
- For translateText: text in Spanish, correctAnswer in exam language
- Each question: type, text, options? (for multiple), correctIndex? (for multiple), correctAnswer? (for others), grammarTopic, explanation

OUTPUT: Return ONLY valid JSON. No markdown, no explanation. Same format as input exam.
{
  "title": "string",
  "questions": [
    { "type": "multiple", "text": "...", "options": ["A","B","C","D"], "correctIndex": 0, "grammarTopic": "...", "explanation": "..." },
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
