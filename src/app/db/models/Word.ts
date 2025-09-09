import mongoose, { Schema } from "mongoose";
import { ChatMessage, IWord } from "../../../../types/models";

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

const WordSchema: Schema = new Schema<IWord>(
  {
    word: {
      type: String,
      required: true,
      unique: true,
      minlength: 1,
      maxlength: 100,
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
    sinonyms: {
      type: [String],
      default: [],
    },
    type: {
      type: [String],
      enum: [
        "noun",
        "verb",
        "adjective",
        "adverb",
        "personal pronoun",
        "possessive pronoun",
        "preposition",
        "conjunction",
        "determiner",
        "article",
        "quantifier",
        "interjection",
        "auxiliary verb",
        "modal verb",
        "infinitive",
        "participle",
        "gerund",
        "other",
        "phrasal verb",
      ],
      default: [],
    },
    IPA: {
      type: String,
    },
    seen: {
      type: Number,
      default: 0,
    },
    img: {
      type: String,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "hard",
    },
    codeSwitching: {
      type: [String],
      default: [],
    },
    spanish: {
      definition: {
        type: String,
        minlength: 5,
        maxlength: 1000,
      },
      word: {
        type: String,
        minlength: 1,
        maxlength: 100,
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
const Word = mongoose.model<IWord>("Word", WordSchema);

export default Word;
