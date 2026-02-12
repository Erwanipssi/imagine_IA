import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/userRepository.js';
import { profileRepository } from '../repositories/profileRepository.js';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createUser(email: string, password: string) {
  const passwordHash = await hashPassword(password);
  const user = await userRepository.create({ email: email.toLowerCase(), passwordHash });
  await profileRepository.create({ userId: user._id.toString(), type: 'parent', name: 'Mon profil' });
  return user;
}

export async function findUserByEmail(email: string) {
  return userRepository.findByEmail(email);
}

export async function findUserById(id: string) {
  return userRepository.findById(id).select('email role').lean();
}
