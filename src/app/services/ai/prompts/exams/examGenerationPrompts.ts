export type QuestionType = "multiple" | "unique" | "fillInBlank" | "completeText";

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
    "4 options, one correct. Schema: text, options[], correctIndex (0-3), grammarTopic, explanation",
  unique:
    "Single word/phrase answer. Text with blank or instruction. Schema: text, correctAnswer, grammarTopic, explanation",
  fillInBlank:
    "Sentence with _____ for blank(s). Schema: text (use _____ for blank), correctAnswer, grammarTopic, explanation",
  completeText:
    "Incomplete sentence to complete. Schema: text (incomplete), correctAnswer, grammarTopic, explanation",
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
    { "type": "multiple", "text": "...", "options": ["A","B","C","D"], "correctIndex": 0, "grammarTopic": "...", "explanation": "..." },
    { "type": "fillInBlank", "text": "She _____ to school.", "correctAnswer": "goes", "grammarTopic": "...", "explanation": "..." }
  ]
}

RULES:
- Each question has "type" matching the requested type
- Distribute grammar topics across questions
- Match vocabulary and structures to ${difficulty} level
- explanation: brief, pedagogical, in ${language}
- For fillInBlank/completeText: use _____ for blanks in text
- CRITICAL for multiple: Wrong options (distractors) must be PLAUSIBLE - common learner mistakes, not random words. E.g. for "She _____ to school" (correct: goes), use "go", "going", "gone" as distractors; never "banana" or unrelated words`,
    user: `Generate ${questionCount} questions in ${language} for level ${difficulty}. Types: ${typesList}. Grammar: ${grammarTopics.join(", ")}.`,
  };
};
