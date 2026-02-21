export interface ExamQuestionChatParams {
  questionText: string;
  questionType: string;
  grammarTopic?: string;
  difficulty?: string;
  options?: string[];
  correctIndex?: number;
  correctAnswer?: string;
  explanation: string;
  userAnswer: number | string;
  userMessage: string;
  chatHistory: Array<{ role: string; content: string }>;
  language: string;
}

export const createExamQuestionChatPrompt = (params: ExamQuestionChatParams) => {
  const {
    questionText,
    questionType,
    grammarTopic = "",
    difficulty = "",
    options = [],
    correctIndex = 0,
    correctAnswer,
    explanation,
    userAnswer,
    userMessage,
    chatHistory,
    language,
  } = params;

  const isMultiple = questionType === "multiple";
  const correctDisplay = isMultiple
    ? `Option ${correctIndex}: ${options[correctIndex] || "N/A"}`
    : correctAnswer || "N/A";
  const userDisplay = isMultiple
    ? `Option ${userAnswer}: ${options[Number(userAnswer)] || "N/A"}`
    : String(userAnswer || "");

  const optionsPart = isMultiple
    ? `OPTIONS: ${options.map((o, i) => `${i}: ${o}`).join(" | ")}\n`
    : "";

  const grammarPart = grammarTopic ? `GRAMMAR TOPIC: ${grammarTopic}\n` : "";
  const levelPart = difficulty ? `EXAM LEVEL (CEFR): ${difficulty}\n` : "";

  const systemPrompt = `You are a helpful language teacher. The student failed this grammar question and wants to understand their mistake.

QUESTION: ${questionText}
${optionsPart}CORRECT ANSWER: ${correctDisplay}
STUDENT ANSWERED: ${userDisplay}
${grammarPart}${levelPart}EXPLANATION: ${explanation}

Respond in ${language}. Be encouraging, clear, and pedagogical.
- Focus on ONE concept at a time - don't overwhelm
${grammarTopic ? `- Explain the grammar rule (${grammarTopic}) that applies` : ""}
${difficulty ? `- Use vocabulary appropriate for ${difficulty} level` : ""}
- Help them understand why their answer was wrong and how to avoid the mistake.`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...chatHistory.slice(-6).map((msg) => ({ role: msg.role, content: msg.content })),
    { role: "user" as const, content: userMessage },
  ];

  return { system: systemPrompt, messages };
};
