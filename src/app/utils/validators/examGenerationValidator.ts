import { ValidationResult } from "../importTypes";

export interface ExamGenerationParams {
  topic: string;
  grammarTopics?: string[];
  level?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  numberOfQuestions?: number;
  types?: string[];
  difficulty?: number;
  userLang?: string;
}

export class ExamGenerationValidator {
  static validateExamGeneration(params: ExamGenerationParams): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!params.topic || typeof params.topic !== 'string' || params.topic.trim().length === 0) {
      errors.push('Topic is required and must be a non-empty string');
    }

    // Grammar topics validation
    if (params.grammarTopics !== undefined) {
      if (!Array.isArray(params.grammarTopics)) {
        errors.push('Grammar topics must be an array');
      } else {
        if (params.grammarTopics.length > 10) {
          errors.push('Maximum 10 grammar topics allowed');
        }
        
        // Validate each grammar topic
        params.grammarTopics.forEach((topic, index) => {
          if (typeof topic !== 'string' || topic.trim().length === 0) {
            errors.push(`Grammar topic ${index + 1} must be a non-empty string`);
          }
          if (topic.length > 100) {
            errors.push(`Grammar topic ${index + 1} is too long (max 100 characters)`);
          }
        });
      }
    }

    // Level validation
    if (params.level !== undefined && !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(params.level)) {
      errors.push('Level must be one of: A1, A2, B1, B2, C1, C2');
    }

    // Number of questions validation
    if (params.numberOfQuestions !== undefined) {
      if (typeof params.numberOfQuestions !== 'number') {
        errors.push('Number of questions must be a number');
      } else if (params.numberOfQuestions < 1 || params.numberOfQuestions > 50) {
        errors.push('Number of questions must be between 1 and 50');
      }
    }

    // Types validation
    if (params.types !== undefined) {
      if (!Array.isArray(params.types)) {
        errors.push('Types must be an array');
      } else {
        const validTypes = ['multiple_choice', 'fill_blank', 'true_false', 'translate', 'writing'];
        params.types.forEach((type, index) => {
          if (!validTypes.includes(type)) {
            errors.push(`Type ${index + 1} must be one of: ${validTypes.join(', ')}`);
          }
        });
        
        if (params.types.length === 0) {
          errors.push('At least one question type must be selected');
        }
      }
    }

    // Difficulty validation
    if (params.difficulty !== undefined) {
      if (typeof params.difficulty !== 'number') {
        errors.push('Difficulty must be a number');
      } else if (params.difficulty < 1 || params.difficulty > 5) {
        errors.push('Difficulty must be between 1 and 5');
      }
    }

    // User language validation
    if (params.userLang !== undefined) {
      if (typeof params.userLang !== 'string' || params.userLang.trim().length === 0) {
        errors.push('User language must be a non-empty string');
      } else if (params.userLang.length > 10) {
        errors.push('User language is too long (max 10 characters)');
      }
    }

    // Topic length warning
    if (params.topic && params.topic.length > 200) {
      warnings.push('Topic is very long (>200 characters)');
    }

    // Grammar topics warnings
    if (params.grammarTopics && params.grammarTopics.length > 5) {
      warnings.push('Many grammar topics selected (>5) - this may affect question distribution');
    }

    // Number of questions warnings
    if (params.numberOfQuestions && params.numberOfQuestions > 30) {
      warnings.push('Many questions requested (>30) - generation may take longer');
    }

    // Difficulty level warnings
    if (params.level && params.difficulty) {
      const levelDifficultyMap = {
        'A1': { min: 1, max: 2 },
        'A2': { min: 1, max: 3 },
        'B1': { min: 2, max: 4 },
        'B2': { min: 3, max: 5 },
        'C1': { min: 4, max: 5 },
        'C2': { min: 4, max: 5 }
      };
      
      const levelRange = levelDifficultyMap[params.level];
      if (levelRange && (params.difficulty < levelRange.min || params.difficulty > levelRange.max)) {
        warnings.push(`Difficulty ${params.difficulty} may not be appropriate for level ${params.level}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateExamGenerationBatch(params: ExamGenerationParams[]): ValidationResult[] {
    return params.map((param, index) => this.validateExamGeneration(param));
  }
} 