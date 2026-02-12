import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporterUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', required: true },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ['pending', 'processed', 'dismissed'], default: 'pending' },
  },
  { timestamps: true }
);

reportSchema.index({ storyId: 1 });
reportSchema.index({ status: 1 });

export const Report = mongoose.model('Report', reportSchema);
export type ReportDocument = mongoose.InferSchemaType<typeof reportSchema> & mongoose.Document;
