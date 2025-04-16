import mongoose, { Schema, Document } from "mongoose";

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
  },
  { timestamps: true }
);

// Crear el modelo
const Word = mongoose.model<IWord>("Word", WordSchema);

export default Word;
