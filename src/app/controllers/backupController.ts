import { Request, Response } from 'express';
import { sendBackupByEmail, testBackupService } from '../services/backup/backupEmailService';
import { testEmailConnection } from '../services/email/gmailService';
import { 
  startBackupScheduler, 
  stopBackupScheduler, 
  getCronStatus, 
  testCronExecution,
  updateCronSchedule 
} from '../services/backup/backupSchedulerService';
import { successResponse, errorResponse } from '../utils/responseHelpers';
import logger from '../utils/logger';

// Send backup immediately (for testing)
export const sendBackupNow = async (req: Request, res: Response) => {
  const operationId = Math.random().toString(36).substr(2, 9);
  const startTime = Date.now();

  try {
    logger.info('Manual backup request received', {
      operationId,
      userId: req.user?.id,
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString()
    });

    // Send backup by email
    const result = await sendBackupByEmail();

    if (!result.success) {
      logger.warn('Manual backup failed', {
        operationId,
        error: result.error,
        duration: Date.now() - startTime
      });

      return errorResponse(res, `Backup failed: ${result.error}`, 500);
    }

    const duration = Date.now() - startTime;
    logger.info('Manual backup completed successfully', {
      operationId,
      wordsCount: result.wordsCount,
      lecturesCount: result.lecturesCount,
      emailSent: result.emailSent,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    return successResponse(res, 'Backup sent successfully', {
      ...result,
      duration: `${duration}ms`
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    logger.error('Manual backup request failed', {
      operationId,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    return errorResponse(res, `Backup request failed: ${error.message}`, 500, error);
  }
};

// Test backup service (for debugging)
export const testBackup = async (req: Request, res: Response) => {
  const operationId = Math.random().toString(36).substr(2, 9);

  try {
    logger.info('Testing backup service', {
      operationId,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });

    // Test backup service
    const backupTestResult = await testBackupService();
    
    // Test email connection
    const emailTestResult = await testEmailConnection();

    const testResults = {
      backupService: backupTestResult,
      emailConnection: emailTestResult,
      timestamp: new Date().toISOString()
    };

    logger.info('Backup service test completed', {
      operationId,
      results: testResults
    });

    return successResponse(res, 'Backup service test completed', testResults);

  } catch (error: any) {
    logger.error('Backup service test failed', {
      operationId,
      error: {
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString()
    });

    return errorResponse(res, `Test failed: ${error.message}`, 500, error);
  }
};

// Get backup service status
export const getBackupStatus = async (req: Request, res: Response) => {
  const operationId = Math.random().toString(36).substr(2, 9);

  try {
    logger.info('Getting backup service status', {
      operationId,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });

    const status = {
      enabled: process.env.BACKUP_EMAIL_ENABLED === 'true',
      recipient: process.env.BACKUP_EMAIL_RECIPIENT || 'titoantifa69@gmail.com',
      gmailConfigured: !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
      timestamp: new Date().toISOString()
    };

    logger.info('Backup service status retrieved', {
      operationId,
      status
    });

    return successResponse(res, 'Backup service status retrieved', status);

  } catch (error: any) {
    logger.error('Failed to get backup service status', {
      operationId,
      error: {
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString()
    });

    return errorResponse(res, `Failed to get status: ${error.message}`, 500, error);
  }
};

// Test email connection only
export const testEmailOnly = async (req: Request, res: Response) => {
  const operationId = Math.random().toString(36).substr(2, 9);

  try {
    logger.info('Testing email connection only', {
      operationId,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });

    const emailTestResult = await testEmailConnection();

    const result = {
      emailConnection: emailTestResult,
      gmailConfigured: !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
      timestamp: new Date().toISOString()
    };

    logger.info('Email connection test completed', {
      operationId,
      result
    });

    return successResponse(res, 'Email connection test completed', result);

  } catch (error: any) {
    logger.error('Email connection test failed', {
      operationId,
      error: {
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString()
    });

    return errorResponse(res, `Email test failed: ${error.message}`, 500, error);
  }
};

// CRON MANAGEMENT ENDPOINTS

// Start cron scheduler
export const startCron = async (req: Request, res: Response) => {
  const operationId = Math.random().toString(36).substr(2, 9);

  try {
    logger.info('Starting cron scheduler', {
      operationId,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });

    const result = startBackupScheduler();

    if (result) {
      logger.info('Cron scheduler started successfully', { operationId });
      return successResponse(res, 'Cron scheduler started successfully', { isActive: true });
    } else {
      logger.warn('Failed to start cron scheduler', { operationId });
      return errorResponse(res, 'Failed to start cron scheduler', 500);
    }

  } catch (error: any) {
    logger.error('Error starting cron scheduler', {
      operationId,
      error: {
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString()
    });

    return errorResponse(res, `Error starting cron: ${error.message}`, 500, error);
  }
};

// Stop cron scheduler
export const stopCron = async (req: Request, res: Response) => {
  const operationId = Math.random().toString(36).substr(2, 9);

  try {
    logger.info('Stopping cron scheduler', {
      operationId,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });

    const result = stopBackupScheduler();

    if (result) {
      logger.info('Cron scheduler stopped successfully', { operationId });
      return successResponse(res, 'Cron scheduler stopped successfully', { isActive: false });
    } else {
      logger.warn('Failed to stop cron scheduler', { operationId });
      return errorResponse(res, 'Failed to stop cron scheduler', 500);
    }

  } catch (error: any) {
    logger.error('Error stopping cron scheduler', {
      operationId,
      error: {
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString()
    });

    return errorResponse(res, `Error stopping cron: ${error.message}`, 500, error);
  }
};

// Get cron status
export const getCronStatusController = async (req: Request, res: Response) => {
  const operationId = Math.random().toString(36).substr(2, 9);

  try {
    logger.info('Getting cron status', {
      operationId,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });

    const status = getCronStatus();

    logger.info('Cron status retrieved successfully', {
      operationId,
      status
    });

    return successResponse(res, 'Cron status retrieved successfully', status);

  } catch (error: any) {
    logger.error('Error getting cron status', {
      operationId,
      error: {
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString()
    });

    return errorResponse(res, `Error getting cron status: ${error.message}`, 500, error);
  }
};

// Test cron execution
export const testCron = async (req: Request, res: Response) => {
  const operationId = Math.random().toString(36).substr(2, 9);

  try {
    logger.info('Testing cron execution', {
      operationId,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });

    const result = await testCronExecution();

    if (result) {
      logger.info('Cron execution test completed successfully', { operationId });
      return successResponse(res, 'Cron execution test completed successfully', { success: true });
    } else {
      logger.warn('Cron execution test failed', { operationId });
      return errorResponse(res, 'Cron execution test failed', 500);
    }

  } catch (error: any) {
    logger.error('Error testing cron execution', {
      operationId,
      error: {
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString()
    });

    return errorResponse(res, `Error testing cron: ${error.message}`, 500, error);
  }
};

// Update cron schedule
export const updateCronScheduleController = async (req: Request, res: Response) => {
  const operationId = Math.random().toString(36).substr(2, 9);
  const { schedule } = req.body;

  try {
    logger.info('Updating cron schedule', {
      operationId,
      userId: req.user?.id,
      newSchedule: schedule,
      timestamp: new Date().toISOString()
    });

    if (!schedule) {
      return errorResponse(res, 'Schedule is required', 400);
    }

    const result = updateCronSchedule(schedule);

    if (result) {
      logger.info('Cron schedule updated successfully', { operationId, schedule });
      return successResponse(res, 'Cron schedule updated successfully', { schedule });
    } else {
      logger.warn('Failed to update cron schedule', { operationId, schedule });
      return errorResponse(res, 'Failed to update cron schedule', 500);
    }

  } catch (error: any) {
    logger.error('Error updating cron schedule', {
      operationId,
      error: {
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString()
    });

    return errorResponse(res, `Error updating cron schedule: ${error.message}`, 500, error);
  }
};
