import { Document, Types } from "mongoose";

export type WordSelectionType = "last10" | "hard10" | "medium10" | "easy10";

export interface IChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface IWordChat extends Document {
  userId: Types.ObjectId;
  title: string;
  wordIds: Types.ObjectId[];
  wordTexts?: string[];
  wordSelectionType: WordSelectionType;
  wordsUsedInConversation: string[];
  messages: IChatMessage[];
  corrections?: Map<string, string>;
  language: string;
  status: "active" | "completed";
  createdAt?: Date;
  updatedAt?: Date;
}
