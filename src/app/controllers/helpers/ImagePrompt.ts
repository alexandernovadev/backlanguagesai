export const imageWordPrompt = (word: string) => {
  return `
  Create a clear, educational illustration for a language learning dictionary that represents the meaning of "${word}".

  GUIDELINES:
  • Create a simple, clear visual that immediately communicates the word's meaning
  • Use clean, uncluttered compositions suitable for educational materials
  • Focus on the main concept - avoid complex scenes or multiple elements
  • Use bright, clear colors and good contrast for visibility
  • Make the illustration instantly understandable to language learners

  STYLE REQUIREMENTS:
  • Clean, modern illustration style
  • Simple backgrounds that don't distract from the main subject
  • Clear, readable visual elements
  • Professional appearance suitable for educational content
  • ABSOLUTELY NO TEXT, WORDS, LETTERS, NUMBERS, OR SYMBOLS IN THE IMAGE
  • NO labels, captions, or any written content whatsoever
  • Pure visual representation only - no text elements of any kind

  CONTENT FOCUS:
  • Nouns: Show the object, person, or concept clearly
  • Verbs: Show the action being performed
  • Adjectives: Show the quality or characteristic
  • Adverbs: Show the manner or degree of an action
  • Other parts of speech: Create appropriate visual representations

  PEOPLE REPRESENTATION:
  • If showing people, use modern, casual clothing and appearances
  • Do NOT show people wearing headscarves, turbans, or traditional head coverings
  • Avoid any cultural or religious head coverings
  • Use diverse but neutral, modern appearances

  EDUCATIONAL PURPOSE:
  • The image should help language learners understand the word's meaning
  • Keep it simple and direct - no abstract interpretations
  • Ensure cultural neutrality and universal understanding
  • Make it suitable for all ages and backgrounds

  Create a dictionary-style illustration that clearly represents "${word}".

  CRITICAL: The image must contain NO text, words, letters, numbers, or any written content whatsoever. Only visual elements are allowed.
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
