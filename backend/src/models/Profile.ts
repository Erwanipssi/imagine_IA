import mongoose from 'mongoose';

const ageBands = ['3-5', '6-8', '9-12'] as const;
export type AgeBand = (typeof ageBands)[number];

const profileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['parent', 'child'], required: true },
    name: { type: String, required: true, trim: true },
    ageBand: { type: String, enum: ageBands }, // uniquement pour type child
  },
  { timestamps: true }
);

profileSchema.index({ userId: 1 });
profileSchema.index({ userId: 1, type: 1 });

export const Profile = mongoose.model('Profile', profileSchema);
export type ProfileDocument = mongoose.InferSchemaType<typeof profileSchema> & mongoose.Document;
export { ageBands };
