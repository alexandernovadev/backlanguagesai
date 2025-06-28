import mongoose, { Schema, Document } from "mongoose";

// Definir la interfaz del documento
export interface IQuestion extends Document {
  text: string;
  type: 'single_choice' | 'multiple_choice' | 'fill_blank' | 'translate' | 'true_false' | 'writing';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  topic?: string;
  difficulty?: number;
  options?: Array<{
    value: string;
    label: string;
    isCorrect: boolean;
  }>;
  correctAnswers?: string[];
  explanation?: string;
  tags?: string[];
  media?: {
    audio?: string;
    image?: string;
    video?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// Definir el esquema
const QuestionSchema = new Schema<IQuestion>(
  {
    text: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ['single_choice', 'multiple_choice', 'fill_blank', 'translate', 'true_false', 'writing'],
      required: true,
    },
    level: {
      type: String,
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      required: true,
    },
    topic: {
      type: String,
      maxlength: 200,
    },
    difficulty: {
      type: Number,
      min: 1,
      max: 5,
    },
    options: [
      {
        value: {
          type: String,
          required: true,
        },
        label: {
          type: String,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
      },
    ],
    correctAnswers: [
      {
        type: String,
        minlength: 1,
      },
    ],
    explanation: {
      type: String,
      maxlength: 1000,
    },
    tags: [
      {
        type: String,
        maxlength: 50,
      },
    ],
    media: {
      audio: {
        type: String,
        // validate: {
        //   validator: function (v: string) {
        //     return /^(https?:\/\/.*\.(?:mp3|wav|ogg|m4a))$/i.test(v);
        //   },
        //   message: (props: { value: string }) =>
        //     `${props.value} no es una URL de audio válida.`,
        // },
      },
      image: {
        type: String,
        // validate: {
        //   validator: function (v: string) {
        //     return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/i.test(v);
        //   },
        //   message: (props: { value: string }) =>
        //     `${props.value} no es una URL de imagen válida.`,
        // },
      },
      video: {
        type: String,
        // validate: {
        //   validator: function (v: string) {
        //     return /^(https?:\/\/.*\.(?:mp4|avi|mov|wmv|flv))$/i.test(v);
        //   },
        //   message: (props: { value: string }) =>
        //     `${props.value} no es una URL de video válida.`,
        // },
      },
    },
  },
  {
    timestamps: true,
  }
);

// 🚀 Índices para optimizar consultas
QuestionSchema.index({ level: 1, type: 1 }); // Consultas por nivel y tipo
QuestionSchema.index({ topic: 1 }); // Consultas por tema
QuestionSchema.index({ tags: 1 }); // Consultas por tags
QuestionSchema.index({ difficulty: 1, level: 1 }); // Consultas por dificultad y nivel
QuestionSchema.index({ createdAt: -1 }); // Ordenamiento por fecha de creación

// Crear el modelo
const Question = mongoose.model<IQuestion>("Question", QuestionSchema);

export default Question; 