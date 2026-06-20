import { lcg } from './rng';
import { tryPlaceWord } from './word-placement';
import { fillEmpty, detectAccidentalWords } from './filler';
import { GRID_DIMENSIONS, DIFFICULTY_DIRECTIONS } from '../types';

import type { GridGenResult, GridSizePreset, WordSearchDifficulty } from '../types';

/** Generate a random 32-bit seed from crypto.getRandomValues (non-deterministic). */
export function generateSeed(): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0];
}

/** Soft timeout: stop trying to place more words after this many ms. */
const PLACEMENT_TIMEOUT_MS = 2000;

/** Max filler retries for accidental word detection. */
const MAX_FILL_RETRIES = 20;

/**
 * Main algorithm: place words, fill empty cells, detect accidental words.
 */
export function generateWordSearchGrid(
  words: string[],
  gridSize: GridSizePreset,
  difficulty: WordSearchDifficulty,
  seed: number,
  letterCase: 'upper' | 'lower' = 'lower',
): GridGenResult {
  const { rows, cols } = GRID_DIMENSIONS[gridSize];

  // 1. Normalize: trim, deduplicate, filter empty, sort by length desc
  const normalized = [...new Set(
    words
      .map((w) => w.trim())
      .filter((w) => w.length > 0),
  )].sort((a, b) => b.length - a.length);

  // 2. Init empty grid
  const grid: string[][] = Array.from({ length: rows }, () => Array(cols).fill(''));

  // 3. Create RNG
  const rng = lcg(seed);

  // 4. Place words
  const dirs = DIFFICULTY_DIRECTIONS[difficulty];
  const placedWords = [];
  const unplacedWords: string[] = [];

  const startTime = Date.now();

  for (const word of normalized) {
    // Soft timeout check
    if (Date.now() - startTime > PLACEMENT_TIMEOUT_MS) {
      unplacedWords.push(word);
      continue;
    }

    const placed = tryPlaceWord(grid, word, dirs, rng, rows, cols, 100);

    if (placed) {
      // Write word into grid
      for (let i = 0; i < placed.cells.length; i++) {
        const { row, col } = placed.cells[i];
        grid[row][col] = word[i];
      }
      placedWords.push(placed);
    } else {
      unplacedWords.push(word);
    }
  }

  // 5-6. Fill empty cells + accidental word detection with retry
  for (let retry = 0; retry < MAX_FILL_RETRIES; retry++) {
    // Clone grid for this retry
    const fillGrid = grid.map((row) => [...row]);
    const fillRng = lcg(seed + retry + 1);
    fillEmpty(fillGrid, fillRng, letterCase);

    if (!detectAccidentalWords(fillGrid, normalized)) {
      // Success: copy fillGrid back to grid
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          grid[r][c] = fillGrid[r][c];
        }
      }
      return { grid, placedWords, unplacedWords };
    }
  }

  // Max retries exceeded: accept current state with a warning
  const finalRng = lcg(seed + MAX_FILL_RETRIES + 1);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '') {
        const letter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(finalRng() * 26)];
        grid[r][c] = letterCase === 'lower' ? letter.toLowerCase() : letter;
      }
    }
  }
  console.warn('[word-search] Max fill retries exceeded, accepting current grid');
  return { grid, placedWords, unplacedWords };
}
