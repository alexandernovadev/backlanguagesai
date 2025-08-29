import mongoose, { Schema, Document } from "mongoose";

export interface IGeneratedText extends Document {
  userId: string;
  chatId: string;
  text: string;
  config: {
    sourceLanguage: 'spanish' | 'english' | 'portuguese';
    targetLanguage: 'spanish' | 'english' | 'portuguese';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    minWords: number;
    maxWords: number;
    mustUseWords: string[];
    grammarTopics: string[];
  };
  wordCount: number;
  generatedAt: Date;
  aiProvider: 'openai' | 'deepseek';
  createdAt?: Date;
  updatedAt?: Date;
}

const GeneratedTextSchema: Schema = new Schema<IGeneratedText>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    chatId: {
      type: String,
      required: true,
      index: true
    },
    text: {
      type: String,
      required: true,
      minlength: 50,
      maxlength: 10000
    },
    config: {
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
    },
    wordCount: {
      type: Number,
      required: true,
      min: 0
    },
    generatedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    aiProvider: {
      type: String,
      enum: ['openai', 'deepseek'],
      required: true
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance
GeneratedTextSchema.index({ userId: 1, generatedAt: -1 });
GeneratedTextSchema.index({ chatId: 1, generatedAt: -1 });
GeneratedTextSchema.index({ userId: 1, chatId: 1 });

// Virtual for checking if text meets word requirements
GeneratedTextSchema.virtual('meetsWordRequirements').get(function() {
  const doc = this as unknown as IGeneratedText;
  return doc.wordCount >= doc.config.minWords && doc.wordCount <= doc.config.maxWords;
});

// Virtual for language pair
GeneratedTextSchema.virtual('languagePair').get(function() {
  const doc = this as unknown as IGeneratedText;
  return `${doc.config.sourceLanguage}-${doc.config.targetLanguage}`;
});

// Create the model
const GeneratedText = mongoose.model<IGeneratedText>("GeneratedText", GeneratedTextSchema);

export default GeneratedText;
