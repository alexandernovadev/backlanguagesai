import Lecture, { ILecture } from "../../db/models/Lecture";

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export class LectureService {
  async createLecture(data: ILecture): Promise<ILecture> {
    const lecture = new Lecture(data);
    return await lecture.save();
  }

  async getLectureById(id: string): Promise<ILecture | null> {
    return await Lecture.findById(id);
  }

  async updateLecture(
    id: string,
    data: Partial<ILecture>
  ): Promise<ILecture | null> {
    return await Lecture.findByIdAndUpdate(id, data, { new: true });
  }

  async updateImage(
    id: string,
    img: string
  ): Promise<{ _id: string; img: string; updatedAt: Date } | null> {
    return await Lecture.findByIdAndUpdate(
      id,
      { img },
      {
        new: true,
        projection: { _id: 1, img: 1, updatedAt: 1 }, // Return only necessary fields
      }
    );
  }

  async deleteLecture(id: string): Promise<ILecture | null> {
    return await Lecture.findByIdAndDelete(id);
  }

  async getAllLectures(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<ILecture>> {
    const skip = (page - 1) * limit;
    const [total, data] = await Promise.all([
      Lecture.countDocuments(),
      Lecture.find().skip(skip).sort({ createdAt: -1 }).limit(limit),
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  // Get lecture counts by level (A1, A2, B1, B2, C1, C2) and the total lecture count
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
        // Using $facet to perform multiple operations in parallel
        $facet: {
          A1: [
            { $match: { level: "A1" } }, // Match only lectures with 'A1' level
            { $count: "count" }, // Count the number of documents
          ],
          A2: [
            { $match: { level: "A2" } }, // Match only lectures with 'A2' level
            { $count: "count" }, // Count the number of documents
          ],
          B1: [
            { $match: { level: "B1" } }, // Match only lectures with 'B1' level
            { $count: "count" }, // Count the number of documents
          ],
          B2: [
            { $match: { level: "B2" } }, // Match only lectures with 'B2' level
            { $count: "count" }, // Count the number of documents
          ],
          C1: [
            { $match: { level: "C1" } }, // Match only lectures with 'C1' level
            { $count: "count" }, // Count the number of documents
          ],
          C2: [
            { $match: { level: "C2" } }, // Match only lectures with 'C2' level
            { $count: "count" }, // Count the number of documents
          ],
          total: [
            { $count: "count" }, // Count the total number of lectures
          ],
        },
      },
      {
        // Project the final result, setting default 0 count if not found
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

    // Return the result with counts for each level and the total lecture count
    return result[0];
  }
}
