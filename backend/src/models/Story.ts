import mongoose from 'mongoose';

const storySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Optionnel : si renseigné, l'histoire est explicitement liée à un profil enfant
    childProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: false },
    type: { type: String, enum: ['story', 'rhyme'], required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    inputs: {
      theme: String,
      characters: String,
      emotion: String,
      moral: String,
      situation: String,
      tone: String,
    },
    ageBand: { type: String, enum: ['3-5', '6-8', '9-12'], required: true },
    status: { type: String, enum: ['draft', 'published', 'removed'], default: 'draft' },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

storySchema.index({ userId: 1 });
storySchema.index({ status: 1, publishedAt: -1 });
storySchema.index({ ageBand: 1, 'inputs.theme': 1 });

export const Story = mongoose.model('Story', storySchema);
export type StoryDocument = mongoose.InferSchemaType<typeof storySchema> & mongoose.Document;
