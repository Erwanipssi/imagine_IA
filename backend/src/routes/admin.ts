import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { adminService } from '../services/adminService.js';

const router = Router();
router.use(requireAuth);
router.use(requireAdmin);

router.get('/reports', async (_req, res) => {
  const reports = await adminService.getReports();
  res.json({ reports });
});

router.post('/stories/:id/remove', async (req, res) => {
  try {
    const story = await adminService.removeStory(req.params.id);
    res.json({ story });
  } catch (e) {
    res.status(404).json({ error: e instanceof Error ? e.message : 'Erreur' });
  }
});

router.post('/users/:id/block', async (req, res) => {
  try {
    const user = await adminService.blockUser(req.params.id);
    res.json({ user });
  } catch (e) {
    res.status(404).json({ error: e instanceof Error ? e.message : 'Erreur' });
  }
});

router.patch('/reports/:id/dismiss', async (req, res) => {
  try {
    const report = await adminService.dismissReport(req.params.id);
    res.json({ report });
  } catch (e) {
    res.status(404).json({ error: e instanceof Error ? e.message : 'Erreur' });
  }
});

export default router;
