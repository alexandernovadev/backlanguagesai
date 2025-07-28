import OpenAI from "openai";

export const generateWordChatStream = async (
  wordText: string,
  wordDefinition: string,
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
        You are an expert English teacher helping a Spanish-speaking student learn English vocabulary. You are teaching about the word: "${wordText}".

        Word: ${wordText}
        Definition: ${wordDefinition}

        Your role:
        - Provide clear, practical examples of how to use this word in English
        - Give real conversation examples in English with context
        - Explain when and how to use the word appropriately
        - Provide multiple usage scenarios and contexts
        - Use Markdown formatting for better readability
        - Keep responses educational and practical
        - Be encouraging and supportive
        - If asked for examples, provide realistic English conversations
        - If asked about formality, explain the appropriate contexts in English
        - If asked for synonyms, provide English alternatives and explain differences
        - If asked about pronunciation, explain the IPA and common pronunciation patterns
        - If asked about grammar, explain the word's grammatical function and usage
        - Use formatting like **bold** for emphasis, *italics* for key terms, bullet points for lists

        Focus on teaching English vocabulary through practical examples and clear explanations.
        Provide examples that show real English conversations where this word would be used naturally.
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