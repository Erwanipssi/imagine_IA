import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { buildStoryPrompt, generateText } from '../services/ollamaService.js';
import { validate } from '../utils/validate.js';

const router = Router();
router.use(requireAuth);

const generateSchema = z.object({
  childProfileId: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : v),
    z.string().regex(/^[a-f0-9]{24}$/).optional()
  ),
  ageBand: z.enum(['3-5', '6-8', '9-12']),
  type: z.enum(['story', 'rhyme']),
  theme: z.string().min(1).max(200),
  characters: z.string().min(1).max(300),
  emotion: z.string().min(1).max(100),
  moral: z.string().max(200).optional(),
  situation: z.string().max(300).optional(),
  tone: z.enum(['joyeux', 'rassurant', 'drôle', 'éducatif']).optional(),
});

router.post('/', async (req: AuthRequest, res) => {
  const v = validate(generateSchema, req.body);
  if (!v.ok) return res.status(400).json({ error: v.error, details: v.details });
  const data = v.data;
  try {
    const prompt = buildStoryPrompt({
      type: data.type,
      theme: data.theme,
      characters: data.characters,
      emotion: data.emotion,
      moral: data.moral,
      situation: data.situation,
      tone: data.tone,
      ageBand: data.ageBand,
    });
    const userInputs = [data.theme, data.characters, data.emotion, data.moral ?? '', data.situation ?? ''];
    const content = await generateText(prompt, userInputs);
    const title = data.type === 'story' ? `Histoire : ${data.theme}` : `Comptine : ${data.theme}`;
    res.json({
      title,
      content,
      inputs: {
        theme: data.theme,
        characters: data.characters,
        emotion: data.emotion,
        moral: data.moral,
        situation: data.situation,
        tone: data.tone,
      },
      childProfileId: data.childProfileId,
      type: data.type,
      ageBand: data.ageBand,
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Erreur de génération' });
  }
});

export default router;
