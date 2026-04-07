import Expression from "../../db/models/Expression";
import { IExpression, ChatMessage } from "../../../../types/models";
import { generateId } from "../../utils/generateId";
import { MAX_CHAT_MESSAGES } from "../../../config/constants";

export class ExpressionChatService {
  async addChatMessage(expressionId: string, message: string): Promise<IExpression | null> {
    return await this.addUserMessage(expressionId, message);
  }

  async addUserMessage(expressionId: string, message: string): Promise<IExpression | null> {
    const expression = await Expression.findById(expressionId);
    if (!expression) return null;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    expression.chat = expression.chat || [];
    expression.chat.push(userMessage);
    if (expression.chat.length > MAX_CHAT_MESSAGES) expression.chat = expression.chat.slice(-MAX_CHAT_MESSAGES);
    return await expression.save();
  }

  async addAssistantMessage(expressionId: string, message: string): Promise<IExpression | null> {
    const expression = await Expression.findById(expressionId);
    if (!expression) return null;

    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: "assistant",
      content: message,
      timestamp: new Date(),
    };

    expression.chat = expression.chat || [];
    expression.chat.push(assistantMessage);
    if (expression.chat.length > MAX_CHAT_MESSAGES) expression.chat = expression.chat.slice(-MAX_CHAT_MESSAGES);
    return await expression.save();
  }

  async getChatHistory(expressionId: string): Promise<ChatMessage[]> {
    const expression = await Expression.findById(expressionId);
    return expression?.chat || [];
  }

  async clearChatHistory(expressionId: string): Promise<IExpression | null> {
    const expression = await Expression.findById(expressionId);
    if (!expression) return null;
    expression.chat = [];
    return await expression.save();
  }
}

export default new ExpressionChatService();
