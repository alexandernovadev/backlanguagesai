import { Request, Response } from "express";
import Word from "../db/models/Word";
import Lecture from "../db/models/Lecture";
// import Word, { IWord } from "../db/models/Word";
import { errorResponse, successResponse } from "../utils/responseHelpers";
import { seedAdminUser } from "../services/seed/user";
import { seedQuestions } from "../services/seed/seedQuestions";
import { backupCollections } from "../utils/backupCollections";
import { seedData } from "../utils/seedData";

export const arreglosmaricasrapidos = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Actualizar el campo `level` de todos los documentos a "hard"
    // const result = await Word.updateMany({}, { level: "easy" });

    // const result = await Word.updateMany({}, { seen: 1 });

    // const seedUser = await seedAdminUser()

    // await seedData();

    // await backupCollections();

    // await Word.deleteMany({});
    // await Lecture.deleteMany({});

    // Seed questions from JSON
    const seededQuestions = await seedQuestions();

    return successResponse(res, "Questions seeded successfully", seededQuestions);
  } catch (error) {
    return errorResponse(res, "Error seeding questions", 404, error);
  }
};
