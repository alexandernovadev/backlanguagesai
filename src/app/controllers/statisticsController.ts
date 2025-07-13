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

// Dashboard completo - V2
export const DashboardStats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Obtener todas las estadísticas en paralelo
    const [
      lectureCountsByLevel,
      lectureCountsByLanguage,
      lectureAverageTimeByLevel,
      lectureRecentCount,
      lectureWithoutAudio,
      lectureWithoutImages,
      wordCountsByLevel,
      wordCountsByLanguage,
      wordAverageSeenByLevel,
      wordRecentCount,
      wordWithoutExamples,
      wordWithoutImages
    ] = await Promise.all([
      lectureStatisticsService.getLectureCountsByLevel(),
      lectureStatisticsService.getLecturesByLanguage(),
      lectureStatisticsService.getAverageTimeByLevel(),
      lectureStatisticsService.getRecentLecturesCount(),
      lectureStatisticsService.getLecturesWithoutAudio(),
      lectureStatisticsService.getLecturesWithoutImages(),
      wordStatisticsService.getWordCountsByLevel(),
      wordStatisticsService.getWordsByLanguage(),
      wordStatisticsService.getAverageSeenByLevel(),
      wordStatisticsService.getRecentWordsCount(),
      wordStatisticsService.getWordsWithoutExamples(),
      wordStatisticsService.getWordsWithoutImages()
    ]);

    // Calcular totales
    const totalLectures = lectureCountsByLevel.total;
    const totalWords = wordCountsByLevel.total;

    // Calcular calidad del contenido
    const lectureQualityScore = totalLectures > 0 
      ? Math.round(((totalLectures - lectureWithoutAudio - lectureWithoutImages) / totalLectures) * 100)
      : 0;
    
    const wordQualityScore = totalWords > 0
      ? Math.round(((totalWords - wordWithoutExamples - wordWithoutImages) / totalWords) * 100)
      : 0;

    const dashboardData = {
      // Resumen general
      overview: {
        totalContent: {
          lectures: totalLectures,
          words: totalWords
        },
        contentQuality: {
          lecturesWithAudio: totalLectures - lectureWithoutAudio,
          lecturesWithImages: totalLectures - lectureWithoutImages,
          wordsWithExamples: totalWords - wordWithoutExamples,
          wordsWithImages: totalWords - wordWithoutImages,
          overallQualityScore: Math.round((lectureQualityScore + wordQualityScore) / 2)
        },
        recentActivity: {
          recentLectures: lectureRecentCount,
          recentWords: wordRecentCount
        }
      },

      // Distribución por nivel
      byLevel: {
        lectures: {
          A1: lectureCountsByLevel.A1,
          A2: lectureCountsByLevel.A2,
          B1: lectureCountsByLevel.B1,
          B2: lectureCountsByLevel.B2,
          C1: lectureCountsByLevel.C1,
          C2: lectureCountsByLevel.C2
        },
        words: {
          easy: wordCountsByLevel.easy,
          medium: wordCountsByLevel.medium,
          hard: wordCountsByLevel.hard
        }
      },

      // Distribución por idioma
      byLanguage: {
        lectures: lectureCountsByLanguage.reduce((acc, item) => {
          acc[item.language] = item.count;
          return acc;
        }, {} as Record<string, number>),
        words: wordCountsByLanguage.reduce((acc, item) => {
          acc[item.language] = item.count;
          return acc;
        }, {} as Record<string, number>)
      },

      // Métricas de calidad
      quality: {
        lecturesWithoutAudio: lectureWithoutAudio,
        lecturesWithoutImages: lectureWithoutImages,
        wordsWithoutExamples: wordWithoutExamples,
        wordsWithoutImages: wordWithoutImages,
        lectureQualityScore,
        wordQualityScore
      },

      // Métricas de engagement
      engagement: {
        averageLectureTime: lectureAverageTimeByLevel.reduce((sum, item) => sum + item.averageTime, 0) / lectureAverageTimeByLevel.length || 0,
        averageWordSeen: wordAverageSeenByLevel.reduce((sum, item) => sum + item.averageSeen, 0) / wordAverageSeenByLevel.length || 0
      }
    };

    return successResponse(res, "Dashboard statistics retrieved successfully", dashboardData);
  } catch (error) {
    return errorResponse(res, "Error getting dashboard statistics", 500, error);
  }
};

// Estadísticas detalladas de lecturas
export const LectureStats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const [
      countsByLevel,
      countsByLanguage,
      averageTimeByLevel,
      recentCount,
      withoutAudio,
      withoutImages
    ] = await Promise.all([
      lectureStatisticsService.getLectureCountsByLevel(),
      lectureStatisticsService.getLecturesByLanguage(),
      lectureStatisticsService.getAverageTimeByLevel(),
      lectureStatisticsService.getRecentLecturesCount(),
      lectureStatisticsService.getLecturesWithoutAudio(),
      lectureStatisticsService.getLecturesWithoutImages()
    ]);

    const totalLectures = countsByLevel.total;
    const qualityScore = totalLectures > 0 
      ? Math.round(((totalLectures - withoutAudio - withoutImages) / totalLectures) * 100)
      : 0;

    const lectureStats = {
      overview: {
        total: totalLectures,
        recent: recentCount,
        qualityScore
      },
      distribution: {
        byLevel: {
          A1: countsByLevel.A1,
          A2: countsByLevel.A2,
          B1: countsByLevel.B1,
          B2: countsByLevel.B2,
          C1: countsByLevel.C1,
          C2: countsByLevel.C2
        },
        byLanguage: countsByLanguage.reduce((acc, item) => {
          acc[item.language] = item.count;
          return acc;
        }, {} as Record<string, number>)
      },
      quality: {
        withAudio: totalLectures - withoutAudio,
        withImages: totalLectures - withoutImages,
        withoutAudio,
        withoutImages
      },
      metrics: {
        averageTimeByLevel: averageTimeByLevel.reduce((acc, item) => {
          acc[item.level] = Math.round(item.averageTime);
          return acc;
        }, {} as Record<string, number>),
        averageTimeOverall: Math.round(
          averageTimeByLevel.reduce((sum, item) => sum + item.averageTime, 0) / averageTimeByLevel.length
        )
      }
    };

    return successResponse(res, "Lecture statistics retrieved successfully", lectureStats);
  } catch (error) {
    return errorResponse(res, "Error getting lecture statistics", 500, error);
  }
};

// Estadísticas detalladas de palabras
export const WordStats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const [
      countsByLevel,
      countsByLanguage,
      averageSeenByLevel,
      recentCount,
      withoutExamples,
      withoutImages
    ] = await Promise.all([
      wordStatisticsService.getWordCountsByLevel(),
      wordStatisticsService.getWordsByLanguage(),
      wordStatisticsService.getAverageSeenByLevel(),
      wordStatisticsService.getRecentWordsCount(),
      wordStatisticsService.getWordsWithoutExamples(),
      wordStatisticsService.getWordsWithoutImages()
    ]);

    const totalWords = countsByLevel.total;
    const qualityScore = totalWords > 0 
      ? Math.round(((totalWords - withoutExamples - withoutImages) / totalWords) * 100)
      : 0;

    const wordStats = {
      overview: {
        total: totalWords,
        recent: recentCount,
        qualityScore
      },
      distribution: {
        byLevel: {
          easy: countsByLevel.easy,
          medium: countsByLevel.medium,
          hard: countsByLevel.hard
        },
        byLanguage: countsByLanguage.reduce((acc, item) => {
          acc[item.language] = item.count;
          return acc;
        }, {} as Record<string, number>)
      },
      quality: {
        withExamples: totalWords - withoutExamples,
        withImages: totalWords - withoutImages,
        withoutExamples,
        withoutImages
      },
      metrics: {
        averageSeenByLevel: averageSeenByLevel.reduce((acc, item) => {
          acc[item.level] = Math.round(item.averageSeen);
          return acc;
        }, {} as Record<string, number>),
        averageSeenOverall: Math.round(
          averageSeenByLevel.reduce((sum, item) => sum + item.averageSeen, 0) / averageSeenByLevel.length
        )
      }
    };

    return successResponse(res, "Word statistics retrieved successfully", wordStats);
  } catch (error) {
    return errorResponse(res, "Error getting word statistics", 500, error);
  }
};
