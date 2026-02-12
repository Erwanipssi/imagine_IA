import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  },
  { timestamps: true }
);

// email a déjà un index via unique: true dans le schéma
userSchema.index({ status: 1 });

export const User = mongoose.model('User', userSchema);
export type UserDocument = mongoose.InferSchemaType<typeof userSchema> & mongoose.Document;
