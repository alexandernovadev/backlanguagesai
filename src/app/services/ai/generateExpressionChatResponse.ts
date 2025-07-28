import OpenAI from "openai";

export const generateExpressionChatResponse = async (
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

        Expression: ${expressionText}
        Definition: ${expressionDefinition}

        Your role:
        - Provide clear, practical examples of how to use this expression in English
        - Give real conversation examples in English with context
        - Explain when and how to use the expression appropriately
        - Keep responses concise but informative (2-3 sentences max)
        - Be encouraging and supportive
        - If asked for examples, provide realistic English conversations
        - If asked about formality, explain the appropriate contexts in English
        - If asked for synonyms, provide English alternatives and explain differences

        Focus on teaching English usage through practical examples and clear explanations.
        Provide examples that show real English conversations where this expression would be used naturally.
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

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages,
    temperature: 0.7,
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error("No response generated");
  }

  return content;
}; 