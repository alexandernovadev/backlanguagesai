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

  /**
   * Advanced paginated query with optional text search + multiple filters
   */
  async getLecturesAdvanced(filters: {
    page?: number;
    limit?: number;
    search?: string;
    level?: string | string[];
    language?: string | string[];
    typeWrite?: string | string[];
    timeMin?: number;
    timeMax?: number;
    createdAfter?: string;
    createdBefore?: string;
    sortBy?: string;
    sortOrder?: string;
    hasImg?: "true" | "false";
    hasUrlAudio?: "true" | "false";
    updatedAfter?: string;
    updatedBefore?: string;
  } = {}): Promise<PaginatedResult<ILecture>> {
    const {
      page = 1,
      limit = 10,
      search = "",
      level,
      language,
      typeWrite,
      timeMin,
      timeMax,
      createdAfter,
      createdBefore,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

    // Text search
    if (search.trim()) {
      query.$text = { $search: search.trim() };
    }

    // Level filter
    if (level) {
      query.level = Array.isArray(level) ? { $in: level } : level;
    }

    // Language filter
    if (language) {
      if (Array.isArray(language)) {
        const regexLang = language.map((lang) => new RegExp(lang, "i"));
        query.language = { $in: regexLang };
      } else {
        query.language = { $regex: language, $options: "i" };
      }
    }

    // typeWrite filter
    if (typeWrite) {
      query.typeWrite = Array.isArray(typeWrite) ? { $in: typeWrite } : typeWrite;
    }

    // Boolean filter: hasImg
    if (filters.hasImg === "true") {
      query.img = { $exists: true, $nin: ["", null] };
    } else if (filters.hasImg === "false") {
      query.$or = query.$or || [];
      query.$or.push({ img: { $exists: false } }, { img: "" }, { img: null });
    }

    // Boolean filter: hasUrlAudio
    if (filters.hasUrlAudio === "true") {
      query.urlAudio = { $exists: true, $nin: ["", null] };
    } else if (filters.hasUrlAudio === "false") {
      query.$or = query.$or || [];
      query.$or.push({ urlAudio: { $exists: false } }, { urlAudio: "" }, { urlAudio: null });
    }

    // Time range filter
    if (timeMin !== undefined || timeMax !== undefined) {
      const timeFilter: Record<string, number> = {};
      if (timeMin !== undefined) timeFilter.$gte = timeMin;
      if (timeMax !== undefined) timeFilter.$lte = timeMax;
      query.time = timeFilter;
    }

    // Date filters
    if (createdAfter || createdBefore) {
      const createdFilter: Record<string, Date> = {};
      if (createdAfter) createdFilter.$gte = new Date(createdAfter);
      if (createdBefore) createdFilter.$lte = new Date(createdBefore);
      query.createdAt = createdFilter;
    }

    if (filters.updatedAfter || filters.updatedBefore) {
      const updFilter: Record<string, Date> = {};
      if (filters.updatedAfter) updFilter.$gte = new Date(filters.updatedAfter);
      if (filters.updatedBefore) updFilter.$lte = new Date(filters.updatedBefore);
      query.updatedAt = updFilter;
    }

    // Sorting
    const sortField = ["createdAt", "time"].includes(sortBy) ? sortBy : "createdAt";
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const sortObj: Record<string, number | any> = {};
    sortObj[sortField] = sortDirection;

    // If using text search, prepend by textScore for relevancia
    if (query.$text) {
      sortObj.score = { $meta: "textScore" };
    }

    // Projection
    const projection = query.$text ? { score: { $meta: "textScore" } } : {};

    const [total, data] = await Promise.all([
      Lecture.countDocuments(query),
      Lecture.find(query, projection)
        .sort(sortObj)
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
}
