import { getLangLabel } from "../langUtils";

export interface ExamQuestionChatParams {
  questionText: string;
  questionType: string;
  grammarTopic?: string;
  difficulty?: string;
  options?: string[];
  correctIndex?: number;
  correctIndices?: number[];
  correctAnswer?: string;
  explanation: string;
  userAnswer: number | number[] | string;
  userMessage: string;
  chatHistory: Array<{ role: string; content: string }>;
  language: string;
  explainsLanguage?: string;
}

export const createExamQuestionChatPrompt = (params: ExamQuestionChatParams) => {
  const {
    questionText,
    questionType,
    grammarTopic = "",
    difficulty = "",
    options = [],
    correctIndex = 0,
    correctIndices,
    correctAnswer,
    explanation,
    userAnswer,
    userMessage,
    chatHistory,
    language,
    explainsLanguage = "es",
  } = params;

  const hasOptions = options && options.length > 0;
  const isMultipleSelect = questionType === "multiple" && hasOptions;
  const correctIndicesArr = correctIndices ?? (correctIndex != null ? [correctIndex] : []);
  const correctDisplay = hasOptions
    ? isMultipleSelect
      ? correctIndicesArr.map((i) => options[i]).filter(Boolean).join(", ")
      : `Option ${correctIndex}: ${options[correctIndex] || "N/A"}`
    : correctAnswer || "N/A";
  const userIndices = Array.isArray(userAnswer) ? userAnswer : typeof userAnswer === "number" ? [userAnswer] : [];
  const userDisplay = hasOptions
    ? isMultipleSelect
      ? userIndices.map((i) => options[i]).filter(Boolean).join(", ")
      : `Option ${userAnswer}: ${options[Number(userAnswer)] || "N/A"}`
    : String(userAnswer || "");

  const optionsPart = hasOptions
    ? `OPTIONS: ${options.map((o, i) => `${i}: ${o}`).join(" | ")}\n`
    : "";

  const grammarPart = grammarTopic ? `GRAMMAR TOPIC: ${grammarTopic}\n` : "";
  const levelPart = difficulty ? `EXAM LEVEL (CEFR): ${difficulty}\n` : "";
  const isSelectionQuestion = hasOptions && (questionType === "multiple" || questionType === "unique" || questionType === "fillInBlank");
  const selectionNote = isSelectionQuestion
    ? `\nNote: The student SELECTED an option - they did not write it. Focus on why the selected option was wrong vs the correct one. Avoid correcting grammar as if they wrote it.\n`
    : "";

  const systemPrompt = `You are a helpful language teacher. The student failed this grammar question and wants to understand their mistake.

QUESTION: ${questionText}
${optionsPart}CORRECT ANSWER: ${correctDisplay}
STUDENT ${isSelectionQuestion ? "SELECTED" : "ANSWERED"}: ${userDisplay}
${grammarPart}${levelPart}EXPLANATION: ${explanation}
${selectionNote}

Respond in ${getLangLabel(explainsLanguage)}. Be encouraging, clear, and pedagogical.
- Focus on ONE concept at a time - don't overwhelm
${grammarTopic ? `- Explain the grammar rule (${grammarTopic}) that applies` : ""}
${difficulty ? `- Use vocabulary appropriate for ${difficulty} level` : ""}
- Help them understand why ${isSelectionQuestion ? "the selected option was wrong" : "their answer was wrong"} and how to avoid the mistake.`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...chatHistory.slice(-6).map((msg) => ({ role: msg.role, content: msg.content })),
    { role: "user" as const, content: userMessage },
  ];

  return { system: systemPrompt, messages };
};
