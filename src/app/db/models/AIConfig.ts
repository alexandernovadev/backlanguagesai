import mongoose, { Schema } from "mongoose";
import { IAIConfig } from "../../../../types/models";

const AIConfigSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      default: null, // null = configuración global/default
      index: true,
    },
    feature: {
      type: String,
      required: true,
      enum: ['word', 'expression', 'lecture'],
      index: true,
    },
    operation: {
      type: String,
      required: true,
      enum: [
        // Words
        'generate', 'examples', 'codeSwitching', 'types', 'synonyms', 'chat', 'image',
        // Expressions
        'generate', 'chat', 'image',
        // Lectures
        'text', 'topic', 'image',
      ],
      index: true,
    },
    provider: {
      type: String,
      required: true,
      enum: ['openai', 'deepseek'],
    },
    model: {
      type: String,
      default: undefined, // opcional override de modelo específico
    },
  },
  { timestamps: true }
);

// Índice compuesto para búsquedas rápidas
AIConfigSchema.index({ userId: 1, feature: 1, operation: 1 }, { unique: true });

export default mongoose.model<IAIConfig>("AIConfig", AIConfigSchema);
