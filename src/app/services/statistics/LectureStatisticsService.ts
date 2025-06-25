import Lecture from "../../db/models/Lecture";

export class LectureStatisticsService {
  // Get lecture counts by level
  async getLectureCountsByLevel(): Promise<{
    A1: number;
    A2: number;
    B1: number;
    B2: number;
    C1: number;
    C2: number;
    total: number;
  }> {
    const result = await Lecture.aggregate([
      {
        $facet: {
          A1: [{ $match: { level: "A1" } }, { $count: "count" }],
          A2: [{ $match: { level: "A2" } }, { $count: "count" }],
          B1: [{ $match: { level: "B1" } }, { $count: "count" }],
          B2: [{ $match: { level: "B2" } }, { $count: "count" }],
          C1: [{ $match: { level: "C1" } }, { $count: "count" }],
          C2: [{ $match: { level: "C2" } }, { $count: "count" }],
          total: [{ $count: "count" }],
        },
      },
      {
        $project: {
          A1: { $ifNull: [{ $arrayElemAt: ["$A1.count", 0] }, 0] },
          A2: { $ifNull: [{ $arrayElemAt: ["$A2.count", 0] }, 0] },
          B1: { $ifNull: [{ $arrayElemAt: ["$B1.count", 0] }, 0] },
          B2: { $ifNull: [{ $arrayElemAt: ["$B2.count", 0] }, 0] },
          C1: { $ifNull: [{ $arrayElemAt: ["$C1.count", 0] }, 0] },
          C2: { $ifNull: [{ $arrayElemAt: ["$C2.count", 0] }, 0] },
          total: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
        },
      },
    ]);

    return result[0];
  }

  // Get lectures by language
  async getLecturesByLanguage(): Promise<Array<{ language: string; count: number }>> {
    return await Lecture.aggregate([
      { $group: { _id: "$language", count: { $sum: 1 } } },
      { $project: { language: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);
  }

  // Get average time by level
  async getAverageTimeByLevel(): Promise<Array<{ level: string; averageTime: number }>> {
    return await Lecture.aggregate([
      { $match: { time: { $exists: true, $ne: null } } },
      { $group: { _id: "$level", averageTime: { $avg: "$time" } } },
      { $project: { level: "$_id", averageTime: 1, _id: 0 } },
      { $sort: { level: 1 } }
    ]);
  }

  // Get recent lectures count (last 30 days)
  async getRecentLecturesCount(days: number = 30): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    return await Lecture.countDocuments({
      createdAt: { $gte: date }
    });
  }

  // Get lectures with missing audio
  async getLecturesWithoutAudio(): Promise<number> {
    return await Lecture.countDocuments({
      $or: [
        { urlAudio: { $exists: false } },
        { urlAudio: null },
        { urlAudio: "" }
      ]
    });
  }

  // Get lectures with missing images
  async getLecturesWithoutImages(): Promise<number> {
    return await Lecture.countDocuments({
      $or: [
        { img: { $exists: false } },
        { img: null },
        { img: "" }
      ]
    });
  }
} 