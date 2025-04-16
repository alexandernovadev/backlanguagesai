import OpenAI from "openai";

export const generateWordExamplesCodeSwithcingJson = async (
  prompt: string,
  language = "en",
  oldExamples: string
) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  });

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `
        You are an expert in the English Spaninsh language with a focus on teaching and lexicography. 
        Please generate a JSON object with the following properties, ensuring each is accurate, 
        error-free, and appropriate for English learners:

        EXAMPLES with word "burst"
        {
        "codeSwitching": [
            "El globo bursts y todos se asustan.",
            "Ella bursts en lágrimas al escuchar la noticia.",
            "El río bursts sus orillas después de la tormenta.",
            "Él bursts en la habitación con una sonrisa enorme.",
            "El cohete bursts en el aire con colores brillantes."
          ]
        }

        The user has this examples and he wish to changue those, so be aware in no generate the sames
        ${oldExamples}

        - Be creative with examples, ensuring they do not seem repetitive or too similar to the provided ones.
        - Ensure the examples are diverse and cover different contexts where the word might be used.
        - Avoid using the same sentence structure repeatedly.
        - Make sure the examples are suitable for learners at the B2 level.

        `,
      },
      {
        role: "user",
        content: "The word to generate examples is " + prompt,
      },
    ],
    model: "gpt-4o-2024-08-06",
    temperature: 0.5,
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
