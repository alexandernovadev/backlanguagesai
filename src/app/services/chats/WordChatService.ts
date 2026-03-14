import WordChat from "../../db/models/WordChat";
import Word from "../../db/models/Word";
import { WordService } from "../words/wordService";
import {
  generateInitialMessage,
  generateChatResponse,
  generateCorrection,
  generateChatTitle,
} from "../ai/wordChatAIService";
import type { IWordChat, WordSelectionType } from "../../../../types/models";

const wordService = new WordService();

const WORD_SELECTION_PARAMS: Record<
  WordSelectionType,
  { difficulty?: string; sortBy: string; sortOrder: string }
> = {
  last10: { sortBy: "updatedAt", sortOrder: "desc" },
  hard10: { difficulty: "hard", sortBy: "updatedAt", sortOrder: "desc" },
  medium10: { difficulty: "medium", sortBy: "updatedAt", sortOrder: "desc" },
  easy10: { difficulty: "easy", sortBy: "updatedAt", sortOrder: "desc" },
};

function toWordSummary(w: { word: string; definition: string; examples?: string[] }): { word: string; definition: string; examples?: string[] } {
  return {
    word: w.word,
    definition: w.definition,
    examples: w.examples,
  };
}

export class WordChatService {
  async list(userId: string, page = 1, limit = 20, language?: string) {
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = { userId };
    if (language) {
      filter.language = language;
    }
    const total = await WordChat.countDocuments(filter);
    const data = await WordChat.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async create(userId: string, wordSelectionType: WordSelectionType, language = "en") {
    const params = WORD_SELECTION_PARAMS[wordSelectionType];
    const { data: words } = await wordService.getWords({
      page: 1,
      limit: 10,
      difficulty: params.difficulty,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      language: language,
    });

    if (!words?.length) {
      throw new Error("No words found for the selected criteria");
    }

    const wordIds = words.map((w: { _id: unknown }) => w._id);
    const wordTexts = words.map((w: { word: string }) => w.word);
    const wordSummaries = words.map(toWordSummary);

    const initialMsg = await generateInitialMessage(wordSummaries, language);

    const chat = new WordChat({
      userId,
      title: "Chat",
      wordIds,
      wordTexts,
      wordSelectionType,
      wordsUsedInConversation: [],
      messages: [{ role: "assistant", content: initialMsg }],
      language,
      status: "active",
    });
    await chat.save();

    return chat;
  }

  async getById(chatId: string, userId: string): Promise<IWordChat | null> {
    const chat = await WordChat.findOne({ _id: chatId, userId });
    return chat;
  }

  async addMessage(chatId: string, userId: string, content: string) {
    const chat = await WordChat.findOne({ _id: chatId, userId });
    if (!chat) return null;

    chat.messages.push({ role: "user", content });
    await chat.save();

    const words = await Word.find({ _id: { $in: chat.wordIds } }).lean();
    const wordSummaries = words.map(toWordSummary);
    const wordsUsed = chat.wordsUsedInConversation || [];
    const recentMessages = chat.messages.slice(-8);

    const aiResponse = await generateChatResponse(
      wordSummaries,
      wordsUsed,
      recentMessages,
      chat.language
    );

    const usedInResponse = wordSummaries
      .filter((w) => aiResponse.toLowerCase().includes(w.word.toLowerCase()))
      .map((w) => w.word);
    const newUsed = [...new Set([...wordsUsed, ...usedInResponse])];
    chat.wordsUsedInConversation = newUsed;

    const allUsed = wordSummaries.every((w) => newUsed.includes(w.word));
    if (allUsed) {
      chat.status = "completed";
    }

    chat.messages.push({ role: "assistant", content: aiResponse });
    await chat.save();

    return chat;
  }

  async requestCorrection(chatId: string, userId: string, messageIndex: number) {
    const chat = await WordChat.findOne({ _id: chatId, userId });
    if (!chat) return null;

    const msg = chat.messages[messageIndex];
    if (!msg || msg.role !== "user") return null;

    const correction = await generateCorrection(msg.content, chat.language);
    if (!chat.corrections) chat.corrections = new Map();
    chat.corrections.set(String(messageIndex), correction);
    await chat.save();

    return chat;
  }

  async updateTitle(chatId: string, userId: string) {
    const chat = await WordChat.findOne({ _id: chatId, userId });
    if (!chat || chat.messages.length < 2) return chat;

    const title = await generateChatTitle(chat.messages);
    chat.title = title;
    await chat.save();
    return chat;
  }

  async delete(chatId: string, userId: string) {
    const result = await WordChat.findOneAndDelete({ _id: chatId, userId });
    return !!result;
  }
}
