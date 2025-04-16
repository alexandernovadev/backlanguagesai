import OpenAI from "openai";

export const generateWordExamplesJson = async (
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
        You are an expert in the English language with a focus on teaching and lexicography. 
        Please generate a JSON object with the following properties, ensuring each is accurate, 
        error-free, and appropriate for English learners:

        EXAMPLES with word "challenges"
        {
          "examples": [
            "Starting a new job comes with its own set of challenges.",
            "The team faced several challenges in completing the project on time.",
            "One of the main challenges in learning a language is mastering pronunciation.",
            "They overcame many challenges to reach their goal.",
            "Climate change presents serious challenges for all nations."
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
