import OpenAI from "openai";

export const generateWordTypesJson = async (
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
            Your task is to analyze the given word and determine all appropriate parts of speech from the allowed list below. 
            Use your expertise to decide which types best describe the word based on its meanings and usage.

            Please generate a JSON object with the following property:
            {
              "type": [ <array of applicable types> ]
            }

            For example, for the word "challenges", a possible output might be:
            {
              "type": ["noun", "verb"]
            }

            Note:
            - The user has provided an array of example types that they already have. Include these if they are applicable, 
            but also consider adding any additional relevant types based on your analysis.
            - Do not simply duplicate the user's examples; ensure your analysis is thorough.

            Allowed types:
            ["noun", "verb","phrasal verb", "adjective", "adverb", "personal pronoun", "possessive pronoun", "preposition", "conjunction",
            "determiner", "article", "quantifier", "interjection", "auxiliary verb", "modal verb", "infinitive", "participle", "gerund", "other"].
        `.trim(),
      },
      {
        role: "user",
        content: `Generate examples for the word: ${word}
                  User provided examples: ${oldExamples}`,
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
