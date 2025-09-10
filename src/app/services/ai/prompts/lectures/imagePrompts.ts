export const createLectureImagePrompt = (lectureContent: string) => {
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
