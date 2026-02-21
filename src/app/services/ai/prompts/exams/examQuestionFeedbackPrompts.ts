export interface ExamQuestionFeedbackParams {
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
  isCorrect: boolean;
  language: string;
}

export const createExamQuestionFeedbackPrompt = (params: ExamQuestionFeedbackParams) => {
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
    isCorrect,
    language,
  } = params;

  const hasOptions = options && options.length > 0;
  const isMultipleSelect = params.questionType === "multiple" && hasOptions;
  const correctIndicesArr = correctIndices ?? (correctIndex != null ? [correctIndex] : []);
  const correctDisplay = hasOptions
    ? isMultipleSelect
      ? correctIndicesArr.map((i) => options[i]).filter(Boolean).join(", ") || "N/A"
      : options[correctIndex] || "N/A"
    : correctAnswer || "N/A";
  const userIndices = Array.isArray(userAnswer) ? userAnswer : typeof userAnswer === "number" ? [userAnswer] : [];
  const userDisplay = hasOptions
    ? isMultipleSelect
      ? userIndices.map((i) => options[i]).filter(Boolean).join(", ") || String(userAnswer || "")
      : (typeof userAnswer === "number" && options[userAnswer] ? options[userAnswer] : String(userAnswer || ""))
    : String(userAnswer || "");

  const optionsPart = hasOptions
    ? `OPTIONS: ${options.map((o, i) => `${i}: ${o}`).join(" | ")}\n`
    : "";

  const langLabel = language === "es" ? "Spanish" : language === "pt" ? "Portuguese" : "English";
  const isSelectionQuestion = hasOptions && (questionType === "multiple" || questionType === "unique" || questionType === "fillInBlank");
  const selectionNote = isSelectionQuestion
    ? `\n**IMPORTANT:** The student SELECTED an option from the list - they did NOT write the answer. Do NOT correct grammar as if they wrote it. Focus on why the selected option was wrong (or incomplete) vs the correct one. Avoid phrasing like "you used", "you wrote", "you missed" - they only chose from given options.\n`
    : "";

  const systemPrompt = `You are a helpful language teacher. A student just completed a grammar exam question. Generate VISUAL, STRUCTURED feedback using Markdown.

QUESTION: ${questionText}
${optionsPart}CORRECT ANSWER: ${correctDisplay}
STUDENT ${isSelectionQuestion ? "SELECTED" : "ANSWERED"}: ${userDisplay}
RESULT: ${isCorrect ? "CORRECT" : "INCORRECT"}
${grammarTopic ? `GRAMMAR TOPIC: ${grammarTopic}\n` : ""}${difficulty ? `LEVEL: ${difficulty}\n` : ""}EXPLANATION: ${explanation}
${selectionNote}

Respond in ${langLabel}. Use Markdown for a very visual, structured response:

**Format rules (MANDATORY):**
- Use **bold** for key grammar terms, rules, and important words
- Use \`backticks\` for specific words or phrases (correct/incorrect answers, examples)
- Use bullet lists (- ) for tips, rules, or steps
- Use > blockquote for the main takeaway or rule
- Add structure: short paragraphs, clear sections
- Be concise but rich in formatting (3-6 lines of markdown)

**If CORRECT:** Brief positive feedback, reinforce the grammar point with **bold** and \`code\`
**If INCORRECT:** 
${isSelectionQuestion ? `- Explain why the selected option was wrong or incomplete (use **bold** for the rule)
- Compare: \`correct option\` vs \`selected option\` - what makes the correct one right?
- Add a > blockquote with the key rule
- End with a - bullet tip for next time` : `- Explain why wrong (use **bold** for the rule)
- Show correct: \`correct answer\` vs your \`wrong answer\`
- Add a > blockquote with the key rule
- End with a - bullet tip to avoid the mistake`}`;

  return {
    system: systemPrompt,
    messages: [{ role: "user" as const, content: "Generate feedback for this question." }],
  };
};
