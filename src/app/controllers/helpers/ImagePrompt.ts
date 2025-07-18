export const imageWordPrompt = (word: string) => {
  return `
  Create a vivid, contextually accurate, and visually compelling illustration that clearly represents 
  the meaning of the word "${word}" in a highly intuitive and unmistakable way. 
  Avoid abstract or ambiguous interpretations, and ensure the scene aligns perfectly with 
  the grammatical category of the word:

  • Nouns: Depict objects, people, or abstract concepts directly tied to the word. Include distinctive details that make them instantly recognizable in their natural context, using realistic proportions, textures, and lighting.
  • Adjectives: Illustrate the qualities or characteristics of the subject clearly. Emphasize contrasts, textures, and visual cues that convey the adjective's essence.
  • Verbs: Show dynamic actions with clear movement, energy, and intent. Use motion effects, expressive poses, and vivid interactions to capture the essence of the action.
  • Adverbs: Enhance the depiction of actions by visually representing intensity, speed, manner, or degree. Use elements like motion blur, light trails, or exaggerated gestures.
  • Pronouns: Stylize figures or silhouettes to represent subjects generically, focusing on relationships and interactions rather than specific identities.
  • Prepositions: Illustrate spatial or temporal relationships accurately, ensuring clear and logical positioning of objects to convey the meaning.
  • Conjunctions: Visually represent connections, contrasts, or relationships. Use symbols like paths merging or objects linking logically.
  • Articles: Subtly differentiate main objects to indicate specificity or generality, using focus effects or grouping similar objects.
  • Interjections: Express intense emotions or reactions with exaggerated expressions, body language, or impactful visual effects.

  CRITICAL PEOPLE REPRESENTATION RULES:
  • When depicting people, show diverse, modern, casual individuals in everyday situations
  • Use contemporary Western-style clothing: jeans, t-shirts, casual dresses, business attire
  • Show people with natural, relaxed expressions and poses
  • Avoid any traditional, cultural, or religious clothing items
  • Do NOT show people wearing: headscarves, turbans, kufiyas, hijabs, burkas, traditional robes, or any cultural/religious attire
  • Do NOT show people with covered heads unless it's a modern hat (baseball cap, beanie, etc.)
  • Show people in modern, everyday environments: offices, homes, parks, streets, cafes
  • Use natural skin tones and diverse but casual appearances

  IMPORTANT RESTRICTIONS:
  • Do NOT depict people wearing kufiyas, turbans, or culturally sensitive attire.
  • Use visual storytelling and scene composition to communicate meaning without relying on text, symbols, or labels.
  • Ensure the scene is clear, contextually accurate, and instantly understandable.
  • Focus on modern, contemporary, everyday situations and appearances.

  Use lighting, color, and perspective to create a visually engaging and coherent illustration.
  `.trim();
};
