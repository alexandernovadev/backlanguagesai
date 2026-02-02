import { Document } from "mongoose";

export type AIFeature = 'word' | 'expression' | 'lecture';

export type AIOperation = 
  // Words
  | 'generate' | 'examples' | 'codeSwitching' | 'types' | 'synonyms' | 'chat' | 'image'
  // Expressions
  | 'generate' | 'chat' | 'image'
  // Lectures
  | 'text' | 'topic' | 'image';

export type AIProvider = 'openai' | 'deepseek';

export interface IAIConfig extends Document {
  userId?: string | null; // null = configuración global/default
  feature: AIFeature;
  operation: AIOperation;
  provider: AIProvider;
  model?: string; // opcional override de modelo específico
  createdAt: Date;
  updatedAt: Date;
}
