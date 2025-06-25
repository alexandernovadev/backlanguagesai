import mongoose from "mongoose";
import dotenv from "dotenv";
import Question from "../../db/models/Question";
import logger from "../../utils/logger";
import fs from "fs";
import path from "path";

dotenv.config();

interface QuestionData {
  text: string;
  type: string;
  options?: string[] | null;
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  category: string;
  tags: string[];
  cefrLevel: string;
  points: number;
  timeLimit: number;
  imageUrl?: string | null;
  audioUrl?: string | null;
  metadata: {
    topic: string;
    subtopic: string;
    languageFocus: string;
  };
}

export const seedQuestions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL!);

    // Limpiar preguntas existentes
    await Question.deleteMany({});
    logger.info("Existing questions deleted");

    // Leer el archivo JSON de preguntas
    const questionsPath = path.join(
      process.cwd(),
      "scripts",
      "data",
      "questions-seed.json"
    );
    const questionsData: QuestionData[] = JSON.parse(
      fs.readFileSync(questionsPath, "utf8")
    );

    // Transformar los datos del JSON al formato del modelo
    const transformedQuestions = questionsData.map((questionData) => {
      // Mapear el tipo de pregunta
      let questionType:
        | "multiple_choice"
        | "fill_blank"
        | "translate"
        | "true_false"
        | "writing";
      switch (questionData.type) {
        case "multiple_choice":
          questionType = "multiple_choice";
          break;
        case "fill_blank":
          questionType = "fill_blank";
          break;
        case "audio_question":
        case "image_description":
        case "speaking_practice":
        case "ordering":
          questionType = "multiple_choice"; // Mapear a multiple_choice por ahora
          break;
        default:
          questionType = "multiple_choice";
      }

      // Mapear el nivel CEFR
      let level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
      switch (questionData.cefrLevel) {
        case "A1":
        case "A2":
        case "B1":
        case "B2":
        case "C1":
        case "C2":
          level = questionData.cefrLevel;
          break;
        default:
          level = "A1";
      }

      // Crear las opciones si existen
      const options =
        questionData.options?.map((option, index) => ({
          value: option,
          label: option,
          isCorrect: option === questionData.correctAnswer,
        })) || [];

      // Crear las respuestas correctas
      const correctAnswers = [questionData.correctAnswer];

      // Mapear la dificultad
      let difficulty: number;
      switch (questionData.difficulty) {
        case "beginner":
          difficulty = 1;
          break;
        case "intermediate":
          difficulty = 3;
          break;
        case "advanced":
          difficulty = 5;
          break;
        default:
          difficulty = 2;
      }

      return {
        text: questionData.text,
        type: questionType,
        isSingleAnswer: true,
        level,
        topic: questionData.metadata.topic,
        difficulty,
        options,
        correctAnswers,
        explanation: questionData.explanation,
        tags: questionData.tags,
        media: {
          audio: questionData.audioUrl || undefined,
          image: questionData.imageUrl || undefined,
        },
      };
    });

    // Insertar las preguntas en la base de datos
    const result = await Question.insertMany(transformedQuestions);

    logger.info(
      `Questions seeded successfully. ${result.length} questions created.`
    );
    return result;
  } catch (error) {
    console.error("Error seeding questions:", error);
    logger.error("Error seeding questions:", error);
    throw new Error("Failed to seed questions");
  } finally {
    mongoose.connection.close();
  }
};
