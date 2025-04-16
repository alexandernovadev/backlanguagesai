import OpenAI from "openai";

export const generateWordSynomymsJson = async (
  word: string,
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
        You are a highly knowledgeable expert in English language teaching and lexicography. 
        Your task is to analyze the given word and generate a list of accurate and contextually appropriate synonyms. 
        Use your expertise to consider the nuances of meaning and usage.

        Please generate a JSON object with the following property:
        {
          "sinonyms": [ <array of synonym examples> ]
        }

        For example, for the word "happy", a possible output might be:
        {
          "sinonyms": ["joyful", "cheerful", "content"]
        }

        Note:
        - The user has provided an array of synonyms that they already have.
         Include these if they are applicable, but also consider adding any additional relevant synonyms based on your analysis.
        - Do not simply duplicate the user's examples; ensure your analysis is thorough.
        - Ensure that the list of synonyms includes at least 5 items.
        `.trim(),
      },
      {
        role: "user",
        content: `Generate synonyms for the word: ${word}
          User provided synonyms: ${oldExamples}`,
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
