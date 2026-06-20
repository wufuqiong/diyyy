import { it, expect, describe } from 'vitest';

import { lcg } from '../rng';
import { tryPlaceWord } from '../word-placement';
import { generateWordSearchGrid } from '../grid-generator';
import { fillEmpty, detectAccidentalWords } from '../filler';
import { GridSizePreset, WordSearchDifficulty } from '../../types';

// ---------------------------------------------------------------------------
// rng.ts
// ---------------------------------------------------------------------------

describe('lcg', () => {
  it('produces deterministic output for a given seed', () => {
    const a = lcg(42);
    const b = lcg(42);
    const seqA = Array.from({ length: 10 }, () => a());
    const seqB = Array.from({ length: 10 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it('produces different output for different seeds', () => {
    const a = lcg(1);
    const b = lcg(9999);
    const seqA = Array.from({ length: 10 }, () => a());
    const seqB = Array.from({ length: 10 }, () => b());
    expect(seqA).not.toEqual(seqB);
  });
});

// ---------------------------------------------------------------------------
// word-placement.ts
// ---------------------------------------------------------------------------

describe('tryPlaceWord', () => {
  const rows = 10;
  const cols = 10;

  it('places a word in horizontal direction', () => {
    const grid = Array.from({ length: rows }, () => Array(cols).fill(''));
    const rng = lcg(123);
    const result = tryPlaceWord(grid, 'CAT', ['horizontal'], rng, rows, cols, 200);
    expect(result).not.toBeNull();
    expect(result!.word).toBe('CAT');
    expect(result!.direction).toBe('horizontal');
    expect(result!.cells).toHaveLength(3);
  });

  it('placed word cells match grid content', () => {
    const grid = Array.from({ length: rows }, () => Array(cols).fill(''));
    const rng = lcg(456);
    const result = tryPlaceWord(grid, 'DOG', ['horizontal', 'vertical'], rng, rows, cols, 200);
    expect(result).not.toBeNull();

    // Write to grid
    const word = result!.word;
    for (let i = 0; i < result!.cells.length; i++) {
      const { row, col } = result!.cells[i];
      grid[row][col] = word[i];
    }

    // Read back
    const readBack = result!.cells.map(({ row, col }) => grid[row][col]).join('');
    expect(readBack).toBe(word);
  });

  it('avoids overwriting different characters (conflict detection)', () => {
    const grid = Array.from({ length: rows }, () => Array(cols).fill(''));
    // Pre-fill a cell with 'X'
    grid[5][5] = 'X';
    const rng = lcg(789);

    // Try many times with a word that doesn't contain X at that position
    // If it ever places across (5,5) with a non-X char, that's a conflict
    for (let i = 0; i < 50; i++) {
      const testRng = lcg(789 + i);
      const result = tryPlaceWord(grid, 'HELLO', ['horizontal', 'vertical', 'diagonal-down', 'diagonal-up'], testRng, rows, cols, 50);
      if (result) {
        // Verify no conflict
        for (let j = 0; j < result.cells.length; j++) {
          const { row, col } = result.cells[j];
          const existing = grid[row][col];
          if (existing !== '' && existing !== result.word[j]) {
            // This should not happen
            expect(false).toBe(true);
          }
        }
      }
    }
  });

  it('allows cross-sharing when same character', () => {
    const grid = Array.from({ length: rows }, () => Array(cols).fill(''));
    // Place CAT horizontally at row 5, starting at col 3
    grid[5][3] = 'C';
    grid[5][4] = 'A';
    grid[5][5] = 'T';

    const rng = lcg(111);
    // Try to place a word that uses 'A' as cross point
    const result = tryPlaceWord(grid, 'BAT', ['vertical', 'horizontal'], rng, rows, cols, 500);
    // May or may not hit the cross point — just verify no false conflicts
    if (result) {
      for (let j = 0; j < result.cells.length; j++) {
        const { row, col } = result.cells[j];
        const existing = grid[row][col];
        if (existing !== '') {
          expect(existing).toBe(result.word[j]);
        }
      }
    }
  });

  it('returns null when word cannot fit (out of bounds)', () => {
    const grid = Array.from({ length: 5 }, () => Array(5).fill(''));
    const rng = lcg(222);
    // A 20-char word can't fit in 5x5
    const result = tryPlaceWord(grid, 'SUPERCALIFRAGILISTIC', ['horizontal'], rng, 5, 5, 50);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// filler.ts
// ---------------------------------------------------------------------------

describe('fillEmpty', () => {
  it('fills all empty cells', () => {
    const grid = [
      ['A', '', 'B'],
      ['', 'C', ''],
    ];
    fillEmpty(grid, lcg(333), 'upper');
    for (const row of grid) {
      for (const cell of row) {
        expect(cell).not.toBe('');
        expect(cell).toMatch(/^[A-Z]$/);
      }
    }
  });

  it('produces lowercase when letterCase is lower', () => {
    const grid = [['', '']];
    fillEmpty(grid, lcg(444), 'lower');
    for (const cell of grid[0]) {
      expect(cell).toMatch(/^[a-z]$/);
    }
  });
});

describe('detectAccidentalWords', () => {
  it('detects an accidental target word in the grid', () => {
    const grid = [
      ['C', 'A', 'T'],
      ['X', 'X', 'X'],
      ['X', 'X', 'X'],
    ];
    expect(detectAccidentalWords(grid, ['CAT'])).toBe(true);
  });

  it('detects accidental word case-insensitively', () => {
    const grid = [
      ['c', 'a', 't'],
      ['X', 'X', 'X'],
      ['X', 'X', 'X'],
    ];
    expect(detectAccidentalWords(grid, ['CAT'])).toBe(true);
  });

  it('detects accidental word in reverse direction', () => {
    const grid = [
      ['T', 'A', 'C'],
      ['X', 'X', 'X'],
      ['X', 'X', 'X'],
    ];
    expect(detectAccidentalWords(grid, ['CAT'])).toBe(true);
  });

  it('does not flag non-target words', () => {
    const grid = [
      ['C', 'A', 'R'],
      ['X', 'X', 'X'],
      ['X', 'X', 'X'],
    ];
    expect(detectAccidentalWords(grid, ['CAT'])).toBe(false);
  });

  it('returns false for empty target list', () => {
    const grid = [
      ['C', 'A', 'T'],
    ];
    expect(detectAccidentalWords(grid, [])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// grid-generator.ts (integration)
// ---------------------------------------------------------------------------

describe('generateWordSearchGrid', () => {
  it('generates a fully filled grid', () => {
    const result = generateWordSearchGrid(
      ['cat', 'dog', 'fish'],
      GridSizePreset.SMALL,
      WordSearchDifficulty.EASY,
      42,
    );
    expect(result.grid).toHaveLength(10);
    expect(result.grid[0]).toHaveLength(10);
    for (const row of result.grid) {
      for (const cell of row) {
        expect(cell).not.toBe('');
      }
    }
    expect(result.placedWords.length).toBeGreaterThan(0);
  });

  it('places all words when there is enough space', () => {
    const result = generateWordSearchGrid(
      ['cat', 'dog'],
      GridSizePreset.MEDIUM,
      WordSearchDifficulty.EASY,
      100,
    );
    expect(result.placedWords).toHaveLength(2);
    expect(result.unplacedWords).toHaveLength(0);
  });

  it('puts words that cannot fit into unplacedWords without throwing', () => {
    // A 20-char word in a 10x10 grid with limited directions
    const result = generateWordSearchGrid(
      ['supercalifragilistic'],
      GridSizePreset.SMALL,
      WordSearchDifficulty.EASY,
      200,
    );
    expect(result.unplacedWords).toContain('supercalifragilistic');
  });

  it('does not throw on extreme input (many long words)', () => {
    const longWords = Array.from({ length: 50 }, (_, i) => `word${i}extra`);
    expect(() =>
      generateWordSearchGrid(longWords, GridSizePreset.SMALL, WordSearchDifficulty.HARD, 300),
    ).not.toThrow();
  });

  it('is reproducible with the same seed', () => {
    const words = ['apple', 'banana', 'cherry', 'date'];
    const a = generateWordSearchGrid(words, GridSizePreset.MEDIUM, WordSearchDifficulty.EASY, 777);
    const b = generateWordSearchGrid(words, GridSizePreset.MEDIUM, WordSearchDifficulty.EASY, 777);
    expect(a.grid).toEqual(b.grid);
    expect(a.placedWords).toEqual(b.placedWords);
    expect(a.unplacedWords).toEqual(b.unplacedWords);
  });

  it('handles empty word list gracefully', () => {
    const result = generateWordSearchGrid([], GridSizePreset.SMALL, WordSearchDifficulty.EASY, 888);
    expect(result.placedWords).toHaveLength(0);
    expect(result.unplacedWords).toHaveLength(0);
    expect(result.grid).toHaveLength(10);
  });

  it('deduplicates duplicate words', () => {
    const result = generateWordSearchGrid(
      ['cat', 'cat', 'dog', 'dog'],
      GridSizePreset.MEDIUM,
      WordSearchDifficulty.EASY,
      999,
    );
    // Only unique words placed
    const uniquePlaced = new Set(result.placedWords.map((p) => p.word));
    expect(uniquePlaced.size).toBe(result.placedWords.length);
  });

  it('respects difficulty: easy only uses horizontal and vertical', () => {
    const result = generateWordSearchGrid(
      ['word', 'test', 'grid'],
      GridSizePreset.MEDIUM,
      WordSearchDifficulty.EASY,
      1234,
    );
    for (const pw of result.placedWords) {
      expect(['horizontal', 'vertical']).toContain(pw.direction);
    }
  });
});
