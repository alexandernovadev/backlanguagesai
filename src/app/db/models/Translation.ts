import mongoose, { Schema, Document } from "mongoose";

export interface ITranslationError {
  type: 'grammar' | 'vocabulary' | 'structure' | 'spelling' | 'punctuation';
  severity: 'low' | 'medium' | 'high' | 'minor' | 'moderate' | 'major' | 'critical';
  original: string;
  corrected: string;
  explanation: string;
  position?: {
    start: number;
    end: number;
  };
}

export interface ITranslation extends Document {
  userId: string;
  chatId: string;
  generatedTextId: string;
  originalText: string;
  userTranslation: string;
  correctTranslation: string;
  score: number;
  translationErrors: ITranslationError[];
  feedback: string;
  timeSpent: number; // in seconds
  sourceLanguage: 'spanish' | 'english' | 'portuguese';
  targetLanguage: 'spanish' | 'english' | 'portuguese';
  aiProvider: 'openai' | 'deepseek';
  submittedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const TranslationErrorSchema: Schema = new Schema<ITranslationError>({
  type: {
    type: String,
    enum: ['grammar', 'vocabulary', 'structure', 'spelling', 'punctuation'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'minor', 'moderate', 'major', 'critical'],
    required: true
  },
  original: {
    type: String,
    required: false, // Optional if no specific text to highlight
    maxlength: 500
  },
  corrected: {
    type: String,
    required: false, // Optional if no correction needed
    maxlength: 500
  },
  explanation: {
    type: String,
    required: false, // Optional for minor errors
    maxlength: 1000
  },
  position: {
    start: {
      type: Number,
      min: 0
    },
    end: {
      type: Number,
      min: 0
    }
  }
});

const TranslationSchema: Schema = new Schema<ITranslation>(
  {
    userId: {
      type: String,
      required: true,
    },
    chatId: {
      type: String,
      required: true,
    },
    generatedTextId: {
      type: String,
      required: false, // Temporarily optional until we fix the flow
    },
    originalText: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 10000
    },
    userTranslation: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 10000
    },
    correctTranslation: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 10000
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    translationErrors: {
      type: [TranslationErrorSchema],
      default: []
    },
    feedback: {
      type: String,
      required: true,
      maxlength: 2000
    },
    timeSpent: {
      type: Number,
      required: true,
      min: 0
    },
    sourceLanguage: {
      type: String,
      enum: ['spanish', 'english', 'portuguese'],
      required: true
    },
    targetLanguage: {
      type: String,
      enum: ['spanish', 'english', 'portuguese'],
      required: true
    },
    aiProvider: {
      type: String,
      enum: ['openai', 'deepseek'],
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance
TranslationSchema.index({ userId: 1, submittedAt: -1 });
TranslationSchema.index({ chatId: 1, submittedAt: -1 });
TranslationSchema.index({ userId: 1, chatId: 1 });
TranslationSchema.index({ generatedTextId: 1 });

// Virtual for error count by type
TranslationSchema.virtual('errorStats').get(function() {
  const errors = this.translationErrors as ITranslationError[];
  const stats = {
    grammar: 0,
    vocabulary: 0,
    structure: 0,
    spelling: 0,
    punctuation: 0,
    total: errors.length
  };
  
  errors.forEach(error => {
    stats[error.type]++;
  });
  
  return stats;
});

// Virtual for accuracy percentage
TranslationSchema.virtual('accuracy').get(function() {
  return this.score;
});

// Virtual for language pair
TranslationSchema.virtual('languagePair').get(function() {
  return `${this.sourceLanguage}-${this.targetLanguage}`;
});

// Virtual for performance level
TranslationSchema.virtual('performanceLevel').get(function() {
  const score = this.score as number;
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'good';
  if (score >= 70) return 'average';
  if (score >= 60) return 'below_average';
  return 'poor';
});

// Create the model
const Translation = mongoose.model<ITranslation>("Translation", TranslationSchema);

export default Translation;
