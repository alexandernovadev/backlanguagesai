import Expression from "../../db/models/Expression";
import { IExpression } from "../../../../types/models";

export class ExpressionImportExportService {
  async getAllExpressionsForExport(): Promise<IExpression[]> {
    const results: IExpression[] = [];
    const cursor = Expression.find({}).sort({ createdAt: -1 }).lean().cursor();
    for await (const doc of cursor) {
      results.push(doc as unknown as IExpression);
    }
    return results;
  }

  async importExpressions(
    expressions: any[],
    config: {
      duplicateStrategy: "skip" | "overwrite" | "error" | "merge";
      batchSize?: number;
    }
  ): Promise<{
    totalItems: number;
    totalInserted: number;
    totalUpdated: number;
    totalSkipped: number;
    totalErrors: number;
    batches: any[];
    summary: { success: boolean; message: string; duration: number };
  }> {
    const startTime = Date.now();
    const batches: any[] = [];
    let totalInserted = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    const batchSize = config.batchSize || 10;

    // No transaction: compatible with MongoDB standalone (no replica set required).
    for (let i = 0; i < expressions.length; i += batchSize) {
      const batchExpressions = expressions.slice(i, i + batchSize);
      const batchIndex = Math.floor(i / batchSize);
      let batchInserted = 0;
      let batchUpdated = 0;
      let batchSkipped = 0;
      let batchErrors = 0;

      for (const expressionData of batchExpressions) {
        try {
          const existing = await Expression.findOne({
            expression: expressionData.expression,
          });

          if (existing) {
            switch (config.duplicateStrategy) {
              case "error":
                batchErrors++; totalErrors++; break;
              case "skip":
                batchSkipped++; totalSkipped++; break;
              case "overwrite":
              case "merge": {
                const { _id: _drop, ...updateData } = expressionData;
                await Expression.findByIdAndUpdate(existing._id, updateData, { new: true });
                batchUpdated++; totalUpdated++; break;
              }
            }
          } else {
            await new Expression(expressionData).save();
            batchInserted++; totalInserted++;
          }
        } catch {
          batchErrors++; totalErrors++;
        }
      }

      batches.push({
        batchIndex,
        processed: batchExpressions.length,
        inserted: batchInserted,
        updated: batchUpdated,
        skipped: batchSkipped,
        errors: batchErrors,
      });
    }

    const duration = Date.now() - startTime;
    return {
      totalItems: expressions.length,
      totalInserted,
      totalUpdated,
      totalSkipped,
      totalErrors,
      batches,
      summary: {
        success: totalErrors === 0,
        message: `Import completed. ${totalInserted} inserted, ${totalUpdated} updated, ${totalSkipped} skipped, ${totalErrors} errors`,
        duration,
      },
    };
  }
}

export default new ExpressionImportExportService();
