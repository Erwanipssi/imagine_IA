import { reportRepository } from '../repositories/reportRepository.js';
import { storyRepository } from '../repositories/storyRepository.js';
import { userRepository } from '../repositories/userRepository.js';

export const adminService = {
  async getReports() {
    return reportRepository.findPending();
  },

  async removeStory(id: string) {
    const story = await storyRepository.setRemoved(id);
    if (!story) throw new Error('Histoire non trouvée');
    await reportRepository.setProcessed(id);
    return story;
  },

  async blockUser(id: string) {
    const user = await userRepository.updateStatus(id, 'blocked');
    if (!user) throw new Error('Utilisateur non trouvé');
    return user;
  },

  async dismissReport(id: string) {
    const report = await reportRepository.setDismissed(id);
    if (!report) throw new Error('Signalement non trouvé');
    return report;
  },
};
