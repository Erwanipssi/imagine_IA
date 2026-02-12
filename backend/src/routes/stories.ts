import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { storyService } from '../services/storyService.js';
import { validate } from '../utils/validate.js';

const router = Router();

const optionalObjectId = z.preprocess(
  (v) => (v === '' || v === undefined ? undefined : v),
  z.string().regex(/^[a-f0-9]{24}$/).optional()
);

const createStorySchema = z.object({
  childProfileId: optionalObjectId,
  type: z.enum(['story', 'rhyme']),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  inputs: z
    .object({
      theme: z.string().optional(),
      characters: z.string().optional(),
      emotion: z.string().optional(),
      moral: z.string().optional(),
      situation: z.string().optional(),
      tone: z.string().optional(),
    })
    .optional(),
  ageBand: z.enum(['3-5', '6-8', '9-12']),
});

const reportSchema = z.object({ reason: z.string().min(1).max(500) });

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const stories = await storyService.list(req.userId!);
  res.json({ stories });
});

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const v = validate(createStorySchema, req.body);
  if (!v.ok) return res.status(400).json({ error: v.error, details: v.details });
  try {
    const story = await storyService.create(req.userId!, {
      ...v.data,
      childProfileId: v.data.childProfileId as string | undefined,
    });
    res.status(201).json({ story });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur';
    return res.status(404).json({ error: msg });
  }
});

router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  const result = await storyService.get(req.params.id, req.userId!);
  if (!result) return res.status(404).json({ error: 'Histoire non trouvée' });
  res.json(result);
});

router.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  const v = validate(createStorySchema.partial(), req.body);
  if (!v.ok) return res.status(400).json({ error: v.error });
  try {
    const story = await storyService.update(req.params.id, req.userId!, v.data);
    res.json({ story });
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : 'Erreur' });
  }
});

router.post('/:id/publish', requireAuth, async (req: AuthRequest, res) => {
  try {
    const story = await storyService.publish(req.params.id, req.userId!);
    res.json({ story });
  } catch (e) {
    return res.status(404).json({ error: e instanceof Error ? e.message : 'Erreur' });
  }
});

router.post('/:id/like', requireAuth, async (req: AuthRequest, res) => {
  try {
    const count = await storyService.like(req.params.id, req.userId!);
    res.json({ liked: true, count });
  } catch (e) {
    return res.status(404).json({ error: e instanceof Error ? e.message : 'Erreur' });
  }
});

router.delete('/:id/like', requireAuth, async (req: AuthRequest, res) => {
  const count = await storyService.unlike(req.params.id, req.userId!);
  res.json({ liked: false, count });
});

router.post('/:id/report', requireAuth, async (req: AuthRequest, res) => {
  const v = validate(reportSchema, req.body);
  if (!v.ok) return res.status(400).json({ error: 'Raison requise' });
  try {
    await storyService.report(req.params.id, req.userId!, v.data.reason);
    res.status(201).json({ ok: true });
  } catch (e) {
    return res.status(404).json({ error: e instanceof Error ? e.message : 'Erreur' });
  }
});

router.get('/:id/pdf', requireAuth, async (req: AuthRequest, res) => {
  const result = await storyService.getPdf(req.params.id, req.userId!);
  if (!result) return res.status(404).json({ error: 'Histoire non trouvée' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(result.title)}.pdf"`);
  res.send(result.pdf);
});

export default router;
