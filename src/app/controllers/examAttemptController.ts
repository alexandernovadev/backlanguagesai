import { Request, Response } from "express";
import { ExamAttemptService } from "../services/examAttempts/examAttemptService";

export class ExamAttemptController {
  private examAttemptService = new ExamAttemptService();

  // POST /api/exam-attempts/start
  async startAttempt(req: Request, res: Response) {
    try {
      const { examId } = req.body;
      const userId = req.user?.id || req.user?._id; // Del middleware de auth

      console.log('🎯 startAttempt called:', { examId, userId, user: req.user });

      if (!examId) {
        return res.status(400).json({
          success: false,
          error: 'Exam ID is required'
        });
      }

      const attempt = await this.examAttemptService.startAttempt(examId, userId);
      
      res.status(201).json({
        success: true,
        data: attempt
      });
    } catch (error) {
      console.error('Error starting attempt:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST /api/exam-attempts/:id/submit
  async submitAttempt(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { answers } = req.body;

      // Validar que answers tenga toda la información necesaria
      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({
          success: false,
          error: 'Answers array is required'
        });
      }

      // Validar que cada respuesta tenga la estructura correcta
      for (const answer of answers) {
        if (!answer.questionId || !answer.questionText || !answer.options || !answer.userAnswer) {
          return res.status(400).json({
            success: false,
            error: 'Each answer must have questionId, questionText, options, and userAnswer'
          });
        }
      }

      const attempt = await this.examAttemptService.submitAttempt(id, answers);
      
      res.json({
        success: true,
        data: attempt
      });
    } catch (error) {
      console.error('Error submitting attempt:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST /api/exam-attempts/:id/grade
  async gradeWithAI(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const gradedAttempt = await this.examAttemptService.gradeWithAI(id);
      
      res.json({
        success: true,
        data: gradedAttempt
      });
    } catch (error) {
      console.error('Error grading with AI:', error);
      
      // Errores específicos
      if (error.message.includes('AI')) {
        return res.status(503).json({
          success: false,
          error: 'AI service temporarily unavailable. Please try again later.'
        });
      }
      
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/exam-attempts/in-progress/:examId
  async getInProgressAttempt(req: Request, res: Response) {
    try {
      const { examId } = req.params;
      // @ts-ignore
      const userId = req.user?.id || req.user?._id;

      const attempt = await this.examAttemptService.getInProgressAttempt(examId, userId);
      
      res.json({
        success: true,
        data: attempt
      });
    } catch (error) {
      console.error('Error getting in-progress attempt:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/exam-attempts/user/:userId
  async getUserAttempts(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const attempts = await this.examAttemptService.getUserAttempts(userId);
      
      res.json({
        success: true,
        data: attempts
      });
    } catch (error) {
      console.error('Error getting user attempts:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/exam-attempts/:id
  async getAttemptDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const attempt = await this.examAttemptService.getAttemptDetails(id);
      
      if (!attempt) {
        return res.status(404).json({
          success: false,
          error: 'Attempt not found'
        });
      }

      res.json({
        success: true,
        data: attempt
      });
    } catch (error) {
      console.error('Error getting attempt details:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST /api/exam-attempts/:id/abandon
  async abandonAttempt(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const attempt = await this.examAttemptService.abandonAttempt(id);
      
      res.json({
        success: true,
        data: attempt
      });
    } catch (error) {
      console.error('Error abandoning attempt:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/exam-attempts/stats/:userId
  async getAttemptStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { examId } = req.query;
      
      const stats = await this.examAttemptService.getAttemptStats(userId, examId as string);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting attempt stats:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
} 