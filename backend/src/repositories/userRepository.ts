import { User } from '../models/User.js';

export const userRepository = {
  findByEmail(email: string) {
    return User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  },

  findById(id: string, selectPassword = false) {
    const q = User.findById(id);
    return selectPassword ? q.select('+passwordHash') : q;
  },

  create(data: { email: string; passwordHash: string }) {
    return User.create(data);
  },

  updateStatus(id: string, status: 'active' | 'blocked') {
    return User.findByIdAndUpdate(id, { status }, { new: true });
  },
};
