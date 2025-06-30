import mongoose, { Schema, Document } from "mongoose";

// Definir la interfaz del documento
export interface IExamAttempt extends Document {
  user: mongoose.Types.ObjectId;
  exam: mongoose.Types.ObjectId;
  attemptNumber: number;
  answers: Array<{
    question: mongoose.Types.ObjectId;
    answer: any; // Mixed type for flexible answers
    submittedAt: Date;
  }>;
  startedAt: Date;
  submittedAt?: Date;
  duration?: number;
  status: 'in_progress' | 'submitted' | 'graded';
  passed?: boolean;
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
ExamAttemptSchema.index({ status: 1 }); // Consultas por estado
ExamAttemptSchema.index({ startedAt: -1 }); // Consultas por fecha de inicio
ExamAttemptSchema.index({ submittedAt: -1 }); // Consultas por fecha de envío
ExamAttemptSchema.index({ passed: 1 }); // Consultas por aprobación

export const ExamAttempt = mongoose.model<IExamAttempt>('ExamAttempt', ExamAttemptSchema); 