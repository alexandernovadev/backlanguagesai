import mongoose, { Schema } from "mongoose";
import { ILecture } from "../../../../types/models";

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
