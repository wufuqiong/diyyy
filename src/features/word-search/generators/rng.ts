import type { Direction } from '../types';

/* eslint-disable no-bitwise */

/** LCG pseudo-random number generator. Returns a function that produces values in [0, 1). */
export function lcg(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state * 1664525 + 1013904223) | 0;
    return (state >>> 0) / 0xFFFFFFFF;
  };
}

/* eslint-enable no-bitwise */

/** Direction vectors: [dRow, dCol] */
export const DIRECTION_VECTORS: Record<Direction, [number, number]> = {
  'horizontal':              [0, 1],
  'horizontal-reverse':      [0, -1],
  'vertical':                [1, 0],
  'vertical-reverse':        [-1, 0],
  'diagonal-down':           [1, 1],
  'diagonal-down-reverse':   [-1, -1],
  'diagonal-up':             [-1, 1],
  'diagonal-up-reverse':     [1, -1],
};

/** Pick a random element from an array using the provided rng. */
export function randomPick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** Generate a random integer in [0, max). */
export function randomInt(max: number, rng: () => number): number {
  return Math.floor(rng() * max);
}
