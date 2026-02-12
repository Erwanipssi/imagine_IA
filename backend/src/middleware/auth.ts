import type { Request, Response, NextFunction } from 'express';
import { userRepository } from '../repositories/userRepository.js';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const userId = req.cookies?.userId;
  if (!userId) {
    res.status(401).json({ error: 'Non authentifié' });
    return;
  }
  const user = await userRepository.findById(userId).select('_id role status').lean();
  if (!user) {
    res.clearCookie('userId');
    res.status(401).json({ error: 'Session invalide' });
    return;
  }
  if (user.status === 'blocked') {
    res.clearCookie('userId');
    res.status(403).json({ error: 'Compte bloqué' });
    return;
  }
  req.userId = user._id.toString();
  req.userRole = user.role;
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.userRole !== 'admin') {
    res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    return;
  }
  next();
}
