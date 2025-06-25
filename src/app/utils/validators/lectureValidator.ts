import { ILecture } from "../../db/models/Lecture";
import { ValidationResult } from "../importTypes";

export class LectureValidator {
  // Validate a single lecture
  static validateLecture(lecture: Partial<ILecture>, index: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!lecture.content || typeof lecture.content !== 'string' || lecture.content.trim().length === 0) {
      errors.push('Content is required and must be a non-empty string');
    }

    if (!lecture.level || !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(lecture.level)) {
      errors.push('Level is required and must be one of: A1, A2, B1, B2, C1, C2');
    }

    if (!lecture.language || typeof lecture.language !== 'string' || lecture.language.trim().length === 0) {
      errors.push('Language is required and must be a non-empty string');
    }

    if (!lecture.typeWrite || typeof lecture.typeWrite !== 'string' || lecture.typeWrite.trim().length === 0) {
      errors.push('TypeWrite is required and must be a non-empty string');
    }

    // Optional field validations
    if (lecture.time !== undefined && (typeof lecture.time !== 'number' || lecture.time < 0)) {
      errors.push('Time must be a non-negative number');
    }

    // urlAudio is optional and can be empty
    if (lecture.urlAudio !== undefined && lecture.urlAudio !== null && typeof lecture.urlAudio !== 'string') {
      errors.push('UrlAudio must be a string');
    }

    // img is optional and can be empty
    if (lecture.img !== undefined && lecture.img !== null && typeof lecture.img !== 'string') {
      errors.push('Img must be a string');
    }

    // Content length warning
    if (lecture.content && lecture.content.length > 10000) {
      warnings.push('Content is very long (>10,000 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Validate multiple lectures
  static validateLectures(lectures: Partial<ILecture>[]): ValidationResult[] {
    return lectures.map((lecture, index) => this.validateLecture(lecture, index));
  }

  // Check if lecture has required fields for basic validation
  static hasRequiredFields(lecture: Partial<ILecture>): boolean {
    return !!(
      lecture.content &&
      lecture.level &&
      lecture.language &&
      lecture.typeWrite
    );
  }

  // Validate level format
  static isValidLevel(level: string): boolean {
    return ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(level);
  }

  // Validate content length
  static validateContentLength(content: string, maxLength: number = 10000): boolean {
    return content.length <= maxLength;
  }
} 