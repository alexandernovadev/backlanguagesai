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
You are an AI specialized in generating educational topics for language learning content.

🎯 TASK: Generate a compelling educational topic for ${type} content.

${hasExistingText 
  ? `📝 CONTEXT: Based on this reference: ${existingText.trim()}
     - Generate a related but different educational topic
     - Make it more specific, advanced, or explore a different angle
     - Maintain educational value and relevance`
  : `🎲 RANDOM TOPIC: Generate a completely random educational topic
     - Choose from various categories: grammar, vocabulary, culture, daily life, etc.
     - Make it engaging and educational`
}

📋 REQUIREMENTS:
- Topic must be educational and suitable for language learning
- CRITICAL: Generate between 140-220 characters - no less than 140, no more than 220 use this range
- Be specific and descriptive with detailed explanations
- Use clear, engaging language
- Focus on language learning aspects
- Include subtopics, examples, or context to reach the minimum length

🚫 CONSTRAINTS:
- NO general knowledge, history, science, geography (unless language-related)
- NO inappropriate content
- NO overly complex or technical topics
- Keep it accessible for language learners
- NO quotes, no special characters, no punctuation marks at the beginning or end

🎨 OUTPUT FORMAT:
- Generate ONLY the topic text
- No explanations, no additional text
- Just the topic itself
- Stream character by character for real-time display
- NO quotes around the topic

💡 EXAMPLES OF GOOD TOPICS (140-220 characters):
- Advanced verb tenses: Present Perfect vs Past Simple in everyday conversations and their usage patterns in modern communication contexts
- Cultural expressions and idioms in modern Spanish speaking countries: Understanding regional variations and contemporary usage in different social settings
- Business vocabulary: Essential terms for professional communication in international settings and corporate environments with practical applications
- Travel vocabulary: Planning a trip and navigating new cities with essential phrases for transportation, accommodation, and cultural experiences
- Food and dining: Ordering at restaurants and describing flavors with vocabulary for different cuisines and dining experiences
- Technology and social media: Digital communication in the modern world with vocabulary for social platforms, online interactions, and digital etiquette

🔢 CRITICAL: Your response MUST be between 140-220 characters. Count carefully and ensure you meet this requirement.
🔢 CRITICAL: STOP generating at exactly 220 characters. Do not exceed this limit under any circumstances.
`.trim();

  return await openai.chat.completions.create({
    stream: true,
    model: "gpt-4o-mini",
    temperature: 0.7, // Slightly more creative for topic generation
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `Generate a ${hasExistingText ? "related but different" : "random"} educational topic for ${type} content. ${hasExistingText ? `Based on: ${existingText.trim()}` : ""} Make it engaging and educational. MANDATORY: Generate between 140-220 characters. CRITICAL: Count your characters and STOP at exactly 220. Include detailed explanations, subtopics, or context to reach the minimum length. Do not use quotes or special characters.`,
      },
    ],
  });
}; 