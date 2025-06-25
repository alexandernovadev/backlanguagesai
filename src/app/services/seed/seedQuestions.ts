import { QuestionService } from "../questions/questionService";
import { QuestionValidator } from "../../utils/validators/questionValidator";
import questionsData from "../../../../scripts/data/questions-seed.json";
import logger from "../../utils/logger";
import { IQuestion } from "../../db/models/Question";

export class SeedQuestionsService {
  private questionService: QuestionService;

  constructor() {
    this.questionService = new QuestionService();
  }

  private transformQuestionData(rawQuestion: any): IQuestion {
    return {
      text: rawQuestion.text,
      type: rawQuestion.type as IQuestion['type'],
      isSingleAnswer: rawQuestion.type === 'multiple_choice' || rawQuestion.type === 'true_false',
      level: rawQuestion.cefrLevel as IQuestion['level'],
      topic: rawQuestion.metadata?.topic,
      difficulty: this.mapDifficultyToNumber(rawQuestion.difficulty),
      options: rawQuestion.options ? rawQuestion.options.map((option: string, index: number) => ({
        value: option,
        label: option,
        isCorrect: option === rawQuestion.correctAnswer
      })) : undefined,
      correctAnswers: rawQuestion.correctAnswer ? [rawQuestion.correctAnswer] : undefined,
      explanation: rawQuestion.explanation,
      tags: rawQuestion.tags,
      media: {
        audio: rawQuestion.audioUrl || undefined,
        image: rawQuestion.imageUrl || undefined
      }
    } as IQuestion;
  }

  private mapDifficultyToNumber(difficulty: string): number {
    switch (difficulty) {
      case 'beginner': return 1;
      case 'intermediate': return 3;
      case 'advanced': return 5;
      default: return 2;
    }
  }

  async seedQuestions(): Promise<{
    success: boolean;
    total: number;
    created: number;
    errors: string[];
    warnings: string[];
  }> {
    const result = {
      success: false,
      total: questionsData.length,
      created: 0,
      errors: [] as string[],
      warnings: [] as string[]
    };

    try {
      logger.info("Starting questions seed process", {
        totalQuestions: questionsData.length
      });

      // Transform and validate all questions first
      const transformedQuestions = questionsData.map(q => this.transformQuestionData(q));
      const validations = QuestionValidator.validateQuestions(transformedQuestions);
      
      // Collect validation errors and warnings
      validations.forEach((validation, index) => {
        if (!validation.isValid) {
          result.errors.push(`Question ${index + 1}: ${validation.errors.join(', ')}`);
        }
        if (validation.warnings.length > 0) {
          result.warnings.push(`Question ${index + 1}: ${validation.warnings.join(', ')}`);
        }
      });

      // If there are validation errors, stop the process
      if (result.errors.length > 0) {
        logger.error("Questions validation failed", {
          errors: result.errors,
          warnings: result.warnings
        });
        return result;
      }

      // Check if questions already exist
      const existingQuestions = await this.questionService.getQuestions({ limit: 1 });
      if (existingQuestions.total > 0) {
        logger.warn("Questions already exist in database", {
          existingCount: existingQuestions.total
        });
        result.warnings.push("Questions already exist in database. Skipping seed process.");
        result.success = true;
        return result;
      }

      // Create questions
      for (let i = 0; i < transformedQuestions.length; i++) {
        try {
          const question = transformedQuestions[i];
          
          // Create the question
          const createdQuestion = await this.questionService.createQuestion(question);
          
          if (createdQuestion) {
            result.created++;
            logger.info(`Created question ${i + 1}/${transformedQuestions.length}`, {
              questionId: createdQuestion._id,
              text: question.text?.substring(0, 50) + "..."
            });
          } else {
            result.errors.push(`Failed to create question ${i + 1}: ${question.text?.substring(0, 50)}...`);
          }
        } catch (error) {
          const errorMessage = `Error creating question ${i + 1}: ${error.message}`;
          result.errors.push(errorMessage);
          logger.error(errorMessage, { error });
        }
      }

      // Determine success
      result.success = result.created === questionsData.length && result.errors.length === 0;

      if (result.success) {
        logger.info("Questions seed completed successfully", {
          total: result.total,
          created: result.created,
          warnings: result.warnings.length
        });
      } else {
        logger.warn("Questions seed completed with issues", {
          total: result.total,
          created: result.created,
          errors: result.errors.length,
          warnings: result.warnings.length
        });
      }

      return result;

    } catch (error) {
      const errorMessage = "Unexpected error during questions seed process";
      result.errors.push(errorMessage);
      logger.error(errorMessage, { error });
      return result;
    }
  }

  async clearQuestions(): Promise<{
    success: boolean;
    deleted: number;
    error?: string;
  }> {
    try {
      logger.info("Starting questions clear process");
      
      // Get all questions and delete them one by one
      const questions = await this.questionService.getQuestions({ limit: 1000 });
      let deleted = 0;
      
      for (const question of questions.data) {
        try {
          await this.questionService.deleteQuestion(question._id.toString());
          deleted++;
        } catch (error) {
          logger.error(`Error deleting question ${question._id}`, { error });
        }
      }
      
      logger.info("Questions clear completed", {
        deleted
      });

      return {
        success: true,
        deleted
      };

    } catch (error) {
      const errorMessage = "Error clearing questions";
      logger.error(errorMessage, { error });
      
      return {
        success: false,
        deleted: 0,
        error: errorMessage
      };
    }
  }

  async resetQuestions(): Promise<{
    success: boolean;
    cleared: number;
    created: number;
    errors: string[];
    warnings: string[];
  }> {
    try {
      logger.info("Starting questions reset process");

      // Clear existing questions
      const clearResult = await this.clearQuestions();
      if (!clearResult.success) {
        return {
          success: false,
          cleared: 0,
          created: 0,
          errors: [clearResult.error || "Failed to clear questions"],
          warnings: []
        };
      }

      // Seed new questions
      const seedResult = await this.seedQuestions();

      return {
        success: seedResult.success,
        cleared: clearResult.deleted,
        created: seedResult.created,
        errors: seedResult.errors,
        warnings: seedResult.warnings
      };

    } catch (error) {
      const errorMessage = "Unexpected error during questions reset process";
      logger.error(errorMessage, { error });
      
      return {
        success: false,
        cleared: 0,
        created: 0,
        errors: [errorMessage],
        warnings: []
      };
    }
  }

  async getSeedStatus(): Promise<{
    totalInSeed: number;
    totalInDatabase: number;
    needsSeeding: boolean;
    lastCreated?: Date;
  }> {
    try {
      const dbQuestions = await this.questionService.getQuestions({ limit: 1000 });
      
      return {
        totalInSeed: questionsData.length,
        totalInDatabase: dbQuestions.total,
        needsSeeding: dbQuestions.total === 0,
        lastCreated: dbQuestions.data.length > 0 ? dbQuestions.data[0].createdAt : undefined
      };

    } catch (error) {
      logger.error("Error getting seed status", { error });
      throw error;
    }
  }
}

// Export singleton instance
export const seedQuestionsService = new SeedQuestionsService(); 