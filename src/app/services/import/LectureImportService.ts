import Lecture, { ILecture } from "../../db/models/Lecture";
import { 
  ImportConfig, 
  ProcessingResult, 
  BatchResult, 
  ImportResult 
} from "../../utils/importTypes";
import { LectureValidator } from "../../utils/validators/lectureValidator";
import logger from "../../utils/logger";

export class LectureImportService {
  // Check for duplicate lectures
  private async checkDuplicate(lecture: Partial<ILecture>): Promise<ILecture | null> {
    if (!lecture.content) return null;
    return await Lecture.findOne({ content: lecture.content });
  }

  // Process a single lecture
  private async processLecture(
    lecture: Partial<ILecture>, 
    index: number, 
    config: ImportConfig
  ): Promise<ProcessingResult<Partial<ILecture>>> {
    try {
      const validationResult = LectureValidator.validateLecture(lecture, index);
      
      if (!validationResult.isValid) {
        return {
          index,
          data: lecture,
          status: 'invalid',
          validationResult,
          action: 'skipped'
        };
      }

      const existingLecture = await this.checkDuplicate(lecture);
      
      if (existingLecture) {
        switch (config.duplicateStrategy) {
          case 'error':
            return {
              index,
              data: lecture,
              status: 'duplicate',
              validationResult,
              error: 'Duplicate lecture found',
              action: 'skipped'
            };
          
          case 'skip':
            return {
              index,
              data: lecture,
              status: 'duplicate',
              validationResult,
              action: 'skipped'
            };
          
          case 'overwrite':
            await Lecture.findByIdAndUpdate(
              existingLecture._id,
              { ...lecture, updatedAt: new Date() },
              { new: true }
            );
            return {
              index,
              data: lecture,
              status: 'valid',
              validationResult,
              action: 'updated'
            };
          
          case 'merge':
            await Lecture.findByIdAndUpdate(
              existingLecture._id,
              { ...lecture, updatedAt: new Date() },
              { new: true }
            );
            return {
              index,
              data: lecture,
              status: 'valid',
              validationResult,
              action: 'merged'
            };
        }
      }

      const newLecture = new Lecture(lecture);
      await newLecture.save();
      
      return {
        index,
        data: lecture,
        status: 'valid',
        validationResult,
        action: 'inserted'
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        index,
        data: lecture,
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
    
    let totalValid = 0;
    let totalInvalid = 0;
    let totalDuplicates = 0;
    let totalErrors = 0;
    let totalInserted = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;

    for (let i = 0; i < lectures.length; i += config.batchSize) {
      const batchLectures = lectures.slice(i, i + config.batchSize);
      const batchIndex = Math.floor(i / config.batchSize);
      
      let batchValid = 0;
      let batchInvalid = 0;
      let batchDuplicates = 0;
      let batchErrors = 0;
      let batchInserted = 0;
      let batchUpdated = 0;
      let batchSkipped = 0;

      for (let j = 0; j < batchLectures.length; j++) {
        const result = await this.processLecture(batchLectures[j], i + j, config);

        switch (result.status) {
          case 'valid': batchValid++; totalValid++; break;
          case 'invalid': batchInvalid++; totalInvalid++; break;
          case 'duplicate': batchDuplicates++; totalDuplicates++; break;
          case 'error': batchErrors++; totalErrors++; break;
        }

        switch (result.action) {
          case 'inserted': batchInserted++; totalInserted++; break;
          case 'updated': batchUpdated++; totalUpdated++; break;
          case 'merged': batchUpdated++; totalUpdated++; break;
          case 'skipped': batchSkipped++; totalSkipped++; break;
        }
      }

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
    
    return {
      totalItems: lectures.length,
      totalBatches: batches.length,
      totalValid,
      totalInvalid,
      totalDuplicates,
      totalErrors,
      totalInserted,
      totalUpdated,
      totalSkipped,
      batches,
      summary: {
        success: totalErrors === 0,
        message: `Import completed. ${totalInserted} inserted, ${totalUpdated} updated, ${totalSkipped} skipped, ${totalErrors} errors`,
        duration
      }
    };
  }

  // Validate lectures without importing
  async validateLectures(lectures: Partial<ILecture>[]): Promise<ProcessingResult<Partial<ILecture>>[]> {
    return lectures.map((lecture, index) => ({
      index,
      data: lecture,
      status: LectureValidator.validateLecture(lecture, index).isValid ? 'valid' : 'invalid',
      validationResult: LectureValidator.validateLecture(lecture, index)
    }));
  }
} 