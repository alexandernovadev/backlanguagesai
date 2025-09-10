import Expression from "../../db/models/Expression";
import { IExpression, ChatMessage } from "../../../../types/models";

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

    if (filters.hasContext === "true") {
      filter.context = { $exists: true, $ne: null, $nin: ["", null] };
    } else if (filters.hasContext === "false") {
      filter.$or = filter.$or || [];
      filter.$or.push(
        { context: { $exists: false } },
        { context: null },
        { context: "" }
      );
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

  async updateExpressionImg(
    id: string,
    img: string
  ): Promise<{ _id: string; img?: string; updatedAt: Date } | null> {
    return await Expression.findByIdAndUpdate(
      id,
      { img },
      {
        new: true,
        projection: { _id: 1, img: 1, updatedAt: 1 },
      }
    );
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
    return await Expression.find({})
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  // Import expressions from JSON data
  async importExpressions(expressions: any[], config: {
    duplicateStrategy: 'skip' | 'overwrite' | 'error' | 'merge';
    batchSize?: number;
  }): Promise<{
    totalItems: number;
    totalInserted: number;
    totalUpdated: number;
    totalSkipped: number;
    totalErrors: number;
    batches: any[];
    summary: {
      success: boolean;
      message: string;
      duration: number;
    };
  }> {
    const startTime = Date.now();
    const batches: any[] = [];
    let totalInserted = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    const batchSize = config.batchSize || 10;

    for (let i = 0; i < expressions.length; i += batchSize) {
      const batchExpressions = expressions.slice(i, i + batchSize);
      const batchIndex = Math.floor(i / batchSize);
      let batchInserted = 0;
      let batchUpdated = 0;
      let batchSkipped = 0;
      let batchErrors = 0;

      for (const expressionData of batchExpressions) {
        try {
          // Check for duplicates by expression text
          const existingExpression = await Expression.findOne({
            expression: expressionData.expression
          });

          if (existingExpression) {
            switch (config.duplicateStrategy) {
              case 'error':
                batchErrors++;
                totalErrors++;
                break;
              case 'skip':
                batchSkipped++;
                totalSkipped++;
                break;
              case 'overwrite':
              case 'merge':
                // Remove _id to avoid conflicts
                const { _id, ...updateData } = expressionData;
                await Expression.findByIdAndUpdate(existingExpression._id, updateData, { new: true });
                batchUpdated++;
                totalUpdated++;
                break;
            }
          } else {
            // Create new expression
            const newExpression = new Expression(expressionData);
            await newExpression.save();
            batchInserted++;
            totalInserted++;
          }
        } catch (error) {
          batchErrors++;
          totalErrors++;
        }
      }

      batches.push({
        batchIndex,
        processed: batchExpressions.length,
        inserted: batchInserted,
        updated: batchUpdated,
        skipped: batchSkipped,
        errors: batchErrors,
      });
    }

    const duration = Date.now() - startTime;
    return {
      totalItems: expressions.length,
      totalInserted,
      totalUpdated,
      totalSkipped,
      totalErrors,
      batches,
      summary: {
        success: totalErrors === 0,
        message: `Import completed. ${totalInserted} inserted, ${totalUpdated} updated, ${totalSkipped} skipped, ${totalErrors} errors`,
        duration,
      },
    };
  }
} 