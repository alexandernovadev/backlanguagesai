import { Router } from "express";
import { 
  updateWordsLevel,
  resetWordsSeenCount,
  createAdminUser,
  seedInitialData,
  createBackup,
  clearAllData,
  seedQuestionsFromJson,
  migrateWordsToReviewSystem,
  getDatabaseStats,
  cleanExamAttempts,
  cleanExams,
  cleanQuestions,
  cleanWords,
  cleanLectures,
  cleanExpressions,
  cleanUsers,
  updateLecturesLanguage
} from "../controllers/labsController";

const routes = Router();

// Database operations
routes.post("/words/update-level", updateWordsLevel);
routes.post("/words/reset-seen", resetWordsSeenCount);
routes.post("/lectures/update-language", updateLecturesLanguage);

// User management
routes.post("/users/create-admin", createAdminUser);

// Data seeding
routes.post("/seed/initial-data", seedInitialData);
routes.post("/seed/questions", seedQuestionsFromJson);

// Backup and maintenance
routes.post("/backup/create", createBackup);
routes.delete("/data/clear-all", clearAllData);

// Migration
routes.post("/migrate/words-to-review", migrateWordsToReviewSystem);

// Statistics
routes.get("/stats/database", getDatabaseStats);

// ===== CLEANER ROUTES (DANGEROUS - use with caution) =====
routes.delete("/clean/exam-attempts", cleanExamAttempts);
routes.delete("/clean/exams", cleanExams);
routes.delete("/clean/questions", cleanQuestions);
routes.delete("/clean/words", cleanWords);
routes.delete("/clean/lectures", cleanLectures);
routes.delete("/clean/expressions", cleanExpressions);
routes.delete("/clean/users", cleanUsers);

export default routes;
