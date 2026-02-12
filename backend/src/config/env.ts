export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 3000),
  MONGODB_URI: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/imagine-ai',
  OLLAMA_URL: process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434',
  OLLAMA_MODEL: process.env.OLLAMA_MODEL ?? 'llama3.2:1b',
  SESSION_SECRET: process.env.SESSION_SECRET ?? 'change-me-in-production',
  COOKIE_MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000, // 7 jours
} as const;
