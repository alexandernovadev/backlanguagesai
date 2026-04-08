import crypto from "crypto";
import Exam from "../../db/models/Exam";
import { IExam } from "../../../../types/models";
import {
  ImportConfig,
  ProcessingResult,
  BatchResult,
  ImportResult,
} from "../../utils/importTypes";
import { ExamValidator } from "../../utils/validators/examValidator";
import logger from "../../utils/logger";

export class ExamImportService {
  private async checkDuplicate(exam: Partial<IExam>): Promise<IExam | null> {
    if (!exam.title || !exam.language || !exam.difficulty) return null;
    return Exam.findOne({ title: exam.title, language: exam.language, difficulty: exam.difficulty });
  }

  private normalizeExam(exam: Partial<IExam>): Partial<IExam> {
    return {
      ...exam,
      questions: (exam.questions || []).map((q: any) => ({
        ...q,
        id: q.id || crypto.randomUUID(),
        type: q.type || "multiple",
      })),
    };
  }

  private async processExam(
    exam: Partial<IExam>,
    index: number,
    config: ImportConfig
  ): Promise<ProcessingResult<Partial<IExam>>> {
    try {
      const validationResult = ExamValidator.validateExam(exam, index);

      if (!validationResult.isValid) {
        return { index, data: exam, status: "invalid", validationResult, action: "skipped" };
      }

      const existing = await this.checkDuplicate(exam);

      if (existing) {
        switch (config.duplicateStrategy) {
          case "error":
            return { index, data: exam, status: "duplicate", validationResult, error: "Duplicate exam found", action: "skipped" };
          case "skip":
            return { index, data: exam, status: "duplicate", validationResult, action: "skipped" };
          case "overwrite":
          case "merge":
            await Exam.findByIdAndUpdate(existing._id, { ...this.normalizeExam(exam), updatedAt: new Date() }, { new: true });
            return { index, data: exam, status: "valid", validationResult, action: config.duplicateStrategy === "merge" ? "merged" : "updated" };
        }
      }

      const newExam = new Exam(this.normalizeExam(exam));
      await newExam.save();
      return { index, data: exam, status: "valid", validationResult, action: "inserted" };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error(`ExamImportService error at index ${index}:`, error);
      return { index, data: exam, status: "error", error: errorMessage, action: "skipped" };
    }
  }

  async importExams(exams: Partial<IExam>[], config: ImportConfig): Promise<ImportResult> {
    const startTime = Date.now();
    const batches: BatchResult[] = [];
    let totalValid = 0, totalInvalid = 0, totalDuplicates = 0, totalErrors = 0;
    let totalInserted = 0, totalUpdated = 0, totalSkipped = 0;

    for (let i = 0; i < exams.length; i += config.batchSize) {
      const batch = exams.slice(i, i + config.batchSize);
      const batchIndex = Math.floor(i / config.batchSize);
      let batchValid = 0, batchInvalid = 0, batchDuplicates = 0, batchErrors = 0;
      let batchInserted = 0, batchUpdated = 0, batchSkipped = 0;

      for (let j = 0; j < batch.length; j++) {
        const result = await this.processExam(batch[j], i + j, config);

        switch (result.status) {
          case "valid": batchValid++; totalValid++; break;
          case "invalid": batchInvalid++; totalInvalid++; break;
          case "duplicate": batchDuplicates++; totalDuplicates++; break;
          case "error": batchErrors++; totalErrors++; break;
        }
        switch (result.action) {
          case "inserted": batchInserted++; totalInserted++; break;
          case "updated": batchUpdated++; totalUpdated++; break;
          case "merged": batchUpdated++; totalUpdated++; break;
          case "skipped": batchSkipped++; totalSkipped++; break;
        }
      }

      batches.push({
        batchIndex,
        processed: batch.length,
        valid: batchValid,
        invalid: batchInvalid,
        duplicates: batchDuplicates,
        errors: batchErrors,
        inserted: batchInserted,
        updated: batchUpdated,
        skipped: batchSkipped,
      });
    }

    const duration = Date.now() - startTime;
    return {
      totalItems: exams.length,
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
        duration,
      },
    };
  }

  async validateExams(exams: Partial<IExam>[]): Promise<ProcessingResult<Partial<IExam>>[]> {
    return exams.map((exam, index) => {
      const validationResult = ExamValidator.validateExam(exam, index);
      return { index, data: exam, status: validationResult.isValid ? "valid" : "invalid", validationResult };
    });
  }
}
