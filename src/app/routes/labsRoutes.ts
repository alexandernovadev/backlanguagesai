import { Router } from "express";
import { 
  updateWordsLevel,
  resetWordsSeenCount,
  createAdminUser,
  createTestUsers,
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
  updateLecturesLanguage,
  recalculateLecturesTime
} from "../controllers/labsController";
import {
  sendBackupNow,
  testBackup,
  getBackupStatus,
  testEmailOnly,
  startCron,
  stopCron,
  getCronStatusController,
  testCron,
  updateCronScheduleController
} from "../controllers/backupController";

const routes = Router();

// Database operations
routes.post("/words/update-level", updateWordsLevel);
routes.post("/words/reset-seen", resetWordsSeenCount);
routes.post("/lectures/update-language", updateLecturesLanguage);
routes.post("/lectures/recalculate-time", recalculateLecturesTime);

// User management
routes.post("/users/create-admin", createAdminUser);
routes.post("/users/create-test-users", createTestUsers);
routes.post("/users/create-test-users", createTestUsers);

// Data seeding
routes.post("/seed/initial-data", seedInitialData);
routes.post("/seed/questions", seedQuestionsFromJson);

// Backup and maintenance
routes.post("/backup/create", createBackup);
routes.delete("/data/clear-all", clearAllData);

// Backup service (migrated from /api/backup)
routes.post("/backup/send-now", sendBackupNow);
routes.get("/backup/test", testBackup);
routes.get("/backup/status", getBackupStatus);
routes.get("/backup/test-email", testEmailOnly);
routes.post("/backup/cron/start", startCron);
routes.post("/backup/cron/stop", stopCron);
routes.get("/backup/cron/status", getCronStatusController);
routes.post("/backup/cron/test", testCron);
routes.put("/backup/cron/schedule", updateCronScheduleController);

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


