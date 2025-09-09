import mongoose, { Schema } from "mongoose";
import { ChatMessage, IExpression } from "../../../../types/models";
import { chatRolesList, difficultyList, expressionTypesList } from "../../data/bussiness/shared";

const ChatMessageSchema: Schema = new Schema<ChatMessage>({
  id: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: chatRolesList,
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
      enum: expressionTypesList,
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
      enum: difficultyList,
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