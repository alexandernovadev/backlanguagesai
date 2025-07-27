export class LectureGenerationValidator {
  private static readonly VALID_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
  private static readonly VALID_TYPES = [
    "analysis", "argumentative", "narrative", "descriptive", "expository", 
    "persuasive", "creative", "technical", "scientific", "historical", 
    "biographical", "fiction", "review", "report", "case_study", 
    "tutorial", "speech", "poetry", "dialogue", "letter", 
    "instructions", "guide", "chronicle", "blog"
  ];
  private static readonly VALID_LANGUAGES = ["es", "en", "pt"];
  private static readonly VALID_DIFFICULTIES = ["easy", "medium", "hard"];

  // Lista de temas de gramática válidos (basada en los disponibles en el frontend)
  private static readonly VALID_GRAMMAR_TOPICS = [
    // Verb Tenses
    "Present Simple", "Present Continuous", "Present Perfect", "Present Perfect Continuous",
    "Past Simple", "Past Continuous", "Past Perfect", "Past Perfect Continuous",
    "Future Simple (Will)", "Future with Going To", "Future Continuous", "Future Perfect", "Future Perfect Continuous",
    
    // Modals
    "Modal Verbs (Can, Could, May, Might)", "Modal Verbs (Must, Should, Ought To)", 
    "Modal Verbs (Will, Would, Shall)", "Modal Perfect (Must Have, Should Have)", "Modal Continuous (Must Be, Should Be)",
    
    // Conditionals
    "Zero Conditional", "First Conditional", "Second Conditional", "Third Conditional", "Mixed Conditionals",
    
    // Passive Voice
    "Passive Voice - Present", "Passive Voice - Past", "Passive Voice - Future", 
    "Passive Voice - Perfect Tenses", "Passive Voice - Modal Verbs",
    
    // Reported Speech
    "Reported Speech - Statements", "Reported Speech - Questions", 
    "Reported Speech - Commands", "Reported Speech - Time Expressions",
    
    // Basic Grammar
    "Subject-Verb Agreement", "Basic Word Order", "Questions (Yes/No Questions)", 
    "Questions (Wh-Questions)", "Negatives and Negation", "There is/There are", 
    "Have got/Has got", "This/That/These/Those",
    
    // Articles
    "Definite Article (The)", "Indefinite Articles (A/An)", "Zero Article", 
    "Articles with Countable/Uncountable",
    
    // Nouns
    "Countable and Uncountable Nouns", "Plural Forms", "Possessive Nouns", 
    "Compound Nouns", "Collective Nouns",
    
    // Pronouns
    "Personal Pronouns", "Possessive Pronouns", "Reflexive Pronouns", 
    "Demonstrative Pronouns", "Indefinite Pronouns", "Relative Pronouns", "Interrogative Pronouns",
    
    // Adjectives
    "Comparative Adjectives", "Superlative Adjectives", "Adjective Order", 
    "Participial Adjectives", "Compound Adjectives",
    
    // Adverbs
    "Adverbs of Frequency", "Adverbs of Manner", "Adverbs of Time", 
    "Adverbs of Place", "Adverbs of Degree", "Comparative and Superlative Adverbs",
    
    // Basic Prepositions
    "In, On, At (Time)", "In, On, At (Place)", "In, On, At (Transport)", 
    "By, With, From", "To, For, Of", "Common Prepositional Phrases",
    
    // Prepositions
    "Prepositions of Time", "Prepositions of Place", "Prepositions of Movement", 
    "Prepositions with Verbs", "Prepositions with Adjectives", "Complex Prepositional Phrases",
    
    // Conjunctions
    "Coordinating Conjunctions", "Subordinating Conjunctions", 
    "Correlative Conjunctions", "Conjunctive Adverbs",
    
    // Verbs
    "Regular Verbs", "Irregular Verbs", "Phrasal Verbs", "Gerunds and Infinitives", 
    "Participles (Present/Past)", "Causative Verbs (Have/Get/Make)",
    
    // Vocabulary
    "Common Expressions", "Idioms and Phrases", "Collocations", "Phrasal Verbs", 
    "Word Formation", "Synonyms and Antonyms", "Formal vs Informal Language", "Academic Vocabulary",
    
    // Communication
    "Making Requests", "Giving Advice", "Expressing Opinions", "Agreeing and Disagreeing", 
    "Making Suggestions", "Expressing Preferences", "Describing People and Things", "Talking about the Future",
    
    // Integrated Skills
    "Reading Comprehension", "Listening Comprehension", "Writing Skills", "Speaking Skills", 
    "Critical Thinking", "Context Clues", "Inference Skills", "Text Analysis",
    
    // Advanced Structures
    "Inversion", "Cleft Sentences", "Emphatic Structures", "Ellipsis", "Substitution", 
    "Inverted Conditionals", "Reduced Relative Clauses", "Non-finite Clauses", "Absolute Phrases", "Appositives"
  ];

  static validateLectureGeneration(params: {
    prompt?: string;
    level?: string;
    typeWrite?: string;
    language?: string;
    difficulty?: string;
    rangeMin?: number;
    rangeMax?: number;
    grammarTopics?: string[];
  }): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar prompt
    if (!params.prompt || params.prompt.trim().length === 0) {
      errors.push("Prompt is required");
    } else if (params.prompt.length < 10) {
      errors.push("Prompt must be at least 10 characters long");
    } else if (params.prompt.length > 500) {
      errors.push("Prompt cannot exceed 500 characters");
    }

    // Validar level
    if (params.level && !this.VALID_LEVELS.includes(params.level)) {
      errors.push(`Invalid level. Must be one of: ${this.VALID_LEVELS.join(", ")}`);
    }

    // Validar typeWrite
    if (params.typeWrite && !this.VALID_TYPES.includes(params.typeWrite)) {
      errors.push(`Invalid type. Must be one of: ${this.VALID_TYPES.join(", ")}`);
    }

    // Validar language
    if (params.language && !this.VALID_LANGUAGES.includes(params.language)) {
      errors.push(`Invalid language. Must be one of: ${this.VALID_LANGUAGES.join(", ")}`);
    }

    // Validar difficulty
    if (params.difficulty && !this.VALID_DIFFICULTIES.includes(params.difficulty)) {
      errors.push(`Invalid difficulty. Must be one of: ${this.VALID_DIFFICULTIES.join(", ")}`);
    }

    // Validar rangeMin y rangeMax
    if (params.rangeMin !== undefined) {
      if (params.rangeMin < 100) {
        errors.push("Minimum range must be at least 100 characters");
      } else if (params.rangeMin > 100000) {
        errors.push("Minimum range cannot exceed 100,000 characters");
      }
    }

    if (params.rangeMax !== undefined) {
      if (params.rangeMax < 100) {
        errors.push("Maximum range must be at least 100 characters");
      } else if (params.rangeMax > 100000) {
        errors.push("Maximum range cannot exceed 100,000 characters");
      }
    }

    if (params.rangeMin !== undefined && params.rangeMax !== undefined) {
      if (params.rangeMin > params.rangeMax) {
        errors.push("Minimum range cannot be greater than maximum range");
      }
    }

    // Validar grammarTopics
    if (params.grammarTopics && Array.isArray(params.grammarTopics)) {
      if (params.grammarTopics.length > 10) {
        errors.push("Cannot select more than 10 grammar topics");
      }

      const invalidTopics = params.grammarTopics.filter(
        topic => !this.VALID_GRAMMAR_TOPICS.includes(topic)
      );

      if (invalidTopics.length > 0) {
        errors.push(`Invalid grammar topics: ${invalidTopics.join(", ")}`);
      }

      // Verificar duplicados
      const uniqueTopics = new Set(params.grammarTopics);
      if (uniqueTopics.size !== params.grammarTopics.length) {
        warnings.push("Duplicate grammar topics detected and will be ignored");
      }
    }

    // Warnings adicionales
    if (params.grammarTopics && params.grammarTopics.length > 5) {
      warnings.push("Many grammar topics selected. This may affect content quality");
    }

    if (params.rangeMin && params.rangeMax && (params.rangeMax - params.rangeMin) < 1000) {
      warnings.push("Small range difference may limit content variety");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
} 