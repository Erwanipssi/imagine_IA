import { profileRepository } from '../repositories/profileRepository.js';

export const profileService = {
  async list(userId: string) {
    return profileRepository.findByUserId(userId);
  },

  async createChild(userId: string, data: { name: string; ageBand: string }) {
    return profileRepository.create({
      userId,
      type: 'child',
      name: data.name,
      ageBand: data.ageBand,
    });
  },

  async updateChild(id: string, userId: string, data: { name?: string; ageBand?: string }) {
    return profileRepository.update(id, userId, data);
  },

  async deleteChild(id: string, userId: string) {
    return profileRepository.delete(id, userId);
  },
};
