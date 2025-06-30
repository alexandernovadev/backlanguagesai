import { IExam } from "../../db/models/Exam";
import { ValidationResult } from "../importTypes";

export class ExamValidator {
  static validateExam(exam: Partial<IExam>, index: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields (only validate if they are provided)
    if (exam.title !== undefined && (!exam.title || typeof exam.title !== 'string' || exam.title.trim().length === 0)) {
      errors.push('Title is required and must be a non-empty string');
    }
    if (exam.language !== undefined && (!exam.language || typeof exam.language !== 'string' || exam.language.trim().length === 0)) {
      errors.push('Language is required and must be a non-empty string');
    }
    if (exam.level !== undefined && (!exam.level || !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(exam.level))) {
      errors.push('Level is required and must be one of: A1, A2, B1, B2, C1, C2');
    }

    // Optional fields validation
    if (exam.description !== undefined && typeof exam.description !== 'string') {
      errors.push('Description must be a string');
    }
    if (exam.topic !== undefined && typeof exam.topic !== 'string') {
      errors.push('Topic must be a string');
    }
    if (exam.source !== undefined && !['manual', 'ai'].includes(exam.source)) {
      errors.push('Source must be one of: manual, ai');
    }
    if (exam.timeLimit !== undefined && (typeof exam.timeLimit !== 'number' || exam.timeLimit < 1 || exam.timeLimit > 480)) {
      errors.push('Time limit must be a number between 1 and 480 minutes');
    }
    if (exam.adaptive !== undefined && typeof exam.adaptive !== 'boolean') {
      errors.push('Adaptive must be a boolean');
    }
    if (exam.version !== undefined && (typeof exam.version !== 'number' || exam.version < 1)) {
      errors.push('Version must be a positive number');
    }

    // Questions validation
    if (exam.questions !== undefined) {
      if (!Array.isArray(exam.questions)) {
        errors.push('Questions must be an array');
      } else {
        if (exam.questions.length === 0) {
          errors.push('Exam must have at least one question');
        } else {
          exam.questions.forEach((questionItem, questionIndex) => {
            if (!questionItem.question) {
              errors.push(`Question ${questionIndex + 1} must have a question ID`);
            }
            if (questionItem.weight !== undefined && (typeof questionItem.weight !== 'number' || questionItem.weight < 0 || questionItem.weight > 10)) {
              errors.push(`Question ${questionIndex + 1} weight must be a number between 0 and 10`);
            }
            if (questionItem.order !== undefined && (typeof questionItem.order !== 'number' || questionItem.order < 0)) {
              errors.push(`Question ${questionIndex + 1} order must be a non-negative number`);
            }
          });
        }
      }
    }

    // CreatedBy validation (optional but if provided should be valid ObjectId)
    if (exam.createdBy !== undefined && typeof exam.createdBy !== 'string') {
      errors.push('CreatedBy must be a string (ObjectId)');
    }

    // Metadata validation
    if (exam.metadata !== undefined) {
      if (typeof exam.metadata !== 'object') {
        errors.push('Metadata must be an object');
      } else {
        if (exam.metadata.difficultyScore !== undefined && (typeof exam.metadata.difficultyScore !== 'number' || exam.metadata.difficultyScore < 0 || exam.metadata.difficultyScore > 100)) {
          errors.push('Metadata difficulty score must be a number between 0 and 100');
        }
        if (exam.metadata.estimatedDuration !== undefined && (typeof exam.metadata.estimatedDuration !== 'number' || exam.metadata.estimatedDuration < 1 || exam.metadata.estimatedDuration > 480)) {
          errors.push('Metadata estimated duration must be a number between 1 and 480 minutes');
        }
      }
    }

    // Warnings
    if (exam.title && exam.title.length > 200) {
      warnings.push('Title is very long (>200 characters)');
    }
    if (exam.description && exam.description.length > 1000) {
      warnings.push('Description is very long (>1000 characters)');
    }
    if (exam.topic && exam.topic.length > 200) {
      warnings.push('Topic is very long (>200 characters)');
    }
    if (exam.questions && exam.questions.length > 50) {
      warnings.push('Exam has many questions (>50)');
    }
    if (exam.timeLimit && exam.timeLimit > 240) {
      warnings.push('Time limit is very long (>4 hours)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateExams(exams: Partial<IExam>[]): ValidationResult[] {
    return exams.map((exam, index) => this.validateExam(exam, index));
  }
} 