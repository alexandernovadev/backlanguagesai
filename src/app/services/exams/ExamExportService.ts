import Exam from "../../db/models/Exam";
import { IExam } from "../../../../types/models";

export class ExamExportService {
  async getAllExamsForExport(): Promise<IExam[]> {
    const results: IExam[] = [];
    const cursor = Exam.find({}).sort({ createdAt: -1 }).lean().cursor();
    for await (const doc of cursor) {
      results.push(doc as unknown as IExam);
    }
    return results;
  }
}

export default new ExamExportService();
