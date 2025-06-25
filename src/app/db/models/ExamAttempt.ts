import mongoose, { Schema, Document } from "mongoose";

// Definir la interfaz del documento
export interface IExamAttempt extends Document {
  user: mongoose.Types.ObjectId;
  exam: mongoose.Types.ObjectId;
  attemptNumber: number;
  answers: Array<{
    question: mongoose.Types.ObjectId;
    answer: any; // Mixed type for flexible answers
    isCorrect?: boolean;
    score?: number;
    feedback?: string;
    submittedAt: Date;
  }>;
  startedAt: Date;
  submittedAt?: Date;
  duration?: number;
  status: 'in_progress' | 'submitted' | 'graded';
  passed?: boolean;
  cefrEstimated?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  aiEvaluation?: {
    grammar?: number;
    fluency?: number;
    coherence?: number;
    vocabulary?: number;
    comments?: string;
  };
  aiNotes?: string;
  userNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Definir el esquema
const ExamAttemptSchema = new Schema<IExamAttempt>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    exam: {
      type: Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    attemptNumber: {
      type: Number,
      default: 1,
      min: 1,
      max: 100,
    },
    answers: [
      {
        question: {
          type: Schema.Types.ObjectId,
          ref: 'Question',
          required: true,
        },
        answer: {
          type: Schema.Types.Mixed,
          required: true,
        },
        isCorrect: {
          type: Boolean,
        },
        score: {
          type: Number,
          min: 0,
          max: 100,
        },
        feedback: {
          type: String,
          maxlength: 1000,
        },
        submittedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
    },
    duration: {
      type: Number,
      min: 0, // Duración en segundos
      max: 172800, // Máximo 48 horas
    },
    status: {
      type: String,
      enum: ['in_progress', 'submitted', 'graded'],
      default: 'in_progress',
    },
    passed: {
      type: Boolean,
    },
    cefrEstimated: {
      type: String,
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    },
    aiEvaluation: {
      grammar: {
        type: Number,
        min: 0,
        max: 100,
      },
      fluency: {
        type: Number,
        min: 0,
        max: 100,
      },
      coherence: {
        type: Number,
        min: 0,
        max: 100,
      },
      vocabulary: {
        type: Number,
        min: 0,
        max: 100,
      },
      comments: {
        type: String,
        maxlength: 2000,
      },
    },
    aiNotes: {
      type: String,
      maxlength: 3000,
    },
    userNotes: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// 🚀 Índices para optimizar consultas
ExamAttemptSchema.index({ user: 1, exam: 1 }); // Consultas por usuario y examen
ExamAttemptSchema.index({ exam: 1, status: 1 }); // Consultas por examen y estado
ExamAttemptSchema.index({ user: 1, status: 1 }); // Consultas por usuario y estado
ExamAttemptSchema.index({ startedAt: -1 }); // Ordenamiento por fecha de inicio
ExamAttemptSchema.index({ submittedAt: -1 }); // Ordenamiento por fecha de envío
ExamAttemptSchema.index({ cefrEstimated: 1 }); // Consultas por nivel CEFR estimado

// Crear el modelo
const ExamAttempt = mongoose.model<IExamAttempt>("ExamAttempt", ExamAttemptSchema);

export default ExamAttempt; 