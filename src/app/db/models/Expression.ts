import mongoose, { Schema } from "mongoose";
import { ChatMessage, IExpression } from "../../../../types/models";

const ChatMessageSchema: Schema = new Schema<ChatMessage>({
  id: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ExpressionSchema: Schema = new Schema<IExpression>(
  {
    expression: {
      type: String,
      required: true,
      unique: true,
      minlength: 1,
      maxlength: 200,
    },
    language: {
      type: String,
      required: true,
    },
    definition: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 1000,
    },
    examples: {
      type: [String],
      default: [],
    },
    type: {
      type: [String],
      enum: [
        "idiom",
        "phrase",
        "collocation",
        "slang",
        "formal",
        "informal",
      ],
      default: [],
    },
    context: {
      type: String,
      maxlength: 500,
    },
    img: {
      type: String,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "hard",
    },
    spanish: {
      definition: {
        type: String,
        minlength: 5,
        maxlength: 1000,
      },
      expression: {
        type: String,
        minlength: 1,
        maxlength: 200,
      },
    },
    chat: {
      type: [ChatMessageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Crear el modelo
const Expression = mongoose.model<IExpression>("Expression", ExpressionSchema);

export default Expression; 