import { it, expect, describe } from 'vitest';

import { BlankMode } from 'src/features/hundred-chart/types';

describe('Hundred Chart Utils', () => {
  // ---------- lcg ----------
  describe('lcg', () => {
    it('same seed produces identical sequence', async () => {
      const { lcg } = await import('src/features/hundred-chart/utils');
      const rng1 = lcg(42);
      const rng2 = lcg(42);
      for (let i = 0; i < 20; i++) {
        expect(rng1()).toBe(rng2());
      }
    });

    it('different seeds produce different sequences', async () => {
      const { lcg } = await import('src/features/hundred-chart/utils');
      const rng1 = lcg(1);
      const rng2 = lcg(2);
      const values1 = Array.from({ length: 10 }, () => rng1());
      const values2 = Array.from({ length: 10 }, () => rng2());
      expect(values1).not.toEqual(values2);
    });

    it('returns values in [0, 1)', async () => {
      const { lcg } = await import('src/features/hundred-chart/utils');
      const rng = lcg(12345);
      for (let i = 0; i < 100; i++) {
        const val = rng();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });

    it('produces deterministic sequence matching expected output', async () => {
      const { lcg } = await import('src/features/hundred-chart/utils');
      const rng = lcg(0);
      const first10 = Array.from({ length: 10 }, () => rng());
      // Re-seed with same value and verify
      const rng2 = lcg(0);
      const second10 = Array.from({ length: 10 }, () => rng2());
      expect(first10).toEqual(second10);
    });
  });

  // ---------- seededShuffle ----------
  describe('seededShuffle', () => {
    it('same seed produces same shuffle', async () => {
      const { seededShuffle } = await import('src/features/hundred-chart/utils');
      const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      const result1 = seededShuffle(arr, 100);
      const result2 = seededShuffle(arr, 100);
      expect(result1).toEqual(result2);
    });

    it('different seeds produce different shuffles (likely)', async () => {
      const { seededShuffle } = await import('src/features/hundred-chart/utils');
      const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      const result1 = seededShuffle(arr, 1);
      const result2 = seededShuffle(arr, 2);
      expect(result1).not.toEqual(result2);
    });

    it('does not mutate the input array', async () => {
      const { seededShuffle } = await import('src/features/hundred-chart/utils');
      const arr = [0, 1, 2, 3, 4];
      const copy = [...arr];
      seededShuffle(arr, 42);
      expect(arr).toEqual(copy);
    });

    it('returns all original elements (no loss, no duplicates)', async () => {
      const { seededShuffle } = await import('src/features/hundred-chart/utils');
      const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      const result = seededShuffle(arr, 77);
      expect(result.sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      expect(result.length).toBe(arr.length);
    });
  });

  // ---------- generateSeed ----------
  describe('generateSeed', () => {
    it('returns a number', async () => {
      const { generateSeed } = await import('src/features/hundred-chart/utils');
      const seed = generateSeed();
      expect(typeof seed).toBe('number');
    });

    it('returns a 32-bit unsigned integer', async () => {
      const { generateSeed } = await import('src/features/hundred-chart/utils');
      const seed = generateSeed();
      expect(seed).toBeGreaterThanOrEqual(0);
      expect(seed).toBeLessThanOrEqual(0xFFFFFFFF);
    });

    it('returns integer values (no fractional part)', async () => {
      const { generateSeed } = await import('src/features/hundred-chart/utils');
      for (let i = 0; i < 10; i++) {
        const seed = generateSeed();
        expect(Number.isInteger(seed)).toBe(true);
      }
    });
  });

  // ---------- computeBlanks ----------
  describe('computeBlanks', () => {
    // --- RANDOM mode ---
    describe('RANDOM mode', () => {
      it('returns exactly blankCount blanks', async () => {
        const { computeBlanks } = await import('src/features/hundred-chart/utils');
        for (const count of [0, 1, 5, 10, 20, 50, 99]) {
          const blanks = computeBlanks(BlankMode.RANDOM, count, 42, 2, 0, []);
          expect(blanks.length).toBe(count);
        }
      });

      it('all blanks are within 0-99', async () => {
        const { computeBlanks } = await import('src/features/hundred-chart/utils');
        const blanks = computeBlanks(BlankMode.RANDOM, 30, 12345, 2, 0, []);
        blanks.forEach((i) => {
          expect(i).toBeGreaterThanOrEqual(0);
          expect(i).toBeLessThanOrEqual(99);
        });
      });

      it('same seed and count produce identical blanks', async () => {
        const { computeBlanks } = await import('src/features/hundred-chart/utils');
        const blanks1 = computeBlanks(BlankMode.RANDOM, 20, 777, 2, 0, []);
        const blanks2 = computeBlanks(BlankMode.RANDOM, 20, 777, 2, 0, []);
        expect(blanks1).toEqual(blanks2);
      });

      it('different seeds produce different blanks (likely)', async () => {
        const { computeBlanks } = await import('src/features/hundred-chart/utils');
        const blanks1 = computeBlanks(BlankMode.RANDOM, 10, 1, 2, 0, []);
        const blanks2 = computeBlanks(BlankMode.RANDOM, 10, 2, 2, 0, []);
        expect(blanks1).not.toEqual(blanks2);
      });

      it('returns sorted blanks', async () => {
        const { computeBlanks } = await import('src/features/hundred-chart/utils');
        const blanks = computeBlanks(BlankMode.RANDOM, 50, 99, 2, 0, []);
        for (let i = 1; i < blanks.length; i++) {
          expect(blanks[i]).toBeGreaterThan(blanks[i - 1]);
        }
      });

      it('no duplicate blanks', async () => {
        const { computeBlanks } = await import('src/features/hundred-chart/utils');
        const blanks = computeBlanks(BlankMode.RANDOM, 50, 42, 2, 0, []);
        const unique = new Set(blanks);
        expect(unique.size).toBe(blanks.length);
      });

      it('blankCount=0 returns empty array', async () => {
        const { computeBlanks } = await import('src/features/hundred-chart/utils');
        const blanks = computeBlanks(BlankMode.RANDOM, 0, 42, 2, 0, []);
        expect(blanks).toEqual([]);
      });

      it('blankCount > 99 returns at most 99 blanks', async () => {
        const { computeBlanks } = await import('src/features/hundred-chart/utils');
        const blanks = computeBlanks(BlankMode.RANDOM, 150, 42, 2, 0, []);
        expect(blanks.length).toBe(99);
      });
    });

    // --- PATTERN mode ---
    describe('PATTERN mode', () => {
      it('blanks follow step starting from offset (mod step)', async () => {
        const { computeBlanks } = await import('src/features/hundred-chart/utils');
        const blanks = computeBlanks(BlankMode.PATTERN, 0, 42, 3, 0, []);
        expect(blanks).toEqual([0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78, 81, 84, 87, 90, 93, 96, 99]);
      });

      it('step=2 offset=1 blanks every odd index', async () => {
        const { computeBlanks } = await import('src/features/hundred-chart/utils');
        const blanks = computeBlanks(BlankMode.PATTERN, 0, 42, 2, 1, []);
        expect(blanks.length).toBe(50);
        blanks.forEach((i) => {
          expect(i % 2).toBe(1);
        });
      });

      it('step=5 offset=0 blanks multiples of 5', async () => {
        const { computeBlanks } = await import('src/features/hundred-chart/utils');
        const blanks = computeBlanks(BlankMode.PATTERN, 0, 42, 5, 0, []);
        expect(blanks.length).toBe(20);
        blanks.forEach((i) => {
          expect(i % 5).toBe(0);
        });
      });

      it('offset larger than step wraps correctly via modulo', async () => {
        const { computeBlanks } = await import('src/features/hundred-chart/utils');
        // offset=5, step=3 => start = 5 % 3 = 2
        const blanks = computeBlanks(BlankMode.PATTERN, 0, 42, 3, 5, []);
        expect(blanks[0]).toBe(2);
        blanks.forEach((i) => {
          expect(i % 3).toBe(2);
        });
      });

      it('step=1 blanks every cell 0-99', async () => {
        const { computeBlanks } = await import('src/features/hundred-chart/utils');
        const blanks = computeBlanks(BlankMode.PATTERN, 0, 42, 1, 0, []);
        expect(blanks.length).toBe(100);
        expect(blanks).toEqual(Array.from({ length: 100 }, (_, i) => i));
      });

      it('blankCount is ignored in PATTERN mode', async () => {
        const { computeBlanks } = await import('src/features/hundred-chart/utils');
        const blanks1 = computeBlanks(BlankMode.PATTERN, 5, 42, 4, 0, []);
        const blanks2 = computeBlanks(BlankMode.PATTERN, 99, 42, 4, 0, []);
        expect(blanks1).toEqual(blanks2);
      });
    });

    // --- MANUAL mode ---
    describe('MANUAL mode', () => {
      it('returns manualBlanks sorted', async () => {
        const { computeBlanks } = await import('src/features/hundred-chart/utils');
        const manualBlanks = [42, 7, 99, 0, 55];
        const blanks = computeBlanks(BlankMode.MANUAL, 0, 0, 0, 0, manualBlanks);
        expect(blanks).toEqual([0, 7, 42, 55, 99]);
      });

      it('empty manualBlanks returns empty array', async () => {
        const { computeBlanks } = await import('src/features/hundred-chart/utils');
        const blanks = computeBlanks(BlankMode.MANUAL, 0, 0, 0, 0, []);
        expect(blanks).toEqual([]);
      });

      it('does not mutate the input manualBlanks array', async () => {
        const { computeBlanks } = await import('src/features/hundred-chart/utils');
        const manualBlanks = [50, 10, 80];
        const copy = [...manualBlanks];
        computeBlanks(BlankMode.MANUAL, 0, 0, 0, 0, manualBlanks);
        expect(manualBlanks).toEqual(copy);
      });

      it('single-element manualBlanks returns that element in an array', async () => {
        const { computeBlanks } = await import('src/features/hundred-chart/utils');
        const blanks = computeBlanks(BlankMode.MANUAL, 0, 0, 0, 0, [37]);
        expect(blanks).toEqual([37]);
      });
    });

    // --- ANSWER_KEY mode ---
    describe('ANSWER_KEY mode', () => {
      it('returns empty array', async () => {
        const { computeBlanks } = await import('src/features/hundred-chart/utils');
        const blanks = computeBlanks(BlankMode.ANSWER_KEY, 10, 42, 2, 0, []);
        expect(blanks).toEqual([]);
      });

      it('returns empty array regardless of blankCount', async () => {
        const { computeBlanks } = await import('src/features/hundred-chart/utils');
        const blanks = computeBlanks(BlankMode.ANSWER_KEY, 99, 123, 5, 3, [1, 2, 3]);
        expect(blanks).toEqual([]);
      });
    });

    // --- Boundary and cross-mode notes ---
    describe('boundary and invariants', () => {
      it('blank indices are always 0-99 regardless of startNumber', async () => {
        const { computeBlanks } = await import('src/features/hundred-chart/utils');
        // computeBlanks only returns 0-99 indices; startNumber is applied elsewhere
        const blanks = computeBlanks(BlankMode.RANDOM, 20, 42, 2, 0, []);
        blanks.forEach((i) => {
          expect(i).toBeGreaterThanOrEqual(0);
          expect(i).toBeLessThanOrEqual(99);
        });
      });

      it('RANDOM with blankCount=99 returns 99 unique indices', async () => {
        const { computeBlanks } = await import('src/features/hundred-chart/utils');
        const blanks = computeBlanks(BlankMode.RANDOM, 99, 42, 2, 0, []);
        expect(blanks.length).toBe(99);
        expect(new Set(blanks).size).toBe(99);
      });

      it('cross puzzle logic is NOT in this utils file (it lives in cross-utils.ts)', async () => {
        const module = await import('src/features/hundred-chart/utils');
        // Only grid-mode functions are exported
        expect(Object.keys(module).sort()).toEqual(
          ['computeBlanks', 'generateSeed', 'lcg', 'seededShuffle'].sort()
        );
      });
    });
  });
});
