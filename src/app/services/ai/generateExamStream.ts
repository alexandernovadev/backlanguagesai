import OpenAI from "openai";
import { IQuestion } from "../../db/models/Question";
import { IExam } from "../../db/models/Exam";

interface ExamOptions {
  level?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  topic?: string;
  grammarTopics?: string[];
  numberOfQuestions?: number;
  types?: string[];
  difficulty?: number;
  userLang?: string;
}

interface GeneratedQuestion {
  text: string;
  type:
    | "single_choice"
    | "multiple_choice"
    | "fill_blank"
    | "translate"
    | "true_false"
    | "writing";
  options?: Array<{
    value: string;
    label: string;
    isCorrect: boolean;
  }>;
  correctAnswers?: string[];
  explanation?: string;
  tags?: string[];
}

interface ExamGenerationResult {
  exam: Partial<IExam>;
  questions: Partial<IQuestion>[];
}

export const generateExamStreamService = async ({
  level = "B1",
  topic = "daily life",
  grammarTopics = [],
  numberOfQuestions = 10,
  types = ["multiple_choice", "fill_blank", "true_false"],
  difficulty = 3,
  userLang = "es",
}: ExamOptions) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  });

  const levelToneMap = {
    A1: `
🔹 Use very basic vocabulary (house, school, food).
🔹 Grammar: present simple, basic prepositions.
🔹 Question length: max 8–10 words.
🔹 One clear meaning. Avoid figurative language.
🔹 Options must be literal and easy to distinguish.
    `,
    A2: `
🔸 Slightly richer vocabulary (travel, jobs, places).
🔸 Grammar: past simple, comparatives, frequency adverbs.
🔸 Question length: 10–15 words.
🔸 Use simple connectors: because, but, so.
🔸 Begin to introduce context-based options.
    `,
    B1: `
🟡 Vocabulary includes opinions, preferences, routines.
🟡 Grammar: present perfect, modals, first conditional.
🟡 Question length: 15–25 words.
🟡 Include short realistic situations.
🟡 Introduce distractors among options.
    `,
    B2: `
🟠 Topics: abstract ideas (environment, media, ethics).
🟠 Grammar: passive voice, relative clauses, second conditional.
🟠 Question length: 25–40 words.
🟠 Include context: dialogue, email, mini-story.
🟠 Options can require inference.
    `,
    C1: `
🔴 Topics: academic, professional, sociocultural.
🔴 Grammar: inversion, mixed conditionals, indirect speech.
🔴 Question length: 35–60 words.
🔴 Include scenarios, quotes or layered meaning.
🔴 Test critical reading and logic.
    `,
    C2: `
🟣 Advanced formal vocabulary and idioms.
🟣 Question length: up to 80 words.
🟣 Include subtle irony, tone or bias detection.
🟣 Grammar: full range, including ellipsis and unusual structures.
🟣 Test nuanced interpretation or comparison.
    `,
  };

  const levelNotes = levelToneMap[level] || "";

  const grammarInstructions = grammarTopics.length > 0 
    ? `
🎯 GRAMMAR TOPICS REQUIREMENT:
You MUST include questions covering these specific grammar topics: ${grammarTopics.join(', ')}
- Each grammar topic must appear in at least one question
- Distribute grammar topics evenly throughout the exam
- Ensure questions test the specific grammar concepts requested
- The topic "${topic}" is the main theme, but grammar topics are MANDATORY
- If you have ${grammarTopics.length} grammar topics and ${numberOfQuestions} questions, try to include each grammar topic in ${Math.ceil(numberOfQuestions / grammarTopics.length)} questions
`
    : "";

  const systemPrompt = `
You are an AI specialized in generating CEFR-aligned English LANGUAGE LEARNING questions.

🧠 Guidelines for ${level} level:
${levelNotes}

🌐 Write explanations in: **${userLang.toUpperCase()}**

🎨 EXPLANATIONS: Create DETAILED, EDUCATIONAL explanations in ENGLISH:
- <span style='color: #ff6b6b; font-weight: bold;'>Keywords</span> in red bold
- <span style='color: #74b9ff; border: 1px solid #74b9ff; padding: 2px 4px; border-radius: 3px;'>Grammar rules</span> in blue with border
- <span style='color: #00b894; text-decoration: underline;'>Important concepts</span> in green underlined
- <span style='color: #fdcb6e; font-style: italic;'>Examples</span> in yellow italic
- Use emojis: 🔴 🟦 🟢 🟡 for visual appeal

📚 EXPLANATION REQUIREMENTS:
- Write explanations in ENGLISH (not ${userLang})
- Explain WHY the answer is correct (specific grammar rules)
- Mention why the other options are wrong
- Give examples of the grammar concept
- Connect to broader grammar topics
- Use clear, educational language that actually teaches
- Focus on English grammar learning

❌ AVOID vague explanations like:
- "This is correct because it uses the grammar properly"
- "The sentence uses the correct form"
- "This option is right because it's grammatically correct"

✅ PROVIDE detailed explanations like:
- "We use 'that' instead of 'which' because this is a restrictive relative clause that identifies specific information"
- "The Present Perfect 'has learned' indicates an action completed in the past with present relevance"
- "In the Second Conditional, the 'if' clause uses the past simple 'had' to express a hypothetical condition"

🎯 CRITICAL: Generate ONLY language learning questions:
- Grammar: verb tenses, articles, prepositions, word order, sentence structure
- Vocabulary: word meanings, synonyms, antonyms, collocations, phrasal verbs
- Reading: comprehension of language patterns and structures
- NO general knowledge, history, science, geography, literature, or culture

${grammarInstructions}

📝 Question Types Focus:
- Single Choice: "Choose the correct verb form/word/grammar structure (one answer)"
- Multiple Choice: "Choose the correct verb forms/words/grammar structures (multiple answers)"
- Fill Blank: "Complete with the appropriate word/verb form"
- True/False: "Is this sentence grammatically correct?"
- Translate: "Translate from ${userLang === 'es' ? 'Spanish' : userLang} to English" (never translate to the same language as userLang)

🏠 ANY topic is valid - adapt the language level to ${level}, not the topic complexity

🚫 Constraints:
- For questions of type "single_choice", "multiple_choice", or "fill_blank": generate between 4 and 6 options per question (no less than 4, no more than 6).
- Only one correct answer for single_choice and fill_blank. Multiple correct answers allowed for multiple_choice.
- Match answer format: if correctAnswer is "B", it must match options
- Use clear, realistic language per level
- Avoid ambiguous answers
- NO trivia or general knowledge questions
- DO NOT judge topic appropriateness - ANY topic is fine

🔢 MANDATORY: Generate EXACTLY ${numberOfQuestions} questions - no more, no less!

🛠️ Output: JSON object with questions array containing EXACTLY ${numberOfQuestions} items
{
  "questions": [
    {
      "text": "Question text (language-focused only)",
      "type": "single_choice" | "multiple_choice" | "fill_blank" | "true_false" | "translate" | "writing",
      "options": [
        { "value": "A", "label": "Option A", "isCorrect": false },
        { "value": "B", "label": "Correct answer", "isCorrect": true }
      ],
      "correctAnswers": ["B"],
      "explanation": "Detailed explanation in ENGLISH with colorful HTML:
       <span style='color: #ff6b6b; font-weight: bold;'>key words</span>, 
       <span style='color: #74b9ff; border: 1px solid #74b9ff; padding: 2px 4px; border-radius: 3px;'>specific grammar rule</span>, 
       <span style='color: #00b894; text-decoration: underline;'>important concept</span>,
       <span style='color: #fdcb6e; font-style: italic;'>additional example</span>.
       
       Explain WHY it's correct, mention the specific grammar rule, and why other options are wrong.",
      "tags": ["grammar", "vocabulary"]
    }
  ]
}

⚠️ Respond ONLY with the raw JSON object containing EXACTLY ${numberOfQuestions} questions in the questions array.
`.trim();

  return await openai.chat.completions.create({
    stream: true,
    model: "gpt-4o-2024-08-06",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `You MUST generate EXACTLY ${numberOfQuestions} questions - no more, no less! 
        Create ${level} level LANGUAGE LEARNING questions about "${topic}". 
        ${grammarTopics.length > 0 ? `MANDATORY: Include questions covering these grammar topics: ${grammarTopics.join(', ')}. ` : ''}
        Focus on grammar, vocabulary, and language patterns regardless of the topic. 
        Use these types: ${types.join(", ")}. Difficulty: ${difficulty}/5. 
        
        🎓 CRITICAL: Provide DETAILED, EDUCATIONAL explanations in ENGLISH that actually teach:
        - Write explanations in ENGLISH (not ${userLang})
        - Explain WHY the answer is correct (specific grammar rules)
        - Mention why other options are wrong
        - Give examples of the grammar concept
        - Connect to broader grammar topics
        - Focus on English grammar learning
        - Avoid vague statements like "this is correct because it's grammatically correct"
        
        The response must contain exactly ${numberOfQuestions} questions in the JSON object. 
        ANY topic is valid - adapt the language complexity to ${level}.`,
      },
    ],
    temperature: 0.7,
    response_format: {
      type: "json_object",
    },
  });
};
