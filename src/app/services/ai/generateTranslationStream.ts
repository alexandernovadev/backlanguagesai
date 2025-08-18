import OpenAI from "openai";

export interface TranslationOptions {
  text: string;
  sourceLang: string; // 'auto' or allowed code
  targetLang: string; // allowed code
}

export const generateTranslationStreamService = async ({
  text,
  sourceLang,
  targetLang,
}: TranslationOptions) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

  const targetLabelMap: Record<string, string> = {
    es: "Spanish",
    en: "English",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
  };

  const srcInstruction =
    sourceLang === "auto"
      ? "Detect the input language first"
      : `The input text is in ${targetLabelMap[sourceLang] || sourceLang}`;

  const targetLabel = targetLabelMap[targetLang] || targetLang;

  const systemPrompt = `You are a professional translator. ${srcInstruction} and translate it into ${targetLabel}.\n\nRules:\n- Output ONLY the translated text, no quotes, no labels, no language codes.\n- Preserve meaning, tone, and style.\n- Keep formatting and punctuation where appropriate.\n- If input is a single word or short phrase, translate it naturally.\n- Do not add explanations or notes.`;

  return await openai.chat.completions.create({
    stream: true,
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ],
  });
};


