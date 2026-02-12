import { Story } from '../models/Story.js';

export const storyRepository = {
  findByUserId(userId: string) {
    return Story.find({ userId })
      .sort({ updatedAt: -1 })
      .populate('childProfileId', 'name ageBand')
      .lean();
  },

  findById(id: string) {
    return Story.findById(id)
      .populate('childProfileId', 'name ageBand')
      .lean();
  },

  findPublished(filters: { ageBand?: string; theme?: string }, limit = 50) {
    const q: Record<string, unknown> = { status: 'published' };
    if (filters.ageBand) q.ageBand = filters.ageBand;
    if (filters.theme) q['inputs.theme'] = new RegExp(filters.theme, 'i');
    return Story.find(q)
      .sort({ publishedAt: -1, updatedAt: -1 })
      .limit(limit)
      .populate('userId', 'email')
      .populate('childProfileId', 'name ageBand')
      .select('_id title content type ageBand inputs publishedAt userId childProfileId')
      .lean();
  },

  create(data: {
    userId: string;
    childProfileId?: string;
    type: 'story' | 'rhyme';
    title: string;
    content: string;
    inputs?: Record<string, string>;
    ageBand: string;
  }) {
    return Story.create({
      ...data,
      status: 'draft',
    });
  },

  update(id: string, userId: string, data: Partial<{ title: string; content: string; inputs: Record<string, string> }>) {
    return Story.findOneAndUpdate({ _id: id, userId, status: 'draft' }, { $set: data }, { new: true });
  },

  publish(id: string, userId: string) {
    return Story.findOneAndUpdate(
      { _id: id, userId, status: 'draft' },
      { $set: { status: 'published', publishedAt: new Date() } },
      { new: true }
    );
  },

  setRemoved(id: string) {
    return Story.findByIdAndUpdate(id, { status: 'removed' }, { new: true });
  },
};
