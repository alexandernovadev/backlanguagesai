import e, { Request, Response } from "express";

import { LectureService } from "../services/lectures/LectureService";
import { WordService } from "../services/words/wordService";
import { errorResponse, successResponse } from "../utils/responseHelpers";

const lectureService = new LectureService();
const wordService = new WordService();

// V1
export const BasicInformation = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const countByLevelAndTotalLectures =
      await lectureService.getLectureCountsByLevel();
    const countByLevelAndTotalWords = await wordService.getWordCountsByLevel();

    return successResponse(res, "Statitics successfully generated", {
      lectures: countByLevelAndTotalLectures,
      words: countByLevelAndTotalWords,
    });
  } catch (error) {
    return errorResponse(res, "Error getting statics ", 404, error);
  }
};
