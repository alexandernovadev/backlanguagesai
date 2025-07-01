import ExamAttempt, { IExamAttempt } from "../../db/models/ExamAttempt";
import Exam from "../../db/models/Exam";
import User from "../../db/models/User";
import { ExamGradingService, AIGradingResult } from "./examGradingService";

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export class ExamAttemptService {
  private gradingService = new ExamGradingService();

  // 1. INICIAR INTENTO (con validación de límites)
  async startAttempt(examId: string, userId: string): Promise<IExamAttempt> {
    console.log('🚀 ExamAttemptService.startAttempt called:', { examId, userId });
    
    const exam = await Exam.findById(examId);
    if (!exam) throw new Error('Exam not found');

    // Verificar límite de intentos
    const existingAttempts = await ExamAttempt.countDocuments({
      exam: examId,
      user: userId,
      status: { $in: ['submitted', 'graded'] }
    });

    if (exam.maxAttempts && existingAttempts >= exam.maxAttempts) {
      throw new Error(`Maximum attempts (${exam.maxAttempts}) reached for this exam`);
    }

    // Verificar si ya existe un intento en progreso
    const existingInProgress = await ExamAttempt.findOne({
      exam: examId,
      user: userId,
      status: 'in_progress'
    });

    if (existingInProgress) {
      return existingInProgress;
    }

    const maxScore = exam.questions.reduce((total, q) => total + q.weight, 0);

    console.log('📝 Creating new attempt:', { examId, userId, maxScore });

    const attempt = new ExamAttempt({
      exam: examId,
      user: userId,
      status: 'in_progress',
      startTime: new Date(),
      maxScore
    });

    console.log('💾 Saving attempt...');
    const savedAttempt = await attempt.save();
    console.log('✅ Attempt saved successfully:', savedAttempt._id);
    return savedAttempt;
  }

  // 2. ENVIAR RESPUESTAS (obtener questionText y options del examen)
  async submitAttempt(attemptId: string, answers: any[]): Promise<IExamAttempt> {
    const attempt = await ExamAttempt.findById(attemptId).populate({
      path: 'exam',
      populate: {
        path: 'questions.question'
      }
    });
    
    if (!attempt) throw new Error('Attempt not found');

    if (attempt.status !== 'in_progress') {
      throw new Error('Attempt is not in progress');
    }

    // Obtener información completa de las preguntas del examen
    const exam = attempt.exam as any;
    if (!exam || !exam.questions) {
      throw new Error('Exam not found or has no questions');
    }

    // Mapear respuestas con información completa de las preguntas
    attempt.answers = answers.map(answer => {
      const examQuestion = exam.questions.find((q: any) => {
        const questionId = typeof q.question === 'string' ? q.question : q.question._id;
        return questionId.toString() === answer.questionId;
      });

      if (!examQuestion) {
        throw new Error(`Question ${answer.questionId} not found in exam`);
      }

      const questionData = typeof examQuestion.question === 'string' 
        ? { text: '', options: [] }
        : examQuestion.question;

      return {
        questionId: answer.questionId,
        questionText: answer.questionText || questionData.text || '',
        options: answer.options || questionData.options || [],
        userAnswer: answer.userAnswer,
        aiComment: '',
        isCorrect: false,
        points: 0
      };
    });

    attempt.status = 'submitted';
    attempt.submittedAt = new Date();

    await attempt.save();
    return attempt;
  }

  // 3. CALIFICAR CON AI (usando el servicio de calificación)
  async gradeWithAI(attemptId: string): Promise<IExamAttempt> {
    const attempt = await ExamAttempt.findById(attemptId)
      .populate('exam')
      .populate('user');
    
    if (!attempt) throw new Error('Attempt not found');
    if (attempt.status !== 'submitted') {
      throw new Error('Attempt must be submitted before grading');
    }

    // Obtener el idioma del usuario
    const user = await User.findById(attempt.user);
    const userLanguage = user?.language || 'es';

    // Usar el servicio de calificación con AI
    const aiResult = await this.gradingService.gradeExamWithAI(attempt, userLanguage);

    // Actualizar intento con resultados
    attempt.aiFeedback = aiResult.feedback;
    attempt.status = 'graded';
    attempt.score = aiResult.score;
    attempt.gradedAt = new Date();

    // Actualizar cada respuesta con el análisis de AI
    attempt.answers = attempt.answers.map((answer, index) => ({
      ...answer,
      aiComment: aiResult.questionAnalysis[index]?.aiComment || '',
      isCorrect: aiResult.questionAnalysis[index]?.isCorrect || false,
      points: aiResult.questionAnalysis[index]?.points || 0
    }));

    await attempt.save();
    return attempt;
  }

  // 4. OBTENER INTENTO EN PROGRESO
  async getInProgressAttempt(examId: string, userId: string): Promise<IExamAttempt | null> {
    return await ExamAttempt.findOne({
      exam: examId,
      user: userId,
      status: 'in_progress'
    });
  }

  // 5. OBTENER INTENTOS DEL USUARIO
  async getUserAttempts(userId: string): Promise<IExamAttempt[]> {
    return await ExamAttempt.find({ user: userId })
      .populate('exam')
      .sort({ createdAt: -1 });
  }

  // 6. OBTENER DETALLES DE INTENTO
  async getAttemptDetails(attemptId: string): Promise<IExamAttempt | null> {
    return await ExamAttempt.findById(attemptId)
      .populate('exam')
      .populate('user');
  }

  // 7. ABANDONAR INTENTO
  async abandonAttempt(attemptId: string): Promise<IExamAttempt | null> {
    return await ExamAttempt.findByIdAndUpdate(
      attemptId,
      { status: 'abandoned' },
      { new: true }
    );
  }

  // 8. OBTENER ESTADÍSTICAS DE INTENTOS
  async getAttemptStats(userId: string, examId?: string): Promise<any> {
    const filter: any = { user: userId };
    if (examId) filter.exam = examId;
    
    const attempts = await ExamAttempt.find(filter);
    
    return {
      totalAttempts: attempts.length,
      completedAttempts: attempts.filter(a => a.status === 'graded').length,
      inProgressAttempts: attempts.filter(a => a.status === 'in_progress').length,
      averageScore: attempts.length > 0 
        ? attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length 
        : 0,
      bestScore: attempts.length > 0 
        ? Math.max(...attempts.map(a => a.score || 0)) 
        : 0,
      lastAttempt: attempts.length > 0 
        ? attempts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        : null
    };
  }
} 