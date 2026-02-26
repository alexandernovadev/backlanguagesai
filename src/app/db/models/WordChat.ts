import mongoose, { Schema } from "mongoose";
import { IWordChat } from "../../../../types/models";

const chatMessageSchema = new Schema(
  {
    role: { type: String, required: true, enum: ["user", "assistant"] },
    content: { type: String, required: true },
  },
  { _id: false }
);

const wordChatSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, default: "Chat" },
    wordIds: [{ type: Schema.Types.ObjectId, ref: "Word" }],
    wordTexts: [{ type: String }],
    wordSelectionType: {
      type: String,
      required: true,
      enum: ["last10", "hard10", "medium10", "easy10"],
    },
    wordsUsedInConversation: [{ type: String }],
    messages: [chatMessageSchema],
    corrections: { type: Map, of: String, default: () => new Map() },
    language: { type: String, default: "en" },
    status: { type: String, enum: ["active", "completed"], default: "active" },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        if (ret.corrections && ret.corrections instanceof Map) {
          ret.corrections = Object.fromEntries(ret.corrections as Map<string, string>);
        }
      },
    },
  }
);

wordChatSchema.index({ userId: 1 });
wordChatSchema.index({ updatedAt: -1 });

export default mongoose.model<IWordChat>("WordChat", wordChatSchema);
