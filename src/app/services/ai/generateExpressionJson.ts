import OpenAI from "openai";

export const generateExpressionJson = async (prompt: string, language = "en") => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  });

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `
        You are an expert in English idioms, phrases, and expressions with a focus on teaching and language learning. 
        Please generate a JSON object with the following properties, ensuring each is accurate, 
        error-free, and appropriate for English learners:
        
        {
          "expression": "[expression]",
          "language": "${language}",
          "definition": "[A clear and concise definition appropriate to B2 English level]",
          "examples": [
              "[5 example sentences in English using the expression in realistic contexts that are understandable at B2 level]"
          ],
          "type": [
              "[one or more types, selected ONLY from this exact list: 'idiom', 'phrase', 'collocation', 'slang', 'formal', 'informal']"
          ],
          "context": "[Brief context about when and how to use this expression]",
          "difficulty": "[one of: 'easy', 'medium', 'hard']",
          "spanish": {
              "definition": "[Clear and concise Spanish translation of the definition]",
              "expression": "[Spanish equivalent of the expression]"
          }
        }

        Make sure that Its So IMPORTANT all :
        - "type" can contain one or multiple values, but each must be selected only from the following allowed types:
          ["idiom", "phrase", "collocation", "slang", "formal", "informal"].

        - "difficulty" must be one of: "easy", "medium", "hard"
        - Every field contains accurate, B2-appropriate content with correct grammar and relevant contexts.
        - The examples must be realistic and show different contexts of use.
        - The Spanish translation should be natural and idiomatic.
        `.trim(),
      },
      {
        role: "user",
        content:
          `
        Generate an expression based on this prompt: ` + prompt,
      },
    ],
    model: "gpt-4o-2024-08-06",
    temperature: 0.1,
    response_format: {
      type: "json_object",
    },
  });

  // Process the completion response
  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error("Completion content is null");
  }
  const jsonResp = JSON.parse(content);

  return jsonResp;
}; 