import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
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
} from '../controllers/backupController';

const router = Router();

// Apply auth middleware to all backup routes
router.use(authMiddleware);

// Send backup immediately (for testing)
router.post('/send-now', sendBackupNow);

// Test backup service
router.get('/test', testBackup);

// Get backup service status
router.get('/status', getBackupStatus);

// Test email connection only
router.get('/test-email', testEmailOnly);

// CRON MANAGEMENT ROUTES
// Start cron scheduler
router.post('/cron/start', startCron);

// Stop cron scheduler
router.post('/cron/stop', stopCron);

// Get cron status
router.get('/cron/status', getCronStatusController);

// Test cron execution
router.post('/cron/test', testCron);

// Update cron schedule
router.put('/cron/schedule', updateCronScheduleController);

export default router;
