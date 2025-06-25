import { Request, Response } from "express";
import { QuestionService } from "../services/questions/questionService";
import { QuestionValidator } from "../utils/validators/questionValidator";
import { errorResponse, successResponse } from "../utils/responseHelpers";

const questionService = new QuestionService();

export const createQuestion = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const questionData = req.body;
    
    // Validate question data
    const validation = QuestionValidator.validateQuestion(questionData, 0);
    if (!validation.isValid) {
      return errorResponse(res, `Validation error: ${validation.errors.join(', ')}`, 400);
    }

    const newQuestion = await questionService.createQuestion(questionData);
    return successResponse(res, "Question created successfully", newQuestion, 201);
  } catch (error) {
    if (error.name === "ValidationError") {
      return errorResponse(res, "Validation error: " + error.message, 400);
    }
    return errorResponse(
      res,
      "An error occurred while creating the question",
      500,
      error
    );
  }
};

export const getQuestionById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const question = await questionService.getQuestionById(id);
    
    if (!question) {
      return errorResponse(res, "Question not found", 404);
    }

    return successResponse(res, "Question retrieved successfully", question);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving the question",
      500,
      error
    );
  }
};

export const getQuestions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string) || 10, 1);

    // Filters
    const level = req.query.level as string;
    const type = req.query.type as string;
    const topic = req.query.topic as string;
    const tags = req.query.tags as string;
    const difficulty = req.query.difficulty as string;
    const hasMedia = req.query.hasMedia as string;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';
    const createdAfter = req.query.createdAfter as string;
    const createdBefore = req.query.createdBefore as string;

    // Process filters that can have multiple values
    const levels = level ? level.split(',').map(l => l.trim()) : undefined;
    const types = type ? type.split(',').map(t => t.trim()) : undefined;
    const tagsArray = tags ? tags.split(',').map(t => t.trim()) : undefined;
    
    // Process difficulty filter
    let difficultyFilter: number | { min: number; max: number } | undefined;
    if (difficulty) {
      if (difficulty.includes('-')) {
        const [min, max] = difficulty.split('-').map(d => parseInt(d.trim()));
        if (!isNaN(min) && !isNaN(max)) {
          difficultyFilter = { min, max };
        }
      } else {
        const diff = parseInt(difficulty);
        if (!isNaN(diff)) {
          difficultyFilter = diff;
        }
      }
    }

    // Process hasMedia filter
    let hasMediaFilter: boolean | undefined;
    if (hasMedia === 'true') {
      hasMediaFilter = true;
    } else if (hasMedia === 'false') {
      hasMediaFilter = false;
    }

    const questions = await questionService.getQuestions({
      page,
      limit,
      level: levels,
      type: types,
      topic,
      tags: tagsArray,
      difficulty: difficultyFilter,
      hasMedia: hasMediaFilter,
      sortBy,
      sortOrder,
      createdAfter,
      createdBefore
    });

    return successResponse(res, "Questions retrieved successfully", questions);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving questions",
      500,
      error
    );
  }
};

export const updateQuestion = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate update data
    const validation = QuestionValidator.validateQuestion(updateData, 0);
    if (!validation.isValid) {
      return errorResponse(res, `Validation error: ${validation.errors.join(', ')}`, 400);
    }

    const updatedQuestion = await questionService.updateQuestion(id, updateData);
    if (!updatedQuestion) {
      return errorResponse(res, "Question not found", 404);
    }

    return successResponse(res, "Question updated successfully", updatedQuestion);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while updating the question",
      500,
      error
    );
  }
};

export const deleteQuestion = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const deletedQuestion = await questionService.deleteQuestion(id);
    
    if (!deletedQuestion) {
      return errorResponse(res, "Question not found", 404);
    }

    return successResponse(res, "Question deleted successfully", deletedQuestion);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while deleting the question",
      500,
      error
    );
  }
};

export const getQuestionsByLevelAndType = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { level, type } = req.params;
    const questions = await questionService.findByLevelAndType(level, type);
    
    return successResponse(res, "Questions retrieved successfully", questions);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving questions",
      500,
      error
    );
  }
};

export const getQuestionsByTopic = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { topic } = req.params;
    const questions = await questionService.findByTopic(topic);
    
    return successResponse(res, "Questions retrieved successfully", questions);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving questions",
      500,
      error
    );
  }
};

export const getQuestionsByTags = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { tags } = req.params;
    const tagsArray = tags.split(',').map(t => t.trim());
    const questions = await questionService.findByTags(tagsArray);
    
    return successResponse(res, "Questions retrieved successfully", questions);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving questions",
      500,
      error
    );
  }
};

export const getRandomQuestions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { level, type } = req.params;
    const limit = Math.max(parseInt(req.query.limit as string) || 5, 1);
    
    const questions = await questionService.getRandomQuestions(level, type, limit);
    
    return successResponse(res, "Random questions retrieved successfully", questions);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving random questions",
      500,
      error
    );
  }
};

export const getQuestionStats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const stats = await questionService.getQuestionStats();
    
    return successResponse(res, "Question statistics retrieved successfully", stats);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving question statistics",
      500,
      error
    );
  }
};

export const getQuestionsForLevel = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { level } = req.params;
    const limit = Math.max(parseInt(req.query.limit as string) || 10, 1);
    
    const questions = await questionService.getQuestionsForLevel(level, limit);
    
    return successResponse(res, "Questions for level retrieved successfully", questions);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving questions for level",
      500,
      error
    );
  }
}; 