import { Request } from "express";
import {
  getUserWordsByType,
  getRecentWords,
  getGrammarTopics,
  getDefaultConfigs,
} from "./wordService";
import { generateTrainingText } from "./textGenerationService";
import { analyzeTranslation } from "./translationAnalysisService";
import {
  TranslationChat,
  Translation,
  GeneratedText,
  ITranslationConfig,
} from "../../db/models";
import logger from "../../utils/logger";

// This service will encapsulate the business logic for translation-related operations

export const translationControllerService = {
  getConfigs: async (userId: string) => {
    logger.info("Getting translation trainer configs", { userId });
    const [userWords, recentWords, grammarTopics, defaultConfigs] =
      await Promise.all([
        getUserWordsByType(userId),
        getRecentWords(userId),
        getGrammarTopics(),
        getDefaultConfigs(),
      ]);

    return {
      userWords,
      recentWords,
      grammarTopics,
      defaultConfigs,
    };
  },

  generateText: async (userId: string, config: any, chatId?: string) => {
    logger.info("Generating training text", { userId, config, chatId });
    const generatedText = await generateTrainingText(config);

    const newGeneratedText = new GeneratedText({
      userId,
      chatId,
      text: generatedText.text,
      config,
      wordCount: generatedText.text.split(" ").length,
      generatedAt: new Date(),
      aiProvider: "deepseek",
    });
    await newGeneratedText.save();

    if (chatId) {
      const messageData = {
        id: newGeneratedText._id.toString(),
        type: "generated_text" as const,
        content: generatedText.text,
        timestamp: new Date(),
        metadata: { config },
      };
      await TranslationChat.findByIdAndUpdate(chatId, {
        $push: { messages: messageData },
        $inc: { messageCount: 1 },
        $set: { lastActivity: new Date() },
      });
    }
    return {
      generatedTextContent: generatedText.text,
      newGeneratedTextId: newGeneratedText._id,
    };
  },

  processTranslation: async (
    userId: string,
    originalText: string,
    userTranslation: string,
    textId: string,
    chatId: string,
    sourceLanguage: string,
    targetLanguage: string
  ) => {
    logger.info("Processing user translation", { userId, textId, chatId });

    const analysisResult = await analyzeTranslation(
      originalText,
      userTranslation,
      sourceLanguage as "spanish" | "english" | "portuguese",
      targetLanguage as "spanish" | "english" | "portuguese"
    );

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
      timeSpent: 0,
      sourceLanguage,
      targetLanguage,
      aiProvider: "deepseek",
      submittedAt: new Date(),
    });
    await newTranslation.save();

    if (chatId) {
      const userMessageData = {
        id: `user-${newTranslation._id.toString()}`,
        type: "user_translation" as const,
        content: userTranslation,
        timestamp: new Date(),
      };

      const feedbackMessageData = {
        id: `feedback-${newTranslation._id.toString()}`,
        type: "ai_feedback" as const,
        content: analysisResult.feedback,
        timestamp: new Date(),
        metadata: {
          score: analysisResult.score,
          errors: analysisResult.errors,
          correctTranslation: analysisResult.correctTranslation,
        },
      };

      await TranslationChat.findByIdAndUpdate(chatId, {
        $push: {
          messages: {
            $each: [userMessageData, feedbackMessageData],
          },
        },
        $inc: { messageCount: 2 },
        $set: {
          lastActivity: new Date(),
          lastScore: analysisResult.score,
        },
      });
    }
    return { ...analysisResult, _id: newTranslation._id }; // Return analysis result along with the new translation's _id
  },

  getChats: async (userId: string) => {
    logger.info("Getting translation chats", { userId });
    const chats = await TranslationChat.find({ userId })
      .sort({ lastActivity: -1 })
      .select("name config lastActivity createdAt messageCount lastScore")
      .lean();

    return chats.map((chat) => ({
      id: chat._id.toString(),
      name: chat.name,
      config: chat.config,
      lastActivity: chat.lastActivity,
      createdAt: chat.createdAt,
      messageCount: chat.messageCount,
      lastScore: chat.lastScore,
    }));
  },

  createChat: async (userId: string) => {
    logger.info("Creating new translation chat", { userId });
    const defaultConfig: ITranslationConfig = {
      sourceLanguage: "spanish" as const,
      targetLanguage: "english" as const,
      difficulty: "intermediate" as const,
      minWords: 120,
      maxWords: 300,
      mustUseWords: [],
      grammarTopics: [],
    };

    const chatNumber = (await TranslationChat.countDocuments({ userId })) + 1;

    const newChat = new TranslationChat({
      userId,
      name: `Translation Chat ${chatNumber}`,
      config: defaultConfig,
      messages: [],
      lastActivity: new Date(),
      messageCount: 0,
    });
    await newChat.save();

    return {
      id: newChat._id.toString(),
      name: newChat.name,
      config: newChat.config,
      lastActivity: newChat.lastActivity,
      createdAt: newChat.createdAt,
      messageCount: newChat.messageCount,
      lastScore: newChat.lastScore,
      messages: newChat.messages,
    };
  },

  getChat: async (userId: string, chatId: string) => {
    logger.info("Getting chat details", { userId, chatId });
    const chat = await TranslationChat.findOne({ _id: chatId, userId }).lean();
    if (!chat) {
      return null; // Indicate not found
    }
    return {
      id: chat._id.toString(),
      name: chat.name,
      config: chat.config,
      lastActivity: chat.lastActivity,
      createdAt: chat.createdAt,
      messageCount: chat.messageCount,
      lastScore: chat.lastScore,
      messages: chat.messages || [],
    };
  },

  deleteChat: async (userId: string, chatId: string) => {
    logger.info("Deleting chat", { userId, chatId });
    const deletedChat = await TranslationChat.findOneAndDelete({
      _id: chatId,
      userId,
    });
    if (!deletedChat) {
      return false; // Indicate not found
    }
    await Promise.all([
      Translation.deleteMany({ chatId }),
      GeneratedText.deleteMany({ chatId }),
    ]);
    return true;
  },

  updateChatConfig: async (
    userId: string,
    chatId: string,
    config: ITranslationConfig
  ) => {
    logger.info("Updating chat configuration", { userId, chatId, config });
    const updatedChat = await TranslationChat.findOneAndUpdate(
      { _id: chatId, userId },
      { $set: { config: config, updatedAt: new Date() } },
      { new: true, runValidators: true }
    );
    if (!updatedChat) {
      return false; // Indicate not found
    }
    return true;
  },
};
