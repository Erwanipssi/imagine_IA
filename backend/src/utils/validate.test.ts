import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { validate } from './validate.js';

describe('validate', () => {
  const schema = z.object({
    email: z.string().email(),
    name: z.string().min(1),
  });

  it('retourne ok et les données quand la validation réussit', () => {
    const result = validate(schema, { email: 'test@example.com', name: 'Alice' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.email).toBe('test@example.com');
      expect(result.data.name).toBe('Alice');
    }
  });
});
