import { Request, Response } from "express";
import Word from "../db/models/Word";
import Lecture from "../db/models/Lecture";
import Question from "../db/models/Question";
import Exam from "../db/models/Exam";
import ExamAttempt from "../db/models/ExamAttempt";
import Expression from "../db/models/Expression";
import User from "../db/models/User";
import { errorResponse, successResponse } from "../utils/responseHelpers";
import { seedAdminUser } from "../services/seed/user";
import { seedQuestions } from "../services/seed/seedQuestions";
import { backupCollections } from "../utils/backupCollections";
import { seedData } from "../utils/seedData";
import { calculateReadingTimeFromContent } from "../utils/text/calculateReadingTime";
import { CleanerService } from "../services/cleanerService";
import logger from "../utils/logger";
import bcrypt from "bcryptjs";
// import { MigrationService } from "../services/migration/migrationService";

// const migrationService = new MigrationService();

/**
 * LABS CONTROLLER - Development & Maintenance Endpoints
 * 
 * This controller provides endpoints for database operations, data seeding, 
 * maintenance tasks, and development utilities.
 * 
 * AVAILABLE ENDPOINTS:
 * 
 * Database Operations:
 * - POST /api/labs/words/update-level - Update all words level
 * - POST /api/labs/words/reset-seen - Reset seen count for all words
 * 
 * User Management:
 * - POST /api/labs/users/create-admin - Create admin user
 * 
 * Data Seeding:
 * - POST /api/labs/seed/initial-data - Seed initial data
 * - POST /api/labs/seed/questions - Seed questions from JSON
 * 
 * Backup & Maintenance:
 * - POST /api/labs/backup/create - Create backup of collections
 * - DELETE /api/labs/data/clear-all - Clear all words and lectures (DANGEROUS)
 * 
 * Migration:
 * - POST /api/labs/migrate/words-to-review - Migrate words to review system
 * 
 * Statistics:
 * - GET /api/labs/stats/database - Get database statistics
 * 
 * Cleaner Functions (DANGEROUS - requires authentication):
 * - DELETE /api/cleaner/exam-attempts - Delete ALL exam attempts
 * - DELETE /api/cleaner/exams - Delete ALL exams and attempts
 * - DELETE /api/cleaner/questions - Delete ALL questions
 * 
 * All cleaner functions require authentication and are marked as DANGEROUS
 * because they permanently delete data.
 */

/**
 * Update all words level to a specific value
 * @param req.body.level - The level to set (easy, medium, hard)
 */
export const updateWordsLevel = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { level } = req.body;
    
    if (!level || !['easy', 'medium', 'hard'].includes(level)) {
      return errorResponse(res, "Level must be 'easy', 'medium', or 'hard'", 400);
    }

    const result = await Word.updateMany({}, { level });
    
    return successResponse(
      res, 
      `Updated ${result.modifiedCount} words to level: ${level}`, 
      { modifiedCount: result.modifiedCount, level }
    );
  } catch (error) {
    return errorResponse(res, "Error updating words level", 500, error);
  }
};

/**
 * Reset seen count for all words to a specific value
 * @param req.body.seen - The seen count to set (default: 0)
 */
export const resetWordsSeenCount = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { seen = 0 } = req.body;
    
    if (typeof seen !== 'number' || seen < 0) {
      return errorResponse(res, "Seen count must be a positive number", 400);
    }

    const result = await Word.updateMany({}, { seen });
    
    return successResponse(
      res, 
      `Reset seen count for ${result.modifiedCount} words to: ${seen}`, 
      { modifiedCount: result.modifiedCount, seen }
    );
  } catch (error) {
    return errorResponse(res, "Error resetting words seen count", 500, error);
  }
};

/**
 * Create admin user for development/testing
 */
export const createAdminUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const seedUser = await seedAdminUser();
    
    return successResponse(
      res, 
      "Admin user created successfully", 
      { user: seedUser }
    );
  } catch (error) {
    return errorResponse(res, "Error creating admin user", 500, error);
  }
};

/**
 * Create 5 test users for development
 */
export const createTestUsers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    logger.info("🔄 Iniciando creación de 5 usuarios de prueba");
    
    const testUsers = [
      {
        username: "testuser1",
        email: "testuser1@example.com",
        password: "password123",
        role: "user",
        firstName: "Test",
        lastName: "User 1",
        isActive: true,
        language: "en"
      },
      {
        username: "testuser2", 
        email: "testuser2@example.com",
        password: "password123",
        role: "user",
        firstName: "Test",
        lastName: "User 2", 
        isActive: true,
        language: "es"
      },
      {
        username: "testuser3",
        email: "testuser3@example.com", 
        password: "password123",
        role: "user",
        firstName: "Test",
        lastName: "User 3",
        isActive: true,
        language: "pt"
      },
      {
        username: "testuser4",
        email: "testuser4@example.com",
        password: "password123", 
        role: "user",
        firstName: "Test",
        lastName: "User 4",
        isActive: true,
        language: "pt"
      },
      {
        username: "testuser5",
        email: "testuser5@example.com",
        password: "password123",
        role: "user", 
        firstName: "Test",
        lastName: "User 5",
        isActive: true,
        language: "pt"
      }
    ];

    const createdUsers = [];
    const errors = [];

    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ 
          $or: [
            { email: userData.email },
            { username: userData.username }
          ]
        });

        if (existingUser) {
          logger.warn(`⚠️ Usuario ${userData.username} ya existe, saltando...`);
          errors.push(`Usuario ${userData.username} ya existe`);
          continue;
        }

        // Hash password using imported bcrypt
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create user with all required fields
        const newUser = new User({
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          firstName: userData.firstName,
          lastName: userData.lastName,
          isActive: userData.isActive,
          language: userData.language,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        const savedUser = await newUser.save();
        
        logger.info(`✅ Usuario creado exitosamente: ${savedUser.username} (${savedUser.email})`);
        
        createdUsers.push({
          username: savedUser.username,
          email: savedUser.email,
          role: savedUser.role,
          language: savedUser.language,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName
        });
      } catch (error) {
        logger.error(`❌ Error creando usuario ${userData.username}:`, error);
        errors.push(`Error creando ${userData.username}: ${error.message}`);
      }
    }

    const result = {
      createdUsers,
      totalCreated: createdUsers.length,
      totalErrors: errors.length,
      errors,
      totalAttempted: testUsers.length,
      message: createdUsers.length > 0 
        ? `Se crearon ${createdUsers.length} usuarios de prueba exitosamente`
        : "No se crearon usuarios nuevos (todos ya existían o hubo errores)"
    };

    logger.info("✅ Creación de usuarios de prueba completada", {
      totalCreated: createdUsers.length,
      totalErrors: errors.length,
      totalAttempted: testUsers.length,
      createdUsers: createdUsers.map(u => u.username),
      errors
    });

    return successResponse(
      res,
      result.message,
      result
    );
  } catch (error) {
    logger.error("❌ Error creando usuarios de prueba", {
      error: error.message,
      stack: error.stack
    });
    return errorResponse(res, "Error creating test users", 500, error);
  }
};

/**
 * Seed initial data for development
 */
export const seedInitialData = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await seedData();
    
    return successResponse(
      res, 
      "Initial data seeded successfully", 
      {}
    );
  } catch (error) {
    return errorResponse(res, "Error seeding initial data", 500, error);
  }
};

/**
 * Create backup of all collections
 */
export const createBackup = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    logger.info("🔄 Iniciando backup de todas las colecciones");
    
    const backupResult = await backupCollections();
    
    const totalDocuments = backupResult.backupResults.reduce(
      (total: number, result: any) => total + (result.count || 0), 
      0
    );
    
    const successfulBackups = backupResult.backupResults.filter(
      (result: any) => !result.error
    ).length;
    
    logger.info("✅ Backup completado exitosamente", {
      successfulBackups,
      totalCollections: backupResult.totalCollections,
      totalDocuments,
      backupResults: backupResult.backupResults
    });
    
    return successResponse(
      res, 
      `Backup created successfully. ${successfulBackups}/${backupResult.totalCollections} collections backed up with ${totalDocuments} total documents.`, 
      { 
        backupResult,
        totalDocuments,
        successfulBackups,
        totalCollections: backupResult.totalCollections
      }
    );
  } catch (error) {
    logger.error("❌ Error creando backup", {
      error: error.message,
      stack: error.stack
    });
    return errorResponse(res, "Error creating backup", 500, error);
  }
};

/**
 * Clear all words and lectures (DANGEROUS - use with caution)
 */
export const clearAllData = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    logger.warn("⚠️ Iniciando limpieza completa de la base de datos (PELIGROSO)");
    
    // Get counts before deletion
    const wordsCountBefore = await Word.countDocuments();
    const lecturesCountBefore = await Lecture.countDocuments();
    const questionsCountBefore = await Question.countDocuments();
    const examsCountBefore = await Exam.countDocuments();
    const examAttemptsCountBefore = await ExamAttempt.countDocuments();
    const expressionsCountBefore = await Expression.countDocuments();
    const usersCountBefore = await User.countDocuments();
    
    logger.info("📊 Datos encontrados antes de la limpieza", {
      words: wordsCountBefore,
      lectures: lecturesCountBefore,
      questions: questionsCountBefore,
      exams: examsCountBefore,
      examAttempts: examAttemptsCountBefore,
      expressions: expressionsCountBefore,
      users: usersCountBefore
    });
    
    // Delete all data from all collections
    const wordsResult = await Word.deleteMany({});
    const lecturesResult = await Lecture.deleteMany({});
    const questionsResult = await Question.deleteMany({});
    const examsResult = await Exam.deleteMany({});
    const examAttemptsResult = await ExamAttempt.deleteMany({});
    const expressionsResult = await Expression.deleteMany({});
    const usersResult = await User.deleteMany({});
    
    logger.warn("✅ Limpieza completada exitosamente", {
      deletedWords: wordsResult.deletedCount,
      deletedLectures: lecturesResult.deletedCount,
      deletedQuestions: questionsResult.deletedCount,
      deletedExams: examsResult.deletedCount,
      deletedExamAttempts: examAttemptsResult.deletedCount,
      deletedExpressions: expressionsResult.deletedCount,
      deletedUsers: usersResult.deletedCount
    });
    
    return successResponse(
      res, 
      "All data cleared successfully", 
      { 
        deletedWords: wordsResult.deletedCount,
        deletedLectures: lecturesResult.deletedCount,
        deletedQuestions: questionsResult.deletedCount,
        deletedExams: examsResult.deletedCount,
        deletedExamAttempts: examAttemptsResult.deletedCount,
        deletedExpressions: expressionsResult.deletedCount,
        deletedUsers: usersResult.deletedCount,
        wordsBefore: wordsCountBefore,
        lecturesBefore: lecturesCountBefore,
        questionsBefore: questionsCountBefore,
        examsBefore: examsCountBefore,
        examAttemptsBefore: examAttemptsCountBefore,
        expressionsBefore: expressionsCountBefore,
        usersBefore: usersCountBefore
      }
    );
  } catch (error) {
    logger.error("❌ Error durante la limpieza de datos", {
      error: error.message,
      stack: error.stack
    });
    return errorResponse(res, "Error clearing data", 500, error);
  }
};

/**
 * Seed questions from JSON file
 */
export const seedQuestionsFromJson = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const seededQuestions = await seedQuestions();
    
    return successResponse(
      res, 
      "Questions seeded successfully", 
      { seededQuestions }
    );
  } catch (error) {
    return errorResponse(res, "Error seeding questions", 500, error);
  }
};

/**
 * Migrate words to review system (if migration service is available)
 */
export const migrateWordsToReviewSystem = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Uncomment when migration service is ready
    // const migrationResult = await migrationService.migrateWordsToReviewSystem();
    
    return successResponse(
      res, 
      "Migration completed successfully", 
      { message: "Migration service not yet implemented" }
    );
  } catch (error) {
    return errorResponse(res, "Error during migration", 500, error);
  }
};

/**
 * Get database statistics for development
 */
export const getDatabaseStats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const wordCount = await Word.countDocuments();
    const lectureCount = await Lecture.countDocuments();
    
    return successResponse(
      res, 
      "Database statistics retrieved", 
      { 
        totalWords: wordCount,
        totalLectures: lectureCount,
        timestamp: new Date().toISOString()
      }
    );
  } catch (error) {
    return errorResponse(res, "Error getting database stats", 500, error);
  }
};

/**
 * Recalculate reading time for ALL lectures based on their content
 * - Uses ~200 words per minute, minimum 1 minute when content exists
 */
export const recalculateLecturesTime = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const lectures = await Lecture.find({}, { _id: 1, content: 1, time: 1 });

    let updated = 0;
    const updates: Array<{ _id: string; oldTime: number; newTime: number }> = [];

    for (const lec of lectures) {
      const computed = calculateReadingTimeFromContent(lec.content || "");

      // Only update if different to avoid unnecessary writes
      if (typeof lec.time !== "number" || lec.time !== computed) {
        await Lecture.updateOne({ _id: lec._id }, { $set: { time: computed } });
        updates.push({ _id: lec._id.toString(), oldTime: lec.time as number, newTime: computed });
        updated++;
      }
    }

    return successResponse(res, `Recalculated time for ${updated} lectures`, {
      totalLectures: lectures.length,
      updated,
      updatesPreview: updates.slice(0, 20),
    });
  } catch (error) {
    return errorResponse(res, "Error recalculating lecture times", 500, error);
  }
};

// ===== CLEANER FUNCTIONS =====

/**
 * Delete ALL exam attempts (DANGEROUS - use with caution)
 * Requires authentication
 */
export const cleanExamAttempts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user?._id) {
      return errorResponse(res, "Usuario no autenticado", 401);
    }

    const result = await CleanerService.cleanExamAttempts();
    
    return successResponse(res, "TODOS los intentos de examen han sido eliminados exitosamente", {
      deletedCount: result.deletedCount,
      totalFound: result.totalFound,
      message: `Se eliminaron ${result.deletedCount} intentos de examen de un total de ${result.totalFound}`
    });
  } catch (error) {
    console.error("Error cleaning exam attempts:", error);
    return errorResponse(res, "Error al eliminar los intentos de examen", 500, error);
  }
};

/**
 * Delete ALL exams and their associated attempts (DANGEROUS - use with caution)
 * Requires authentication
 */
export const cleanExams = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user?._id) {
      return errorResponse(res, "Usuario no autenticado", 401);
    }

    const result = await CleanerService.cleanExams();
    
    return successResponse(res, "TODOS los exámenes han sido eliminados exitosamente", {
      deletedExams: result.deletedExams,
      deletedAttempts: result.deletedAttempts,
      totalExamsFound: result.totalExamsFound,
      totalAttemptsFound: result.totalAttemptsFound,
      message: `Se eliminaron ${result.deletedExams} exámenes y ${result.deletedAttempts} intentos asociados`
    });
  } catch (error) {
    console.error("Error cleaning exams:", error);
    return errorResponse(res, "Error al eliminar los exámenes", 500, error);
  }
};

/**
 * Delete ALL questions (DANGEROUS - use with caution)
 * Requires authentication
 */
export const cleanQuestions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user?._id) {
      return errorResponse(res, "Usuario no autenticado", 401);
    }

    const result = await CleanerService.cleanQuestions();
    
    return successResponse(res, "TODAS las preguntas han sido eliminadas exitosamente", {
      deletedCount: result.deletedCount,
      totalQuestionsBefore: result.totalQuestionsBefore,
      message: `Se eliminaron ${result.deletedCount} preguntas de un total de ${result.totalQuestionsBefore}`
    });
  } catch (error) {
    console.error("Error cleaning questions:", error);
    return errorResponse(res, "Error al eliminar las preguntas", 500, error);
  }
};

/**
 * Delete ALL words (DANGEROUS - use with caution)
 * Requires authentication
 */
export const cleanWords = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user?._id) {
      return errorResponse(res, "Usuario no autenticado", 401);
    }

    logger.warn("⚠️ Iniciando limpieza de palabras (PELIGROSO)", {
      userId: req.user._id,
      username: req.user.username
    });

    const wordsCountBefore = await Word.countDocuments();
    const result = await Word.deleteMany({});
    
    logger.warn("✅ Limpieza de palabras completada", {
      userId: req.user._id,
      deletedCount: result.deletedCount,
      totalBefore: wordsCountBefore
    });

    return successResponse(res, "TODAS las palabras han sido eliminadas exitosamente", {
      deletedCount: result.deletedCount,
      totalBefore: wordsCountBefore,
      message: `Se eliminaron ${result.deletedCount} palabras de un total de ${wordsCountBefore}`
    });
  } catch (error) {
    logger.error("❌ Error limpiando palabras", {
      error: error.message,
      stack: error.stack
    });
    return errorResponse(res, "Error al eliminar las palabras", 500, error);
  }
};

/**
 * Delete ALL lectures (DANGEROUS - use with caution)
 * Requires authentication
 */
export const cleanLectures = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user?._id) {
      return errorResponse(res, "Usuario no autenticado", 401);
    }

    logger.warn("⚠️ Iniciando limpieza de lecturas (PELIGROSO)", {
      userId: req.user._id,
      username: req.user.username
    });

    const lecturesCountBefore = await Lecture.countDocuments();
    const result = await Lecture.deleteMany({});
    
    logger.warn("✅ Limpieza de lecturas completada", {
      userId: req.user._id,
      deletedCount: result.deletedCount,
      totalBefore: lecturesCountBefore
    });

    return successResponse(res, "TODAS las lecturas han sido eliminadas exitosamente", {
      deletedCount: result.deletedCount,
      totalBefore: lecturesCountBefore,
      message: `Se eliminaron ${result.deletedCount} lecturas de un total de ${lecturesCountBefore}`
    });
  } catch (error) {
    logger.error("❌ Error limpiando lecturas", {
      error: error.message,
      stack: error.stack
    });
    return errorResponse(res, "Error al eliminar las lecturas", 500, error);
  }
};

/**
 * Delete ALL expressions (DANGEROUS - use with caution)
 * Requires authentication
 */
export const cleanExpressions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user?._id) {
      return errorResponse(res, "Usuario no autenticado", 401);
    }

    logger.warn("⚠️ Iniciando limpieza de expresiones (PELIGROSO)", {
      userId: req.user._id,
      username: req.user.username
    });

    const expressionsCountBefore = await Expression.countDocuments();
    const result = await Expression.deleteMany({});
    
    logger.warn("✅ Limpieza de expresiones completada", {
      userId: req.user._id,
      deletedCount: result.deletedCount,
      totalBefore: expressionsCountBefore
    });

    return successResponse(res, "TODAS las expresiones han sido eliminadas exitosamente", {
      deletedCount: result.deletedCount,
      totalBefore: expressionsCountBefore,
      message: `Se eliminaron ${result.deletedCount} expresiones de un total de ${expressionsCountBefore}`
    });
  } catch (error) {
    logger.error("❌ Error limpiando expresiones", {
      error: error.message,
      stack: error.stack
    });
    return errorResponse(res, "Error al eliminar las expresiones", 500, error);
  }
};

/**
 * Delete ALL users except current user (DANGEROUS - use with caution)
 * Requires authentication
 */
export const cleanUsers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user?._id) {
      return errorResponse(res, "Usuario no autenticado", 401);
    }

    logger.warn("⚠️ Iniciando limpieza de usuarios (PELIGROSO)", {
      userId: req.user._id,
      username: req.user.username
    });

    const usersCountBefore = await User.countDocuments();
    // No eliminar al usuario actual
    const result = await User.deleteMany({ _id: { $ne: req.user._id } });
    
    logger.warn("✅ Limpieza de usuarios completada", {
      userId: req.user._id,
      deletedCount: result.deletedCount,
      totalBefore: usersCountBefore,
      preservedCurrentUser: true
    });

    return successResponse(res, "TODOS los usuarios han sido eliminados exitosamente (usuario actual preservado)", {
      deletedCount: result.deletedCount,
      totalBefore: usersCountBefore,
      preservedCurrentUser: true,
      message: `Se eliminaron ${result.deletedCount} usuarios de un total de ${usersCountBefore} (usuario actual preservado)`
    });
  } catch (error) {
    logger.error("❌ Error limpiando usuarios", {
      error: error.message,
      stack: error.stack
    });
    return errorResponse(res, "Error al eliminar los usuarios", 500, error);
  }
};

/**
 * Update language for ALL lectures
 * @param req.body.language - The language to set for all lectures
 */
export const updateLecturesLanguage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { language } = req.body;
    
    if (!language) {
      return errorResponse(res, "Language is required", 400);
    }

    logger.info("🔄 Iniciando actualización de idioma para todas las lecturas", {
      language: language,
      userId: req.user?._id
    });

    const lecturesCountBefore = await Lecture.countDocuments();
    const result = await Lecture.updateMany({}, { language });
    
    logger.info("✅ Actualización de idioma completada", {
      language: language,
      modifiedCount: result.modifiedCount,
      totalLectures: lecturesCountBefore
    });

    return successResponse(
      res, 
      `Language updated successfully for all lectures to: ${language}`, 
      { 
        language: language,
        modifiedCount: result.modifiedCount,
        totalLectures: lecturesCountBefore
      }
    );
  } catch (error) {
    logger.error("❌ Error actualizando idioma de lecturas", {
      error: error.message,
      stack: error.stack
    });
    return errorResponse(res, "Error updating lectures language", 500, error);
  }
};
