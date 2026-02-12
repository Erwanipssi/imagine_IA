import { Like } from '../models/Like.js';

export const likeRepository = {
  findByUserAndStories(userId: string, storyIds: string[]) {
    return Like.find({ userId, storyId: { $in: storyIds } }).lean();
  },

  findByUserAndStory(userId: string, storyId: string) {
    return Like.findOne({ userId, storyId });
  },

  countByStory(storyId: string) {
    return Like.countDocuments({ storyId });
  },

  countByStories(storyIds: string[]) {
    return Like.aggregate([
      { $match: { storyId: { $in: storyIds } } },
      { $group: { _id: '$storyId', count: { $sum: 1 } } },
    ]);
  },

  upsert(userId: string, storyId: string) {
    return Like.findOneAndUpdate(
      { userId, storyId },
      { userId, storyId },
      { upsert: true, new: true }
    );
  },

  delete(userId: string, storyId: string) {
    return Like.findOneAndDelete({ userId, storyId });
  },
};
