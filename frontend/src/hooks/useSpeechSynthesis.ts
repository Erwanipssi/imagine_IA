import { useState, useCallback, useEffect } from 'react';

function getFrenchVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.startsWith('fr')) ??
    voices.find((v) => v.lang.startsWith('fr-FR')) ??
    voices[0] ??
    null
  );
}

export function useSpeechSynthesis(options?: { rate?: number; pitch?: number }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voicesReady, setVoicesReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
      setVoicesReady(true);
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !window.speechSynthesis || !text.trim()) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.lang = 'fr-FR';
      utterance.rate = options?.rate ?? 0.95;
      utterance.pitch = options?.pitch ?? 1;
      const voice = getFrenchVoice();
      if (voice) utterance.voice = voice;
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
      window.speechSynthesis.speak(utterance);
    },
    [options?.rate, options?.pitch]
  );

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, []);

  const supported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window;

  return { speak, stop, pause, resume, isSpeaking, isPaused, supported };
}
