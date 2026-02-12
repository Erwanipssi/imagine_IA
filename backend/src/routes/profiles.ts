import { Router } from 'express';
import { z } from 'zod';
import { ageBands } from '../models/Profile.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { profileService } from '../services/profileService.js';
import { validate } from '../utils/validate.js';

const router = Router();
router.use(requireAuth);

const createChildSchema = z.object({
  name: z.string().min(1).max(50),
  ageBand: z.enum(ageBands),
});

router.get('/', async (req: AuthRequest, res) => {
  const profiles = await profileService.list(req.userId!);
  res.json({ profiles });
});

router.post('/', async (req: AuthRequest, res) => {
  const v = validate(createChildSchema, req.body);
  if (!v.ok) return res.status(400).json({ error: v.error, details: v.details });
  const profile = await profileService.createChild(req.userId!, v.data);
  res.status(201).json({ profile });
});

router.patch('/:id', async (req: AuthRequest, res) => {
  const v = validate(createChildSchema.partial(), req.body);
  if (!v.ok) return res.status(400).json({ error: v.error });
  const profile = await profileService.updateChild(req.params.id, req.userId!, v.data);
  if (!profile) return res.status(404).json({ error: 'Profil non trouvé' });
  res.json({ profile });
});

router.delete('/:id', async (req: AuthRequest, res) => {
  const deleted = await profileService.deleteChild(req.params.id, req.userId!);
  if (!deleted) return res.status(404).json({ error: 'Profil non trouvé' });
  res.json({ ok: true });
});

export default router;
