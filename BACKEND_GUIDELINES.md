# Backend Guidelines - LanguageAI

## 🏗️ Architecture & Structure

### 1. Separation of Concerns
- **ALWAYS separate** Controller, Service, and Routes
- **Controller**: Handle HTTP requests/responses, validation, and logging
- **Service**: Business logic, database operations, and data processing
- **Routes**: Define endpoints and middleware

```typescript
// ✅ CORRECT - Controller (src/app/controllers/expressionController.ts)
export const createExpression = async (req: Request, res: Response) => {
  try {
    const expression = await expressionService.createExpression(req.body);
    return successResponse(res, "Expression created successfully", expression, 201);
  } catch (error: any) {
    logger.error("Error creating expression:", error);
    return errorResponse(res, error.message, 400, error);
  }
};

// ✅ CORRECT - Service (src/app/services/expressions/expressionService.ts)
export class ExpressionService {
  async createExpression(expressionData: IExpression): Promise<IExpression> {
    const expression = new Expression(expressionData);
    return await expression.save();
  }
}

// ✅ CORRECT - Routes (src/app/routes/expressionRoutes.ts)
router.post("/", createExpression);
```

### 2. Response Helpers
- **ALWAYS use** `successResponse` and `errorResponse` from `src/app/utils/responseHelpers.ts`
- **NEVER return raw responses**

```typescript
// ✅ CORRECT
import { successResponse, errorResponse } from "../utils/responseHelpers";

export const getExpression = async (req: Request, res: Response) => {
  try {
    const expression = await expressionService.getExpressionById(req.params.id);
    if (!expression) {
      return errorResponse(res, "Expression not found", 404);
    }
    return successResponse(res, "Expression retrieved successfully", expression);
  } catch (error: any) {
    logger.error("Error getting expression:", error);
    return errorResponse(res, error.message, 500, error);
  }
};
```

## 📝 Logging

### 3. Structured Logging
- **ALWAYS use** the centralized logger from `src/app/utils/logger.ts`
- **ALWAYS structure** logs with consistent format and context
- **ALWAYS include** relevant metadata (user, operation, timestamps)

```typescript
// ✅ CORRECT - Well-structured logging
import logger from "../utils/logger";

export const updateExpression = async (req: Request, res: Response) => {
  const operationId = Math.random().toString(36).substr(2, 9);
  const startTime = Date.now();
  
  try {
    // 1. Log operation start with context
    logger.info("Expression update started", {
      operationId,
      userId: req.user?.id,
      expressionId: req.params.id,
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    
    // 2. Validate and log validation
    if (!req.body.expression) {
      logger.warn("Validation failed - missing expression field", {
        operationId,
        expressionId: req.params.id,
        providedFields: Object.keys(req.body),
        timestamp: new Date().toISOString()
      });
      return errorResponse(res, "Expression field is required", 400);
    }
    
    // 3. Call service and log result
    const expression = await expressionService.updateExpression(req.params.id, req.body);
    
    if (!expression) {
      logger.warn("Expression not found for update", {
        operationId,
        expressionId: req.params.id,
        searchCriteria: { id: req.params.id },
        timestamp: new Date().toISOString()
      });
      return errorResponse(res, "Expression not found", 404);
    }
    
    // 4. Log successful operation with metrics
    const duration = Date.now() - startTime;
    logger.info("Expression updated successfully", {
      operationId,
      expressionId: expression._id,
      updatedFields: Object.keys(req.body),
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
    
    return successResponse(res, "Expression updated successfully", expression);
  } catch (error: any) {
    // 5. Log error with full context and stack
    const duration = Date.now() - startTime;
    logger.error("Expression update failed", {
      operationId,
      expressionId: req.params.id,
      error: {
        message: error.message,
        name: error.name,
        code: error.code,
        stack: error.stack
      },
      request: {
        method: req.method,
        path: req.path,
        body: req.body,
        params: req.params,
        query: req.query,
        headers: {
          'user-agent': req.get('User-Agent'),
          'content-type': req.get('Content-Type'),
          'authorization': req.get('Authorization') ? 'Bearer ***' : undefined
        }
      },
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
    
    return errorResponse(res, error.message, 400, error);
  }
};
```

### 4. Log Levels and Structure
```typescript
// ✅ CORRECT - Log levels usage
logger.debug("Debug information", { data: "for development" });
logger.info("General information", { operation: "user action" });
logger.warn("Warning message", { issue: "potential problem" });
logger.error("Error occurred", { error: "detailed error info" });

// ✅ CORRECT - Structured log object
const logContext = {
  operationId: "unique-id",
  userId: req.user?.id,
  resourceId: req.params.id,
  action: "create|update|delete|read",
  method: req.method,
  path: req.path,
  duration: "123ms",
  timestamp: new Date().toISOString(),
  metadata: {
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    version: "1.0.0"
  }
};
```

## 📚 Swagger Documentation

### 4. API Documentation
- **ALWAYS document** all endpoints with Swagger
- **ALWAYS verify** and test with Swagger UI
- **ALWAYS include** request/response schemas

```yaml
# ✅ CORRECT - src/swagger/routes/expressions.yaml
openapi: 3.0.0
info:
  title: Expressions API
  version: 1.0.0

paths:
  /api/expressions:
    get:
      summary: Get all expressions with pagination and filters
      tags: [Expressions]
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
      responses:
        '200':
          description: List of expressions
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaginatedExpressions'
```

## 🧩 Code Style

### 5. Avoid Classes When Possible
- **PREFER functional programming** over classes
- **USE classes only** for complex services with multiple methods
- **USE functions** for simple operations

```typescript
// ✅ CORRECT - Functional approach
export const createUser = async (userData: IUser): Promise<IUser> => {
  const user = new User(userData);
  return await user.save();
};

// ✅ CORRECT - Class for complex services
export class ExpressionService {
  async createExpression(data: IExpression): Promise<IExpression> {
    // Complex business logic
  }
  
  async updateExpression(id: string, data: Partial<IExpression>): Promise<IExpression | null> {
    // Complex update logic
  }
}
```

## 🤖 AI Services

### 6. AI Prompts Organization
- **ALWAYS put AI prompts** in `src/app/services/ai/` directory
- **ALWAYS separate** different AI functionalities
- **ALWAYS use descriptive names** for AI services

```typescript
// ✅ CORRECT - AI service structure
src/app/services/ai/
├── generateExpressionJson.ts
├── generateExpressionChatResponse.ts
├── generateExpressionChatStream.ts
├── generateWordJson.ts
├── generateExamStream.ts
└── helpers/
    └── promptTemplates.ts

// ✅ CORRECT - AI service example
export const generateExpressionJson = async (prompt: string): Promise<any> => {
  // AI logic here
  return await aiService.generate(prompt);
};
```

## 📁 File Organization

### 7. Directory Structure
```
src/app/
├── controllers/          # HTTP request handlers
├── services/            # Business logic
│   ├── ai/             # AI services
│   ├── expressions/     # Expression services
│   ├── words/          # Word services
│   └── users/          # User services
├── routes/              # Route definitions
├── middlewares/         # Custom middlewares
├── utils/               # Utility functions
│   ├── responseHelpers.ts
│   ├── logger.ts
│   └── validators/
└── db/                  # Database models
```

### 8. Import Organization
```typescript
// ✅ CORRECT - Organized imports
// Express & Types
import { Request, Response } from "express";

// Services
import { ExpressionService } from "../services/expressions/expressionService";

// Utils
import { successResponse, errorResponse } from "../utils/responseHelpers";
import logger from "../utils/logger";

// Models
import { IExpression } from "../db/models/Expression";
```

## 🔧 Error Handling

### 9. Consistent Error Handling
```typescript
// ✅ CORRECT - Standard error handling pattern with structured logging
export const someController = async (req: Request, res: Response) => {
  const operationId = Math.random().toString(36).substr(2, 9);
  const startTime = Date.now();
  
  try {
    // 1. Log operation start
    logger.info("Operation started", {
      operationId,
      userId: req.user?.id,
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString()
    });
    
    // 2. Validate input
    if (!req.body.requiredField) {
      logger.warn("Validation failed", {
        operationId,
        missingField: "requiredField",
        providedFields: Object.keys(req.body),
        timestamp: new Date().toISOString()
      });
      return errorResponse(res, "Required field is missing", 400);
    }
    
    // 3. Call service
    const result = await someService.doSomething(req.body);
    
    // 4. Log success with metrics
    const duration = Date.now() - startTime;
    logger.info("Operation completed successfully", {
      operationId,
      resultId: result._id,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
    
    // 5. Return success response
    return successResponse(res, "Operation successful", result);
  } catch (error: any) {
    // 6. Log error with full context
    const duration = Date.now() - startTime;
    logger.error("Operation failed", {
      operationId,
      error: {
        message: error.message,
        name: error.name,
        code: error.code,
        stack: error.stack
      },
      request: {
        method: req.method,
        path: req.path,
        body: req.body,
        params: req.params
      },
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
    
    // 7. Return error response
    return errorResponse(res, error.message, 500, error);
  }
};
```

## 📋 Checklist for New Endpoints

- [ ] Separate controller, service, and routes
- [ ] Use successResponse and errorResponse
- [ ] Add proper logging with context
- [ ] Document with Swagger
- [ ] Avoid classes when possible
- [ ] Put AI prompts in services/ai/
- [ ] Organize imports properly
- [ ] Add error handling with try-catch
- [ ] Test with Swagger UI
- [ ] Follow naming conventions
- [ ] Add input validation
- [ ] Implement proper error codes
- [ ] Add rate limiting where needed OPTIONAL , conversar con el user,
- [ ] Consider caching strategies OPTIONAL , conversar con el user,
- [ ] Update API documentation

## 🔧 Validation & Security

### 10. Input Validation
- **ALWAYS validate** input data before processing
- **ALWAYS use** proper validation libraries (Joi, Yup, or custom validators)
- **ALWAYS sanitize** user input to prevent injection attacks

```typescript
// ✅ CORRECT - Input validation
import Joi from 'joi';

const expressionSchema = Joi.object({
  expression: Joi.string().required().min(1).max(200),
  definition: Joi.string().required().min(1).max(1000),
  language: Joi.string().required().valid('en', 'es'),
  difficulty: Joi.string().valid('easy', 'medium', 'hard'),
  type: Joi.array().items(Joi.string().valid('idiom', 'phrase', 'collocation'))
});

export const createExpression = async (req: Request, res: Response) => {
  try {
    // Validate input
    const { error, value } = expressionSchema.validate(req.body);
    if (error) {
      logger.warn("Validation failed", { 
        errors: error.details,
        providedData: req.body 
      });
      return errorResponse(res, "Invalid input data", 400, error.details);
    }
    
    // Process validated data
    const expression = await expressionService.createExpression(value);
    return successResponse(res, "Expression created successfully", expression, 201);
  } catch (error: any) {
    logger.error("Error creating expression:", error);
    return errorResponse(res, error.message, 500, error);
  }
};
```

### 11. Error Codes & Messages
- **ALWAYS use** consistent HTTP status codes
- **ALWAYS provide** meaningful error messages
- **ALWAYS include** error codes for frontend handling

```typescript
// ✅ CORRECT - Consistent error codes
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 400,
  errorCode?: string,
  details?: any
) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
    code: errorCode || 'UNKNOWN_ERROR',
    details: details || null
  });
};
```

## 🚀 Performance & Optimization

### 12. Caching Strategies
- **ALWAYS consider** caching for frequently accessed data
- **ALWAYS implement** proper cache invalidation
- **ALWAYS monitor** cache hit rates

```typescript
// ✅ CORRECT - Caching implementation
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

export const getExpressions = async (req: Request, res: Response) => {
  const cacheKey = `expressions:${JSON.stringify(req.query)}`;
  
  try {
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.info("Cache hit", { cacheKey });
      return successResponse(res, "Expressions retrieved from cache", cached);
    }
    
    // Fetch from database
    const result = await expressionService.getExpressions(req.query);
    
    // Cache the result
    cache.set(cacheKey, result);
    logger.info("Cache miss - data cached", { cacheKey });
    
    return successResponse(res, "Expressions retrieved successfully", result);
  } catch (error: any) {
    logger.error("Error getting expressions:", error);
    return errorResponse(res, error.message, 500, error);
  }
};
```

### 13. Rate Limiting
- **ALWAYS implement** rate limiting for public endpoints
- **ALWAYS configure** different limits for different user types
- **ALWAYS log** rate limit violations

```typescript
// ✅ CORRECT - Rate limiting
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to all routes
app.use('/api/', apiLimiter);
```

## 🧪 Testing

### 14. Unit Testing
- **ALWAYS write** unit tests for services
- **ALWAYS test** error scenarios
- **ALWAYS mock** external dependencies

```typescript
// ✅ CORRECT - Unit test example
import { ExpressionService } from '../services/expressions/expressionService';

describe('ExpressionService', () => {
  let expressionService: ExpressionService;
  
  beforeEach(() => {
    expressionService = new ExpressionService();
  });
  
  it('should create expression successfully', async () => {
    const expressionData = {
      expression: 'test expression',
      definition: 'test definition',
      language: 'en'
    };
    
    const result = await expressionService.createExpression(expressionData);
    expect(result.expression).toBe(expressionData.expression);
  });
  
  it('should handle validation errors', async () => {
    const invalidData = { expression: '' };
    
    await expect(expressionService.createExpression(invalidData))
      .rejects.toThrow('Expression is required');
  });
});
```

## 🔗 Related Files

- `src/app/utils/responseHelpers.ts` - Response helper functions
- `src/app/utils/logger.ts` - Centralized logging
- `src/app/services/ai/` - AI services directory
- `src/swagger/` - API documentation
- `src/app/controllers/` - HTTP controllers
- `src/app/services/` - Business logic services
- `src/app/routes/` - Route definitions
- `src/app/middlewares/` - Custom middlewares
- `src/app/utils/validators/` - Input validation schemas
- `tests/` - Unit and integration tests

---

**Remember:** Always read this file before making changes to maintain consistency across the backend! 🚀 