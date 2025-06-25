import e, { Request, Response } from "express";

import { LectureStatisticsService } from "../services/statistics/LectureStatisticsService";
import { WordStatisticsService } from "../services/statistics/WordStatisticsService";
import { errorResponse, successResponse } from "../utils/responseHelpers";

const lectureStatisticsService = new LectureStatisticsService();
const wordStatisticsService = new WordStatisticsService();

// V1
export const BasicInformation = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const countByLevelAndTotalLectures =
      await lectureStatisticsService.getLectureCountsByLevel();
    const countByLevelAndTotalWords = await wordStatisticsService.getWordCountsByLevel();

    return successResponse(res, "Statitics successfully generated", {
      lectures: countByLevelAndTotalLectures,
      words: countByLevelAndTotalWords,
    });
  } catch (error) {
    return errorResponse(res, "Error getting statics ", 404, error);
  }
};
