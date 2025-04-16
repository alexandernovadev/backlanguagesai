import mongoose, { Document, Schema } from "mongoose";

// Definir la interfaz del documento
export interface ILecture extends Document {
  time: number;
  level: string;
  typeWrite: string;
  language: string;
  img?: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Definir el esquema
const lectureSchema = new Schema<ILecture>(
  {
    time: { type: Number, required: true },
    level: { type: String, required: true },
    typeWrite: { type: String, required: true },
    language: { type: String, required: true },
    img: { type: String, default: "" },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Crear el modelo
const Lecture = mongoose.model<ILecture>("Lecture", lectureSchema);

export default Lecture;
