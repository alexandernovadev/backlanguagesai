import { Request, Response } from "express";
import Word, { IWord } from "../db/models/Word";
import { errorResponse, successResponse } from "../utils/responseHelpers";

export const arreglosmaricasrapidos = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Actualizar el campo `level` de todos los documentos a "hard"
    // const result = await Word.updateMany({}, { level: "easy" });

    // const result = await Word.updateMany({}, { seen: 1 });

    return successResponse(res, "FIxed quick done", {});
  } catch (error) {
    return errorResponse(res, "Error updating words level", 404, error);
  }
};
