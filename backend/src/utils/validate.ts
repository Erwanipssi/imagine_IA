import { z } from 'zod';

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { ok: true; data: T } | { ok: false; error: string; details?: unknown } {
  const result = schema.safeParse(data);
  if (result.success) return { ok: true, data: result.data };
  return {
    ok: false,
    error: 'Données invalides',
    details: result.error.flatten(),
  };
}
