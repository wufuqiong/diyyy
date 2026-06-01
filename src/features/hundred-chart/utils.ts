import { BlankMode } from './types';

/** LCG pseudo-random number generator. Returns a function that produces values in [0, 1). */
/* eslint-disable no-bitwise */
export function lcg(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state * 1664525 + 1013904223) | 0;
    return (state >>> 0) / 0xFFFFFFFF;
  };
}
/* eslint-enable no-bitwise */

/** Fisher-Yates shuffle using LCG for reproducibility. */
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rng = lcg(seed);
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Generate a random 32-bit seed from crypto.getRandomValues (non-deterministic). */
export function generateSeed(): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0];
}

/** Compute which indices (0–99) should be blank based on the blank mode. */
export function computeBlanks(
  mode: BlankMode,
  blankCount: number,
  seed: number,
  step: number,
  offset: number,
  manualBlanks: number[],
): number[] {
  switch (mode) {
    case BlankMode.RANDOM: {
      const indices = Array.from({ length: 100 }, (_, i) => i);
      const shuffled = seededShuffle(indices, seed);
      return shuffled.slice(0, Math.min(blankCount, 99)).sort((a, b) => a - b);
    }
    case BlankMode.PATTERN: {
      const blanks: number[] = [];
      // Starting from offset, every step-th cell is blank
      const start = Math.max(0, offset) % step;
      for (let i = start; i < 100; i += step) {
        blanks.push(i);
      }
      return blanks;
    }
    case BlankMode.MANUAL:
      return [...manualBlanks].sort((a, b) => a - b);
    case BlankMode.ANSWER_KEY:
      return [];
    default:
      return [];
  }
}
