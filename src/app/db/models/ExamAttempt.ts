import mongoose, { Schema, Document } from "mongoose";

export interface IExamAttempt extends Document {
  exam: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  status: 'in_progress' | 'submitted' | 'graded' | 'abandoned';
  startTime: Date;
  submittedAt?: Date;
  gradedAt?: Date;
  score?: number;
  maxScore: number;
  aiFeedback?: string;
  answers: Array<{
    questionId: mongoose.Types.ObjectId;
    questionText: string;
    options: Array<{
      value: string;
      label: string;
      isCorrect: boolean;
    }>;
    userAnswer: string[];
    aiComment?: string;
    isCorrect?: boolean;
    points?: number;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

const ExamAttemptSchema = new Schema<IExamAttempt>({
  exam: {
    type: Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['in_progress', 'submitted', 'graded', 'abandoned'],
    default: 'in_progress'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  submittedAt: Date,
  gradedAt: Date,
  score: Number,
  maxScore: {
    type: Number,
    required: true
  },
  aiFeedback: String,
  answers: [{
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question'
    },
    questionText: String,
    options: [{
      value: String,
      label: String,
      isCorrect: Boolean
    }],
    userAnswer: [String],
    aiComment: String,
    isCorrect: Boolean,
    points: Number
  }]
}, {
  timestamps: true
});

// 🚀 Índices para optimizar consultas
ExamAttemptSchema.index({ user: 1, exam: 1 });
ExamAttemptSchema.index({ user: 1, exam: 1, status: 1 });
ExamAttemptSchema.index({ exam: 1, status: 1 });
ExamAttemptSchema.index({ status: 1 });
ExamAttemptSchema.index({ createdAt: -1 });
ExamAttemptSchema.index({ submittedAt: -1 });

export default mongoose.model<IExamAttempt>("ExamAttempt", ExamAttemptSchema); 