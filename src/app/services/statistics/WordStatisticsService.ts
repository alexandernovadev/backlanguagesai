import Word from "../../db/models/Word";

export class WordStatisticsService {
  // Get word counts by level
  async getWordCountsByLevel(): Promise<{
    easy: number;
    medium: number;
    hard: number;
    total: number;
  }> {
    const result = await Word.aggregate([
      {
        $facet: {
          easy: [{ $match: { level: "easy" } }, { $count: "count" }],
          medium: [{ $match: { level: "medium" } }, { $count: "count" }],
          hard: [{ $match: { level: "hard" } }, { $count: "count" }],
          total: [{ $count: "count" }],
        },
      },
      {
        $project: {
          easy: { $ifNull: [{ $arrayElemAt: ["$easy.count", 0] }, 0] },
          medium: { $ifNull: [{ $arrayElemAt: ["$medium.count", 0] }, 0] },
          hard: { $ifNull: [{ $arrayElemAt: ["$hard.count", 0] }, 0] },
          total: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
        },
      },
    ]);
    return result[0];
  }

  // Get words by language
  async getWordsByLanguage(): Promise<Array<{ language: string; count: number }>> {
    return await Word.aggregate([
      { $group: { _id: "$language", count: { $sum: 1 } } },
      { $project: { language: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);
  }

  // Get average seen by level
  async getAverageSeenByLevel(): Promise<Array<{ level: string; averageSeen: number }>> {
    return await Word.aggregate([
      { $match: { seen: { $exists: true, $ne: null } } },
      { $group: { _id: "$level", averageSeen: { $avg: "$seen" } } },
      { $project: { level: "_id", averageSeen: 1, _id: 0 } },
      { $sort: { level: 1 } }
    ]);
  }

  // Get recent words count (last 30 days)
  async getRecentWordsCount(days: number = 30): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return await Word.countDocuments({
      createdAt: { $gte: date }
    });
  }

  // Get words with missing images
  async getWordsWithoutImages(): Promise<number> {
    return await Word.countDocuments({
      $or: [
        { img: { $exists: false } },
        { img: null },
        { img: "" }
      ]
    });
  }

  // Get words with missing examples
  async getWordsWithoutExamples(): Promise<number> {
    return await Word.countDocuments({
      $or: [
        { examples: { $exists: false } },
        { examples: [] },
        { examples: { $size: 0 } }
      ]
    });
  }
} 