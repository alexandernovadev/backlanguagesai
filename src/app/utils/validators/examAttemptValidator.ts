import { IExamAttempt } from "../../db/models/ExamAttempt";
import { ValidationResult } from "../importTypes";

export class ExamAttemptValidator {
  static validateExamAttempt(examAttempt: Partial<IExamAttempt>, index: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!examAttempt.user) {
      errors.push('User is required');
    }
    if (!examAttempt.exam) {
      errors.push('Exam is required');
    }

    // Validate attempt number
    if (examAttempt.attemptNumber !== undefined) {
      if (typeof examAttempt.attemptNumber !== 'number') {
        errors.push('Attempt number must be a number');
      } else if (examAttempt.attemptNumber < 1 || examAttempt.attemptNumber > 100) {
        errors.push('Attempt number must be between 1 and 100');
      }
    }

    // Validate status
    if (examAttempt.status !== undefined) {
      if (!['in_progress', 'submitted', 'graded'].includes(examAttempt.status)) {
        errors.push('Status must be one of: in_progress, submitted, graded');
      }
    }

    // Validate dates
    if (examAttempt.startedAt !== undefined && !(examAttempt.startedAt instanceof Date) && isNaN(Date.parse(examAttempt.startedAt as any))) {
      errors.push('Started at must be a valid date');
    }
    if (examAttempt.submittedAt !== undefined && !(examAttempt.submittedAt instanceof Date) && isNaN(Date.parse(examAttempt.submittedAt as any))) {
      errors.push('Submitted at must be a valid date');
    }

    // Validate that submitted time is after started time if both exist
    if (examAttempt.startedAt && examAttempt.submittedAt) {
      const startedAt = examAttempt.startedAt instanceof Date ? examAttempt.startedAt : new Date(examAttempt.startedAt);
      const submittedAt = examAttempt.submittedAt instanceof Date ? examAttempt.submittedAt : new Date(examAttempt.submittedAt);
      if (submittedAt <= startedAt) {
        errors.push('Submitted at must be after started at');
      }
    }

    // Answers validation
    if (examAttempt.answers !== undefined) {
      if (!Array.isArray(examAttempt.answers)) {
        errors.push('Answers must be an array');
      } else {
        examAttempt.answers.forEach((answer, answerIndex) => {
          if (!answer.question) {
            errors.push(`Answer ${answerIndex + 1} must have a question ID`);
          }
          if (answer.answer === undefined) {
            errors.push(`Answer ${answerIndex + 1} must have an answer`);
          }
          if (answer.submittedAt !== undefined && !(answer.submittedAt instanceof Date) && isNaN(Date.parse(answer.submittedAt as any))) {
            errors.push(`Answer ${answerIndex + 1} submitted at must be a valid date`);
          }
        });
      }
    }

    // Duration validation
    if (examAttempt.duration !== undefined) {
      if (typeof examAttempt.duration !== 'number') {
        errors.push('Duration must be a number');
      } else if (examAttempt.duration < 0 || examAttempt.duration > 172800) {
        errors.push('Duration must be between 0 and 172800 seconds (48 hours)');
      }
    }

    // User notes validation
    if (examAttempt.userNotes !== undefined && typeof examAttempt.userNotes !== 'string') {
      errors.push('User notes must be a string');
    }
    if (examAttempt.userNotes && examAttempt.userNotes.length > 1000) {
      errors.push('User notes is too long (max 1000 characters)');
    }

    // Warnings
    if (examAttempt.duration !== undefined && examAttempt.duration < 60) {
      warnings.push('Very short duration (<1 minute) - consider reviewing');
    }
    if (examAttempt.answers && examAttempt.answers.length > 50) {
      warnings.push('Many answers (>50) - consider reviewing');
    }
    if (examAttempt.attemptNumber && examAttempt.attemptNumber > 5) {
      warnings.push('High attempt number (>5) - consider reviewing');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateExamAttempts(examAttempts: Partial<IExamAttempt>[]): ValidationResult[] {
    return examAttempts.map((examAttempt, index) => this.validateExamAttempt(examAttempt, index));
  }
} 