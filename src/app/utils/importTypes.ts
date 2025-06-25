import { ILecture } from "../db/models/Lecture";
import { IWord } from "../db/models/Word";

// Estrategias para manejar duplicados
export type DuplicateStrategy = 'skip' | 'overwrite' | 'error' | 'merge';

// Configuración de importación
export interface ImportConfig {
  duplicateStrategy: DuplicateStrategy;
  validateOnly: boolean;
  batchSize: number;
}

// Resultado de validación
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Resultado de procesamiento genérico
export interface ProcessingResult<T = Partial<ILecture>> {
  index: number;
  data: T;
  status: 'valid' | 'invalid' | 'duplicate' | 'error';
  validationResult?: ValidationResult;
  error?: string;
  action?: 'skipped' | 'inserted' | 'updated' | 'merged';
}

// Resultado de procesamiento de un lote
export interface BatchResult {
  batchIndex: number;
  processed: number;
  valid: number;
  invalid: number;
  duplicates: number;
  errors: number;
  inserted: number;
  updated: number;
  skipped: number;
  results?: ProcessingResult[];
}

// Resultado final de la importación genérico
export interface ImportResult {
  totalItems: number;
  totalBatches: number;
  totalValid: number;
  totalInvalid: number;
  totalDuplicates: number;
  totalErrors: number;
  totalInserted: number;
  totalUpdated: number;
  totalSkipped: number;
  batches: BatchResult[];
  summary: {
    success: boolean;
    message: string;
    duration: number;
  };
}

// Tipos específicos para compatibilidad
export interface LectureProcessingResult extends ProcessingResult<Partial<ILecture>> {
  lecture: Partial<ILecture>; // Para compatibilidad hacia atrás
}

export interface WordProcessingResult extends ProcessingResult<Partial<IWord>> {
  word: Partial<IWord>; // Para compatibilidad hacia atrás
}

export interface LectureImportResult extends ImportResult {
  totalLectures: number; // Para compatibilidad hacia atrás
}

export interface WordImportResult extends ImportResult {
  totalWords: number; // Para compatibilidad hacia atrás
}

// Payload de la request de importación
export interface ImportRequest<T = Partial<ILecture>> {
  data: T[];
  config: ImportConfig;
} 