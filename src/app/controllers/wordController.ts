import { Request, Response } from "express";
import { WordService } from "../services/words/wordService";
import { WordImportService } from "../services/import/WordImportService";
import { WordStatisticsService } from "../services/statistics/WordStatisticsService";
import { errorResponse, successResponse } from "../utils/responseHelpers";
import { generateWordChatStream } from "../services/ai/generateWordChatStream";
import logger from "../utils/logger";

const wordService = new WordService();
const wordImportService = new WordImportService();
const wordStatisticsService = new WordStatisticsService();

export const getWordByName = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Forzamos el tipo a `string`, y si es un array, tomamos el primer elemento.
    const word = (req.params.word || req.query.word) as string | undefined;

    // Verificamos que `word` sea un `string` y no esté vacío.
    if (!word || Array.isArray(word)) {
      return errorResponse(res, "A single word parameter is required");
    }

    const foundWord = await wordService.findWordByWord(word);
    if (!foundWord) {
      return errorResponse(res, "Word not found", 404);
    }

    return successResponse(res, "Get Word successFully", foundWord);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while getting the word",
      500,
      error
    );
  }
};

export const createWord = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const wordData = req.body;
    const newWord = await wordService.createWord(wordData);

    return successResponse(res, "Word created successfully", newWord, 201);
  } catch (error) {
    if (error.name === "ValidationError") {
      return errorResponse(res, "Validation error" + error);
    }
    return errorResponse(
      res,
      "An error occurred while creating the word ",
      500,
      error
    );
  }
};

export const getWordById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const word = await wordService.getWordById(id);
    if (!word) {
      return errorResponse(res, "Word not found", 404);
    }

    return successResponse(res, "Word listed by Id successfully", word);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving the word",
      500,
      error
    );
  }
};

export const getWords = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string) || 10, 1);

    // Filtros existentes
    const wordUser = req.query.wordUser as string;
    
    // Nuevos filtros básicos
    const level = req.query.level as string;
    const language = req.query.language as string;
    const type = req.query.type as string;
    const seenMin = req.query.seenMin ? parseInt(req.query.seenMin as string) : undefined;
    const seenMax = req.query.seenMax ? parseInt(req.query.seenMax as string) : undefined;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';

    // Nuevos filtros de contenido
    const definition = req.query.definition as string;
    const IPA = req.query.IPA as string;
    const hasImage = req.query.hasImage as string;
    const hasExamples = req.query.hasExamples as string;
    const hasSynonyms = req.query.hasSynonyms as string;
    const hasCodeSwitching = req.query.hasCodeSwitching as string;
    const spanishWord = req.query.spanishWord as string;
    const spanishDefinition = req.query.spanishDefinition as string;

    // Filtros de fecha
    const createdAfter = req.query.createdAfter as string;
    const createdBefore = req.query.createdBefore as string;
    const updatedAfter = req.query.updatedAfter as string;
    const updatedBefore = req.query.updatedBefore as string;

    // Procesar filtros que pueden tener múltiples valores
    const levels = level ? level.split(',').map(l => l.trim()) : undefined;
    const languages = language ? language.split(',').map(l => l.trim()) : undefined;
    const types = type ? type.split(',').map(t => t.trim()) : undefined;

    const wordList = await wordService.getWords({
      page,
      limit,
      wordUser,
      level: levels,
      language: languages,
      type: types,
      seenMin,
      seenMax,
      sortBy,
      sortOrder,
      definition,
      IPA,
      hasImage,
      hasExamples,
      hasSynonyms,
      hasCodeSwitching,
      spanishWord,
      spanishDefinition,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore
    });

    return successResponse(res, "Words sucessfully listed", wordList);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving the word",
      500,
      error
    );
  }
};

export const updateWord = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedWord = await wordService.updateWord(id, updateData);
    if (!updatedWord) {
      return errorResponse(res, "Word not found", 404);
    }
    return successResponse(res, "Word updated successfully", updatedWord);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while updating the word ",
      500,
      error
    );
  }
};

export const updateWordLevel = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const level = req.body.level;

    const updatedWord = await wordService.updateWordLevel(id, level);
    if (!updatedWord) {
      return errorResponse(res, "Word not found", 404);
    }

    return successResponse(res, "Word level updated successfully", updatedWord);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while updating level the word ",
      500,
      error
    );
  }
};

export const deleteWord = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const deletedWord = await wordService.deleteWord(id);
    if (!deletedWord) {
      return errorResponse(res, "Word no found by ID: " + id, 403);
    }

    return successResponse(res, "Word deleted successfully", {});
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while deleting the word",
      500,
      error
    );
  }
};

export const getRecentHardOrMediumWords = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const words = await wordService.getRecentHardOrMediumWords();
    return successResponse(
      res,
      "List Recent Hard Or Medium Words successfully",
      words
    );
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving recent hard or medium words",
      500,
      error
    );
  }
};

export const getWordsByType = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { type } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const words = await wordService.getWordsByType(type, limit, search);
    return successResponse(res, `Words of type ${type} retrieved successfully`, words);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving words by type",
      500,
      error
    );
  }
};

export const getWordsByTypeOptimized = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const type = req.query.type as string;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.wordUser as string;
    const fields = req.query.fields as string;

    if (!type) {
      return errorResponse(res, "Type parameter is required", 400);
    }

    const words = await wordService.getWordsByTypeOptimized(type, limit, search, fields);
    return successResponse(res, `Words of type ${type} retrieved successfully`, words);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving words by type",
      500,
      error
    );
  }
};

export const getWordsOnly = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string) || 10, 1);
    const fields = req.query.fields as string;

    // Filtros básicos
    const wordUser = req.query.wordUser as string;
    const level = req.query.level as string;
    const language = req.query.language as string;
    const type = req.query.type as string;

    // Procesar filtros que pueden tener múltiples valores
    const levels = level ? level.split(',').map(l => l.trim()) : undefined;
    const languages = language ? language.split(',').map(l => l.trim()) : undefined;
    const types = type ? type.split(',').map(t => t.trim()) : undefined;

    const wordList = await wordService.getWordsOnly({
      page,
      limit,
      wordUser,
      level: levels,
      language: languages,
      type: types,
      fields
    });

    return successResponse(res, "Words retrieved successfully", wordList);
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving words",
      500,
      error
    );
  }
};

// Nuevo endpoint para obtener palabras para repaso inteligente
export const getWordsForReview = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const words = await wordService.getWordsForReview(limit);
    return successResponse(
      res,
      "Words for review retrieved successfully",
      words
    );
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving words for review",
      500,
      error
    );
  }
};

// Nuevo endpoint para actualizar el progreso de repaso de una palabra
export const updateWordReview = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { wordId } = req.params;
    const { difficulty, quality } = req.body;

    if (!wordId || !difficulty || !quality) {
      return errorResponse(res, "wordId, difficulty, and quality are required", 400);
    }

    if (difficulty < 1 || difficulty > 5 || quality < 1 || quality > 5) {
      return errorResponse(res, "difficulty and quality must be between 1 and 5", 400);
    }

    const updatedWord = await wordService.updateWordReview(wordId, difficulty, quality);
    
    if (!updatedWord) {
      return errorResponse(res, "Word not found", 404);
    }

    return successResponse(
      res,
      "Word review updated successfully",
      updatedWord
    );
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while updating word review",
      500,
      error
    );
  }
};

// Nuevo endpoint para obtener estadísticas de repaso
export const getReviewStats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const stats = await wordService.getReviewStats();
    return successResponse(
      res,
      "Review statistics retrieved successfully",
      stats
    );
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while retrieving review statistics",
      500,
      error
    );
  }
};

export const updateIncrementWordSeens = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const updatedWord = await wordService.incrementWordSeen(id);

    if (!updatedWord) {
      return errorResponse(res, "Word Not Found ", 404);
    }

    return successResponse(
      res,
      "Word seen count incremented successfully",
      updatedWord
    );
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while incrementing the word seen count",
      500,
      error
    );
  }
};

export const exportWordsToJSON = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const words = await wordService.getAllWordsForExport();

    // Set headers for file download
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `words-export-${timestamp}.json`;

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Send the JSON data
    return res.json({
      success: true,
      message: `Exported ${words.length} words successfully`,
      data: {
        totalWords: words.length,
        exportDate: new Date().toISOString(),
        words: words,
      },
    });
  } catch (error) {
    return errorResponse(
      res,
      "An error occurred while exporting words to JSON",
      500,
      error
    );
  }
};

export const importWordsFromFile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    if (!req.file) {
      return errorResponse(res, "No file uploaded", 400);
    }

    // Parse the JSON file content
    let fileData: any;
    try {
      const fileContent = req.file.buffer.toString("utf-8");
      fileData = JSON.parse(fileContent);
    } catch (parseError) {
      return errorResponse(res, "Invalid JSON file format", 400);
    }

    // Validate file structure - handle both direct and nested structures
    let words: any[] = [];
    
    // Try to find words in different possible structures
    if (fileData.data?.words && Array.isArray(fileData.data.words)) {
      // Direct structure: data.words
      words = fileData.data.words;
    } else if (fileData.data?.data?.words && Array.isArray(fileData.data.data.words)) {
      // Nested structure: data.data.words (from export)
      words = fileData.data.data.words;
    } else if (fileData.words && Array.isArray(fileData.words)) {
      // Root level: words
      words = fileData.words;
    } else {
      return errorResponse(
        res,
        "Invalid file structure. Expected 'data.words' or 'data.data.words' array",
        400
      );
    }
    const {
      duplicateStrategy = "skip",
      validateOnly = false,
      batchSize = 10,
    } = req.query;

    // Validate duplicateStrategy
    const validStrategies = ["skip", "overwrite", "error", "merge"];
    if (!validStrategies.includes(duplicateStrategy as string)) {
      return errorResponse(
        res,
        `Invalid duplicateStrategy. Must be one of: ${validStrategies.join(
          ", "
        )}`,
        400
      );
    }

    // Validate batchSize
    const batchSizeNum = parseInt(batchSize as string);
    if (isNaN(batchSizeNum) || batchSizeNum < 1 || batchSizeNum > 100) {
      return errorResponse(
        res,
        "Invalid batchSize. Must be a number between 1 and 100",
        400
      );
    }

    // Convert validateOnly to boolean
    const validateOnlyBool = validateOnly === "true";

    // If validateOnly is true, just validate without importing
    if (validateOnlyBool) {
      const validationResults = await wordImportService.validateWords(words);
      const validCount = validationResults.filter(
        (r) => r.status === "valid"
      ).length;
      const invalidCount = validationResults.filter(
        (r) => r.status === "invalid"
      ).length;

      return successResponse(res, "Validation completed", {
        totalWords: words.length,
        valid: validCount,
        invalid: invalidCount,
        validationResults,
      });
    }

    // Import words
    const importResult = await wordImportService.importWords(words, {
      duplicateStrategy: duplicateStrategy as any,
      validateOnly: false,
      batchSize: batchSizeNum,
    });

    return successResponse(res, "Import completed successfully", importResult);
  } catch (error) {
    console.error("Import error:", error);
    return errorResponse(res, "Error importing words", 500, error);
  }
};

// Chat methods
export const addChatMessage = async (req: Request, res: Response) => {
  try {
    const { wordId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const word = await wordService.addChatMessage(wordId, message);
    if (!word) {
      return res.status(404).json({ message: "Word not found" });
    }

    res.json({ 
      message: "Chat message added successfully",
      word 
    });
  } catch (error: any) {
    logger.error("Error adding chat message:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const { wordId } = req.params;
    const chatHistory = await wordService.getChatHistory(wordId);
    res.json(chatHistory);
  } catch (error: any) {
    logger.error("Error getting chat history:", error);
    res.status(500).json({ message: error.message });
  }
};

export const clearChatHistory = async (req: Request, res: Response) => {
  try {
    const { wordId } = req.params;
    const word = await wordService.clearChatHistory(wordId);
    if (!word) {
      return res.status(404).json({ message: "Word not found" });
    }

    res.json({ 
      message: "Chat history cleared successfully",
      word 
    });
  } catch (error: any) {
    logger.error("Error clearing chat history:", error);
    res.status(500).json({ message: error.message });
  }
};

// Streaming chat response
export const streamChatResponse = async (req: Request, res: Response) => {
  try {
    const { wordId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const word = await wordService.getWordById(wordId);
    if (!word) {
      return res.status(404).json({ message: "Word not found" });
    }

    // Add user message first
    await wordService.addUserMessage(wordId, message);

    // Set up streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const stream = await generateWordChatStream(
      word.word,
      word.definition,
      message,
      word.chat || []
    );

    let fullResponse = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        res.write(content);
      }
    }

    // Save the complete AI response
    await wordService.addAssistantMessage(wordId, fullResponse);
    
    res.end();
  } catch (error: any) {
    logger.error("Error streaming chat response:", error);
    res.status(500).json({ message: error.message });
  }
};
