import { IQuestion } from "../../db/models/Question";
import { ValidationResult } from "../importTypes";

export class QuestionValidator {
  static validateQuestion(question: Partial<IQuestion>, index: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!question.text || question.text.trim().length === 0) {
      errors.push('Question text is required');
    }

    if (!question.type) {
      errors.push('Question type is required');
    } else if (!['single_choice', 'multiple_choice', 'fill_blank', 'translate', 'true_false', 'writing'].includes(question.type)) {
      errors.push('Invalid question type');
    }

    if (!question.level) {
      errors.push('Question level is required');
    } else if (!['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(question.level)) {
      errors.push('Invalid question level');
    }

    // Optional fields validation
    if (question.topic !== undefined && typeof question.topic !== 'string') {
      errors.push('Topic must be a string');
    }
    if (question.difficulty !== undefined && (typeof question.difficulty !== 'number' || question.difficulty < 1 || question.difficulty > 5)) {
      errors.push('Difficulty must be a number between 1 and 5');
    }
    if (question.explanation !== undefined && typeof question.explanation !== 'string') {
      errors.push('Explanation must be a string');
    }
    if (question.tags !== undefined && !Array.isArray(question.tags)) {
      errors.push('Tags must be an array');
    }

    // Options validation (for multiple choice and true_false)
    if (question.options !== undefined) {
      if (!Array.isArray(question.options)) {
        errors.push('Options must be an array');
      } else {
        question.options.forEach((option, optionIndex) => {
          if (!option.value || typeof option.value !== 'string') {
            errors.push(`Option ${optionIndex + 1} value is required and must be a string`);
          }
          if (!option.label || typeof option.label !== 'string') {
            errors.push(`Option ${optionIndex + 1} label is required and must be a string`);
          }
          if (typeof option.isCorrect !== 'boolean') {
            errors.push(`Option ${optionIndex + 1} isCorrect must be a boolean`);
          }
        });
      }
    }

    // Correct answers validation (for fill_blank and writing)
    if (question.correctAnswers !== undefined) {
      if (!Array.isArray(question.correctAnswers)) {
        errors.push('Correct answers must be an array');
      } else {
        question.correctAnswers.forEach((answer, answerIndex) => {
          if (!answer || typeof answer !== 'string' || answer.trim().length === 0) {
            errors.push(`Correct answer ${answerIndex + 1} must be a non-empty string`);
          }
        });
      }
    }

    // Media validation
    if (question.media !== undefined) {
      if (typeof question.media !== 'object') {
        errors.push('Media must be an object');
      } else {
        if (question.media.audio !== undefined && typeof question.media.audio !== 'string') {
          errors.push('Media audio must be a string');
        }
        if (question.media.image !== undefined && typeof question.media.image !== 'string') {
          errors.push('Media image must be a string');
        }
        if (question.media.video !== undefined && typeof question.media.video !== 'string') {
          errors.push('Media video must be a string');
        }
      }
    }

    // Type-specific validations
    if (question.type === 'single_choice' || question.type === 'multiple_choice' || question.type === 'true_false') {
      if (!question.options || question.options.length === 0) {
        errors.push(`${question.type} questions must have options`);
      }
      if (question.options && question.options.length > 0) {
        const correctOptions = question.options.filter(opt => opt.isCorrect);
        if (correctOptions.length === 0) {
          errors.push(`${question.type} questions must have at least one correct option`);
        }
      }
    }

    if (question.type === 'fill_blank' || question.type === 'writing') {
      if (!question.correctAnswers || question.correctAnswers.length === 0) {
        errors.push(`${question.type} questions must have correct answers`);
      }
    }

    // Warnings
    if (question.text && question.text.length > 1000) {
      warnings.push('Question text is very long (>1000 characters)');
    }
    if (question.explanation && question.explanation.length > 1000) {
      warnings.push('Explanation is very long (>1000 characters)');
    }
    if (question.topic && question.topic.length > 200) {
      warnings.push('Topic is very long (>200 characters)');
    }
    if (question.tags && question.tags.length > 10) {
      warnings.push('Too many tags (>10)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateQuestions(questions: Partial<IQuestion>[]): ValidationResult[] {
    return questions.map((question, index) => this.validateQuestion(question, index));
  }
} 