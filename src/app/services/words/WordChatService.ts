import Word from "../../db/models/Word";
import { IWord, ChatMessage } from "../../../../types/models";
import { generateId } from "../../utils/generateId";
import { MAX_CHAT_MESSAGES } from "../../../../config/constants";

export class WordChatService {
  async addChatMessage(wordId: string, message: string): Promise<IWord | null> {
    return await this.addUserMessage(wordId, message);
  }

  async addUserMessage(wordId: string, message: string): Promise<IWord | null> {
    const word = await Word.findById(wordId);
    if (!word) return null;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    word.chat = word.chat || [];
    word.chat.push(userMessage);
    if (word.chat.length > MAX_CHAT_MESSAGES) word.chat = word.chat.slice(-MAX_CHAT_MESSAGES);
    return await word.save();
  }

  async addAssistantMessage(wordId: string, message: string): Promise<IWord | null> {
    const word = await Word.findById(wordId);
    if (!word) return null;

    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: "assistant",
      content: message,
      timestamp: new Date(),
    };

    word.chat = word.chat || [];
    word.chat.push(assistantMessage);
    if (word.chat.length > MAX_CHAT_MESSAGES) word.chat = word.chat.slice(-MAX_CHAT_MESSAGES);
    return await word.save();
  }

  async getChatHistory(wordId: string): Promise<ChatMessage[]> {
    const word = await Word.findById(wordId);
    if (!word) return [];
    return word.chat || [];
  }

  async clearChatHistory(wordId: string): Promise<IWord | null> {
    const word = await Word.findById(wordId);
    if (!word) return null;
    word.chat = [];
    return await word.save();
  }
}

export default new WordChatService();
