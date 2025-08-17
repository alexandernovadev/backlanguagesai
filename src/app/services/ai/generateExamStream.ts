import OpenAI from "openai";
interface ExamOptions {
  level?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  topic?: string;
  grammarTopics?: string[];
  numberOfQuestions?: number;
  types?: string[];
  difficulty?: number;
  userLang?: string;
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

  // Para usar modo razonador de forma más económica:
  // - Usar gpt-4o-mini con temperature: 0.1
  // - Agregar "Let me think step by step" al prompt

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

  // Map selected user language to a human-readable label for explanations
  const explanationLanguageMap: Record<string, string> = {
    es: "Spanish",
    en: "English",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
  };
  const explanationLanguage = explanationLanguageMap[userLang] || "Spanish";

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

🎯 CRITICAL: Generate ONLY language learning questions:
- Grammar: verb tenses, articles, prepositions, word order, sentence structure
- Vocabulary: word meanings, synonyms, antonyms, collocations, phrasal verbs
- Reading: comprehension of language patterns and structures
- NO general knowledge, history, science, geography, literature, or culture

${grammarInstructions}

📝 MANDATORY QUESTION TYPES (ONLY USE THESE):
You MUST use ONLY these question types: ${types.join(', ')}
- single_choice: "Choose the correct verb form/word/grammar structure (one answer)"
- multiple_choice: "Choose the correct verb forms/words/grammar structures (multiple answers)"
- fill_blank: "Complete with the appropriate word/verb form or choose from given options"
- true_false: "Is this sentence grammatically correct?"
- translate: "Translate from ${userLang === 'es' ? 'Spanish' : userLang} to English"
- writing: "Write a short response following the given instructions"

🚫 FORBIDDEN: Do NOT use any question types other than those specified above.

🏠 ANY topic is valid - adapt the language level to ${level}, not the topic complexity

🚫 Constraints:
- For questions of type "single_choice" and "multiple_choice": generate between 4 and 6 options per question (no less than 4, no more than 6).
- For questions of type "fill_blank": generate between 4 and 6 options per question (no less than 4, no more than 6) with word choices, verb forms, or yes/no options as appropriate for the context.
- Only one correct answer for single_choice and fill_blank. Multiple correct answers allowed for multiple_choice.
- Match answer format: if correctAnswer is "B", it must match options
- Use clear, realistic language per level
- Avoid ambiguous answers
- NO trivia or general knowledge questions
- DO NOT judge topic appropriateness - ANY topic is fine
 
 🛡️ Uniqueness rules (single_choice and fill_blank):
 - There must be EXACTLY ONE grammatically and semantically correct option.
 - All distractors must be incorrect for a CLEAR reason (agreement, tense, collocation, meaning, register, preposition, countability, word order).
 - If the stem risks multiple valid options, add disambiguating cues (time markers, number/gender cues, collocations, determiners, specific context) or use agreement-sensitive forms so that only one option fits (e.g., present simple third-person singular "-s").
 - Self-check each question by temporarily inserting EACH option into the blank. If more than one produces a correct sentence, REWRITE the stem and/or options until uniqueness is guaranteed.
 - Bad example: "___ will eat all the food" with options [I, we, they, she] → multiple valid.
 - Good fix examples:
   - "___ eats all the food at home." Options [I, we, they, she] → only "she" fits due to "eats".
   - Or keep "will" but add a gender cue: "___ will eat all the food because her doctor said so." → only "she" fits.

🔢 MANDATORY: Generate EXACTLY ${numberOfQuestions} questions - no more, no less!
🎯 QUESTION TYPE DISTRIBUTION:
- You MUST use ONLY the specified question types: ${types.join(', ')}
- Distribute types evenly: approximately ${Math.ceil(numberOfQuestions / types.length)} questions per type
- Do NOT use any question types not in the specified list

📚 EXPLANATION FIELD (REQUIRED):
Each question MUST include an "explanation" field with rich HTML grammar explanation:
- Use colors: #3b82f6 (blue), #f59e0b (orange), #22d3ee (cyan), #f43f5e (pink), #fff (white)
- Include: grammar rule name, structure, examples, and key reminders
- Format: compact, visual, easy to scan
- Use: <strong>, <em>, <span style="color:...">, <ul>, <li>, <br>
- Keep it concise but informative
- CRITICAL: Write ALL explanation text in ${explanationLanguage}

📝 EXAM TITLE AND SLUG GENERATION:
Based on the topic "${topic}", generate:
- A short, descriptive title (max 60 characters) - this will be the exam title
- A URL-friendly slug (lowercase, hyphens, no special chars, max 50 characters)

🛠️ Output: JSON object with exam metadata and questions array containing EXACTLY ${numberOfQuestions} items
{
  "title": "Short descriptive title (max 60 chars)",
  "examSlug": "url-friendly-slug-based-on-topic",
  "questions": [
    {
      "text": "Question text (language-focused only)",
      "type": "single_choice" | "multiple_choice" | "fill_blank" | "true_false" | "translate" | "writing",
      "options": [
        { "value": "A", "label": "Option A", "isCorrect": false },
        { "value": "B", "label": "Correct answer", "isCorrect": true }
      ],
      "correctAnswers": ["B"],
      "tags": ["grammar", "vocabulary"],
      "explanation": "<div><strong style='font-size:1.1em; color:#3b82f6;'>Grammar Rule</strong> explanation with <span style='color:#f59e0b; font-weight:bold; text-decoration:underline;'>Structure:</span> <span style='color:#22d3ee; font-weight:bold;'>Subject + Verb</span> (+<span style='color:#f43f5e;'>s/es</span> for he/she/it)<br><ul style='margin:4px 0 0 18px;'><li><em>Example 1</em></li><li><em>Example 2</li></ul><span style='color: #f59e0b;'>Remember:</span> key point</div>"
    }
  ]
}

⚠️ CRITICAL REQUIREMENTS:
- Respond ONLY with the raw JSON object containing EXACTLY ${numberOfQuestions} questions
- Ensure ALL questions follow the exact format specified
- Double-check that all required fields are present
- Verify that explanations contain proper HTML formatting
- Confirm that correctAnswers match the options array
 - For single_choice and fill_blank: ensure EXACTLY one correct option by substitution self-check; if multiple are valid, rewrite the stem/options
- Test that the JSON is valid before responding
- VERIFY that ALL question types are from the allowed list: ${types.join(', ')}
- Ensure question types are distributed evenly throughout the exam
- Generate a professional title and clean slug based on the topic
`.trim();

  return await openai.chat.completions.create({
    stream: true,
    model: "gpt-4o-mini",
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
        
        🎯 CRITICAL: You MUST use ONLY these question types: ${types.join(", ")}
        - Do NOT use any other question types
        - Distribute the question types evenly throughout the exam
        - If you have ${types.length} types and ${numberOfQuestions} questions, try to include each type approximately ${Math.ceil(numberOfQuestions / types.length)} times
        
        Difficulty: ${difficulty}/5. 
        
        IMPORTANT: Each question MUST include a rich HTML "explanation" field that explains the grammar rule being tested. Make it visual with colors, clear structure, and helpful examples. Write ALL explanation text in ${explanationLanguage}.
        UNICIDAD (single_choice y fill_blank): Debe haber EXACTAMENTE una opción correcta. Usa concordancia (e.g., tercera persona con "-s") o añade pistas claras en el enunciado para que solo una opción funcione. Valida sustituyendo cada opción; si más de una es válida, reescribe el enunciado u opciones.
        
        📝 EXAM METADATA:
        - Generate a short, descriptive title based on the topic "${topic}" (max 60 characters)
        - Generate a URL-friendly slug (lowercase, hyphens, no special chars, max 50 characters)
        - The title should be educational and descriptive, not just "Exam: topic"
        
        The response must contain exactly ${numberOfQuestions} questions in the JSON object. 
        ANY topic is valid - adapt the language complexity to ${level}.`,
      },
    ],
    temperature: 0.3,
    response_format: {
      type: "json_object",
    },
  });
};
