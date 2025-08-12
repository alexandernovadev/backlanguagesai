import { WordService } from '../words/wordService';
import { LectureService } from '../lectures/LectureService';
import { sendEmailWithAttachments } from '../email/gmailService';
import logger from '../../utils/logger';

const wordService = new WordService();
const lectureService = new LectureService();

// Backup email configuration
const BACKUP_EMAIL_RECIPIENT = process.env.BACKUP_EMAIL_RECIPIENT || 'titoantifa69@gmail.com';
const BACKUP_EMAIL_ENABLED = process.env.BACKUP_EMAIL_ENABLED === 'true';

export interface BackupResult {
  success: boolean;
  wordsCount: number;
  lecturesCount: number;
  emailSent: boolean;
  messageId?: string;
  error?: string;
  timestamp: string;
  duration: number;
}

// Generate backup files and send by email
export const sendBackupByEmail = async (): Promise<BackupResult> => {
  const operationId = Math.random().toString(36).substr(2, 9);
  const startTime = Date.now();

  try {
    logger.info('Starting backup email process', {
      operationId,
      recipient: BACKUP_EMAIL_RECIPIENT,
      enabled: BACKUP_EMAIL_ENABLED,
      timestamp: new Date().toISOString()
    });

    if (!BACKUP_EMAIL_ENABLED) {
      throw new Error('Backup email service is disabled');
    }

    // 1. Generate backup data
    logger.info('Generating backup data', { operationId });
    
    const words = await wordService.getAllWordsForExport();
    const lectures = await lectureService.getAllLecturesForExport();

    logger.info('Backup data generated', {
      operationId,
      wordsCount: words.length,
      lecturesCount: lectures.length
    });

    // 2. Create backup files with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const wordsFilename = `words-backup-${timestamp}.json`;
    const lecturesFilename = `lectures-backup-${timestamp}.json`;

    // 3. Prepare email content
    const emailSubject = `🔒 Backup Diario - LanguageAI [${new Date().toLocaleDateString('es-ES')}]`;
    const emailText = `Backup completado exitosamente.

📊 Resumen:
- Words: ${words.length} registros
- Lectures: ${lectures.length} registros
- Fecha: ${new Date().toLocaleDateString('es-ES')}
- Hora: ${new Date().toLocaleTimeString('es-ES')}

📎 Archivos adjuntos:
- ${wordsFilename}
- ${lecturesFilename}

Este backup se genera automáticamente todos los días.`;

    // 4. Prepare attachments
    const attachments = [
      {
        filename: wordsFilename,
        content: JSON.stringify(words, null, 2),
        contentType: 'application/json'
      },
      {
        filename: lecturesFilename,
        content: JSON.stringify(lectures, null, 2),
        contentType: 'application/json'
      }
    ];

    // 5. Send email
    logger.info('Sending backup email', {
      operationId,
      recipient: BACKUP_EMAIL_RECIPIENT,
      subject: emailSubject,
      attachmentsCount: attachments.length
    });

    const emailSent = await sendEmailWithAttachments(
      BACKUP_EMAIL_RECIPIENT,
      emailSubject,
      emailText,
      attachments
    );

    if (!emailSent) {
      throw new Error('Failed to send backup email');
    }

    const duration = Date.now() - startTime;
    
    logger.info('Backup email sent successfully', {
      operationId,
      wordsCount: words.length,
      lecturesCount: lectures.length,
      recipient: BACKUP_EMAIL_RECIPIENT,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      wordsCount: words.length,
      lecturesCount: lectures.length,
      emailSent: true,
      timestamp: new Date().toISOString(),
      duration
    };

  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    logger.error('Backup email process failed', {
      operationId,
      error: {
        message: error.message,
        stack: error.stack
      },
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    return {
      success: false,
      wordsCount: 0,
      lecturesCount: 0,
      emailSent: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      duration
    };
  }
};

// Test backup service
export const testBackupService = async (): Promise<boolean> => {
  try {
    logger.info('Testing backup service...');
    
    // Test data generation
    const words = await wordService.getAllWordsForExport();
    const lectures = await lectureService.getAllLecturesForExport();
    
    logger.info('Backup service test successful', {
      wordsCount: words.length,
      lecturesCount: lectures.length
    });
    
    return true;
  } catch (error: any) {
    logger.error('Backup service test failed', {
      error: error.message,
      stack: error.stack
    });
    return false;
  }
};

export default {
  sendBackupByEmail,
  testBackupService
};
