export const imageWordPrompt = (word: string) => {
  return `
Create a clean educational illustration that conveys the meaning of "${word}" for a language‑learning dictionary.

Requirements:
- Make the meaning obvious at a glance; focus on one clear subject. Avoid complex scenes.
- Clean, modern style; simple, non‑distracting background; high contrast; professional look.
- Adapt to part of speech:
  • Noun → show the object/person/concept clearly.
  • Verb → show the action.
  • Adjective → show the quality/characteristic.
  • Adverb → show the manner/degree of an action.
- If people are shown: modern, casual appearance; avoid cultural or religious head coverings; keep neutral and inclusive.
 - If people are shown: modern, casual appearance; avoid cultural or religious head coverings; keep neutral and inclusive.
 - Do not depict traditional Arab clothing or turbans.
- Cultural neutrality; suitable for all ages; no abstract or ambiguous visuals.
 - If a literal depiction is restricted or sensitive, choose a safe, didactic alternative that still teaches the concept (e.g., first‑aid kit, bandages, crutches, safety helmet, caution signs). Keep it realistic but strictly non‑graphic and child‑safe.

Hard constraints (must follow):
- Absolutely no text of any kind (no words, letters, numbers, labels, watermarks, or logos).
- Single, clear composition optimized for educational use.
 - No gore, no graphic injuries, no violence, no shocking or adult content.
  `.trim();
};

export const imageLecturePrompt = (lectureContent: string) => {
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
