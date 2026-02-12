import { Router } from 'express';
import { z } from 'zod';
import { createUser, findUserByEmail, verifyPassword, findUserById } from '../services/authService.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { env } from '../config/env.js';
import { validate } from '../utils/validate.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Minimum 8 caractères'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function setAuthCookie(res: import('express').Response, userId: string) {
  res.cookie('userId', userId, {
    httpOnly: true,
    maxAge: env.COOKIE_MAX_AGE_MS,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
  });
}

router.post('/register', async (req, res) => {
  const v = validate(registerSchema, req.body);
  if (!v.ok) return res.status(400).json({ error: v.error, details: v.details });
  const { email, password } = v.data;
  const existing = await findUserByEmail(email);
  if (existing) return res.status(409).json({ error: 'Un compte existe déjà avec cet email' });
  const user = await createUser(email, password);
  setAuthCookie(res, user._id.toString());
  res.status(201).json({ user: { id: user._id, email: user.email, role: user.role } });
});

router.post('/login', async (req, res) => {
  const v = validate(loginSchema, req.body);
  if (!v.ok) return res.status(400).json({ error: 'Email ou mot de passe invalide' });
  const { email, password } = v.data;
  const user = await findUserByEmail(email);
  if (!user || user.status === 'blocked') return res.status(401).json({ error: 'Identifiants incorrects' });
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Identifiants incorrects' });
  setAuthCookie(res, user._id.toString());
  res.json({ user: { id: user._id, email: user.email, role: user.role } });
});

router.post('/logout', (_req, res) => {
  res.clearCookie('userId');
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const user = await findUserById(req.userId!);
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
  res.json({ user: { id: user._id, email: user.email, role: user.role } });
});

export default router;
