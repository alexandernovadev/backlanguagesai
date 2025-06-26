// Ejemplo práctico de uso del sistema de intentos de examen en TypeScript
// Este archivo muestra cómo integrar todo el flujo en tu frontend

interface ExamAttempt {
  _id: string;
  user: string;
  exam: string;
  attemptNumber: number;
  status: 'in_progress' | 'submitted' | 'graded';
  startedAt: Date;
  submittedAt?: Date;
  duration?: number;
  passed?: boolean;
  cefrEstimated?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  aiEvaluation?: {
    grammar?: number;
    fluency?: number;
    coherence?: number;
    vocabulary?: number;
    comments?: string;
  };
  aiNotes?: string;
  answers: Array<{
    question: string;
    answer: any;
    isCorrect?: boolean;
    score?: number;
    feedback?: string;
    submittedAt: Date;
  }>;
}

interface CanCreateAttempt {
  canCreate: boolean;
  currentAttempts: number;
  maxAttempts: number;
  nextAttemptNumber: number;
  message?: string;
}

interface UserStats {
  totalAttempts: number;
  passedAttempts: number;
  avgScore: number;
  totalDuration: number;
  byExam: Record<string, number>;
  byStatus: Record<string, number>;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class ExamAttemptExample {
  private baseUrl: string;
  private currentAttemptId: string | null = null;

  constructor(baseUrl: string = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
  }

  // 1. Verificar si el usuario puede crear un intento
  async checkCanStartExam(userId: string, examId: string): Promise<CanCreateAttempt | null> {
    try {
      const response = await fetch(`${this.baseUrl}/exam-attempts/user/${userId}/exam/${examId}/can-create`);
      const data: ApiResponse<CanCreateAttempt> = await response.json();
      
      if (data.success) {
        console.log('✅ Puede crear intento:', data.data);
        return data.data;
      } else {
        console.log('❌ No puede crear intento:', data.message);
        return null;
      }
    } catch (error) {
      console.error('Error verificando intento:', error);
      return null;
    }
  }

  // 2. Crear un nuevo intento de examen
  async startExam(userId: string, examId: string): Promise<ExamAttempt | null> {
    try {
      const response = await fetch(`${this.baseUrl}/exam-attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: userId,
          exam: examId
          // attemptNumber se calcula automáticamente
        })
      });

      const data: ApiResponse<ExamAttempt> = await response.json();
      
      if (data.success) {
        this.currentAttemptId = data.data._id;
        console.log('✅ Intento creado:', data.data);
        return data.data;
      } else {
        console.log('❌ Error creando intento:', data.message);
        return null;
      }
    } catch (error) {
      console.error('Error creando intento:', error);
      return null;
    }
  }

  // 3. Enviar una respuesta individual
  async submitAnswer(questionId: string, answer: any): Promise<boolean> {
    if (!this.currentAttemptId) {
      console.error('❌ No hay intento activo');
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/exam-attempts/${this.currentAttemptId}/submit-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          answer
        })
      });

      const data: ApiResponse<ExamAttempt> = await response.json();
      
      if (data.success) {
        console.log('✅ Respuesta enviada');
        return true;
      } else {
        console.log('❌ Error enviando respuesta:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error enviando respuesta:', error);
      return false;
    }
  }

  // 4. Finalizar el intento
  async finishExam(): Promise<ExamAttempt | null> {
    if (!this.currentAttemptId) {
      console.error('❌ No hay intento activo');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/exam-attempts/${this.currentAttemptId}/submit`, {
        method: 'POST'
      });

      const data: ApiResponse<ExamAttempt> = await response.json();
      
      if (data.success) {
        console.log('✅ Examen finalizado:', data.data);
        return data.data;
      } else {
        console.log('❌ Error finalizando examen:', data.message);
        return null;
      }
    } catch (error) {
      console.error('Error finalizando examen:', error);
      return null;
    }
  }

  // 5. Calificar el intento (después de evaluación de IA)
  async gradeExam(
    aiEvaluation: {
      grammar?: number;
      fluency?: number;
      coherence?: number;
      vocabulary?: number;
      comments?: string;
    },
    cefrEstimated?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2',
    aiNotes?: string
  ): Promise<ExamAttempt | null> {
    if (!this.currentAttemptId) {
      console.error('❌ No hay intento activo');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/exam-attempts/${this.currentAttemptId}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiEvaluation,
          cefrEstimated,
          aiNotes
        })
      });

      const data: ApiResponse<ExamAttempt> = await response.json();
      
      if (data.success) {
        console.log('✅ Examen calificado:', data.data);
        return data.data;
      } else {
        console.log('❌ Error calificando examen:', data.message);
        return null;
      }
    } catch (error) {
      console.error('Error calificando examen:', error);
      return null;
    }
  }

  // 6. Obtener historial de intentos
  async getAttemptHistory(userId: string, examId: string): Promise<ExamAttempt[]> {
    try {
      const response = await fetch(`${this.baseUrl}/exam-attempts/user/${userId}/exam/${examId}`);
      const data: ApiResponse<ExamAttempt[]> = await response.json();
      
      if (data.success) {
        console.log('✅ Historial obtenido:', data.data);
        return data.data;
      } else {
        console.log('❌ Error obteniendo historial:', data.message);
        return [];
      }
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      return [];
    }
  }

  // 7. Obtener estadísticas del usuario
  async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const response = await fetch(`${this.baseUrl}/exam-attempts/user/${userId}/stats`);
      const data: ApiResponse<UserStats> = await response.json();
      
      if (data.success) {
        console.log('✅ Estadísticas obtenidas:', data.data);
        return data.data;
      } else {
        console.log('❌ Error obteniendo estadísticas:', data.message);
        return null;
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return null;
    }
  }

  // Getter para el intento actual
  getCurrentAttemptId(): string | null {
    return this.currentAttemptId;
  }

  // Resetear el intento actual
  resetCurrentAttempt(): void {
    this.currentAttemptId = null;
  }
}

// Ejemplo de uso completo
async function ejemploCompleto(): Promise<void> {
  const examManager = new ExamAttemptExample();
  
  const userId = '64f1a2b3c4d5e6f7g8h9i0j4';
  const examId = '64f1a2b3c4d5e6f7g8h9i0j3';
  
  console.log('🚀 Iniciando ejemplo completo...\n');

  // 1. Verificar si puede empezar
  const canCreate = await examManager.checkCanStartExam(userId, examId);
  if (!canCreate || !canCreate.canCreate) {
    console.log('❌ No puede crear más intentos');
    return;
  }

  // 2. Empezar el examen
  const attempt = await examManager.startExam(userId, examId);
  if (!attempt) {
    console.log('❌ No se pudo crear el intento');
    return;
  }

  // 3. Simular respuestas del usuario
  const questions: Array<{ id: string; answer: string }> = [
    { id: 'q1', answer: 'Yo voy al supermercado todos los días' },
    { id: 'q2', answer: 'Ella está estudiando para el examen' },
    { id: 'q3', answer: 'Nosotros hemos visitado España dos veces' }
  ];

  for (const question of questions) {
    await examManager.submitAnswer(question.id, question.answer);
    // Simular tiempo entre respuestas
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 4. Finalizar el examen
  const finishedAttempt = await examManager.finishExam();
  if (!finishedAttempt) {
    console.log('❌ No se pudo finalizar el examen');
    return;
  }

  // 5. Simular calificación de IA
  const aiEvaluation = {
    grammar: 85,
    fluency: 90,
    coherence: 88,
    vocabulary: 92,
    comments: 'Excelente trabajo. El estudiante demuestra un buen dominio de la gramática básica.'
  };

  const gradedAttempt = await examManager.gradeExam(
    aiEvaluation,
    'B2',
    'El estudiante muestra progreso significativo.'
  );

  if (gradedAttempt) {
    console.log('🎉 ¡Examen completado y calificado exitosamente!');
    const avgScore = (aiEvaluation.grammar + aiEvaluation.fluency + aiEvaluation.coherence + aiEvaluation.vocabulary) / 4;
    console.log('Puntaje promedio:', avgScore);
    console.log('Nivel estimado:', gradedAttempt.cefrEstimated);
    console.log('¿Aprobó?:', gradedAttempt.passed ? 'Sí' : 'No');
  }

  // 6. Ver historial
  const history = await examManager.getAttemptHistory(userId, examId);
  console.log(`📊 Historial: ${history.length} intentos totales`);

  // 7. Ver estadísticas
  const stats = await examManager.getUserStats(userId);
  if (stats) {
    console.log(`📈 Estadísticas del usuario:`);
    console.log(`- Intentos totales: ${stats.totalAttempts}`);
    console.log(`- Intentos aprobados: ${stats.passedAttempts}`);
    console.log(`- Puntaje promedio: ${stats.avgScore}`);
  }
}

// Exportar la clase y función de ejemplo
export { ExamAttemptExample, ejemploCompleto };
export type { ExamAttempt, CanCreateAttempt, UserStats, ApiResponse }; 