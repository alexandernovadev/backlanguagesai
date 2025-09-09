import { Document } from "mongoose";
import { ChatMessage } from "./ChatMessage";
import { Difficulty, Language } from "../business";

export interface IExpression extends Document {
  expression: string;
  definition: string;
  examples?: string[];
  type?: string[];
  context?: string;
  difficulty?: Difficulty;
  img?: string;
  language: Language;
  spanish?: {
    definition: string;
    expression: string;
  };
  chat?: ChatMessage[];
  createdAt?: Date;
  updatedAt?: Date;
}
