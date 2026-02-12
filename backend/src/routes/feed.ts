import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { feedService } from '../services/feedService.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthRequest, res) => {
  const ageBand = req.query.ageBand as string | undefined;
  const theme = req.query.theme as string | undefined;
  const stories = await feedService.get(req.userId!, { ageBand, theme });
  res.json({ stories });
});

export default router;
