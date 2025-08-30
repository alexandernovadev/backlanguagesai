import ExamAttempt from "../db/models/ExamAttempt";
import Exam from "../db/models/Exam";
import Question from "../db/models/Question";
import TranslationChat from "../db/models/TranslationChat";
import GeneratedText from "../db/models/GeneratedText";

export class CleanerService {
  // Borrar TODOS los intentos de examen
  static async cleanExamAttempts() {
    try {
      // Contar antes de borrar para logging
      const countBefore = await ExamAttempt.countDocuments({});
      
      const result = await ExamAttempt.deleteMany({});
      
      console.log(`Found ${countBefore} exam attempts total, deleted ${result.deletedCount}`);
      
      return {
        deletedCount: result.deletedCount,
        totalFound: countBefore,
        success: true
      };
    } catch (error) {
      console.error("Error in cleanExamAttempts:", error);
      throw new Error("Failed to clean exam attempts");
    }
  }

  // Borrar TODOS los exámenes y sus intentos asociados
  static async cleanExams() {
    try {
      // Contar antes de borrar para logging
      const examsCountBefore = await Exam.countDocuments({});
      const attemptsCountBefore = await ExamAttempt.countDocuments({});

      // Borrar TODOS los intentos primero
      const attemptsResult = await ExamAttempt.deleteMany({});

      // Borrar TODOS los exámenes
      const examsResult = await Exam.deleteMany({});

      console.log(`Found ${examsCountBefore} exams and ${attemptsCountBefore} attempts total, deleted ${examsResult.deletedCount} exams and ${attemptsResult.deletedCount} attempts`);

      return {
        deletedExams: examsResult.deletedCount,
        deletedAttempts: attemptsResult.deletedCount,
        totalExamsFound: examsCountBefore,
        totalAttemptsFound: attemptsCountBefore,
        success: true
      };
    } catch (error) {
      console.error("Error in cleanExams:", error);
      throw new Error("Failed to clean exams");
    }
  }

  // Borrar TODAS las preguntas
  static async cleanQuestions() {
    try {
      // Contar todas las preguntas antes de borrar
      const totalQuestionsBefore = await Question.countDocuments({});
      
      // Borrar TODAS las preguntas
      const result = await Question.deleteMany({});

      console.log(`Total questions before: ${totalQuestionsBefore}, Deleted ${result.deletedCount} questions`);

      return {
        deletedCount: result.deletedCount,
        totalQuestionsBefore,
        success: true
      };
    } catch (error) {
      console.error("Error in cleanQuestions:", error);
      throw new Error("Failed to clean questions");
    }
  }

  // Borrar TODOS los TranslationChat y GeneratedText
  static async cleanTranslationChatsAndTexts() {
    try {
      console.log("⚠️ Iniciando limpieza de TranslationChats y GeneratedTexts (PELIGROSO)");

      const chatsCountBefore = await TranslationChat.countDocuments({});
      const generatedTextsCountBefore = await GeneratedText.countDocuments({});

      const chatsResult = await TranslationChat.deleteMany({});
      const generatedTextsResult = await GeneratedText.deleteMany({});

      console.log(`Found ${chatsCountBefore} TranslationChats and ${generatedTextsCountBefore} GeneratedTexts total.`);
      console.log(`Deleted ${chatsResult.deletedCount} TranslationChats and ${generatedTextsResult.deletedCount} GeneratedTexts.`);

      return {
        deletedChatsCount: chatsResult.deletedCount,
        deletedGeneratedTextsCount: generatedTextsResult.deletedCount,
        totalChatsFound: chatsCountBefore,
        totalGeneratedTextsFound: generatedTextsCountBefore,
        success: true
      };
    } catch (error) {
      console.error("Error in cleanTranslationChatsAndTexts:", error);
      throw new Error("Failed to clean translation chats and generated texts");
    }
  }
} 