import Word from '../../db/models/Word';
import logger from '../../utils/logger';

// Mapping of existing types to modal categories
const TYPE_MAPPING = {
  nouns: ['noun'],
  verbs: ['verb', 'phrasal verb', 'auxiliary verb', 'modal verb', 'infinitive', 'participle', 'gerund'],
  adjectives: ['adjective'],
  adverbs: ['adverb'],
  others: ['personal pronoun', 'possessive pronoun', 'preposition', 'conjunction', 'determiner', 'article', 'quantifier', 'interjection', 'other']
};

/**
 * Get user's last 30 words grouped by grammatical type
 */
export const getUserWordsByType = async (userId: string): Promise<{
  nouns: any[];
  verbs: any[];
  adjectives: any[];
  adverbs: any[];
  others: any[];
}> => {
  try {
    logger.info('Getting user words by type', { userId });

    // Get last 30 words (words are global, not user-specific)
    const words = await Word.find({})
      .sort({ createdAt: -1 })
      .limit(30)
      .select('word spanish definition type level');

    // Group words by type using existing type field
    const groupedWords = {
      nouns: [],
      verbs: [],
      adjectives: [],
      adverbs: [],
      others: []
    };

    words.forEach(word => {
      const wordData = {
        id: word._id.toString(),
        word: word.word,
        translation: word.spanish?.word || word.definition,
        type: word.type || [],
        level: word.level || 'medium'
      };

      logger.info('Processing word', { 
        word: word.word, 
        type: word.type, 
        typeIsArray: Array.isArray(word.type),
        typeLength: word.type?.length 
      });

      // Check which category this word belongs to
      let categorized = false;
      
      for (const [category, types] of Object.entries(TYPE_MAPPING)) {
        if (word.type?.some(t => types.includes(t)) && groupedWords[category as keyof typeof groupedWords].length < 5) {
          logger.info('Word categorized', { word: word.word, category, matchedType: word.type.find(t => types.includes(t)) });
          groupedWords[category as keyof typeof groupedWords].push(wordData);
          categorized = true;
          break;
        }
      }

      // If not categorized or categories are full, add to "others"
      if (!categorized && groupedWords.others.length < 5) {
        logger.info('Word added to others', { word: word.word, type: word.type });
        groupedWords.others.push(wordData);
      }
    });

    logger.info('Words grouped by type successfully', {
      userId,
      nouns: groupedWords.nouns.length,
      verbs: groupedWords.verbs.length,
      adjectives: groupedWords.adjectives.length,
      adverbs: groupedWords.adverbs.length,
      others: groupedWords.others.length,
      totalWords: words.length,
      groupedWordsData: {
        nouns: groupedWords.nouns.map(w => ({ word: w.word, type: w.type })),
        verbs: groupedWords.verbs.map(w => ({ word: w.word, type: w.type })),
        adjectives: groupedWords.adjectives.map(w => ({ word: w.word, type: w.type })),
        adverbs: groupedWords.adverbs.map(w => ({ word: w.word, type: w.type })),
        others: groupedWords.others.map(w => ({ word: w.word, type: w.type }))
      }
    });

    return groupedWords;

  } catch (error) {
    logger.error('Failed to get user words by type:', error);
    throw new Error(`Failed to retrieve user words: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get last 20 words by creation date
 */
export const getRecentWords = async (userId: string): Promise<any[]> => {
  try {
    logger.info('Getting recent words', { userId });

    // Get last 20 words ordered by creation date
    const words = await Word.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .select('word spanish definition type level createdAt');

    const recentWords = words.map(word => ({
      id: word._id.toString(),
      word: word.word,
      translation: word.spanish?.word || word.definition,
      type: word.type || [],
      level: word.level || 'medium',
      createdAt: word.createdAt
    }));

    logger.info('Recent words retrieved successfully', {
      userId,
      count: recentWords.length,
      words: recentWords.map(w => ({ word: w.word, type: w.type }))
    });

    return recentWords;

  } catch (error) {
    logger.error('Failed to get recent words:', error);
    throw new Error(`Failed to retrieve recent words: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get grammar topics for text generation
 */
export const getGrammarTopics = () => {
  return [
    {
      id: 'verbTenses',
      name: 'Verb Tenses',
      description: 'Present, past, future and verb forms',
      difficulty: 'beginner' as const,
      icon: '🏃'
    },
    {
      id: 'nouns',
      name: 'Nouns',
      description: 'Countable, uncountable nouns and plurals',
      difficulty: 'beginner' as const,
      icon: '🏷️'
    },
    {
      id: 'pronouns',
      name: 'Pronouns',
      description: 'Personal, possessive, reflexive and demonstrative',
      difficulty: 'beginner' as const,
      icon: '👤'
    },
    {
      id: 'adjectives',
      name: 'Adjectives',
      description: 'Comparative, superlative and adjective order',
      difficulty: 'intermediate' as const,
      icon: '🎨'
    },
    {
      id: 'adverbs',
      name: 'Adverbs',
      description: 'Frequency, manner, time and place',
      difficulty: 'intermediate' as const,
      icon: '⚡'
    },
    {
      id: 'prepositions',
      name: 'Prepositions',
      description: 'Time, place, movement and with verbs',
      difficulty: 'intermediate' as const,
      icon: '📍'
    },
    {
      id: 'conjunctions',
      name: 'Conjunctions',
      description: 'Coordinating, subordinating and correlative',
      difficulty: 'intermediate' as const,
      icon: '🔗'
    },
    {
      id: 'advancedStructures',
      name: 'Advanced Structures',
      description: 'Conditionals, passive voice and subjunctive',
      difficulty: 'advanced' as const,
      icon: '🧠'
    },
    {
      id: 'portugueseAccents',
      name: 'Portuguese Accents',
      description: 'Acute, grave, circumflex and tilde marks',
      difficulty: 'intermediate' as const,
      icon: '🇵🇹'
    },
    {
      id: 'spanishAccents',
      name: 'Spanish Accents',
      description: 'Accent rules and stress patterns',
      difficulty: 'intermediate' as const,
      icon: '🇪🇸'
    }
  ];
};

/**
 * Get default configuration for text generation
 */
export const getDefaultConfigs = () => {
  return {
    minWords: 120,
    maxWords: 700,
    difficulties: ['beginner', 'intermediate', 'advanced'] as const,
    languages: ['spanish', 'english', 'portuguese'] as const,
    topics: ['general', 'business', 'travel', 'culture', 'technology', 'health', 'education'],
    translationModes: [
      { id: 'es-en', sourceLanguage: 'spanish', targetLanguage: 'english', label: 'Spanish → English' },
      { id: 'en-es', sourceLanguage: 'english', targetLanguage: 'spanish', label: 'English → Spanish' },
      { id: 'es-pt', sourceLanguage: 'spanish', targetLanguage: 'portuguese', label: 'Spanish → Portuguese' },
      { id: 'pt-es', sourceLanguage: 'portuguese', targetLanguage: 'spanish', label: 'Portuguese → Spanish' },
      { id: 'en-pt', sourceLanguage: 'english', targetLanguage: 'portuguese', label: 'English → Portuguese' },
      { id: 'pt-en', sourceLanguage: 'portuguese', targetLanguage: 'english', label: 'Portuguese → English' }
    ]
  };
};
