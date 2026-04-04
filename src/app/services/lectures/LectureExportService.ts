import Lecture from "../../db/models/Lecture";
import { ILecture } from "../../../../types/models";

export class LectureExportService {
  async getAllLecturesForExport(): Promise<ILecture[]> {
    const results: ILecture[] = [];
    const cursor = Lecture.find({}).sort({ createdAt: -1 }).lean().cursor();
    for await (const doc of cursor) {
      results.push(doc as unknown as ILecture);
    }
    return results;
  }
}

export default new LectureExportService();
