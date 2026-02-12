import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import profilesRoutes from './routes/profiles.js';
import generateRoutes from './routes/generate.js';
import storiesRoutes from './routes/stories.js';
import feedRoutes from './routes/feed.js';
import adminRoutes from './routes/admin.js';

const app = express();
const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
  app.use(cors({ origin: true, credentials: true }));
} else {
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
      credentials: true,
    })
  );
}
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

if (!isDev) {
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Trop de tentatives, réessayez plus tard' },
  });
  app.use('/api/auth/login', loginLimiter);
  const generateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: 'Trop de générations, réessayez dans une minute' },
  });
  app.use('/api/generate', generateLimiter);
}

app.use('/api/auth', authRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/stories', storiesRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

export default app;
