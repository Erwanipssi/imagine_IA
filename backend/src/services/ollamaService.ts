import { env } from '../config/env.js';

const OLLAMA_API = `${env.OLLAMA_URL}/api/generate`;
const MAX_TOKENS = 1500;

/** Neutralise les contenus dangereux (filtrage basique). */
const FORBIDDEN_PATTERNS = [
  /\b(violent|tuer|meurtre|mort\b|sang)\b/i,
  /\b(sexe|sexuel|nudité)\b/i,
  /\b(drogue|alcool)\b/i,
  /\b(arme|fusil|pistolet)\b/i,
  /ignore\s+(les\s+)?instructions/i,
  /system\s*:\s*/i,
];

/** Vérifie que le texte saisi par l'utilisateur est autorisé. */
export function isUserInputSafe(text: string): boolean {
  return !FORBIDDEN_PATTERNS.some((re) => re.test(text));
}

/** Vérifie le prompt complet (legacy). */
export function isPromptSafe(prompt: string): boolean {
  return isUserInputSafe(prompt);
}

export async function generateText(prompt: string, userInputsForSafety: string[]): Promise<string> {
  for (const input of userInputsForSafety) {
    if (!isUserInputSafe(input)) {
      throw new Error('Contenu non autorisé détecté');
    }
  }

  try {
    const res = await fetch(OLLAMA_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: env.OLLAMA_MODEL,
        prompt,
        stream: false,
        options: { num_predict: MAX_TOKENS, temperature: 0.8 },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Ollama: ${res.status} - ${err}`);
    }

    const data = (await res.json()) as { response?: string };
    const text = data.response?.trim() ?? '';
    if (!isPromptSafe(text)) {
      throw new Error('Contenu généré non conforme');
    }
    return text;
  } catch (err) {
    if (err instanceof Error) {
      const msg = err.message;
      const cause = err.cause instanceof Error ? err.cause.message : String(err.cause ?? '');
      console.error('[Ollama] Erreur:', msg, cause ? `(cause: ${cause})` : '');
      if (/fetch|ECONNREFUSED|ENOTFOUND|ECONNRESET|network|aborted|socket hang up/i.test(msg + cause)) {
        throw new Error(
          `Ollama injoignable ou modèle manquant. Démarrez Ollama puis : ollama pull ${env.OLLAMA_MODEL}`
        );
      }
    }
    throw err;
  }
}

/** Construit le prompt pour une histoire ou comptine selon l'âge. */
export function buildStoryPrompt(params: {
  type: 'story' | 'rhyme';
  theme: string;
  characters: string;
  emotion: string;
  moral?: string;
  situation?: string;
  tone?: string;
  ageBand: string;
}): string {
  const { type, theme, characters, emotion, moral, situation, tone, ageBand } = params;
  const ageInstruction =
    ageBand === '3-5'
      ? 'Phrases très courtes, vocabulaire simple, répétitions possibles.'
      : ageBand === '6-8'
        ? 'Phrases courtes à moyennes, vocabulaire accessible, peu de métaphores.'
        : 'Tu peux utiliser des phrases plus longues et un vocabulaire plus riche, tout en restant adapté aux enfants.';

  const typeInstruction =
    type === 'story'
      ? `Écris une histoire pour enfant en français. ${ageInstruction} L'histoire doit être bienveillante, sans violence ni contenu inapproprié.`
      : `Écris une comptine pour enfant en français, avec des rimes et un rythme régulier. ${ageInstruction} La comptine doit être joyeuse et adaptée aux enfants.`;

  const parts = [
    typeInstruction,
    `Thème : ${theme}.`,
    `Personnages : ${characters}.`,
    `Émotion à transmettre : ${emotion}.`,
  ];
  if (tone) parts.push(`Ton : ${tone}.`);
  if (moral) parts.push(`Morale ou message : ${moral}.`);
  if (situation) parts.push(`Situation de départ : ${situation}.`);
  parts.push('Réponds uniquement avec le texte de l\'histoire ou de la comptine, sans titre ni préambule.');

  return parts.join('\n');
}
