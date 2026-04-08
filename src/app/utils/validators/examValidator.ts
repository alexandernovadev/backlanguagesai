import { IExam, IExamQuestion } from "../../../../types/models";
import { ValidationResult } from "../importTypes";

const VALID_DIFFICULTIES = ["A1", "A2", "B1", "B2", "C1", "C2"];
const VALID_QUESTION_TYPES = ["multiple", "unique", "fillInBlank", "translateText"];

export class ExamValidator {
  static validateQuestion(q: Partial<IExamQuestion>, qIndex: number): string[] {
    const errors: string[] = [];

    if (!q.type || !VALID_QUESTION_TYPES.includes(q.type)) {
      errors.push(`Question[${qIndex}]: type is required and must be one of: ${VALID_QUESTION_TYPES.join(", ")}`);
    }
    if (!q.text || typeof q.text !== "string" || q.text.trim().length === 0) {
      errors.push(`Question[${qIndex}]: text is required`);
    }
    if (!q.grammarTopic || typeof q.grammarTopic !== "string" || q.grammarTopic.trim().length === 0) {
      errors.push(`Question[${qIndex}]: grammarTopic is required`);
    }
    if (!q.explanation || typeof q.explanation !== "string" || q.explanation.trim().length === 0) {
      errors.push(`Question[${qIndex}]: explanation is required`);
    }

    const type = q.type;
    if (type === "multiple" || type === "unique") {
      if (!Array.isArray(q.options) || q.options.length < 2) {
        errors.push(`Question[${qIndex}]: options array with at least 2 items is required for type "${type}"`);
      }
    }
    if (type === "multiple") {
      if (!Array.isArray(q.correctIndices) || q.correctIndices.length === 0) {
        errors.push(`Question[${qIndex}]: correctIndices is required for type "multiple"`);
      }
    }
    if (type === "unique") {
      if (q.correctIndex === undefined || typeof q.correctIndex !== "number") {
        errors.push(`Question[${qIndex}]: correctIndex is required for type "unique"`);
      }
    }
    if (type === "fillInBlank" || type === "translateText") {
      if (!q.correctAnswer || typeof q.correctAnswer !== "string" || q.correctAnswer.trim().length === 0) {
        errors.push(`Question[${qIndex}]: correctAnswer is required for type "${type}"`);
      }
    }

    return errors;
  }

  static validateExam(exam: Partial<IExam>, index: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!exam.title || typeof exam.title !== "string" || exam.title.trim().length === 0) {
      errors.push("title is required");
    }
    if (!exam.language || typeof exam.language !== "string" || exam.language.trim().length === 0) {
      errors.push("language is required");
    }
    if (!exam.difficulty || !VALID_DIFFICULTIES.includes(exam.difficulty)) {
      errors.push(`difficulty is required and must be one of: ${VALID_DIFFICULTIES.join(", ")}`);
    }
    if (!Array.isArray(exam.grammarTopics) || exam.grammarTopics.length === 0) {
      errors.push("grammarTopics must be a non-empty array");
    }
    if (!Array.isArray(exam.questions) || exam.questions.length === 0) {
      errors.push("questions must be a non-empty array");
    } else {
      for (let i = 0; i < exam.questions.length; i++) {
        const qErrors = ExamValidator.validateQuestion(exam.questions[i], i);
        errors.push(...qErrors);
      }
    }

    if (exam.questions && exam.questions.length > 50) {
      warnings.push("Exam has more than 50 questions");
    }

    return { isValid: errors.length === 0, errors, warnings };
  }
}
