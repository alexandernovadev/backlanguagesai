import nodemailer from 'nodemailer';
import logger from '../../utils/logger';

// Gmail configuration
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const GMAIL_FROM_NAME = process.env.GMAIL_FROM_NAME || 'LanguageAI Backup System';

// Create transporter
const createTransporter = () => {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw new Error('Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD
    },
    secure: false, // Use TLS
    port: 587,
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send email with attachments
export const sendEmailWithAttachments = async (
  to: string,
  subject: string,
  text: string,
  attachments: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>
): Promise<boolean> => {
  const operationId = Math.random().toString(36).substr(2, 9);
  const startTime = Date.now();

  try {
    logger.info('Sending email with attachments', {
      operationId,
      to,
      subject,
      attachmentsCount: attachments.length,
      timestamp: new Date().toISOString()
    });

    const transporter = createTransporter();

    const mailOptions = {
      from: `"${GMAIL_FROM_NAME}" <${GMAIL_USER}>`,
      to,
      subject,
      text,
      attachments: attachments.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType || 'application/json'
      }))
    };

    const result = await transporter.sendMail(mailOptions);
    
    const duration = Date.now() - startTime;
    logger.info('Email sent successfully', {
      operationId,
      messageId: result.messageId,
      to,
      subject,
      attachmentsCount: attachments.length,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    return true;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error('Failed to send email', {
      operationId,
      to,
      subject,
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack
      },
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    return false;
  }
};

// Test email connection
export const testEmailConnection = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    
    logger.info('Gmail connection test successful');
    return true;
  } catch (error: any) {
    logger.error('Gmail connection test failed', {
      error: error.message,
      code: error.code
    });
    return false;
  }
};

export default {
  sendEmailWithAttachments,
  testEmailConnection
};
