import mongoose, { Schema } from "mongoose";
import { IExam } from "../../../../types/models";
import { certificationLevelsList, languagesList } from "../../data/bussiness/shared";

const examQuestionSchema = new Schema(
  {
    id: { type: String },
    type: { type: String, required: true, enum: ["multiple", "unique", "fillInBlank", "translateText"] },
    text: { type: String, required: true },
    options: [{ type: String }],
    correctIndex: { type: Number },
    correctIndices: [{ type: Number }],
    correctAnswer: { type: String },
    grammarTopic: { type: String, required: true },
    explanation: { type: String, required: true },
  },
  { _id: false }
);

const examSchema = new Schema<IExam>(
  {
    title: { type: String, required: true },
    language: { type: String, required: true, enum: languagesList },
    difficulty: { type: String, required: true, enum: certificationLevelsList },
    grammarTopics: [{ type: String }],
    topic: { type: String },
    questions: [examQuestionSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model<IExam>("Exam", examSchema);
