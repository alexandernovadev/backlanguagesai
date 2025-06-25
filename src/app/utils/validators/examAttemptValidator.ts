import { IExamAttempt } from "../../db/models/ExamAttempt";
import { ValidationResult } from "../importTypes";

export class ExamAttemptValidator {
  static validateExamAttempt(examAttempt: Partial<IExamAttempt>, index: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!examAttempt.exam || typeof examAttempt.exam !== 'string') {
      errors.push('Exam ID is required and must be a string');
    }
    if (!examAttempt.user || typeof examAttempt.user !== 'string') {
      errors.push('User ID is required and must be a string');
    }

    // Optional fields validation
    if (examAttempt.attemptNumber !== undefined && (typeof examAttempt.attemptNumber !== 'number' || examAttempt.attemptNumber < 1 || examAttempt.attemptNumber > 100)) {
      errors.push('Attempt number must be a number between 1 and 100');
    }
    if (examAttempt.duration !== undefined && (typeof examAttempt.duration !== 'number' || examAttempt.duration < 0 || examAttempt.duration > 172800)) {
      errors.push('Duration must be a number between 0 and 172800 seconds (48 hours)');
    }

    // Status validation
    if (examAttempt.status !== undefined && !['in_progress', 'submitted', 'graded'].includes(examAttempt.status)) {
      errors.push('Status must be one of: in_progress, submitted, graded');
    }

    // CEFR validation
    if (examAttempt.cefrEstimated !== undefined && !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(examAttempt.cefrEstimated)) {
      errors.push('CEFR estimated must be one of: A1, A2, B1, B2, C1, C2');
    }

    // Start and end time validation
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
          if (answer.isCorrect !== undefined && typeof answer.isCorrect !== 'boolean') {
            errors.push(`Answer ${answerIndex + 1} isCorrect must be a boolean`);
          }
          if (answer.score !== undefined && (typeof answer.score !== 'number' || answer.score < 0 || answer.score > 100)) {
            errors.push(`Answer ${answerIndex + 1} score must be a number between 0 and 100`);
          }
          if (answer.feedback !== undefined && typeof answer.feedback !== 'string') {
            errors.push(`Answer ${answerIndex + 1} feedback must be a string`);
          }
          if (answer.feedback && answer.feedback.length > 1000) {
            errors.push(`Answer ${answerIndex + 1} feedback is too long (max 1000 characters)`);
          }
          if (answer.submittedAt !== undefined && !(answer.submittedAt instanceof Date) && isNaN(Date.parse(answer.submittedAt as any))) {
            errors.push(`Answer ${answerIndex + 1} submitted at must be a valid date`);
          }
        });
      }
    }

    // AI Evaluation validation
    if (examAttempt.aiEvaluation !== undefined) {
      if (typeof examAttempt.aiEvaluation !== 'object') {
        errors.push('AI evaluation must be an object');
      } else {
        if (examAttempt.aiEvaluation.grammar !== undefined && (typeof examAttempt.aiEvaluation.grammar !== 'number' || examAttempt.aiEvaluation.grammar < 0 || examAttempt.aiEvaluation.grammar > 100)) {
          errors.push('AI evaluation grammar must be a number between 0 and 100');
        }
        if (examAttempt.aiEvaluation.fluency !== undefined && (typeof examAttempt.aiEvaluation.fluency !== 'number' || examAttempt.aiEvaluation.fluency < 0 || examAttempt.aiEvaluation.fluency > 100)) {
          errors.push('AI evaluation fluency must be a number between 0 and 100');
        }
        if (examAttempt.aiEvaluation.coherence !== undefined && (typeof examAttempt.aiEvaluation.coherence !== 'number' || examAttempt.aiEvaluation.coherence < 0 || examAttempt.aiEvaluation.coherence > 100)) {
          errors.push('AI evaluation coherence must be a number between 0 and 100');
        }
        if (examAttempt.aiEvaluation.vocabulary !== undefined && (typeof examAttempt.aiEvaluation.vocabulary !== 'number' || examAttempt.aiEvaluation.vocabulary < 0 || examAttempt.aiEvaluation.vocabulary > 100)) {
          errors.push('AI evaluation vocabulary must be a number between 0 and 100');
        }
        if (examAttempt.aiEvaluation.comments !== undefined && typeof examAttempt.aiEvaluation.comments !== 'string') {
          errors.push('AI evaluation comments must be a string');
        }
        if (examAttempt.aiEvaluation.comments && examAttempt.aiEvaluation.comments.length > 2000) {
          errors.push('AI evaluation comments is too long (max 2000 characters)');
        }
      }
    }

    // Notes validation
    if (examAttempt.aiNotes !== undefined && typeof examAttempt.aiNotes !== 'string') {
      errors.push('AI notes must be a string');
    }
    if (examAttempt.aiNotes && examAttempt.aiNotes.length > 3000) {
      errors.push('AI notes is too long (max 3000 characters)');
    }
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
    if (examAttempt.aiEvaluation) {
      const avgScore = [
        examAttempt.aiEvaluation.grammar,
        examAttempt.aiEvaluation.fluency,
        examAttempt.aiEvaluation.coherence,
        examAttempt.aiEvaluation.vocabulary
      ].filter(score => score !== undefined).reduce((sum, score) => sum + score!, 0) / 4;
      if (avgScore > 95) {
        warnings.push('Very high AI evaluation scores (>95 average) - consider reviewing');
      }
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