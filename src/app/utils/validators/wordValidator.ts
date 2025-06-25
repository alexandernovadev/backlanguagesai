import { IWord } from "../../db/models/Word";
import { ValidationResult } from "../importTypes";

export class WordValidator {
  static validateWord(word: Partial<IWord>, index: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!word.word || typeof word.word !== 'string' || word.word.trim().length === 0) {
      errors.push('Word is required and must be a non-empty string');
    }
    if (!word.level || !['easy', 'medium', 'hard'].includes(word.level)) {
      errors.push('Level is required and must be one of: easy, medium, hard');
    }
    if (!word.language || typeof word.language !== 'string' || word.language.trim().length === 0) {
      errors.push('Language is required and must be a non-empty string');
    }
    if (!word.type || !Array.isArray(word.type) || word.type.length === 0) {
      errors.push('Type is required and must be a non-empty array');
    }

    // Optional fields
    if (word.seen !== undefined && (typeof word.seen !== 'number' || word.seen < 0)) {
      errors.push('Seen must be a non-negative number');
    }
    if (word.definition !== undefined && typeof word.definition !== 'string') {
      errors.push('Definition must be a string');
    }
    if (word.IPA !== undefined && typeof word.IPA !== 'string') {
      errors.push('IPA must be a string');
    }
    if (word.img !== undefined && typeof word.img !== 'string') {
      errors.push('Img must be a string');
    }
    if (word.examples !== undefined && !Array.isArray(word.examples)) {
      errors.push('Examples must be an array');
    }
    if (word.sinonyms !== undefined && !Array.isArray(word.sinonyms)) {
      errors.push('Sinonyms must be an array');
    }
    if (word.codeSwitching !== undefined && !Array.isArray(word.codeSwitching)) {
      errors.push('CodeSwitching must be an array');
    }

    // Warnings
    if (word.word && word.word.length > 100) {
      warnings.push('Word is very long (>100 characters)');
    }
    if (word.definition && word.definition.length > 1000) {
      warnings.push('Definition is very long (>1000 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateWords(words: Partial<IWord>[]): ValidationResult[] {
    return words.map((word, index) => this.validateWord(word, index));
  }
} 