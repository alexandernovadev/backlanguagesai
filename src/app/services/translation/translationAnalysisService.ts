import { createChatCompletion } from '../ai/aiClient';
import logger from '../../utils/logger';

interface TranslationAnalysis {
  score: number;
  correctTranslation: string;
  feedback: string;
  errors: Array<{
    type: 'grammar' | 'vocabulary' | 'structure' | 'spelling' | 'punctuation';
    message: string;
    severity: 'low' | 'medium' | 'high' | 'minor' | 'moderate' | 'major' | 'critical';
    original?: string;
    corrected?: string;
    explanation?: string;
  }>;
}

/**
 * Analyze user translation and provide feedback
 */
export const analyzeTranslation = async (
  originalText: string,
  userTranslation: string,
  sourceLanguage: 'spanish' | 'english' | 'portuguese' = 'spanish',
  targetLanguage: 'spanish' | 'english' | 'portuguese' = 'english'
): Promise<TranslationAnalysis> => {
  try {
    logger.info('Analyzing translation with OpenAI', { 
      originalLength: originalText.length,
      userTranslationLength: userTranslation.length 
    });

    // Get correct translation and analysis in parallel
    const [correctTranslation, analysis] = await Promise.all([
      getCorrectTranslation(originalText, sourceLanguage, targetLanguage),
      getTranslationAnalysis(originalText, userTranslation, sourceLanguage, targetLanguage)
    ]);

    logger.info('Translation analysis completed', { 
      score: analysis.score,
      errorCount: analysis.errors.length 
    });

    return {
      score: analysis.score,
      correctTranslation,
      feedback: analysis.feedback,
      errors: analysis.errors
    };

  } catch (error) {
    logger.error('Failed to analyze translation:', error);
    throw new Error(`Translation analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get correct translation from AI
 */
const getCorrectTranslation = async (
  originalText: string, 
  sourceLanguage: 'spanish' | 'english' | 'portuguese',
  targetLanguage: 'spanish' | 'english' | 'portuguese'
): Promise<string> => {
  const languageNames = {
    spanish: 'Spanish',
    english: 'English',
    portuguese: 'Portuguese'
  };

  const prompt = `Translate the following text from ${languageNames[sourceLanguage]} to ${languageNames[targetLanguage]}. Provide only the translation, no additional comments:

${originalText}`;

  const response = await createChatCompletion({
    messages: [
      {
        role: 'system',
        content: `You are a professional translator specializing in ${languageNames[sourceLanguage]} to ${languageNames[targetLanguage]} translation. Provide accurate, natural translations.`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3
  });

  return response.choices[0]?.message?.content?.trim() || '';
};

/**
 * Get detailed analysis of user translation
 */
const getTranslationAnalysis = async (
  originalText: string, 
  userTranslation: string,
  sourceLanguage: 'spanish' | 'english' | 'portuguese',
  targetLanguage: 'spanish' | 'english' | 'portuguese'
): Promise<{ score: number; feedback: string; errors: any[] }> => {
  const languageNames = {
    spanish: 'Spanish',
    english: 'English',
    portuguese: 'Portuguese'
  };

  const prompt = `Analyze this translation from ${languageNames[sourceLanguage]} to ${languageNames[targetLanguage]} and provide feedback in JSON format:

Original text (${languageNames[sourceLanguage]}): ${originalText}
User translation (${languageNames[targetLanguage]}): ${userTranslation}

Provide a JSON response with this exact structure:
{
  "score": <number from 0-100>,
  "feedback": "<constructive feedback in English>",
  "errors": [
    {
      "type": "<grammar|vocabulary|structure|spelling|punctuation>",
      "message": "<specific error description>",
      "severity": "<low|medium|high|minor|moderate|major|critical>",
      "original": "<original problematic text (optional)>",
      "corrected": "<corrected version (optional)>",
      "explanation": "<detailed explanation (optional)>"
    }
  ]
}

IMPORTANT SEVERITY LEVELS:
- low/minor: Small stylistic issues
- medium/moderate: Noticeable errors that don't affect meaning
- high/major: Significant errors that affect clarity
- critical: Errors that change or obscure meaning

Focus on accuracy, naturalness, and grammar. Consider the direction of translation (${languageNames[sourceLanguage]} → ${languageNames[targetLanguage]}). Be constructive and helpful.`;

  const response = await createChatCompletion({
    messages: [
      {
        role: 'system',
        content: 'You are a language teacher providing detailed translation feedback. Always respond with valid JSON.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3
  });

  const analysisText = response.choices[0]?.message?.content?.trim();
  
  try {
    return JSON.parse(analysisText || '{}');
  } catch (parseError) {
    logger.error('Failed to parse analysis JSON:', parseError);
    // Fallback response
    return {
      score: 70,
      feedback: 'Translation analyzed. Consider reviewing grammar and vocabulary choices.',
      errors: []
    };
  }
};
