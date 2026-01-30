import Word from "../../db/models/Word";
import Expression from "../../db/models/Expression";
import Lecture from "../../db/models/Lecture";
import logger from "../../utils/logger";

export class LabsService {
  /**
   * Delete all words from the database
   * ⚠️ DANGEROUS OPERATION - Cannot be undone
   */
  async deleteAllWords(): Promise<{ deletedCount: number; timestamp: Date }> {
    try {
      logger.warn("⚠️ INITIATING: Delete all words operation");
      
      const result = await Word.deleteMany({});
      const timestamp = new Date();
      
      logger.warn("⚠️ COMPLETED: All words deleted", {
        deletedCount: result.deletedCount,
        timestamp: timestamp.toISOString()
      });
      
      return {
        deletedCount: result.deletedCount || 0,
        timestamp
      };
    } catch (error) {
      logger.error("❌ Error deleting all words:", error);
      throw error;
    }
  }

  /**
   * Delete all expressions from the database
   * ⚠️ DANGEROUS OPERATION - Cannot be undone
   */
  async deleteAllExpressions(): Promise<{ deletedCount: number; timestamp: Date }> {
    try {
      logger.warn("⚠️ INITIATING: Delete all expressions operation");
      
      const result = await Expression.deleteMany({});
      const timestamp = new Date();
      
      logger.warn("⚠️ COMPLETED: All expressions deleted", {
        deletedCount: result.deletedCount,
        timestamp: timestamp.toISOString()
      });
      
      return {
        deletedCount: result.deletedCount || 0,
        timestamp
      };
    } catch (error) {
      logger.error("❌ Error deleting all expressions:", error);
      throw error;
    }
  }

  /**
   * Delete all lectures from the database
   * ⚠️ DANGEROUS OPERATION - Cannot be undone
   */
  async deleteAllLectures(): Promise<{ deletedCount: number; timestamp: Date }> {
    try {
      logger.warn("⚠️ INITIATING: Delete all lectures operation");
      
      const result = await Lecture.deleteMany({});
      const timestamp = new Date();
      
      logger.warn("⚠️ COMPLETED: All lectures deleted", {
        deletedCount: result.deletedCount,
        timestamp: timestamp.toISOString()
      });
      
      return {
        deletedCount: result.deletedCount || 0,
        timestamp
      };
    } catch (error) {
      logger.error("❌ Error deleting all lectures:", error);
      throw error;
    }
  }
}
