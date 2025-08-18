import OpenAI from "openai";

export interface TranslationOptions {
  text: string;
  sourceLang: string; // 'auto' or allowed code
  targetLang: string; // allowed code
  mode?: "normal" | "sense"; // normal: faithful/concise; sense: idiomatic/meaning-first
}

export const generateTranslationStreamService = async ({
  text,
  sourceLang,
  targetLang,
  mode = "normal",
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

  const systemPromptNormal = `You are a professional translator. ${srcInstruction} and translate it into ${targetLabel}.

Rules:
- Output ONLY the translated text — no quotes, labels, or extra notes.
- Preserve meaning, tone, and style faithfully without embellishment.
- Keep formatting and punctuation where appropriate.
- If input is a single word or short phrase, translate it naturally (no extra words).
- Do not add explanations or meta text.
- The output language MUST be ${targetLabel}. Never reply in any other language.`;

  const systemPromptSense = `You are a professional translator. ${srcInstruction} and translate it into ${targetLabel}.

Rules:
- Output ONLY the translated text — no quotes, labels, or extra notes.
- Translate for intended meaning; prefer idiomatic equivalents over literal word-by-word translations.
- Handle idioms, colloquialisms, phrasal verbs, and set phrases idiomatically. If no natural equivalent exists, paraphrase the intended meaning in natural ${targetLabel}.
- Do NOT translate parts of idioms literally (e.g., do not render "+bug+" from "as snug as a bug").
- If the input seems truncated or fragmentary, still provide the most natural translation of the intended meaning.
- Preserve useful punctuation and basic formatting.
- Do not add explanations or meta text.
- When translating into Spanish, use neutral Latin American usage (Colombia-friendly).
- The output language MUST be ${targetLabel}. Never reply in any other language.`;

  const systemPrompt = mode === "sense" ? systemPromptSense : systemPromptNormal;

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


