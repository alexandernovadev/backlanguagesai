import { ILecture } from "../db/models/Lecture";

// Estrategias para manejar duplicados
export type DuplicateStrategy = 'skip' | 'overwrite' | 'error' | 'merge';

// Configuración de importación
export interface ImportConfig {
  duplicateStrategy: DuplicateStrategy;
  validateOnly: boolean;
  batchSize: number;
}

// Resultado de validación de una lectura
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Resultado de procesamiento de una lectura
export interface ProcessingResult {
  index: number;
  lecture: Partial<ILecture>;
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

// Resultado final de la importación
export interface ImportResult {
  totalLectures: number;
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

// Payload de la request de importación
export interface ImportRequest {
  lectures: Partial<ILecture>[];
  config: ImportConfig;
} 