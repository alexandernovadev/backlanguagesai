export interface ImagePromptParams {
  word?: string;
  expression?: string;
  lectureContent?: string;
}

export const createImagePrompt = (params: ImagePromptParams) => {
  const { word, expression, lectureContent } = params;

  if (word) {
    return imageWordPrompt(word);
  }
  
  if (expression) {
    return createExpressionImagePrompt(expression);
  }
  
  if (lectureContent) {
    return createLectureImagePrompt(lectureContent);
  }
  
  throw new Error("At least one parameter (word, expression, or lectureContent) must be provided");
};

const imageWordPrompt = (word: string) => {
  return `
•(PLEASE DO NOT ADD TEXT, LETTERS, NUMBERS, LABELS, WATERMARKS, OR LOGOS)
Create a clean educational illustration that conveys the meaning of "${word}" for a language‑learning dictionary
(PLEASE DO NOT ADD TEXT, LETTERS, NUMBERS, LABELS, WATERMARKS, OR LOGOS)

Requirements:
- (NO ADD TEXT OR Letters on IMAGE,)
- Make the meaning obvious at a glance; focus on one clear subject. Avoid complex scenes.
- Clean, modern style; simple, non‑distracting background; high contrast; professional look.
- Adapt to part of speech:
  • Noun → show the object/person/concept clearly.
  • Verb → show the action.
  • Adjective → show the quality/characteristic.
  • Adverb → show the manner/degree of an action.
   •(PLEASE DO NOT ADD TEXT, LETTERS, NUMBERS, LABELS, WATERMARKS, OR LOGOS)
- If people are shown: modern, casual appearance; avoid cultural or religious head coverings; keep neutral and inclusive.
 - If people are shown: modern, casual appearance; avoid cultural or religious head coverings; keep neutral and inclusive.
 - Do not depict traditional Arab clothing or turbans.
- Cultural neutrality; suitable for all ages; no abstract or ambiguous visuals.
 - If a literal depiction is restricted or sensitive, choose a safe, didactic alternative that still teaches the concept 
 (e.g., first‑aid kit, bandages, crutches, safety helmet, caution signs). 
 Keep it realistic but strictly non‑graphic and child‑safe.
  •(PLEASE DO NOT ADD TEXT, LETTERS, NUMBERS, LABELS, WATERMARKS, OR LOGOS)

Hard constraints (must follow):
- Absolutely no text of any kind (no words, letters, numbers, labels, watermarks, or logos)(NO ADD TEXT OR Letters on IMAGE,).
- Single, clear composition optimized for educational use.
 - No gore, no graphic injuries, no violence, no shocking or adult content.
  •(PLEASE DO NOT ADD TEXT, LETTERS, NUMBERS, LABELS, WATERMARKS, OR LOGOS)
  •(PLEASE DO NOT ADD TEXT, LETTERS, NUMBERS, LABELS, WATERMARKS, OR LOGOS)
  •(PLEASE DO NOT ADD TEXT, LETTERS, NUMBERS, LABELS, WATERMARKS, OR LOGOS)
  •(PLEASE DO NOT ADD TEXT, LETTERS, NUMBERS, LABELS, WATERMARKS, OR LOGOS)
   •(PLEASE DO NOT ADD TEXT, LETTERS, NUMBERS, LABELS, WATERMARKS, OR LOGOS)
`.trim();
};

const createExpressionImagePrompt = (expression: string) => {
  return `
Create a clean educational illustration that conveys the meaning and typical context of the expression: "${expression}"

CRITICAL REQUIREMENTS - ZERO TEXT POLICY:
• ABSOLUTELY NO TEXT, NO WORDS, NO LETTERS, NO NUMBERS, NO LABELS, NO WATERMARKS, NO LOGOS
• NO ARROWS WITH TEXT, NO SPEECH BUBBLES, NO CAPTIONS, NO SUBTITLES
• NO WRITING ON OBJECTS, NO SIGNS, NO BOOKS WITH VISIBLE TEXT
• THE IMAGE MUST BE COMPLETELY TEXT-FREE - ONLY VISUAL ELEMENTS

EXPRESSION ANALYSIS:
• First, analyze if this is an idiom, phrase, or literal expression
• For idioms: show the figurative meaning, NOT the literal words
• For example: "fly on the wall" = show someone secretly observing/listening to a conversation, NOT a literal fly on a wall
• For phrases: show the actual meaning in context, NOT word-by-word translation
• NEVER show literal objects mentioned in the expression - show what the expression actually means
• Make the concept instantly understandable through visual storytelling
• If the expression mentions animals/objects, show the human situation they represent instead

GUIDELINES:
• Make the concept obvious and suitable for a language-learning expressions dictionary
• Use a clean, modern illustration style with a simple, non-distracting background
• Focus on one clear scenario that visually communicates the expression's idea
• Keep it culturally neutral and appropriate for all ages

CONTENT APPROACH:
• Portray a short, universal scenario that represents how the expression is used
• Avoid abstract or ambiguous visuals
• If the literal depiction is confusing, choose a safe didactic alternative that conveys the intended meaning

PEOPLE REPRESENTATION:
• If showing people: modern, casual appearance; culturally neutral
• ABSOLUTELY NO traditional head coverings: NO headscarves, NO turbans, NO hijabs, NO keffiyehs
• NO traditional Arab clothing, NO robes, NO Middle Eastern traditional attire
• NO traditional Indian clothing, NO saris, NO traditional Asian head coverings
• Use ONLY modern, casual clothing that is universally recognizable
• People should look like they're from a modern, international city (jeans, t-shirts, casual wear)
• NO cultural or religious clothing of any kind - keep it completely neutral and modern

STYLE REQUIREMENTS:
• High contrast, professional look, simple composition
• NO TEXT OR SYMBOLS IN THE IMAGE - ONLY PURE VISUAL ILLUSTRATION
• Clean, uncluttered design that teaches the expression concept without any written language
`.trim();
};

const createLectureImagePrompt = (lectureContent: string) => {
  return `
Create an educational illustration for a language learning reading that represents the main theme or topic of this content:

"${lectureContent}"

GUIDELINES:
• Create a clear, engaging visual that represents the main theme of the reading
• Use clean, modern illustration style suitable for educational materials
• Focus on the primary concept or topic - avoid cluttered scenes
• Use bright, clear colors with good contrast for visibility
• Make the illustration instantly understandable to language learners

STYLE REQUIREMENTS:
• Clean, professional illustration style
• Simple, uncluttered backgrounds
• Clear visual elements that relate to the reading content
• Educational appearance suitable for language learning materials
• Avoid text, symbols, or labels in the image

CONTENT APPROACH:
• Identify the main theme or topic from the reading
• Create a visual that captures the essence of that theme
• Use universal symbols and concepts that are easily understood
• Keep it culturally neutral and appropriate for all audiences

PEOPLE REPRESENTATION:
• If showing people, use modern, casual clothing and appearances
• Do NOT show people wearing headscarves, turbans, or traditional head coverings
• Do not depict traditional Arab clothing or turbans
• Avoid any cultural or religious head coverings
• Use diverse but neutral, modern appearances

EDUCATIONAL PURPOSE:
• The image should help learners understand the reading's main topic
• Keep it simple and direct - no abstract interpretations
• Ensure cultural neutrality and universal understanding
• Make it suitable for all ages and backgrounds

Create an educational illustration that represents the main theme of this reading content.
`.trim();
};

export { imageWordPrompt };
