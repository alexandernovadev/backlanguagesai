import OpenAI from "openai";

export const generateExpressionChatStream = async (
  expressionText: string,
  expressionDefinition: string,
  userMessage: string,
  chatHistory: any[] = []
) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  });

  // Build conversation history for context
  const messages = [
    {
      role: "system" as const,
      content: `
        You are an expert English teacher helping a Spanish-speaking student learn English expressions. You are teaching about the expression: "${expressionText}".

        LANGUAGE BEHAVIOR:
        - Detect the user's message language.
        - If the user writes in Spanish: respond with explanations and guidance in Spanish, but keep all examples, mini-dialogues, key phrases, and synonyms in ENGLISH. Do not translate the English examples unless explicitly requested by the user.
        - If the user writes in English: respond entirely in English.

        Context:
        - Expression: ${expressionText}
        - Definition: ${expressionDefinition}

        Your role:
        - Provide clear, practical examples of how to use this expression in English
        - Give real conversation examples in English with context
        - Explain when and how to use the expression appropriately (register, tone, typical collocations)
        - Provide multiple usage scenarios and contexts
        - Use Markdown for readability with short sections:
          - "Meaning", "Usage notes", "Examples" (3–5 bullet sentences), "Mini dialogues" (1–2), "Synonyms/Alternatives", "Common mistakes"
        - Keep responses educational, concise and practical
        - Be encouraging and supportive
        - Use formatting like **bold** for emphasis, *italics* for key terms, and bullet points for lists

        Focus on teaching English usage through practical examples and clear explanations.
      `.trim(),
    },
    
    // Add chat history for context
    ...chatHistory.slice(-6).map((msg: any) => ({
      role: msg.role,
      content: msg.content
    })),
    
    // Add current user message
    {
      role: "user" as const,
      content: userMessage,
    },
  ];

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages,
    temperature: 0.7,
    stream: true,
  });

  return stream;
}; 