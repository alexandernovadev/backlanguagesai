import mongoose, { Document, Schema } from "mongoose";

// Definir la interfaz del documento
export interface ILecture extends Document {
  time: number;
  difficulty: string;
  typeWrite: string;
  language: string;
  img?: string;
  urlAudio?: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Definir el esquema
const lectureSchema = new Schema<ILecture>(
  {
    time: { type: Number, required: true },
    difficulty: { type: String, required: true },
    typeWrite: { type: String, required: true },
    language: { type: String, required: true },
    urlAudio: { type: String, default: "" },
    img: { type: String, default: "" },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Add text index for full-text search on key fields
lectureSchema.index({
  content: "text",
  difficulty: "text",
  language: "text",
  typeWrite: "text",
});
// Crear el modelo
const Lecture = mongoose.model<ILecture>("Lecture", lectureSchema);

export default Lecture;
