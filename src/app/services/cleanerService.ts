import ExamAttempt from "../db/models/ExamAttempt";
import Exam from "../db/models/Exam";
import Question from "../db/models/Question";

export class CleanerService {
  // Borrar todos los intentos de examen del usuario
  static async cleanExamAttempts(userId: string) {
    try {
      const result = await ExamAttempt.deleteMany({ user: userId });
      
      console.log(`Deleted ${result.deletedCount} exam attempts for user ${userId}`);
      
      return {
        deletedCount: result.deletedCount,
        success: true
      };
    } catch (error) {
      console.error("Error in cleanExamAttempts:", error);
      throw new Error("Failed to clean exam attempts");
    }
  }

  // Borrar todos los exámenes del usuario y sus intentos asociados
  static async cleanExams(userId: string) {
    try {
      // Primero, obtener todos los exámenes del usuario
      const userExams = await Exam.find({ createdBy: userId });
      const examIds = userExams.map(exam => exam._id);

      // Borrar todos los intentos asociados a estos exámenes
      const attemptsResult = await ExamAttempt.deleteMany({
        exam: { $in: examIds }
      });

      // Borrar todos los exámenes del usuario
      const examsResult = await Exam.deleteMany({ createdBy: userId });

      console.log(`Deleted ${examsResult.deletedCount} exams and ${attemptsResult.deletedCount} attempts for user ${userId}`);

      return {
        deletedExams: examsResult.deletedCount,
        deletedAttempts: attemptsResult.deletedCount,
        success: true
      };
    } catch (error) {
      console.error("Error in cleanExams:", error);
      throw new Error("Failed to clean exams");
    }
  }

  // Borrar todas las preguntas del usuario
  static async cleanQuestions(userId: string) {
    try {
      // Nota: Las preguntas no tienen un campo createdBy por defecto
      // Por ahora, borraremos todas las preguntas que no estén siendo usadas en exámenes
      // En el futuro, se puede agregar un campo createdBy a las preguntas

      // Obtener todas las preguntas que están siendo usadas en exámenes
      const exams = await Exam.find({}).populate('questions.question');
      const usedQuestionIds = new Set();
      
      exams.forEach(exam => {
        exam.questions.forEach((q: any) => {
          if (q.question) {
            usedQuestionIds.add(q.question._id.toString());
          }
        });
      });

      // Borrar preguntas que no están siendo usadas
      const result = await Question.deleteMany({
        _id: { $nin: Array.from(usedQuestionIds) }
      });

      console.log(`Deleted ${result.deletedCount} unused questions`);

      return {
        deletedCount: result.deletedCount,
        success: true
      };
    } catch (error) {
      console.error("Error in cleanQuestions:", error);
      throw new Error("Failed to clean questions");
    }
  }
} 