import { storyRepository } from '../repositories/storyRepository.js';
import { likeRepository } from '../repositories/likeRepository.js';

export const feedService = {
  async get(userId: string, filters: { ageBand?: string; theme?: string }) {
    const stories = await storyRepository.findPublished(
      {
        ageBand: filters.ageBand && ['3-5', '6-8', '9-12'].includes(filters.ageBand) ? filters.ageBand : undefined,
        theme: filters.theme?.trim(),
      },
      50
    );
    const storyIds = stories.map((s) => s._id.toString());
    let likeSet = new Set<string>();
    let countMap: Record<string, number> = {};
    if (storyIds.length > 0) {
      const likes = await likeRepository.findByUserAndStories(userId, storyIds);
      likeSet = new Set(likes.map((l) => l.storyId.toString()));
      const counts = await likeRepository.countByStories(storyIds);
      countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));
    }
    return stories.map((s) => ({
      ...s,
      liked: likeSet.has(s._id.toString()),
      likeCount: countMap[s._id.toString()] ?? 0,
    }));
  },
};
