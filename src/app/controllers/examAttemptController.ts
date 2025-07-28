import { Request, Response } from "express";
import { ExamAttemptService } from "../services/examAttempts/examAttemptService";
import { successResponse, errorResponse } from "../utils/responseHelpers";

export class ExamAttemptController {
  private examAttemptService = new ExamAttemptService();

  // POST /api/exam-attempts/start
  async startAttempt(req: Request, res: Response) {
    try {
      const { examId } = req.body;
      const userId = req.user?.id || req.user?._id; // Del middleware de auth

      console.log('🎯 startAttempt called:', { examId, userId, user: req.user });

      if (!examId) {
        return errorResponse(res, 'Exam ID is required', 400);
      }

      const attempt = await this.examAttemptService.startAttempt(examId, userId);
      
      return successResponse(res, 'Attempt started successfully', attempt, 201);
    } catch (error) {
      console.error('Error starting attempt:', error);
      return errorResponse(res, error.message, 400, error);
    }
  }

  // POST /api/exam-attempts/:id/submit
  async submitAttempt(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { answers } = req.body;

      // Validar que answers tenga toda la información necesaria
      if (!answers || !Array.isArray(answers)) {
        return errorResponse(res, 'Answers array is required', 400);
      }

      // Validar que cada respuesta tenga la estructura correcta
      for (const answer of answers) {
        if (!answer.questionId || !answer.userAnswer) {
          return errorResponse(res, 'Each answer must have questionId and userAnswer', 400);
        }
      }

      const attempt = await this.examAttemptService.submitAttempt(id, answers);
      
      return successResponse(res, 'Attempt submitted successfully', attempt);
    } catch (error) {
      console.error('Error submitting attempt:', error);
      return errorResponse(res, error.message, 400, error);
    }
  }

  // POST /api/exam-attempts/:id/grade
  async gradeWithAI(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const gradedAttempt = await this.examAttemptService.gradeWithAI(id);
      
      return successResponse(res, 'Attempt graded successfully', gradedAttempt);
    } catch (error) {
      console.error('Error grading with AI:', error);
      
      // Errores específicos
      if (error.message.includes('AI')) {
        return errorResponse(res, 'AI service temporarily unavailable. Please try again later.', 503, error);
      }
      
      return errorResponse(res, error.message, 400, error);
    }
  }

  // GET /api/exam-attempts/in-progress/:examId
  async getInProgressAttempt(req: Request, res: Response) {
    try {
      const { examId } = req.params;
      // @ts-ignore
      const userId = req.user?.id || req.user?._id;

      const attempt = await this.examAttemptService.getInProgressAttempt(examId, userId);
      
      return successResponse(res, 'In-progress attempt retrieved successfully', attempt);
    } catch (error) {
      console.error('Error getting in-progress attempt:', error);
      return errorResponse(res, error.message, 400, error);
    }
  }

  // GET /api/exam-attempts/user/:userId
  async getUserAttempts(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const attempts = await this.examAttemptService.getUserAttempts(userId);
      
      return successResponse(res, 'User attempts retrieved successfully', attempts);
    } catch (error) {
      console.error('Error getting user attempts:', error);
      return errorResponse(res, error.message, 400, error);
    }
  }

  // GET /api/exam-attempts/:id
  async getAttemptDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const attempt = await this.examAttemptService.getAttemptDetails(id);
      
      if (!attempt) {
        return errorResponse(res, 'Attempt not found', 404);
      }

      return successResponse(res, 'Attempt details retrieved successfully', attempt);
    } catch (error) {
      console.error('Error getting attempt details:', error);
      return errorResponse(res, error.message, 400, error);
    }
  }

  // POST /api/exam-attempts/:id/abandon
  async abandonAttempt(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const attempt = await this.examAttemptService.abandonAttempt(id);
      
      return successResponse(res, 'Attempt abandoned successfully', attempt);
    } catch (error) {
      console.error('Error abandoning attempt:', error);
      return errorResponse(res, error.message, 400, error);
    }
  }

  // GET /api/exam-attempts/stats/:userId
  async getAttemptStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { examId } = req.query;
      
      const stats = await this.examAttemptService.getAttemptStats(userId, examId as string);
      
      return successResponse(res, 'Attempt stats retrieved successfully', stats);
    } catch (error) {
      console.error('Error getting attempt stats:', error);
      return errorResponse(res, error.message, 400, error);
    }
  }

  // Export all exam attempts to JSON
  async exportExamAttemptsToJSON(req: Request, res: Response) {
    try {
      const attempts = await this.examAttemptService.getAllExamAttemptsForExport();

      // Set headers for file download
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `exam-attempts-export-${timestamp}.json`;

      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

      // Send the JSON data
      return res.json({
        success: true,
        message: `Exported ${attempts.length} exam attempts successfully`,
        data: {
          totalAttempts: attempts.length,
          exportDate: new Date().toISOString(),
          attempts: attempts,
        },
      });
    } catch (error) {
      return errorResponse(
        res,
        "An error occurred while exporting exam attempts to JSON",
        500,
        error
      );
    }
  }

  // Import exam attempts from JSON file
  async importExamAttemptsFromFile(req: Request, res: Response) {
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

      // Validate file structure
      if (
        !fileData.data ||
        !fileData.data.attempts ||
        !Array.isArray(fileData.data.attempts)
      ) {
        return errorResponse(
          res,
          "Invalid file structure. Expected 'data.attempts' array",
          400
        );
      }

      const attempts = fileData.data.attempts;
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
        const validationResults = attempts.map((attempt: any, index: number) => ({
          index,
          data: attempt,
          status: attempt.exam && attempt.user && attempt.startTime ? 'valid' : 'invalid',
          errors: !attempt.exam ? ['Exam is required'] : 
                  !attempt.user ? ['User is required'] : 
                  !attempt.startTime ? ['Start time is required'] : []
        }));

        const validCount = validationResults.filter((r: any) => r.status === 'valid').length;
        const invalidCount = validationResults.filter((r: any) => r.status === 'invalid').length;

        return successResponse(res, "Validation completed", {
          totalAttempts: attempts.length,
          valid: validCount,
          invalid: invalidCount,
          validationResults,
          message: `Validation completed. ${validCount} valid, ${invalidCount} invalid`
        });
      }

      // Import attempts
      const importResult = await this.examAttemptService.importExamAttempts(attempts, {
        duplicateStrategy: duplicateStrategy as 'skip' | 'overwrite' | 'error' | 'merge',
        batchSize: batchSizeNum
      });

      return successResponse(res, "Import completed successfully", importResult);
    } catch (error) {
      return errorResponse(
        res,
        "An error occurred while importing exam attempts",
        500,
        error
      );
    }
  }
} 