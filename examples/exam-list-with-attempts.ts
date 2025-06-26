// Ejemplo de cómo listar exámenes con información de intentos del usuario
// Este endpoint te permite mostrar en tu frontend cuántos intentos ha hecho el usuario en cada examen

interface ExamWithAttempts {
  _id: string;
  title: string;
  description?: string;
  language: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  topic?: string;
  attemptsAllowed: number;
  timeLimit?: number;
  adaptive: boolean;
  questions: Array<{
    question: any;
    weight: number;
    order: number;
  }>;
  userAttempts: number; // Número de intentos que ha hecho el usuario
  lastAttemptDate?: Date; // Fecha del último intento
  bestScore?: number; // Mejor puntaje obtenido
  createdAt: Date;
  updatedAt: Date;
}

interface ExamsWithAttemptsResponse {
  success: boolean;
  message: string;
  data: {
    data: ExamWithAttempts[];
    total: number;
    page: number;
    pages: number;
  };
}

class ExamListWithAttempts {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
  }

  // Obtener exámenes con información de intentos del usuario
  async getExamsWithAttempts(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      level?: string | string[];
      language?: string | string[];
      topic?: string;
      source?: string;
      createdBy?: string;
      adaptive?: boolean;
      sortBy?: string;
      sortOrder?: string;
    } = {}
  ): Promise<ExamWithAttempts[]> {
    try {
      const params = new URLSearchParams();
      
      // Agregar parámetros de paginación
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      
      // Agregar filtros
      if (options.level) {
        if (Array.isArray(options.level)) {
          options.level.forEach(level => params.append('level', level));
        } else {
          params.append('level', options.level);
        }
      }
      
      if (options.language) {
        if (Array.isArray(options.language)) {
          options.language.forEach(lang => params.append('language', lang));
        } else {
          params.append('language', options.language);
        }
      }
      
      if (options.topic) params.append('topic', options.topic);
      if (options.source) params.append('source', options.source);
      if (options.createdBy) params.append('createdBy', options.createdBy);
      if (options.adaptive !== undefined) params.append('adaptive', options.adaptive.toString());
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortOrder) params.append('sortOrder', options.sortOrder);

      const response = await fetch(`${this.baseUrl}/exams/user/${userId}/with-attempts?${params.toString()}`);
      const data: ExamsWithAttemptsResponse = await response.json();
      
      if (data.success) {
        console.log('✅ Exámenes con intentos obtenidos:', data.data);
        return data.data.data;
      } else {
        console.log('❌ Error obteniendo exámenes:', data.message);
        return [];
      }
    } catch (error) {
      console.error('Error obteniendo exámenes con intentos:', error);
      return [];
    }
  }

  // Función helper para mostrar información del examen
  displayExamInfo(exam: ExamWithAttempts): void {
    console.log(`📝 ${exam.title}`);
    console.log(`   Nivel: ${exam.level} | Idioma: ${exam.language}`);
    console.log(`   Intentos realizados: ${exam.userAttempts}/${exam.attemptsAllowed}`);
    
    if (exam.lastAttemptDate) {
      console.log(`   Último intento: ${new Date(exam.lastAttemptDate).toLocaleDateString()}`);
    }
    
    if (exam.bestScore) {
      console.log(`   Mejor puntaje: ${Math.round(exam.bestScore)}%`);
    }
    
    console.log(`   Preguntas: ${exam.questions.length}`);
    if (exam.timeLimit) {
      console.log(`   Tiempo límite: ${exam.timeLimit} minutos`);
    }
    console.log('---');
  }

  // Función helper para determinar el estado del examen
  getExamStatus(exam: ExamWithAttempts): 'available' | 'in_progress' | 'completed' | 'max_attempts' {
    if (exam.userAttempts === 0) {
      return 'available';
    } else if (exam.userAttempts >= exam.attemptsAllowed) {
      return 'max_attempts';
    } else if (exam.lastAttemptDate) {
      // Si tiene intentos pero no está completo, podría estar en progreso
      return 'in_progress';
    } else {
      return 'completed';
    }
  }

  // Función helper para obtener el color del estado
  getStatusColor(status: 'available' | 'in_progress' | 'completed' | 'max_attempts'): string {
    switch (status) {
      case 'available': return '🟢';
      case 'in_progress': return '🟡';
      case 'completed': return '🔵';
      case 'max_attempts': return '🔴';
      default: return '⚪';
    }
  }
}

// Ejemplo de uso
async function ejemploListadoExamenes(): Promise<void> {
  const examList = new ExamListWithAttempts();
  const userId = '64f1a2b3c4d5e6f7g8h9i0j4';
  
  console.log('📚 Obteniendo exámenes con información de intentos...\n');

  // Obtener todos los exámenes con intentos del usuario
  const exams = await examList.getExamsWithAttempts(userId, {
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  if (exams.length === 0) {
    console.log('❌ No se encontraron exámenes');
    return;
  }

  console.log(`📊 Se encontraron ${exams.length} exámenes:\n`);

  // Mostrar información de cada examen
  exams.forEach(exam => {
    const status = examList.getExamStatus(exam);
    const statusIcon = examList.getStatusColor(status);
    
    console.log(`${statusIcon} ${exam.title}`);
    console.log(`   Nivel: ${exam.level} | Idioma: ${exam.language}`);
    console.log(`   Intentos: ${exam.userAttempts}/${exam.attemptsAllowed}`);
    
    if (exam.lastAttemptDate) {
      console.log(`   Último intento: ${new Date(exam.lastAttemptDate).toLocaleDateString()}`);
    }
    
    if (exam.bestScore) {
      console.log(`   Mejor puntaje: ${Math.round(exam.bestScore)}%`);
    }
    
    console.log(`   Estado: ${status}`);
    console.log('---');
  });

  // Estadísticas generales
  const stats = {
    total: exams.length,
    available: exams.filter(e => examList.getExamStatus(e) === 'available').length,
    inProgress: exams.filter(e => examList.getExamStatus(e) === 'in_progress').length,
    completed: exams.filter(e => examList.getExamStatus(e) === 'completed').length,
    maxAttempts: exams.filter(e => examList.getExamStatus(e) === 'max_attempts').length,
    averageScore: exams
      .filter(e => e.bestScore)
      .reduce((sum, e) => sum + (e.bestScore || 0), 0) / exams.filter(e => e.bestScore).length
  };

  console.log('📈 Estadísticas generales:');
  console.log(`- Total de exámenes: ${stats.total}`);
  console.log(`- Disponibles: ${stats.available}`);
  console.log(`- En progreso: ${stats.inProgress}`);
  console.log(`- Completados: ${stats.completed}`);
  console.log(`- Máximo intentos alcanzado: ${stats.maxAttempts}`);
  console.log(`- Puntaje promedio: ${Math.round(stats.averageScore || 0)}%`);
}

// Ejemplo de filtrado por nivel
async function ejemploFiltradoPorNivel(): Promise<void> {
  const examList = new ExamListWithAttempts();
  const userId = '64f1a2b3c4d5e6f7g8h9i0j4';
  
  console.log('🎯 Obteniendo exámenes de nivel B1...\n');

  const b1Exams = await examList.getExamsWithAttempts(userId, {
    level: 'B1',
    limit: 10
  });

  console.log(`📚 Se encontraron ${b1Exams.length} exámenes de nivel B1:\n`);

  b1Exams.forEach(exam => {
    examList.displayExamInfo(exam);
  });
}

// Exportar la clase y funciones de ejemplo
export { ExamListWithAttempts, ejemploListadoExamenes, ejemploFiltradoPorNivel };
export type { ExamWithAttempts, ExamsWithAttemptsResponse }; 