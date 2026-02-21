export type QuestionType = "multiple" | "unique" | "fillInBlank" | "translateText";

export interface ExamGenerationParams {
  language: string;
  grammarTopics: string[];
  difficulty: string;
  questionCount: number;
  questionTypes: QuestionType[];
  topic?: string;
}

const typeDescriptions: Record<QuestionType, string> = {
  multiple:
    "4 options, 2 or more correct (select all that apply). Schema: text, options[], correctIndices (array of 0-3, e.g. [0,2]), grammarTopic, explanation",
  unique:
    "4 options, one correct (like multiple but 'single choice'). Schema: text, options[], correctIndex (0-3), grammarTopic, explanation. MUST include options array.",
  fillInBlank:
    "Sentence with _____ for blank(s). MUST have 4 options. Schema: text (use _____ for blank), options[], correctIndex (0-3), grammarTopic, explanation. Distractors: plausible learner errors.",
  translateText:
    "Translate text to exam language. Schema: text (source text to translate), correctAnswer (correct translation), grammarTopic, explanation. Text can be a sentence or short paragraph.",
};

export const createExamGenerationPrompt = (params: ExamGenerationParams) => {
  const { language, grammarTopics, difficulty, questionCount, questionTypes, topic } = params;

  const topicHint = topic ? `General topic: ${topic}. ` : "";
  const typesList = questionTypes.length ? questionTypes.join(", ") : "multiple";
  const typeInstructions = questionTypes
    .map((t) => `- ${t}: ${typeDescriptions[t]}`)
    .join("\n");

  return {
    system: `You are an expert language teacher creating a grammar exam.
Generate exactly ${questionCount} questions. Types to use (in order, cycle if needed): ${typesList}

PARAMS:
- Language: ${language}
- Grammar topics (MUST use these): ${grammarTopics.join(", ")}
- Difficulty (CEFR): ${difficulty}
${topicHint}

QUESTION TYPES - generate each according to its schema:
${typeInstructions}

OUTPUT: Return ONLY valid JSON. No markdown, no explanation.
{
  "title": "string",
  "questions": [
    { "type": "multiple", "text": "...", "options": ["A","B","C","D"], "correctIndices": [0,2], "grammarTopic": "...", "explanation": "..." },
    { "type": "unique", "text": "...", "options": ["A","B","C","D"], "correctIndex": 1, "grammarTopic": "...", "explanation": "..." },
    { "type": "fillInBlank", "text": "She _____ to school.", "options": ["goes","go","going","gone"], "correctIndex": 0, "grammarTopic": "...", "explanation": "..." },
    { "type": "translateText", "text": "Texto en español", "correctAnswer": "Translation in exam language", "grammarTopic": "...", "explanation": "..." }
  ]
}

RULES:
- Each question has "type" matching the requested type
- Distribute grammar topics across questions
- Match vocabulary and structures to ${difficulty} level
- explanation: brief, pedagogical, in ${language}
- For fillInBlank: use _____ for blanks in text; MUST include options array with plausible distractors
- CRITICAL for multiple: use correctIndices (array), never correctIndex. At least 2 correct options
- CRITICAL for multiple/fillInBlank: Wrong options (distractors) must be PLAUSIBLE - common learner mistakes, not random words. E.g. for "She _____ to school" (correct: goes), use "go", "going", "gone" as distractors; never "banana" or unrelated words
- CRITICAL for translateText: text ALWAYS in Spanish. correctAnswer ALWAYS in ${language}. User translates Spanish → ${language}.`,
    user: `Generate ${questionCount} questions in ${language} for level ${difficulty}. Types: ${typesList}. Grammar: ${grammarTopics.join(", ")}.`,
  };
};
