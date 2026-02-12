import { Profile } from '../models/Profile.js';

export const profileRepository = {
  findByUserId(userId: string) {
    return Profile.find({ userId }).lean();
  },

  findChildByIdAndUser(id: string, userId: string) {
    return Profile.findOne({ _id: id, userId, type: 'child' });
  },

  create(data: { userId: string; type: 'parent' | 'child'; name: string; ageBand?: string }) {
    return Profile.create(data);
  },

  update(id: string, userId: string, data: { name?: string; ageBand?: string }) {
    return Profile.findOneAndUpdate(
      { _id: id, userId, type: 'child' },
      { $set: data },
      { new: true }
    );
  },

  delete(id: string, userId: string) {
    return Profile.findOneAndDelete({ _id: id, userId, type: 'child' });
  },
};
