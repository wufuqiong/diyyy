import { randomInt, randomPick, DIRECTION_VECTORS } from './rng';

import type { Direction, PlacedWord } from '../types';

/**
 * Try to place a word in the grid.
 * Returns PlacedWord on success, null on failure.
 */
export function tryPlaceWord(
  grid: string[][],
  word: string,
  dirs: Direction[],
  rng: () => number,
  rows: number,
  cols: number,
  maxAttempts: number = 100,
): PlacedWord | null {
  const chars = [...word];

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const dir = randomPick(dirs, rng);
    const [dRow, dCol] = DIRECTION_VECTORS[dir];

    // Random valid start position
    const startRow = randomInt(rows, rng);
    const startCol = randomInt(cols, rng);

    // Check bounds for end position
    const endRow = startRow + (chars.length - 1) * dRow;
    const endCol = startCol + (chars.length - 1) * dCol;
    if (endRow < 0 || endRow >= rows || endCol < 0 || endCol >= cols) continue;

    // Check each cell: must be empty or match existing char
    const cells: { row: number; col: number }[] = [];
    let ok = true;
    for (let i = 0; i < chars.length; i++) {
      const r = startRow + i * dRow;
      const c = startCol + i * dCol;
      const existing = grid[r][c];
      if (existing !== '' && existing !== chars[i]) {
        ok = false;
        break;
      }
      cells.push({ row: r, col: c });
    }

    if (!ok) continue;

    return {
      word,
      start: { row: startRow, col: startCol },
      end: { row: endRow, col: endCol },
      direction: dir,
      cells,
    };
  }

  return null;
}
