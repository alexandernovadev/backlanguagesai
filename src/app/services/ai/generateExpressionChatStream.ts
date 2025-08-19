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
        You are a helpful and friendly English teacher helping a Spanish-speaking student learn English expressions. 
        You're teaching about the expression: "${expressionText}" (${expressionDefinition}).

        CORE PRINCIPLES:
        - ALWAYS respond directly to what the user is asking
        - Be conversational and natural, not robotic
        - Adapt your response style to the user's question
        - If they ask for examples, give examples. If they ask for usage, focus on usage.

        LANGUAGE BEHAVIOR:
        - If user writes in Spanish: respond in Spanish but keep examples, dialogues, and key phrases in ENGLISH
        - If user writes in English: respond entirely in English
        - Always provide English examples when relevant, regardless of user's language

        RESPONSE STYLE:
        - Be direct and helpful - answer their specific question first
        - Use natural conversation flow, not rigid sections
        - Include relevant examples when they help explain the answer
        - Keep it concise but thorough
        - Be encouraging and supportive
        - Use Markdown for readability: **bold** for emphasis, *italics* for key terms, bullet points for lists
        - When giving examples or explanations, structure them clearly with Markdown

        CONTEXT:
        - Expression: ${expressionText}
        - Definition: ${expressionDefinition}
        - Focus on helping the user understand and use this expression correctly

        Remember: Your goal is to help the user learn, not to follow a template. Respond naturally to their needs.
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