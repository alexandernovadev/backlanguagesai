import { Request, Response } from 'express';
import { getUserWordsByType, getRecentWords, getGrammarTopics, getDefaultConfigs } from '../services/translation/wordService';
import { generateTrainingText } from '../services/translation/textGenerationService';
import { analyzeTranslation } from '../services/translation/translationAnalysisService';
import { TranslationChat, Translation, GeneratedText } from '../db/models';
import logger from '../utils/logger';

/**
 * Get preloaded configurations for translation trainer
 * GET /api/translation/configs
 */
export const getConfigs = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    logger.info('Getting translation trainer configs', { userId });

    // Get all configurations in parallel
    const [userWords, recentWords, grammarTopics, defaultConfigs] = await Promise.all([
      getUserWordsByType(userId),
      getRecentWords(userId),
      getGrammarTopics(),
      getDefaultConfigs()
    ]);

    const configs = {
      userWords,
      recentWords,
      grammarTopics,
      defaultConfigs
    };

    logger.info('Configs loaded successfully', { userId });

    res.json(configs);

  } catch (error) {
    logger.error('Failed to get translation trainer configs:', error);
    res.status(500).json({ 
      error: 'Failed to load configurations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Generate training text with streaming
 * POST /api/translation/generate-text
 */
export const generateText = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { config, chatId } = req.body;

    logger.info('Generating training text', { userId, config, chatId });

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    logger.info('About to call generateTrainingText...');
    
    // Generate text using OpenAI service
    const generatedText = await generateTrainingText(config);
    
    logger.info('Text generated successfully, length:', generatedText.text.length);

    // Save generated text to database
    const newGeneratedText = new GeneratedText({
      userId,
      chatId,
      text: generatedText.text,
      config,
      wordCount: generatedText.text.split(' ').length,
      generatedAt: new Date(),
      aiProvider: 'openai' // or get from config
    });

    await newGeneratedText.save();

    // Add message to chat if chatId provided
    if (chatId) {
      const messageData = {
        id: newGeneratedText._id.toString(),
        type: 'generated_text' as const,
        content: generatedText.text,
        timestamp: new Date(),
        metadata: { config }
      };

      await TranslationChat.findByIdAndUpdate(
        chatId,
        {
          $push: { messages: messageData },
          $inc: { messageCount: 1 },
          $set: { lastActivity: new Date() }
        }
      );
    }

    // Send only the text content, not the whole object
    res.write(generatedText.text);
    res.end();

    logger.info('Training text generated and saved successfully', { 
      userId, 
      textId: newGeneratedText._id,
      chatId 
    });

  } catch (error) {
    logger.error('Failed to generate training text:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      logger.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to generate training text',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    } else {
      // If headers already sent, try to send error as text
      res.write(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.end();
    }
  }
};

/**
 * Process user translation and provide feedback
 * POST /api/translation/translate
 */
export const processTranslation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { originalText, userTranslation, textId, chatId, sourceLanguage = 'spanish', targetLanguage = 'english' } = req.body;

    if (!originalText || !userTranslation) {
      return res.status(400).json({ error: 'Original text and user translation are required' });
    }

    logger.info('Processing user translation', { userId, textId, chatId });

    // Analyze translation using AI service
    const analysisResult = await analyzeTranslation(originalText, userTranslation, sourceLanguage, targetLanguage);

    // Save user translation to database
    const newTranslation = new Translation({
      userId,
      chatId,
      generatedTextId: textId,
      originalText,
      userTranslation,
      correctTranslation: analysisResult.correctTranslation,
      score: analysisResult.score,
      translationErrors: analysisResult.errors || [],
      feedback: analysisResult.feedback,
      timeSpent: 0, // TODO: track actual time from frontend
      sourceLanguage,
      targetLanguage,
      aiProvider: 'openai',
      submittedAt: new Date()
    });

    await newTranslation.save();

    // Add user translation message to chat
    if (chatId) {
      const userMessageData = {
        id: `user-${newTranslation._id.toString()}`,
        type: 'user_translation' as const,
        content: userTranslation,
        timestamp: new Date()
      };

      const feedbackMessageData = {
        id: `feedback-${newTranslation._id.toString()}`,
        type: 'ai_feedback' as const,
        content: analysisResult.feedback,
        timestamp: new Date(),
        metadata: {
          score: analysisResult.score,
          errors: analysisResult.errors,
          correctTranslation: analysisResult.correctTranslation
        }
      };

      await TranslationChat.findByIdAndUpdate(
        chatId,
        {
          $push: { 
            messages: { 
              $each: [userMessageData, feedbackMessageData] 
            } 
          },
          $inc: { messageCount: 2 },
          $set: { 
            lastActivity: new Date(),
            lastScore: analysisResult.score
          }
        }
      );
    }

    logger.info('Translation processed and saved successfully', { 
      userId, 
      textId, 
      chatId,
      translationId: newTranslation._id,
      score: analysisResult.score 
    });

    res.json(analysisResult);

  } catch (error) {
    logger.error('Failed to process translation:', error);
    res.status(500).json({ 
      error: 'Failed to process translation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get all translation chats for user
 * GET /api/translation/chats
 */
export const getChats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    logger.info('Getting translation chats', { userId });

    // Get user's translation chats from database
    const chats = await TranslationChat.find({ userId })
      .sort({ lastActivity: -1 })
      .select('name config lastActivity createdAt messageCount lastScore')
      .lean();

    // Transform _id to id for frontend compatibility
    const transformedChats = chats.map(chat => ({
      id: chat._id.toString(),
      name: chat.name,
      config: chat.config,
      lastActivity: chat.lastActivity,
      createdAt: chat.createdAt,
      messageCount: chat.messageCount,
      lastScore: chat.lastScore
    }));

    logger.info('Translation chats retrieved successfully', { userId, count: transformedChats.length });

    res.json(transformedChats);

  } catch (error) {
    logger.error('Failed to get translation chats:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve chats',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create new translation chat
 * POST /api/translation/chat
 */
export const createChat = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    logger.info('Creating new translation chat', { userId });

    // Create new translation chat with default config
    const defaultConfig = {
      sourceLanguage: 'spanish' as const,
      targetLanguage: 'english' as const,
      difficulty: 'intermediate' as const,
      minWords: 120,
      maxWords: 300,
      mustUseWords: [],
      grammarTopics: []
    };

    const chatNumber = await TranslationChat.countDocuments({ userId }) + 1;
    
    const newChat = new TranslationChat({
      userId,
      name: `Translation Chat ${chatNumber}`,
      config: defaultConfig,
      messages: [],
      lastActivity: new Date(),
      messageCount: 0
    });

    await newChat.save();

    // Transform _id to id for frontend compatibility
    const transformedChat = {
      id: newChat._id.toString(),
      name: newChat.name,
      config: newChat.config,
      lastActivity: newChat.lastActivity,
      createdAt: newChat.createdAt,
      messageCount: newChat.messageCount,
      lastScore: newChat.lastScore,
      messages: newChat.messages
    };

    logger.info('Translation chat created successfully', { userId, chatId: newChat._id });

    res.json(transformedChat);

  } catch (error) {
    logger.error('Failed to create translation chat:', error);
    res.status(500).json({ 
      error: 'Failed to create chat',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get chat details and messages
 * GET /api/translation/chat/:chatId
 */
export const getChat = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { chatId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }

    logger.info('Getting chat details', { userId, chatId });

    // Get chat details from database
    const chat = await TranslationChat.findOne({ _id: chatId, userId }).lean();

    if (!chat) {
      return res.status(404).json({ 
        error: 'Chat not found',
        message: 'The requested chat does not exist or you do not have access to it'
      });
    }

    // Transform _id to id for frontend compatibility
    const transformedChat = {
      id: chat._id.toString(),
      name: chat.name,
      config: chat.config,
      lastActivity: chat.lastActivity,
      createdAt: chat.createdAt,
      messageCount: chat.messageCount,
      lastScore: chat.lastScore,
      messages: chat.messages || []
    };

    logger.info('Chat details retrieved successfully', { userId, chatId });

    res.json(transformedChat);

  } catch (error) {
    logger.error('Failed to get chat details:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve chat',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteChat = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    logger.info('Deleting chat', { userId, chatId });

    // Delete chat from database
    const deletedChat = await TranslationChat.findOneAndDelete({ _id: chatId, userId });

    if (!deletedChat) {
      return res.status(404).json({ 
        error: 'Chat not found',
        message: 'The requested chat does not exist or you do not have access to it'
      });
    }

    // Also delete related translations and generated texts
    await Promise.all([
      Translation.deleteMany({ chatId }),
      GeneratedText.deleteMany({ chatId })
    ]);

    logger.info('Chat deleted successfully', { userId, chatId });
    res.json({ success: true, message: 'Chat deleted successfully' });
    
  } catch (error) {
    logger.error('Failed to delete chat:', error);
    res.status(500).json({
      error: 'Failed to delete chat',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
