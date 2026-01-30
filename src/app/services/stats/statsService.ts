import Word from "../../db/models/Word";
import Lecture from "../../db/models/Lecture";
import Expression from "../../db/models/Expression";
import User from "../../db/models/User";
import { IWord, ILecture, IExpression } from "../../../../types/models";

interface WordStats {
  total: number;
  byDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  byLanguage: Record<string, number>;
  byType: Record<string, number>;
  withImage: number;
  withoutImage: number;
  withExamples: number;
  withoutExamples: number;
  withSynonyms: number;
  withoutSynonyms: number;
  totalViews: number;
}

interface LectureStats {
  total: number;
  byLevel: Record<string, number>;
  byLanguage: Record<string, number>;
  byType: Record<string, number>;
  withImage: number;
  withoutImage: number;
  withAudio: number;
  withoutAudio: number;
  totalReadingTime: number;
}

interface ExpressionStats {
  total: number;
  byDifficulty: Record<string, number>;
  byLanguage: Record<string, number>;
  byType: Record<string, number>;
  withImage: number;
  withoutImage: number;
  withContext: number;
  withoutContext: number;
}

interface UserStats {
  total: number;
  byRole: Record<string, number>;
  active: number;
  inactive: number;
}

interface RecentActivity {
  words: IWord[];
  lectures: ILecture[];
  expressions: IExpression[];
}

export interface DashboardStats {
  words: WordStats;
  lectures: LectureStats;
  expressions: ExpressionStats;
  users: UserStats;
  recentActivity: RecentActivity;
}

export class StatsService {
  /**
   * Get all dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const [words, lectures, expressions, users, recentActivity] = await Promise.all([
      this.getWordStats(),
      this.getLectureStats(),
      this.getExpressionStats(),
      this.getUserStats(),
      this.getRecentActivity(),
    ]);

    return {
      words,
      lectures,
      expressions,
      users,
      recentActivity,
    };
  }

  /**
   * Get word statistics
   */
  private async getWordStats(): Promise<WordStats> {
    const [
      total,
      easy,
      medium,
      hard,
      byLanguage,
      byType,
      withImage,
      withoutImage,
      withExamples,
      withoutExamples,
      withSynonyms,
      withoutSynonyms,
      totalViews,
    ] = await Promise.all([
      Word.countDocuments(),
      Word.countDocuments({ difficulty: "easy" }),
      Word.countDocuments({ difficulty: "medium" }),
      Word.countDocuments({ difficulty: "hard" }),
      Word.aggregate([
        { $group: { _id: "$language", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Word.aggregate([
        { $unwind: "$type" },
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Word.countDocuments({ img: { $exists: true, $nin: [null, ""] } }),
      Word.countDocuments({
        $or: [{ img: { $exists: false } }, { img: null }, { img: "" }],
      }),
      Word.countDocuments({ examples: { $exists: true, $ne: [] } }),
      Word.countDocuments({
        $or: [{ examples: { $exists: false } }, { examples: [] }],
      }),
      Word.countDocuments({ sinonyms: { $exists: true, $ne: [] } }),
      Word.countDocuments({
        $or: [{ sinonyms: { $exists: false } }, { sinonyms: [] }],
      }),
      Word.aggregate([
        { $group: { _id: null, total: { $sum: "$seen" } } },
      ]),
    ]);

    // Convert aggregation results to objects
    const byLanguageObj: Record<string, number> = {};
    byLanguage.forEach((item) => {
      byLanguageObj[item._id] = item.count;
    });

    const byTypeObj: Record<string, number> = {};
    byType.forEach((item) => {
      byTypeObj[item._id] = item.count;
    });

    const viewsResult = totalViews[0]?.total || 0;

    return {
      total,
      byDifficulty: {
        easy,
        medium,
        hard,
      },
      byLanguage: byLanguageObj,
      byType: byTypeObj,
      withImage,
      withoutImage,
      withExamples,
      withoutExamples,
      withSynonyms,
      withoutSynonyms,
      totalViews: viewsResult,
    };
  }

  /**
   * Get lecture statistics
   */
  private async getLectureStats(): Promise<LectureStats> {
    const [
      total,
      byLevel,
      byLanguage,
      byType,
      withImage,
      withoutImage,
      withAudio,
      withoutAudio,
      totalReadingTime,
    ] = await Promise.all([
      Lecture.countDocuments(),
      Lecture.aggregate([
        { $group: { _id: "$difficulty", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Lecture.aggregate([
        { $group: { _id: "$language", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Lecture.aggregate([
        { $group: { _id: "$typeWrite", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Lecture.countDocuments({ img: { $exists: true, $nin: [null, ""] } }),
      Lecture.countDocuments({
        $or: [{ img: { $exists: false } }, { img: null }, { img: "" }],
      }),
      Lecture.countDocuments({
        urlAudio: { $exists: true, $nin: [null, ""] },
      }),
      Lecture.countDocuments({
        $or: [
          { urlAudio: { $exists: false } },
          { urlAudio: null },
          { urlAudio: "" },
        ],
      }),
      Lecture.aggregate([
        { $group: { _id: null, total: { $sum: "$time" } } },
      ]),
    ]);

    // Convert aggregation results to objects
    const byLevelObj: Record<string, number> = {};
    byLevel.forEach((item) => {
      byLevelObj[item._id] = item.count;
    });

    const byLanguageObj: Record<string, number> = {};
    byLanguage.forEach((item) => {
      byLanguageObj[item._id] = item.count;
    });

    const byTypeObj: Record<string, number> = {};
    byType.forEach((item) => {
      byTypeObj[item._id] = item.count;
    });

    const readingTimeResult = totalReadingTime[0]?.total || 0;

    return {
      total,
      byLevel: byLevelObj,
      byLanguage: byLanguageObj,
      byType: byTypeObj,
      withImage,
      withoutImage,
      withAudio,
      withoutAudio,
      totalReadingTime: readingTimeResult,
    };
  }

  /**
   * Get expression statistics
   */
  private async getExpressionStats(): Promise<ExpressionStats> {
    const [
      total,
      byDifficulty,
      byLanguage,
      byType,
      withImage,
      withoutImage,
      withContext,
      withoutContext,
    ] = await Promise.all([
      Expression.countDocuments(),
      Expression.aggregate([
        { $group: { _id: "$difficulty", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Expression.aggregate([
        { $group: { _id: "$language", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Expression.aggregate([
        { $unwind: "$type" },
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Expression.countDocuments({ img: { $exists: true, $nin: [null, ""] } }),
      Expression.countDocuments({
        $or: [{ img: { $exists: false } }, { img: null }, { img: "" }],
      }),
      Expression.countDocuments({
        context: { $exists: true, $nin: [null, ""] },
      }),
      Expression.countDocuments({
        $or: [
          { context: { $exists: false } },
          { context: null },
          { context: "" },
        ],
      }),
    ]);

    // Convert aggregation results to objects
    const byDifficultyObj: Record<string, number> = {};
    byDifficulty.forEach((item) => {
      byDifficultyObj[item._id] = item.count;
    });

    const byLanguageObj: Record<string, number> = {};
    byLanguage.forEach((item) => {
      byLanguageObj[item._id] = item.count;
    });

    const byTypeObj: Record<string, number> = {};
    byType.forEach((item) => {
      byTypeObj[item._id] = item.count;
    });

    return {
      total,
      byDifficulty: byDifficultyObj,
      byLanguage: byLanguageObj,
      byType: byTypeObj,
      withImage,
      withoutImage,
      withContext,
      withoutContext,
    };
  }

  /**
   * Get user statistics
   */
  private async getUserStats(): Promise<UserStats> {
    const [total, byRole, active, inactive] = await Promise.all([
      User.countDocuments(),
      User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
    ]);

    // Convert aggregation results to objects
    const byRoleObj: Record<string, number> = {};
    byRole.forEach((item) => {
      byRoleObj[item._id] = item.count;
    });

    return {
      total,
      byRole: byRoleObj,
      active,
      inactive,
    };
  }

  /**
   * Get recent activity (last 5 items of each type)
   */
  private async getRecentActivity(): Promise<RecentActivity> {
    const [words, lectures, expressions] = await Promise.all([
      Word.find().sort({ createdAt: -1 }).limit(5).lean(),
      Lecture.find().sort({ createdAt: -1 }).limit(5).lean(),
      Expression.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    return {
      words: words as unknown as IWord[],
      lectures: lectures as unknown as ILecture[],
      expressions: expressions as unknown as IExpression[],
    };
  }
}
