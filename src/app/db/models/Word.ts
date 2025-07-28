import mongoose, { Schema, Document } from "mongoose";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

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

export interface IWord extends Document {
  word: string;
  definition: string;
  examples?: string[];
  type?: string[];
  IPA?: string;
  seen?: number;
  img?: string;
  level?: "easy" | "medium" | "hard";
  sinonyms?: string[];
  codeSwitching?: string[];
  language: string;
  spanish?: {
    definition: string;
    word: string;
  };
  chat?: ChatMessage[];
  // Campos para sistema de repaso inteligente
  lastReviewed?: Date;
  nextReview?: Date;
  reviewCount?: number;
  difficulty?: number; // 1-5, donde 1 es muy fácil y 5 es muy difícil
  interval?: number; // Intervalo en días para el próximo repaso
  easeFactor?: number; // Factor de facilidad (similar a Anki)
}

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
      // validate: {
      //   validator: function (v: string) {
      //     return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/i.test(v);
      //   },
      //   message: (props: { value: string }) =>
      //     `${props.value} no es una URL de imagen válida.`,
      // },
    },
    level: {
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
    // Campos para sistema de repaso inteligente
    lastReviewed: {
      type: Date,
      default: null,
    },
    nextReview: {
      type: Date,
      default: null,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    interval: {
      type: Number,
      default: 1, // 1 día por defecto
    },
    easeFactor: {
      type: Number,
      default: 2.5, // Factor de facilidad inicial (similar a Anki)
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
