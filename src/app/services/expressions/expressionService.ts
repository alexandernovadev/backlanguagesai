import Expression, { IExpression, ChatMessage } from "../../db/models/Expression";

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export class ExpressionService {
  // Create a new expression
  async createExpression(expressionData: IExpression): Promise<IExpression> {
    const expression = new Expression(expressionData);
    return await expression.save();
  }

  // Get an expression by ID
  async getExpressionById(id: string): Promise<IExpression | null> {
    return await Expression.findById(id);
  }

  // Get all expressions with pagination and filters
  async getExpressions(
    filters: {
      page?: number;
      limit?: number;
      expression?: string;
      definition?: string;
      difficulty?: string | string[];
      language?: string | string[];
      type?: string | string[];
      context?: string;
      hasImage?: string;
      hasExamples?: string;
      spanishExpression?: string;
      spanishDefinition?: string;
      createdAfter?: string;
      createdBefore?: string;
      updatedAfter?: string;
      updatedBefore?: string;
      sortBy?: string;
      sortOrder?: string;
    } = {}
  ): Promise<PaginatedResult<IExpression>> {
    const {
      page = 1,
      limit = 10,
      expression,
      definition,
      difficulty,
      language,
      type,
      context,
      hasImage,
      hasExamples,
      spanishExpression,
      spanishDefinition,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const filter: Record<string, unknown> & { $or?: unknown[] } = {};

    // Filtro por expresión
    if (expression) {
      filter.expression = { $regex: expression, $options: "i" };
    }

    // Filtro por definición
    if (definition) {
      filter.definition = { $regex: definition, $options: "i" };
    }

    // Filtro por dificultad
    if (difficulty) {
      if (Array.isArray(difficulty)) {
        const validDifficulties = difficulty.filter(d => ['easy', 'medium', 'hard'].includes(d));
        if (validDifficulties.length > 0) {
          filter.difficulty = { $in: validDifficulties };
        }
      } else {
        if (['easy', 'medium', 'hard'].includes(difficulty)) {
          filter.difficulty = difficulty;
        }
      }
    }

    // Filtro por idioma
    if (language) {
      if (Array.isArray(language)) {
        filter.language = { $in: language };
      } else {
        filter.language = language;
      }
    }

    // Filtro por tipo
    if (type) {
      if (Array.isArray(type)) {
        filter.type = { $in: type };
      } else {
        filter.type = type;
      }
    }

    // Filtro por contexto
    if (context) {
      filter.context = { $regex: context, $options: "i" };
    }

    // Filtro por imagen
    if (hasImage === 'true') {
      filter.img = { $exists: true, $ne: null };
    } else if (hasImage === 'false') {
      if (!filter.$or) filter.$or = [];
      filter.$or.push(
        { img: { $exists: false } },
        { img: null },
        { img: '' }
      );
    }

    // Filtro por ejemplos
    if (hasExamples === 'true') {
      filter.examples = { $exists: true, $ne: [], $size: { $gt: 0 } };
    } else if (hasExamples === 'false') {
      if (!filter.$or) filter.$or = [];
      filter.$or.push(
        { examples: { $exists: false } },
        { examples: [] },
        { examples: { $size: 0 } }
      );
    }

    // Filtro por expresión en español
    if (spanishExpression) {
      filter['spanish.expression'] = { $regex: spanishExpression, $options: "i" };
    }

    // Filtro por definición en español
    if (spanishDefinition) {
      filter['spanish.definition'] = { $regex: spanishDefinition, $options: "i" };
    }

    // Filtros de fecha
    if (createdAfter) {
      filter.createdAt = { $gte: new Date(createdAfter) };
    }
    if (createdBefore) {
      if (filter.createdAt) {
        (filter.createdAt as any).$lte = new Date(createdBefore);
      } else {
        filter.createdAt = { $lte: new Date(createdBefore) };
      }
    }
    if (updatedAfter) {
      filter.updatedAt = { $gte: new Date(updatedAfter) };
    }
    if (updatedBefore) {
      if (filter.updatedAt) {
        (filter.updatedAt as any).$lte = new Date(updatedBefore);
      } else {
        filter.updatedAt = { $lte: new Date(updatedBefore) };
      }
    }

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      Expression.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      Expression.countDocuments(filter)
    ]);

    const pages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      pages
    };
  }

  // Update an expression
  async updateExpression(
    id: string,
    updateData: Partial<IExpression>
  ): Promise<IExpression | null> {
    return await Expression.findByIdAndUpdate(id, updateData, { new: true });
  }

  // Delete an expression
  async deleteExpression(id: string): Promise<IExpression | null> {
    return await Expression.findByIdAndDelete(id);
  }

  // Find expression by expression text
  async findExpressionByExpression(expression: string): Promise<IExpression | null> {
    return await Expression.findOne({ expression: { $regex: new RegExp(expression, 'i') } });
  }

  // Chat methods
  async addChatMessage(expressionId: string, message: string): Promise<IExpression | null> {
    const expression = await Expression.findById(expressionId);
    if (!expression) return null;

    // Create user message
    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: "user",
      content: message,
      timestamp: new Date()
    };

    // TODO: Here you would call GPT API to get response
    // For now, we'll create a mock response
    const assistantMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: "assistant",
      content: `Respuesta a: "${message}" - Esta es una respuesta simulada. En producción, aquí iría la respuesta real de GPT.`,
      timestamp: new Date()
    };

    // Add messages to chat
    expression.chat = expression.chat || [];
    expression.chat.push(userMessage, assistantMessage);
    
    return await expression.save();
  }

  async getChatHistory(expressionId: string): Promise<ChatMessage[]> {
    const expression = await Expression.findById(expressionId);
    return expression?.chat || [];
  }

  async clearChatHistory(expressionId: string): Promise<IExpression | null> {
    return await Expression.findByIdAndUpdate(
      expressionId,
      { chat: [] },
      { new: true }
    );
  }

  // Get expressions by type
  async getExpressionsByType(type: string, limit: number = 10, search?: string): Promise<IExpression[]> {
    const filter: any = { type: type };
    if (search) {
      filter.expression = { $regex: search, $options: "i" };
    }
    
    return await Expression.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  // Get expressions only (for performance)
  async getExpressionsOnly(filters: {
    page?: number;
    limit?: number;
    expression?: string;
    difficulty?: string | string[];
    language?: string | string[];
    type?: string | string[];
    fields?: string;
  } = {}): Promise<PaginatedResult<{ expression: string }>> {
    const {
      page = 1,
      limit = 10,
      expression,
      difficulty,
      language,
      type,
      fields = "expression"
    } = filters;

    const filter: Record<string, unknown> = {};

    if (expression) {
      filter.expression = { $regex: expression, $options: "i" };
    }
    if (difficulty) {
      if (Array.isArray(difficulty)) {
        filter.difficulty = { $in: difficulty };
      } else {
        filter.difficulty = difficulty;
      }
    }
    if (language) {
      if (Array.isArray(language)) {
        filter.language = { $in: language };
      } else {
        filter.language = language;
      }
    }
    if (type) {
      if (Array.isArray(type)) {
        filter.type = { $in: type };
      } else {
        filter.type = type;
      }
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Expression.find(filter)
        .select(fields)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Expression.countDocuments(filter)
    ]);

    const pages = Math.ceil(total / limit);

    return {
      data: data.map(item => ({ expression: item.expression })),
      total,
      page,
      pages
    };
  }

  // Export all expressions
  async getAllExpressionsForExport(): Promise<IExpression[]> {
    return await Expression.find({}).sort({ createdAt: -1 }).exec();
  }
} 