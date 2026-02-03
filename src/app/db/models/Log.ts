import mongoose, { Schema } from "mongoose";
import { ILog } from "../../../../types/models";

const LogSchema: Schema = new Schema<ILog>(
  {
    errorMessage: {
      type: String,
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    errorData: {
      type: Schema.Types.Mixed,
    },
    stack: {
      type: String,
    },
  },
  { timestamps: true }
);

LogSchema.index({ createdAt: -1 });
LogSchema.index({ statusCode: 1 });

export default mongoose.model<ILog>("Log", LogSchema);
