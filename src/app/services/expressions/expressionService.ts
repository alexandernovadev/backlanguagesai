import Expression, { IExpression, ChatMessage } from "../../db/models/Expression";
import { generateExpressionJson } from "../ai/generateExpressionJson";
import { generateExpressionChatResponse } from "../ai/generateExpressionChatResponse";

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export class ExpressionService {
  async createExpression(expressionData: IExpression): Promise<IExpression> {
    const expression = new Expression(expressionData);
    return await expression.save();
  }

  async getExpressionById(id: string): Promise<IExpression | null> {
    return await Expression.findById(id);
  }

  async getExpressions(filters: any = {}): Promise<PaginatedResult<IExpression>> {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};

    if (filters.search) {
      filter.$or = [
        { expression: { $regex: filters.search, $options: "i" } },
        { definition: { $regex: filters.search, $options: "i" } },
        { "spanish.expression": { $regex: filters.search, $options: "i" } },
        { "spanish.definition": { $regex: filters.search, $options: "i" } },
      ];
    }

    if (filters.type && filters.type.length > 0) {
      filter.type = { $in: Array.isArray(filters.type) ? filters.type : [filters.type] };
    }

    if (filters.difficulty) {
      filter.difficulty = filters.difficulty;
    }

    if (filters.language) {
      filter.language = filters.language;
    }

    if (filters.hasImage === "true") {
      filter.img = { $ne: null };
    } else if (filters.hasImage === "false") {
      filter.img = null;
    }

    if (filters.createdAt) {
      if (!filter.createdAt) filter.createdAt = {};
      (filter.createdAt as any).$gte = new Date(filters.createdAt);
    }

    if (filters.updatedAt) {
      if (!filter.updatedAt) filter.updatedAt = {};
      (filter.updatedAt as any).$gte = new Date(filters.updatedAt);
    }

    const total = await Expression.countDocuments(filter);
    const data = await Expression.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async updateExpression(id: string, updateData: Partial<IExpression>): Promise<IExpression | null> {
    return await Expression.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteExpression(id: string): Promise<IExpression | null> {
    return await Expression.findByIdAndDelete(id);
  }

  async findExpressionByExpression(expression: string): Promise<IExpression | null> {
    return await Expression.findOne({ expression });
  }

  async addChatMessage(expressionId: string, message: string): Promise<IExpression | null> {
    // Este método ahora solo agrega el mensaje del usuario
    // Las respuestas se manejan via streaming en el controlador
    return await this.addUserMessage(expressionId, message);
  }

  async addUserMessage(expressionId: string, message: string): Promise<IExpression | null> {
    const expression = await Expression.findById(expressionId);
    if (!expression) return null;

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: "user",
      content: message,
      timestamp: new Date()
    };

    expression.chat = expression.chat || [];
    expression.chat.push(userMessage);
    return await expression.save();
  }

  async addAssistantMessage(expressionId: string, message: string): Promise<IExpression | null> {
    const expression = await Expression.findById(expressionId);
    if (!expression) return null;

    const assistantMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: "assistant",
      content: message,
      timestamp: new Date()
    };

    expression.chat = expression.chat || [];
    expression.chat.push(assistantMessage);
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

  async getExpressionsByType(type: string, limit: number = 10, search?: string): Promise<IExpression[]> {
    const filter: any = { type: { $in: [type] } };
    if (search) {
      filter.$or = [
        { expression: { $regex: search, $options: "i" } },
        { definition: { $regex: search, $options: "i" } },
      ];
    }
    return await Expression.find(filter).limit(limit);
  }

  async getExpressionsOnly(filters: any = {}): Promise<PaginatedResult<{ expression: string }>> {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (filters.search) {
      filter.expression = { $regex: filters.search, $options: "i" };
    }

    const total = await Expression.countDocuments(filter);
    const data = await Expression.find(filter, { expression: 1 })
      .sort({ expression: 1 })
      .skip(skip)
      .limit(limit);

    return {
      data: data.map(doc => ({ expression: doc.expression })),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async getAllExpressionsForExport(): Promise<IExpression[]> {
    return await Expression.find({}).sort({ createdAt: -1 });
  }

  async importExpressions(expressions: any[]): Promise<IExpression[]> {
    const results = [];
    for (const expressionData of expressions) {
      try {
        const expression = await this.createExpression(expressionData);
        results.push(expression);
      } catch (error: any) {
        console.error(`Error importing expression ${expressionData.expression}:`, error.message);
      }
    }
    return results;
  }

  async generateExpression(prompt: string, options: any = {}): Promise<any> {
    try {
      const language = options.language || "en";
      const generatedData = await generateExpressionJson(prompt, language);
      
      // Return the generated data without saving to database
      // The frontend will decide whether to save it or not
      return {
        success: true,
        data: generatedData,
        message: "Expression generated successfully"
      };
    } catch (error: any) {
      throw new Error(`Error generating expression: ${error.message}`);
    }
  }
} 