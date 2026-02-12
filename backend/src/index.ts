import { config } from 'dotenv';
import { join } from 'path';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import app from './app.js';

// Charger .env à la racine du projet (parent de backend/)
config({ path: join(process.cwd(), '..', '.env') });

async function main() {
  const isLocalDev = env.MONGODB_URI.includes('localhost') || env.MONGODB_URI.includes('127.0.0.1');
  await mongoose.connect(env.MONGODB_URI, {
    directConnection: isLocalDev, // Dev local : connexion directe. Docker : replica set
  });
  console.log('MongoDB connecté');

  // Vérification Ollama au démarrage
  try {
    const r = await fetch(`${env.OLLAMA_URL}/api/tags`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = (await r.json()) as { models?: { name: string }[] };
    const hasModel = data.models?.some((m) => m.name === env.OLLAMA_MODEL || m.name.startsWith(env.OLLAMA_MODEL + ':'));
    if (!hasModel) {
      console.warn(`[Ollama] Modèle ${env.OLLAMA_MODEL} non trouvé. Exécutez: ollama pull ${env.OLLAMA_MODEL}`);
    } else {
      console.log('Ollama OK');
    }
  } catch (e) {
    console.warn('[Ollama] Non disponible au démarrage:', e instanceof Error ? e.message : e);
  }

  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`API Imagine AI sur http://127.0.0.1:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
