import OpenAI from "openai";

interface TopicOptions {
  existingText?: string;
  type: "lecture" | "exam";
}

export const generateTopicStreamService = async ({
  existingText = "",
  type,
}: TopicOptions) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  });

  const hasExistingText = existingText.trim().length > 0;

  const systemPrompt = `
You are an AI specialized in generating random daily life topics for language learning content.

🎯 TASK: Generate a random, casual topic from everyday life for ${type} content.

${
  hasExistingText
    ? `📝 CONTEXT: Based on this reference: ${existingText.trim()}
     - Generate a related but different casual topic
     - Make it more specific or explore a different angle
     - Keep it casual and relatable`
    : `🎲 RANDOM DAILY TOPIC: Generate a completely random topic from everyday life
     - Choose from casual, relatable situations people experience daily
     - Make it fun, engaging, and something people can easily relate to`
}

📋 REQUIREMENTS:
- Topic must be casual and from everyday life
- CRITICAL: Generate between 140-220 characters - no less than 140, no more than 220
- Be specific and descriptive with detailed explanations
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
`.trim();

  return await openai.chat.completions.create({
    stream: true,
    model: "gpt-4o-mini",
    temperature: 0.8, // More creative for casual topic generation
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `Generate a ${
          hasExistingText ? "related but different" : "random"
        } casual topic from everyday life for ${type} content. ${
          hasExistingText ? `Based on: ${existingText.trim()}` : ""
        } Make it fun and relatable. MANDATORY: Generate between 140-220 characters. CRITICAL: Count your characters and STOP at exactly 220. Include detailed explanations, subtopics, or context to reach the minimum length. Do not use quotes or special characters. NO grammar topics - focus on daily life situations.`,
      },
    ],
  });
};
