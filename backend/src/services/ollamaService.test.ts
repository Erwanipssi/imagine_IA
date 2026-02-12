import { describe, it, expect } from 'vitest';
import { isUserInputSafe, buildStoryPrompt } from './ollamaService.js';

describe('ollamaService', () => {
  describe('isUserInputSafe', () => {
    it('accepte les textes sûrs et rejette le contenu violent ou interdit', () => {
      expect(isUserInputSafe('Le petit lapin joue dans le jardin')).toBe(true);
      expect(isUserInputSafe('une scène très violent')).toBe(false);
      expect(isUserInputSafe('il veut le tuer')).toBe(false);
    });
  });

  describe('buildStoryPrompt', () => {
    it('construit un prompt correct pour une histoire 3-5 ans', () => {
      const prompt = buildStoryPrompt({
        type: 'story',
        theme: 'foret',
        characters: 'lapin, renard',
        emotion: 'joie',
        ageBand: '3-5',
      });
      expect(prompt).toContain('foret');
      expect(prompt).toContain('lapin, renard');
      expect(prompt).toContain('joie');
      expect(prompt).toContain('Phrases très courtes');
      expect(prompt).toContain('histoire');
    });
  });
});
