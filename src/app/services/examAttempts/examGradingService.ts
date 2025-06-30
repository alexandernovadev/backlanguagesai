import OpenAI from "openai";
import Exam, { IExam } from '../../db/models/Exam';
import { IExamAttempt } from '../../db/models/ExamAttempt';

export interface AIGradingResult {
  score: number;
  feedback: string;
  questionAnalysis: Array<{
    questionId: string;
    userAnswer: string[];
    isCorrect: boolean;
    points: number;
    aiComment: string;
  }>;
}

export class ExamGradingService {
  async gradeExamWithAI(attempt: IExamAttempt, userLanguage: string = 'es'): Promise<AIGradingResult> {
    // Obtener el examen con las preguntas y pesos
    const exam = await Exam.findById(attempt.exam).populate('questions.question');
    
    if (!exam) {
      throw new Error('Exam not found');
    }

    // Preparar el prompt para AI
    const prompt = this.buildGradingPrompt(attempt, exam, userLanguage);
    
    try {
      console.log('Calling AI for exam grading...');
      const aiResponse = await this.callAI(prompt);
      console.log('AI response received successfully');
      
      // Parsear la respuesta de AI
      const parsedResponse = this.parseAIResponse(aiResponse);
      
      return parsedResponse;
    } catch (error) {
      console.error('Error calling AI for grading:', error);
      throw new Error('Failed to grade exam with AI');
    }
  }

  private buildGradingPrompt(attempt: IExamAttempt, exam: IExam, userLanguage: string): string {
    const questionsWithWeights = attempt.answers.map((answer, index) => {
      const examQuestion = exam.questions.find((q: any) => 
        q.question._id.toString() === answer.questionId.toString()
      );
      const weight = examQuestion ? examQuestion.weight : 1;
      
      return `
Pregunta ${index + 1} (Peso: ${weight} puntos):
Texto: ${answer.questionText}
Opciones disponibles:
${answer.options.map((opt, optIndex) => 
  `${optIndex + 1}. ${opt.label} ${opt.isCorrect ? '(CORRECTA)' : ''}`
).join('\n')}
Respuesta del estudiante: ${answer.userAnswer.join(', ')}
`;
    }).join('\n');

    // Determinar el idioma del feedback basado en el idioma del usuario
    const feedbackLanguage = this.getFeedbackLanguage(userLanguage);
    const targetLanguage = exam.language; // Idioma del examen

    return `
Eres un profesor experto en ${targetLanguage} nivel ${exam.level}.

Título del examen: ${exam.title}
Puntuación máxima: ${attempt.maxScore}
Idioma del examen: ${targetLanguage}
Idioma para el feedback: ${feedbackLanguage}

IMPORTANTE: Debes dar el feedback en ${feedbackLanguage}, pero el examen es de ${targetLanguage}.

Por favor califica las siguientes respuestas del estudiante:

${questionsWithWeights}

INSTRUCCIONES:
1. Analiza cada respuesta considerando el peso de cada pregunta
2. Determina si cada respuesta es correcta o incorrecta
3. Asigna puntos según el peso de la pregunta (si es correcta = peso completo, si es incorrecta = 0)
4. Proporciona comentarios constructivos para cada pregunta EN ${feedbackLanguage}
5. Calcula la puntuación total
6. Da un feedback general EN ${feedbackLanguage}

Responde en el siguiente formato JSON:
{
  "score": número,
  "feedback": "feedback general en ${feedbackLanguage}",
  "questionAnalysis": [
    {
      "questionId": "id de la pregunta",
      "userAnswer": ["respuesta del usuario"],
      "isCorrect": true/false,
      "points": número de puntos obtenidos,
      "aiComment": "comentario específico para esta pregunta en ${feedbackLanguage}"
    }
  ]
}
`;
  }

  private getFeedbackLanguage(userLanguage: string): string {
    const languageMap: { [key: string]: string } = {
      'es': 'español',
      'en': 'inglés',
      'fr': 'francés',
      'de': 'alemán',
      'it': 'italiano',
      'pt': 'portugués'
    };
    
    return languageMap[userLanguage] || 'español';
  }

  private async callAI(prompt: string): Promise<string> {
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || "",
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4o-2024-08-06",
        messages: [
          {
            role: "system",
            content: "You are an expert language teacher. Grade the exam responses accurately and provide constructive feedback."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });
      
      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI service error:', error);
      return '';
    }
  }

  private parseAIResponse(aiResponse: string): AIGradingResult {
    try {
      // Intentar parsear JSON de la respuesta de AI
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: parsed.score || 0,
          feedback: parsed.feedback || "No feedback available",
          questionAnalysis: parsed.questionAnalysis || []
        };
      }
      
      // Si no se puede parsear, usar fallback
      return this.getFallbackResponse();
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.getFallbackResponse();
    }
  }

  private getFallbackResponse(): AIGradingResult {
    return {
      score: 0,
      feedback: "No se pudo calificar automáticamente. Por favor, revisa manualmente.",
      questionAnalysis: []
    };
  }
} 