import OpenAI from "openai";

export const generateImage = async (prompt: string) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  });

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      // style:'',
      n: 1,
      size: "1024x1024",
      quality: "hd",
      response_format: "b64_json", // Formart ('url' o 'b64_json')
    });

    return response.data[0].b64_json || null;
  } catch (error) {
    console.error("Error generando la imagen:", error);
    throw new Error("Error generando la imagen" + error);
  }
};
