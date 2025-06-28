import ExamAttempt, { IExamAttempt } from "../../db/models/ExamAttempt";
import Exam from "../../db/models/Exam";
import User from "../../db/models/User";
import mongoose from "mongoose";
import Question, { IQuestion } from "../../db/models/Question";

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export class ExamAttemptService {
  // Create a new exam attempt
  async createExamAttempt(attemptData: IExamAttempt): Promise<IExamAttempt> {
    // Get the exam to check attemptsAllowed
    const exam = await Exam.findById(attemptData.exam);
    if (!exam) {
      throw new Error('Exam not found');
    }

    // Get existing attempts for this user and exam
    const existingAttempts = await ExamAttempt.find({
      user: attemptData.user,
      exam: attemptData.exam
    }).sort({ attemptNumber: -1 });

    // Calculate next attempt number
    const nextAttemptNumber = existingAttempts.length > 0 
      ? existingAttempts[0].attemptNumber + 1 
      : 1;

    // Check if user has exceeded attemptsAllowed
    if (exam.attemptsAllowed && nextAttemptNumber > exam.attemptsAllowed) {
      throw new Error(`Maximum attempts (${exam.attemptsAllowed}) exceeded for this exam`);
    }

    // Create the attempt with calculated attemptNumber
    const attempt = new ExamAttempt({
      ...attemptData,
      attemptNumber: nextAttemptNumber,
      status: 'in_progress',
      startedAt: new Date()
    });

    return await attempt.save();
  }

  // Get an exam attempt by ID
  async getExamAttemptById(id: string): Promise<IExamAttempt | null> {
    return await ExamAttempt.findById(id)
      .populate('user')
      .populate('exam')
      .populate('answers.question');
  }

  // Get all exam attempts with pagination and filters
  async getExamAttempts(
    filters: {
      page?: number;
      limit?: number;
      user?: string;
      exam?: string;
      status?: string;
      passed?: boolean;
      cefrEstimated?: string;
      sortBy?: string;
      sortOrder?: string;
      startedAfter?: string;
      startedBefore?: string;
      submittedAfter?: string;
      submittedBefore?: string;
    } = {}
  ): Promise<PaginatedResult<IExamAttempt>> {
    const {
      page = 1,
      limit = 10,
      user,
      exam,
      status,
      passed,
      cefrEstimated,
      sortBy = 'startedAt',
      sortOrder = 'desc',
      startedAfter,
      startedBefore,
      submittedAfter,
      submittedBefore
    } = filters;

    const filter: Record<string, any> = {};

    // Filter by user
    if (user) {
      filter.user = user;
    }

    // Filter by exam
    if (exam) {
      filter.exam = exam;
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by passed
    if (passed !== undefined) {
      filter.passed = passed;
    }

    // Filter by CEFR level
    if (cefrEstimated) {
      filter.cefrEstimated = cefrEstimated;
    }

    // Date filters for startedAt
    if (startedAfter || startedBefore) {
      const startedAtFilter: Record<string, Date> = {};
      if (startedAfter) {
        startedAtFilter.$gte = new Date(startedAfter);
      }
      if (startedBefore) {
        startedAtFilter.$lte = new Date(startedBefore);
      }
      filter.startedAt = startedAtFilter;
    }

    // Date filters for submittedAt
    if (submittedAfter || submittedBefore) {
      const submittedAtFilter: Record<string, Date> = {};
      if (submittedAfter) {
        submittedAtFilter.$gte = new Date(submittedAfter);
      }
      if (submittedBefore) {
        submittedAtFilter.$lte = new Date(submittedBefore);
      }
      filter.submittedAt = submittedAtFilter;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Execute queries
    const [data, total] = await Promise.all([
      ExamAttempt.find(filter)
        .populate('user')
        .populate('exam')
        .populate('answers.question')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      ExamAttempt.countDocuments(filter)
    ]);

    const pages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      pages
    };
  }

  // Update an exam attempt
  async updateExamAttempt(
    id: string,
    updateData: Partial<IExamAttempt>
  ): Promise<IExamAttempt | null> {
    return await ExamAttempt.findByIdAndUpdate(id, updateData, { new: true })
      .populate('user')
      .populate('exam')
      .populate('answers.question');
  }

  // Delete an exam attempt
  async deleteExamAttempt(id: string): Promise<IExamAttempt | null> {
    return await ExamAttempt.findByIdAndDelete(id);
  }

  // Find attempts by user and exam
  async findByUserAndExam(userId: string, examId: string): Promise<IExamAttempt[]> {
    return await ExamAttempt.find({ user: userId, exam: examId })
      .populate('user')
      .populate('exam')
      .populate('answers.question')
      .sort({ attemptNumber: -1 });
  }

  // Find attempts by status
  async findByStatus(status: string): Promise<IExamAttempt[]> {
    return await ExamAttempt.find({ status })
      .populate('user')
      .populate('exam')
      .populate('answers.question');
  }

  // Find passed attempts
  async findPassedAttempts(): Promise<IExamAttempt[]> {
    return await ExamAttempt.find({ passed: true })
      .populate('user')
      .populate('exam')
      .populate('answers.question');
  }

  // Get user statistics
  async getUserStats(userId: string): Promise<{
    totalAttempts: number;
    passedAttempts: number;
    avgScore: number;
    totalDuration: number;
    byExam: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const [totalAttempts, passedAttempts, totalDuration, byExam, byStatus] = await Promise.all([
      ExamAttempt.countDocuments({ user: userId }),
      ExamAttempt.countDocuments({ user: userId, passed: true }),
      ExamAttempt.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, totalDuration: { $sum: '$duration' } } }
      ]),
      ExamAttempt.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$exam', count: { $sum: 1 } } }
      ]),
      ExamAttempt.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    // Calculate average score using individual answer scores and AI evaluation
    const attempts = await ExamAttempt.find({ user: userId });
    let totalScore = 0;
    let attemptCount = 0;

    attempts.forEach(attempt => {
      let attemptScore = 0;
      
      // Prefer AI evaluation if available, otherwise use individual scores
      if (attempt.aiEvaluation && this.hasValidAIEvaluation(attempt.aiEvaluation)) {
        attemptScore = this.getAverageAIScore(attempt);
      } else {
        attemptScore = this.getTotalScore(attempt);
      }
      
      if (attemptScore > 0) {
        totalScore += attemptScore;
        attemptCount++;
      }
    });

    const avgScore = attemptCount > 0 ? Math.round(totalScore / attemptCount) : 0;

    return {
      totalAttempts,
      passedAttempts,
      avgScore,
      totalDuration: totalDuration[0]?.totalDuration || 0,
      byExam: byExam.reduce((acc, item) => ({ ...acc, [item._id.toString()]: item.count }), {}),
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {})
    };
  }

  /**
   * Check if AI evaluation has valid scores
   */
  private hasValidAIEvaluation(aiEvaluation: any): boolean {
    return aiEvaluation && (
      (aiEvaluation.grammar !== undefined && aiEvaluation.grammar > 0) ||
      (aiEvaluation.fluency !== undefined && aiEvaluation.fluency > 0) ||
      (aiEvaluation.coherence !== undefined && aiEvaluation.coherence > 0) ||
      (aiEvaluation.vocabulary !== undefined && aiEvaluation.vocabulary > 0)
    );
  }

  /**
   * Evaluate a user's answer against the correct answers for a question
   * Returns isCorrect boolean and score (0-100)
   */
  private evaluateAnswer(question: IQuestion, userAnswer: any): { isCorrect: boolean; score: number; feedback?: string; requiresAI?: boolean } {
    if (!question || userAnswer === null || userAnswer === undefined || userAnswer === '') {
      return { isCorrect: false, score: 0, feedback: 'Respuesta vacía' };
    }

    let isCorrect = false;
    let feedback = '';
    let requiresAI = false;

    switch (question.type) {
      case 'single_choice':
      case 'true_false':
        // ✅ EVALUACIÓN AUTOMÁTICA: Fácil match con respuesta correcta
        if (question.options && question.options.length > 0) {
          const selectedOption = question.options.find(option => option.value === userAnswer);
          isCorrect = selectedOption ? selectedOption.isCorrect : false;
          
          if (!isCorrect) {
            const correctOption = question.options.find(option => option.isCorrect);
            feedback = correctOption ? `Respuesta correcta: ${correctOption.label}` : '';
          } else {
            feedback = '¡Correcto!';
          }
        }
        break;

      case 'multiple_choice':
        // ✅ EVALUACIÓN AUTOMÁTICA: Verificar que todas las opciones seleccionadas sean correctas
        if (question.options && question.options.length > 0) {
          const selectedAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
          const correctOptions = question.options.filter(option => option.isCorrect);
          const selectedOptions = question.options.filter(option => selectedAnswers.includes(option.value));
          
          // Verificar que todas las seleccionadas sean correctas y que se hayan seleccionado todas las correctas
          const allSelectedAreCorrect = selectedOptions.every(option => option.isCorrect);
          const allCorrectAreSelected = correctOptions.every(option => selectedAnswers.includes(option.value));
          
          isCorrect = allSelectedAreCorrect && allCorrectAreSelected;
          
          if (!isCorrect) {
            const correctLabels = correctOptions.map(option => option.label).join(', ');
            feedback = `Respuestas correctas: ${correctLabels}`;
          } else {
            feedback = '¡Correcto!';
          }
        }
        break;

      case 'fill_blank':
        // ✅ EVALUACIÓN AUTOMÁTICA: Match simple con respuestas predefinidas
        if (question.correctAnswers && question.correctAnswers.length > 0) {
          const normalizedUserAnswer = this.normalizeText(userAnswer.toString());
          const normalizedCorrectAnswers = question.correctAnswers.map(answer => this.normalizeText(answer));
          
          isCorrect = normalizedCorrectAnswers.some(correctAnswer => 
            normalizedUserAnswer === correctAnswer ||
            correctAnswer.includes(normalizedUserAnswer) ||
            normalizedUserAnswer.includes(correctAnswer)
          );

          if (!isCorrect) {
            feedback = `Respuesta correcta: ${question.correctAnswers[0]}`;
          } else {
            feedback = '¡Correcto!';
          }
        }
        break;

      case 'translate':
        // 🤔 HÍBRIDO: Puede ser automático O requerir AI
        if (question.correctAnswers && question.correctAnswers.length > 0) {
          // Primero intentar evaluación automática
          const normalizedUserAnswer = this.normalizeText(userAnswer.toString());
          const normalizedCorrectAnswers = question.correctAnswers.map(answer => this.normalizeText(answer));
          
          isCorrect = normalizedCorrectAnswers.some(correctAnswer => 
            normalizedUserAnswer === correctAnswer ||
            this.calculateSimilarity(normalizedUserAnswer, correctAnswer) > 0.8
          );

          if (!isCorrect) {
            // Si no hay match automático, marcar para evaluación AI
            requiresAI = true;
            feedback = 'Respuesta enviada para evaluación detallada';
            // Dar puntuación temporal hasta evaluación AI
            isCorrect = null; // Indicar que necesita evaluación
          } else {
            feedback = '¡Correcto!';
          }
        }
        break;

      case 'writing':
        // 🤖 EVALUACIÓN CON AI: Siempre requiere análisis inteligente
        requiresAI = true;
        const userText = userAnswer.toString().trim();
        
        if (userText.length < 10) {
          isCorrect = false;
          feedback = 'Respuesta muy corta';
        } else {
          // Marcar como pendiente de evaluación AI
          isCorrect = null; // Indicar que necesita evaluación
          feedback = 'Respuesta enviada para evaluación detallada por AI';
        }
        break;

      default:
        isCorrect = false;
        feedback = 'Tipo de pregunta no soportado';
    }

    // Calcular score
    let score = 0;
    if (isCorrect === true) {
      score = 100;
    } else if (isCorrect === false) {
      score = 0;
    } else if (isCorrect === null) {
      // Respuesta pendiente de evaluación AI
      score = 50; // Puntuación temporal
    }

    return { isCorrect: isCorrect === null ? false : isCorrect, score, feedback, requiresAI };
  }

  /**
   * Calculate similarity between two strings (simple Levenshtein-based)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Normalize text for comparison (remove accents, convert to lowercase, trim)
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' '); // Normalize spaces
  }

  // Submit an answer
  async submitAnswer(
    attemptId: string,
    questionId: string,
    answer: any,
    isCorrect?: boolean,
    score?: number,
    feedback?: string
  ): Promise<IExamAttempt | null> {
    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) return null;

    // If isCorrect and score are not provided, evaluate automatically
    let finalIsCorrect = isCorrect;
    let finalScore = score;
    let finalFeedback = feedback;
    let requiresAI = false;

    if (isCorrect === undefined || score === undefined) {
      try {
        // Get the question to evaluate the answer
        const question = await Question.findById(questionId);
        if (question) {
          console.log(`🔍 Evaluando pregunta tipo: ${question.type} | Respuesta: ${answer}`);
          
          const evaluation = this.evaluateAnswer(question, answer);
          finalIsCorrect = evaluation.isCorrect;
          finalScore = evaluation.score;
          finalFeedback = evaluation.feedback || feedback;
          requiresAI = evaluation.requiresAI || false;

          console.log(`📊 Resultado evaluación:`, {
            type: question.type,
            isCorrect: finalIsCorrect,
            score: finalScore,
            requiresAI: requiresAI,
            feedback: finalFeedback
          });

          // Si requiere AI, agregar metadata especial
          if (requiresAI) {
            finalFeedback = `${finalFeedback} [REQUIERE_AI]`;
            console.log(`🤖 Marcando para evaluación AI: ${question.type}`);
          }
        } else {
          // If question not found, default to incorrect
          finalIsCorrect = false;
          finalScore = 0;
          finalFeedback = 'Pregunta no encontrada';
          console.log(`❌ Pregunta no encontrada: ${questionId}`);
        }
      } catch (error) {
        console.error('Error evaluating answer:', error);
        // If evaluation fails, default to provided values or incorrect
        finalIsCorrect = isCorrect ?? false;
        finalScore = score ?? 0;
        finalFeedback = feedback || 'Error al evaluar respuesta';
      }
    }

    // Find existing answer or create new one
    const existingAnswerIndex = attempt.answers.findIndex(
      a => a.question.toString() === questionId
    );

    const answerData = {
      question: new mongoose.Types.ObjectId(questionId),
      answer,
      isCorrect: finalIsCorrect,
      score: finalScore,
      feedback: finalFeedback,
      submittedAt: new Date()
    };

    if (existingAnswerIndex >= 0) {
      attempt.answers[existingAnswerIndex] = answerData;
    } else {
      attempt.answers.push(answerData);
    }

    const savedAttempt = await attempt.save();
    console.log(`✅ Respuesta guardada | Score: ${finalScore} | Correct: ${finalIsCorrect}`);
    
    return savedAttempt;
  }

  // Submit exam attempt
  async submitExamAttempt(attemptId: string): Promise<IExamAttempt | null> {
    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) return null;

    attempt.status = 'submitted';
    attempt.submittedAt = new Date();
    
    if (attempt.duration === undefined) {
      const duration = Math.floor((attempt.submittedAt.getTime() - attempt.startedAt.getTime()) / 1000);
      attempt.duration = duration;
    }

    // Calculate if passed based on individual answer scores (70% threshold)
    const totalScore = this.getTotalScore(attempt);
    attempt.passed = totalScore >= 70;

    // Check if any answers require AI evaluation
    const answersRequiringAI = this.getAnswersRequiringAI(attempt);
    if (answersRequiringAI.length > 0) {
      console.log(`🤖 ${answersRequiringAI.length} respuestas requieren evaluación AI`);
      // Note: AI evaluation would happen separately via the grade endpoint
    }

    const savedAttempt = await attempt.save();
    console.log(`📋 Examen enviado | Score final: ${totalScore}% | Aprobado: ${attempt.passed}`);
    
    return savedAttempt;
  }

  /**
   * Get answers that require AI evaluation
   */
  getAnswersRequiringAI(attempt: IExamAttempt): any[] {
    return attempt.answers.filter(answer => 
      answer.feedback && answer.feedback.includes('[REQUIERE_AI]')
    );
  }

  /**
   * Check if attempt has answers requiring AI evaluation
   */
  hasAnswersRequiringAI(attempt: IExamAttempt): boolean {
    return this.getAnswersRequiringAI(attempt).length > 0;
  }

  /**
   * Get attempt readiness status
   */
  getAttemptStatus(attempt: IExamAttempt): {
    isComplete: boolean;
    requiresAI: boolean;
    totalAnswers: number;
    answersRequiringAI: number;
    autoEvaluatedAnswers: number;
  } {
    const answersRequiringAI = this.getAnswersRequiringAI(attempt);
    const autoEvaluatedAnswers = attempt.answers.filter(answer => 
      !answer.feedback?.includes('[REQUIERE_AI]')
    );

    return {
      isComplete: attempt.status === 'submitted' || attempt.status === 'graded',
      requiresAI: answersRequiringAI.length > 0,
      totalAnswers: attempt.answers.length,
      answersRequiringAI: answersRequiringAI.length,
      autoEvaluatedAnswers: autoEvaluatedAnswers.length
    };
  }

  // Grade exam attempt
  async gradeExamAttempt(
    attemptId: string,
    aiEvaluation: {
      grammar?: number;
      fluency?: number;
      coherence?: number;
      vocabulary?: number;
      comments?: string;
    },
    aiNotes?: string,
    cefrEstimated?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  ): Promise<IExamAttempt | null> {
    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) return null;

    attempt.status = 'graded';
    attempt.aiEvaluation = aiEvaluation;
    attempt.aiNotes = aiNotes;
    attempt.cefrEstimated = cefrEstimated;

    // Calculate if passed (you can adjust this logic)
    const avgScore = this.getAverageAIScore(attempt);
    attempt.passed = avgScore >= 70; // 70% threshold

    return await attempt.save();
  }

  // Utility methods
  getTotalScore(attempt: IExamAttempt): number {
    if (!attempt.answers || attempt.answers.length === 0) return 0;
    const totalScore = attempt.answers.reduce((sum, answer) => sum + (answer.score || 0), 0);
    return Math.round(totalScore / attempt.answers.length);
  }

  getCorrectAnswersCount(attempt: IExamAttempt): number {
    if (!attempt.answers) return 0;
    return attempt.answers.filter(answer => answer.isCorrect).length;
  }

  getAccuracy(attempt: IExamAttempt): number {
    if (!attempt.answers || attempt.answers.length === 0) return 0;
    const correctCount = this.getCorrectAnswersCount(attempt);
    return Math.round((correctCount / attempt.answers.length) * 100);
  }

  getAverageAIScore(attempt: IExamAttempt): number {
    if (!attempt.aiEvaluation) return 0;
    const scores = [
      attempt.aiEvaluation.grammar,
      attempt.aiEvaluation.fluency,
      attempt.aiEvaluation.coherence,
      attempt.aiEvaluation.vocabulary
    ].filter(score => score !== undefined);
    
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }

  getDurationInMinutes(attempt: IExamAttempt): number {
    if (!attempt.duration) return 0;
    return Math.round(attempt.duration / 60);
  }

  isCompleted(attempt: IExamAttempt): boolean {
    return attempt.status === 'submitted' || attempt.status === 'graded';
  }

  isGraded(attempt: IExamAttempt): boolean {
    return attempt.status === 'graded';
  }

  hasAIEvaluation(attempt: IExamAttempt): boolean {
    return !!attempt.aiEvaluation;
  }

  // Get attempt statistics
  async getAttemptStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byCEFR: Record<string, number>;
    passed: number;
    averageScore: number;
    averageDuration: number;
  }> {
    const [total, byStatus, byCEFR, passed, avgDuration] = await Promise.all([
      ExamAttempt.countDocuments(),
      ExamAttempt.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      ExamAttempt.aggregate([
        { $group: { _id: '$cefrEstimated', count: { $sum: 1 } } }
      ]),
      ExamAttempt.countDocuments({ passed: true }),
      ExamAttempt.aggregate([
        { $group: { _id: null, avgDuration: { $avg: '$duration' } } }
      ])
    ]);

    // Calculate average score using individual answer scores and AI evaluation
    const attempts = await ExamAttempt.find({});
    let totalScore = 0;
    let attemptCount = 0;

    attempts.forEach(attempt => {
      let attemptScore = 0;
      
      // Prefer AI evaluation if available, otherwise use individual scores
      if (attempt.aiEvaluation && this.hasValidAIEvaluation(attempt.aiEvaluation)) {
        attemptScore = this.getAverageAIScore(attempt);
      } else {
        attemptScore = this.getTotalScore(attempt);
      }
      
      if (attemptScore > 0) {
        totalScore += attemptScore;
        attemptCount++;
      }
    });

    const averageScore = attemptCount > 0 ? Math.round(totalScore / attemptCount) : 0;

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      byCEFR: byCEFR.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      passed,
      averageScore,
      averageDuration: Math.round(avgDuration[0]?.avgDuration || 0)
    };
  }

  // Check if user can create a new attempt for an exam
  async canCreateAttempt(userId: string, examId: string): Promise<{
    canCreate: boolean;
    currentAttempts: number;
    maxAttempts: number;
    nextAttemptNumber: number;
    message?: string;
  }> {
    const exam = await Exam.findById(examId);
    if (!exam) {
      return {
        canCreate: false,
        currentAttempts: 0,
        maxAttempts: 0,
        nextAttemptNumber: 1,
        message: 'Exam not found'
      };
    }

    const existingAttempts = await ExamAttempt.find({
      user: userId,
      exam: examId
    }).sort({ attemptNumber: -1 });

    const currentAttempts = existingAttempts.length;
    const maxAttempts = exam.attemptsAllowed || 999; // Default to high number if not set
    const nextAttemptNumber = currentAttempts + 1;

    const canCreate = nextAttemptNumber <= maxAttempts;

    return {
      canCreate,
      currentAttempts,
      maxAttempts,
      nextAttemptNumber,
      message: canCreate 
        ? `Can create attempt ${nextAttemptNumber} of ${maxAttempts}`
        : `Maximum attempts (${maxAttempts}) exceeded`
    };
  }
} 