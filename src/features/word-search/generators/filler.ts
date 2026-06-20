import { DIRECTION_VECTORS } from './rng';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Fill empty cells with random letters.
 */
export function fillEmpty(
  grid: string[][],
  rng: () => number,
  letterCase: 'upper' | 'lower',
): void {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === '') {
        const letter = LETTERS[Math.floor(rng() * 26)];
        grid[r][c] = letterCase === 'lower' ? letter.toLowerCase() : letter;
      }
    }
  }
}

/**
 * Scan the grid in all 8 directions for any sequence that matches
 * any of the targetWords (case-insensitive). Only checks sequences
 * whose length equals one of the target word lengths.
 */
export function detectAccidentalWords(grid: string[][], targetWords: string[]): boolean {
  if (targetWords.length === 0) return false;

  const rows = grid.length;
  const cols = grid[0].length;
  const targetLengths = new Set(targetWords.map((w) => w.length));
  const targetSet = new Set(targetWords.map((w) => w.toLowerCase()));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (const [dRow, dCol] of Object.values(DIRECTION_VECTORS)) {
        for (const len of targetLengths) {
          const endR = r + (len - 1) * dRow;
          const endC = c + (len - 1) * dCol;
          if (endR < 0 || endR >= rows || endC < 0 || endC >= cols) continue;

          let seq = '';
          for (let i = 0; i < len; i++) {
            seq += grid[r + i * dRow][c + i * dCol];
          }

          if (targetSet.has(seq.toLowerCase())) {
            return true;
          }
        }
      }
    }
  }

  return false;
}
