import mongoose, { Schema, Document } from "mongoose";

// Definir la interfaz del documento
export interface IExam extends Document {
  title: string;
  slug: string; // URL-friendly identifier
  description?: string;
  language: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  topic?: string;
  questions: Array<{
    question: mongoose.Types.ObjectId;
    weight: number;
    order: number;
  }>;
  createdBy?: mongoose.Types.ObjectId;
  source: 'manual' | 'ai';
  timeLimit?: number;
  adaptive: boolean;
  maxAttempts?: number; // NUEVO: máximo de intentos permitidos
  metadata?: {
    difficultyScore?: number;
    estimatedDuration?: number;
  };
  version: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Definir el esquema
const ExamSchema = new Schema<IExam>(
  {
    title: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      minlength: 1,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    language: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 10,
    },
    level: {
      type: String,
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      required: true,
    },
    topic: {
      type: String,
      maxlength: 200,
    },
    questions: [
      {
        question: {
          type: Schema.Types.ObjectId,
          ref: 'Question',
          required: true,
        },
        weight: {
          type: Number,
          default: 1,
          min: 0,
          max: 10,
        },
        order: {
          type: Number,
          min: 0,
        },
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    source: {
      type: String,
      enum: ['manual', 'ai'],
      default: 'ai',
    },
    timeLimit: {
      type: Number,
      min: 1, // Mínimo 1 minuto
      max: 480, // Máximo 8 horas
    },
    adaptive: {
      type: Boolean,
      default: false,
    },
    maxAttempts: {
      type: Number,
      min: 1,
      max: 10,
      default: 3, // Por defecto 3 intentos
    },
    metadata: {
      difficultyScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      estimatedDuration: {
        type: Number,
        min: 1,
        max: 480,
      },
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// 🚀 Índices para optimizar consultas
ExamSchema.index({ level: 1, language: 1 }); // Consultas por nivel e idioma
ExamSchema.index({ topic: 1 }); // Consultas por tema
ExamSchema.index({ createdBy: 1 }); // Consultas por creador
ExamSchema.index({ source: 1 }); // Consultas por fuente
ExamSchema.index({ createdAt: -1 }); // Ordenamiento por fecha
ExamSchema.index({ slug: 1 }, { unique: true }); // Índice único para slug

// Crear el modelo
const Exam = mongoose.model<IExam>("Exam", ExamSchema);

export default Exam; 