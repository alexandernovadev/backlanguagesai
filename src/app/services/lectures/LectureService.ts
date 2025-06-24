import Lecture, { ILecture } from "../../db/models/Lecture";
import { 
  ImportConfig, 
  ValidationResult, 
  ProcessingResult, 
  BatchResult, 
  ImportResult 
} from "../../utils/importTypes";
import logger from "../../utils/logger";

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

  async updateUrlAudio(
    id: string,
    urlAudio: string
  ): Promise<{ _id: string; urlAudio: string; updatedAt: Date } | null> {
    return await Lecture.findByIdAndUpdate(
      id,
      { urlAudio },
      {
        new: true,
        projection: { _id: 1, urlAudio: 1, updatedAt: 1 }, // Return only necessary fields
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

  // Get all lectures for JSON export (without pagination)
  async getAllLecturesForExport(): Promise<ILecture[]> {
    return await Lecture.find({})
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  // Validate a single lecture
  private validateLecture(lecture: Partial<ILecture>, index: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!lecture.content || typeof lecture.content !== 'string' || lecture.content.trim().length === 0) {
      errors.push('Content is required and must be a non-empty string');
    }

    if (!lecture.level || !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(lecture.level)) {
      errors.push('Level is required and must be one of: A1, A2, B1, B2, C1, C2');
    }

    if (!lecture.language || typeof lecture.language !== 'string' || lecture.language.trim().length === 0) {
      errors.push('Language is required and must be a non-empty string');
    }

    if (!lecture.typeWrite || typeof lecture.typeWrite !== 'string' || lecture.typeWrite.trim().length === 0) {
      errors.push('TypeWrite is required and must be a non-empty string');
    }

    // Optional field validations
    if (lecture.time !== undefined && (typeof lecture.time !== 'number' || lecture.time < 0)) {
      errors.push('Time must be a non-negative number');
    }

    // urlAudio is optional and can be empty
    if (lecture.urlAudio !== undefined && lecture.urlAudio !== null && typeof lecture.urlAudio !== 'string') {
      errors.push('UrlAudio must be a string');
    }

    // img is optional and can be empty
    if (lecture.img !== undefined && lecture.img !== null && typeof lecture.img !== 'string') {
      errors.push('Img must be a string');
    }

    // Content length warning
    if (lecture.content && lecture.content.length > 10000) {
      warnings.push('Content is very long (>10,000 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Validate multiple lectures
  async validateLectures(lectures: Partial<ILecture>[]): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];

    for (let i = 0; i < lectures.length; i++) {
      const lecture = lectures[i];
      const validationResult = this.validateLecture(lecture, i);
      
      results.push({
        index: i,
        lecture,
        status: validationResult.isValid ? 'valid' : 'invalid',
        validationResult
      });
    }

    return results;
  }

  // Check for duplicate lectures
  private async checkDuplicate(lecture: Partial<ILecture>): Promise<ILecture | null> {
    if (!lecture.content) return null;
    
    // Check for exact content match
    return await Lecture.findOne({ content: lecture.content });
  }

  // Process a single lecture based on duplicate strategy
  private async processLecture(
    lecture: Partial<ILecture>, 
    index: number, 
    config: ImportConfig
  ): Promise<ProcessingResult> {
    try {
      // Validate lecture
      const validationResult = this.validateLecture(lecture, index);
      
      if (!validationResult.isValid) {
        logger.warn(`Lecture ${index} validation failed:`, {
          index,
          errors: validationResult.errors,
          warnings: validationResult.warnings,
          lectureContent: lecture.content?.substring(0, 100) + '...'
        });
        
        return {
          index,
          lecture,
          status: 'invalid',
          validationResult,
          action: 'skipped'
        };
      }

      // Check for duplicates
      const existingLecture = await this.checkDuplicate(lecture);
      
      if (existingLecture) {
        logger.info(`Duplicate lecture found at index ${index}`, {
          index,
          existingId: existingLecture._id,
          strategy: config.duplicateStrategy
        });
        
        switch (config.duplicateStrategy) {
          case 'error':
            logger.error(`Duplicate lecture error at index ${index}`, {
              index,
              existingId: existingLecture._id,
              content: lecture.content?.substring(0, 100) + '...'
            });
            return {
              index,
              lecture,
              status: 'duplicate',
              validationResult,
              error: 'Duplicate lecture found',
              action: 'skipped'
            };
          
          case 'skip':
            return {
              index,
              lecture,
              status: 'duplicate',
              validationResult,
              action: 'skipped'
            };
          
          case 'overwrite':
            const updatedLecture = await Lecture.findByIdAndUpdate(
              existingLecture._id,
              { ...lecture, updatedAt: new Date() },
              { new: true }
            );
            logger.info(`Lecture ${index} overwritten`, {
              index,
              existingId: existingLecture._id
            });
            return {
              index,
              lecture,
              status: 'valid',
              validationResult,
              action: 'updated'
            };
          
          case 'merge':
            // For merge, we could implement more sophisticated logic
            // For now, just overwrite
            await Lecture.findByIdAndUpdate(
              existingLecture._id,
              { ...lecture, updatedAt: new Date() },
              { new: true }
            );
            logger.info(`Lecture ${index} merged`, {
              index,
              existingId: existingLecture._id
            });
            return {
              index,
              lecture,
              status: 'valid',
              validationResult,
              action: 'merged'
            };
        }
      }

      // Create new lecture
      const newLecture = new Lecture(lecture);
      await newLecture.save();
      
      logger.info(`Lecture ${index} inserted successfully`, {
        index,
        newId: newLecture._id,
        level: lecture.level,
        language: lecture.language
      });
      
      return {
        index,
        lecture,
        status: 'valid',
        validationResult,
        action: 'inserted'
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      logger.error(`Error processing lecture ${index}:`, {
        index,
        error: errorMessage,
        stack: errorStack,
        lectureContent: lecture.content?.substring(0, 100) + '...',
        lectureData: {
          level: lecture.level,
          language: lecture.language,
          typeWrite: lecture.typeWrite,
          time: lecture.time
        }
      });
      
      return {
        index,
        lecture,
        status: 'error',
        error: errorMessage,
        action: 'skipped'
      };
    }
  }

  // Import lectures in batches
  async importLectures(lectures: Partial<ILecture>[], config: ImportConfig): Promise<ImportResult> {
    const startTime = Date.now();
    const batches: BatchResult[] = [];
    
    logger.info('Starting lecture import process', {
      totalLectures: lectures.length,
      config: {
        duplicateStrategy: config.duplicateStrategy,
        validateOnly: config.validateOnly,
        batchSize: config.batchSize
      }
    });
    
    let totalValid = 0;
    let totalInvalid = 0;
    let totalDuplicates = 0;
    let totalErrors = 0;
    let totalInserted = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;

    // Process in batches
    for (let i = 0; i < lectures.length; i += config.batchSize) {
      const batchLectures = lectures.slice(i, i + config.batchSize);
      const batchIndex = Math.floor(i / config.batchSize);
      
      logger.info(`Processing batch ${batchIndex + 1}/${Math.ceil(lectures.length / config.batchSize)}`, {
        batchIndex,
        batchSize: batchLectures.length,
        startIndex: i,
        endIndex: i + batchLectures.length - 1
      });
      
      const batchResults: ProcessingResult[] = [];
      let batchValid = 0;
      let batchInvalid = 0;
      let batchDuplicates = 0;
      let batchErrors = 0;
      let batchInserted = 0;
      let batchUpdated = 0;
      let batchSkipped = 0;

      // Process each lecture in the batch
      for (let j = 0; j < batchLectures.length; j++) {
        const result = await this.processLecture(batchLectures[j], i + j, config);
        batchResults.push(result);

        // Update counters
        switch (result.status) {
          case 'valid':
            batchValid++;
            totalValid++;
            break;
          case 'invalid':
            batchInvalid++;
            totalInvalid++;
            break;
          case 'duplicate':
            batchDuplicates++;
            totalDuplicates++;
            break;
          case 'error':
            batchErrors++;
            totalErrors++;
            break;
        }

        switch (result.action) {
          case 'inserted':
            batchInserted++;
            totalInserted++;
            break;
          case 'updated':
            batchUpdated++;
            totalUpdated++;
            break;
          case 'merged':
            batchUpdated++;
            totalUpdated++;
            break;
          case 'skipped':
            batchSkipped++;
            totalSkipped++;
            break;
        }
      }

      logger.info(`Batch ${batchIndex + 1} completed`, {
        batchIndex,
        processed: batchLectures.length,
        valid: batchValid,
        invalid: batchInvalid,
        duplicates: batchDuplicates,
        errors: batchErrors,
        inserted: batchInserted,
        updated: batchUpdated,
        skipped: batchSkipped
      });

      batches.push({
        batchIndex,
        processed: batchLectures.length,
        valid: batchValid,
        invalid: batchInvalid,
        duplicates: batchDuplicates,
        errors: batchErrors,
        inserted: batchInserted,
        updated: batchUpdated,
        skipped: batchSkipped
      });
    }

    const duration = Date.now() - startTime;
    
    const summary = {
      success: totalErrors === 0,
      message: `Import completed. ${totalInserted} inserted, ${totalUpdated} updated, ${totalSkipped} skipped, ${totalErrors} errors`,
      duration
    };

    logger.info('Lecture import process completed', {
      summary,
      totals: {
        totalLectures: lectures.length,
        totalBatches: batches.length,
        totalValid,
        totalInvalid,
        totalDuplicates,
        totalErrors,
        totalInserted,
        totalUpdated,
        totalSkipped
      },
      duration
    });

    if (totalErrors > 0) {
      logger.error('Import completed with errors', {
        totalErrors,
        summary
      });
    }

    return {
      totalLectures: lectures.length,
      totalBatches: batches.length,
      totalValid,
      totalInvalid,
      totalDuplicates,
      totalErrors,
      totalInserted,
      totalUpdated,
      totalSkipped,
      batches,
      summary
    };
  }
}
