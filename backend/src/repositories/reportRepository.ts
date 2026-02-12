import { Report } from '../models/Report.js';

export const reportRepository = {
  findPending() {
    return Report.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .populate('reporterUserId', 'email')
      .populate('storyId', '_id title userId')
      .lean();
  },

  create(data: { reporterUserId: string; storyId: string; reason: string }) {
    return Report.create(data);
  },

  setProcessed(storyId: string) {
    return Report.updateMany({ storyId }, { status: 'processed' });
  },

  setDismissed(id: string) {
    return Report.findByIdAndUpdate(id, { status: 'dismissed' }, { new: true });
  },
};
