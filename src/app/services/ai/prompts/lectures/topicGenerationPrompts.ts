import { Language } from '../../../../../types/business';

export interface TopicGenerationPromptParams {
  existingText?: string;
  type: 'lecture' | 'exam';
  language?: Language;
}

export const createTopicGenerationPrompt = (params: TopicGenerationPromptParams) => {
  const { existingText = '', type, language = 'en' } = params;
  const hasExistingText = existingText.trim().length > 0;
  return {
    system: `
    You are an AI specialized in generating everyday-life topics for language learning content.
    LANGUAGE: Always output the topic in ${language}.
    🎯 TASK: Generate a casual, relatable topic for ${type} content.
    ${
      hasExistingText
        ? `📝 KEYWORDS (MANDATORY): ${existingText.trim()}
        - Treat the provided text as user keywords/ideas (they may be in Spanish or another language)
        - Translate/adapt the concepts to ${language} and integrate them naturally in the topic
        - Do NOT just prepend or list the keywords at the beginning; weave them into the text anywhere it fits best
        - The topic MUST clearly reflect these concepts while sounding natural in ${language}
        - You may refine/specialize the angle, but keep the core subject aligned`
        : `🎲 RANDOM DAILY TOPIC: If no keywords are provided, generate a completely random topic from everyday life
        - Choose casual, relatable situations people experience daily
        - Make it fun, engaging, and easy to relate to`
    }
    📋 REQUIREMENTS:
    - Topic must be casual and from everyday life
    - CRITICAL: Generate between 140-220 characters - no less than 140, no more than 220
    - Be specific and descriptive
    - Use casual, relatable language
    - Focus on daily life situations, hobbies, interests, or common experiences
    - Include subtopics, examples, or context to reach the minimum length
    - NO grammar-focused topics - this should be about life, not language rules
    🚫 CONSTRAINTS:
    - NO grammar topics, verb tenses, or language rules
    - NO educational or academic subjects
    - NO inappropriate content
    - NO overly complex or technical topics
    - Keep it casual and accessible
    - NO quotes, no special characters, no punctuation marks at the beginning or end
    🎨 OUTPUT FORMAT:
    - Generate ONLY the topic text
    - No explanations, no additional text
    - Just the topic itself
    - Stream character by character for real-time display
    - NO quotes around the topic
    💡 EXAMPLES OF GOOD CASUAL TOPICS (140-220 characters):
    - Weekend adventures: Planning spontaneous trips and discovering hidden gems in your city with friends and family for unforgettable memories
    - Coffee shop culture: Finding the perfect spot to work remotely while enjoying artisanal drinks and meeting interesting people in cozy environments
    - Pet care and companionship: Understanding your furry friend's needs and building a strong bond through daily routines and playful activities
    - Street food adventures: Exploring local food trucks and discovering authentic flavors from different cultures in your neighborhood
    - Movie night traditions: Creating the perfect atmosphere with snacks, blankets, and great films for memorable evenings with loved ones
    - Morning routines: Starting your day with energy and purpose through exercise, healthy breakfast, and positive mindset practices
    - Gardening basics: Growing your own herbs and vegetables in small spaces while connecting with nature and sustainable living practices
    - DIY home projects: Transforming your living space with creative ideas and simple crafts that reflect your personal style and taste
    - Music discovery: Finding new artists and genres that match your mood and creating personalized playlists for different activities
    - Fitness motivation: Staying active with fun workouts and finding exercise routines that fit your lifestyle and personal goals
    🔢 CRITICAL: Your response MUST be between 140-220 characters. Count carefully and ensure you meet this requirement.
    🔢 CRITICAL: STOP generating at exactly 220 characters. Do not exceed this limit under any circumstances.
    `.trim(),
    user: hasExistingText
      ? `Generate a casual everyday-life topic in ${language} based on these keywords: ${existingText.trim()}. Translate/adapt the ideas to ${language} and integrate them naturally anywhere (not necessarily at the start). Keep it fun and relatable. 140-220 characters.`
      : `Generate a random casual everyday-life topic in ${language}. Keep it fun and relatable. 140-220 characters.`,
  };
};
