import Lecture, { ILecture } from "../../db/models/Lecture";

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export class LectureService {
  // Basic CRUD operations
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
        projection: { _id: 1, img: 1, updatedAt: 1 },
      }
    );
  }

  async updateUrlAudio(
    id: string,
    urlAudio: string
  ): Promise<{ _id: string; urlAudio: string; updatedAt: Date } | null> {
    return await Lecture.findByIdAndUpdate(
      id,
      { urlAudio },
      {
        new: true,
        projection: { _id: 1, urlAudio: 1, updatedAt: 1 },
      }
    );
  }

  async deleteLecture(id: string): Promise<ILecture | null> {
    return await Lecture.findByIdAndDelete(id);
  }

  // Query operations
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

  async getAllLecturesForExport(): Promise<ILecture[]> {
    return await Lecture.find({})
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  // Find operations
  async findLectureByContent(content: string): Promise<ILecture | null> {
    return await Lecture.findOne({ content });
  }

  async findLecturesByLevel(level: string): Promise<ILecture[]> {
    return await Lecture.find({ level }).sort({ createdAt: -1 });
  }

  async findLecturesByLanguage(language: string): Promise<ILecture[]> {
    return await Lecture.find({ language }).sort({ createdAt: -1 });
  }

  // Count operations
  async countLectures(): Promise<number> {
    return await Lecture.countDocuments();
  }

  // Text search operation
  async searchLectures(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<ILecture>> {
    const skip = (page - 1) * limit;

    // Use MongoDB text index for efficient full-text search
    const filter = { $text: { $search: query } };

    // Include textScore to sort by relevance
    const projection = { score: { $meta: "textScore" } } as any;

    const [total, data] = await Promise.all([
      Lecture.countDocuments(filter),
      Lecture.find(filter, projection)
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(limit),
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async countLecturesByLevel(level: string): Promise<number> {
    return await Lecture.countDocuments({ level });
  }

  async countLecturesByLanguage(language: string): Promise<number> {
    return await Lecture.countDocuments({ language });
  }
}
