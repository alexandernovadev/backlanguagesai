import Word from "../../db/models/Word";
import { IWord } from "../../../../types/models";

export class WordExportService {
  async getAllWordsForExport(): Promise<IWord[]> {
    const results: IWord[] = [];
    const cursor = Word.find({}).sort({ createdAt: -1 }).lean().cursor();
    for await (const doc of cursor) {
      results.push(doc as unknown as IWord);
    }
    return results;
  }
}

export default new WordExportService();
