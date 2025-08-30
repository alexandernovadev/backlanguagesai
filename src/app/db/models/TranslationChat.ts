import mongoose, { Schema, Document } from "mongoose";

export interface ITranslationConfig {
  sourceLanguage: 'spanish' | 'english' | 'portuguese';
  targetLanguage: 'spanish' | 'english' | 'portuguese';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  minWords: number;
  maxWords: number;
  mustUseWords: string[];
  grammarTopics: string[];
}

export interface ITranslationMessage {
  id: string;
  type: 'generated_text' | 'user_translation' | 'ai_feedback';
  content: string;
  timestamp: Date;
  metadata?: {
    config?: ITranslationConfig;
    score?: number;
    errors?: Array<{
      type: 'grammar' | 'vocabulary' | 'structure' | 'spelling' | 'punctuation';
      severity: 'low' | 'medium' | 'high';
      original: string;
      corrected: string;
      explanation: string;
      position?: { start: number; end: number };
    }>;
    correctTranslation?: string;
  };
}

export interface ITranslationChat extends Document {
  userId: string;
  name: string;
  config: ITranslationConfig;
  messages: ITranslationMessage[];
  lastActivity: Date;
  messageCount: number;
  lastScore?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const TranslationConfigSchema: Schema = new Schema<ITranslationConfig>({
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
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  minWords: {
    type: Number,
    required: true,
    min: 50,
    max: 500
  },
  maxWords: {
    type: Number,
    required: true,
    min: 100,
    max: 300
  },
  mustUseWords: [String], // Array of word strings
  grammarTopics: [String] // Array of topic strings
});

const TranslationMessageSchema: Schema = new Schema<ITranslationMessage>({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['generated_text', 'user_translation', 'ai_feedback'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    config: TranslationConfigSchema,
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    errors: [{
      type: {
        type: String,
        enum: ['grammar', 'vocabulary', 'structure', 'spelling', 'punctuation']
      },
      severity: {
        type: String,
        enum: ['low', 'medium', 'high']
      },
      original: String,
      corrected: String,
      explanation: String,
      position: {
        start: Number,
        end: Number
      }
    }],
    correctTranslation: String
  }
});

const TranslationChatSchema: Schema = new Schema<ITranslationChat>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      maxlength: 100
    },
    config: {
      type: TranslationConfigSchema,
      required: true
    },
    messages: {
      type: [TranslationMessageSchema],
      default: []
    },
    lastActivity: {
      type: Date,
      default: Date.now,
      index: true
    },
    messageCount: {
      type: Number,
      default: 0,
      min: 0
    },
    lastScore: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance
TranslationChatSchema.index({ userId: 1, lastActivity: -1 });
TranslationChatSchema.index({ userId: 1, createdAt: -1 });

// Virtual for average score calculation
TranslationChatSchema.virtual('averageScore').get(function() {
  const messages = this.messages as ITranslationMessage[];
  const feedbackMessages = messages.filter(m => m.type === 'ai_feedback' && m.metadata?.score);
  if (feedbackMessages.length === 0) return null;
  
  const totalScore = feedbackMessages.reduce((sum, msg) => sum + (msg.metadata?.score || 0), 0);
  return Math.round(totalScore / feedbackMessages.length);
});

// Create the model
const TranslationChat = mongoose.model<ITranslationChat>("TranslationChat", TranslationChatSchema);

export default TranslationChat;
