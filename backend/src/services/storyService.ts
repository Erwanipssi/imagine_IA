import { storyRepository } from '../repositories/storyRepository.js';
import { likeRepository } from '../repositories/likeRepository.js';
import { reportRepository } from '../repositories/reportRepository.js';
import { profileRepository } from '../repositories/profileRepository.js';
import { contentToHtml, generatePdfFromHtml } from './pdfService.js';

export const storyService = {
  async list(userId: string) {
    return storyRepository.findByUserId(userId);
  },

  async get(id: string, userId: string) {
    const story = await storyRepository.findById(id);
    if (!story || story.status === 'removed') return null;
    const isOwner = story.userId?.toString() === userId;
    if (story.status === 'draft' && !isOwner) return null;
    const like = await likeRepository.findByUserAndStory(userId, id);
    return { story, liked: isOwner ? undefined : !!like };
  },

  async create(userId: string, data: {
    childProfileId?: string;
    type: 'story' | 'rhyme';
    title: string;
    content: string;
    inputs?: Record<string, string>;
    ageBand: string;
  }) {
    if (data.childProfileId) {
      const child = await profileRepository.findChildByIdAndUser(data.childProfileId, userId);
      if (!child) throw new Error('Profil enfant non trouvé');
    }
    return storyRepository.create({ userId, ...data });
  },

  async update(id: string, userId: string, data: Partial<{ title: string; content: string; inputs: Record<string, string> }>) {
    const story = await storyRepository.update(id, userId, data);
    if (!story) throw new Error('Histoire non trouvée');
    return story;
  },

  async publish(id: string, userId: string) {
    const story = await storyRepository.publish(id, userId);
    if (!story) throw new Error('Histoire non trouvée ou déjà publiée');
    return story;
  },

  async like(id: string, userId: string) {
    const story = await storyRepository.findById(id);
    if (!story || story.status !== 'published') throw new Error('Histoire non trouvée');
    await likeRepository.upsert(userId, id);
    return likeRepository.countByStory(id);
  },

  async unlike(id: string, userId: string) {
    await likeRepository.delete(userId, id);
    return likeRepository.countByStory(id);
  },

  async report(id: string, userId: string, reason: string) {
    const story = await storyRepository.findById(id);
    if (!story || story.status !== 'published') throw new Error('Histoire non trouvée');
    await reportRepository.create({ reporterUserId: userId, storyId: id, reason });
  },

  async getPdf(id: string, userId: string): Promise<{ pdf: Buffer; title: string } | null> {
    const story = await storyRepository.findById(id);
    if (!story || story.status === 'removed') return null;
    const isOwner = story.userId?.toString() === userId;
    const isPublished = story.status === 'published';
    if (!isOwner && !isPublished) return null;
    const html = contentToHtml(story.content);
    const pdf = await generatePdfFromHtml(html, story.title);
    return { pdf, title: story.title };
  },
};
