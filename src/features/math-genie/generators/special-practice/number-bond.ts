import type { CustomDifficultyRange } from 'src/types';

import type { RawMathProblem } from '../shared/types';

export function generateNumberBondProblems(
  count: number,
  difficulty: number,
  emojis: string[],
  customDifficulty?: CustomDifficultyRange,
  usedProblems?: Set<string>,
  excludeZeroProblems: boolean = false,
  blankMode: 'random' | 'parts_only' | 'whole_only' = 'random'
): RawMathProblem[] {
  const minRange = customDifficulty?.min ?? 1;
  const maxRange = customDifficulty?.max ?? difficulty;
  const usedKeys = usedProblems ?? new Set<string>();

  const problems: RawMathProblem[] = [];
  let attempts = 0;
  const maxAttempts = count * 20;

  while (problems.length < count && attempts < maxAttempts) {
    attempts++;
    const whole = getRandomInt(Math.max(minRange, 2), Math.max(maxRange, 2));
    const part0 = getRandomInt(0, whole);
    const part1 = whole - part0;

    // Exclude zeros if requested (skip if whole < 2 as that forces a zero)
    if (excludeZeroProblems) {
      if (part0 === 0 || part1 === 0) continue;
    }

    // Determine blank index
    let blankIndex: 0 | 1 | 'whole';
    if (blankMode === 'parts_only') {
      blankIndex = Math.random() < 0.5 ? 0 : 1;
    } else if (blankMode === 'whole_only') {
      blankIndex = 'whole';
    } else {
      const roll = Math.random();
      blankIndex = roll < 0.33 ? 0 : roll < 0.66 ? 1 : 'whole';
    }

    // De-duplicate
    const key = `NB:${whole}:${part0}:${part1}:${blankIndex}`;
    if (usedKeys.has(key)) continue;
    usedKeys.add(key);

    const emoji = emojis[problems.length % emojis.length];

    problems.push({
      op: '+',
      a: part0,
      b: part1,
      emoji1: emoji,
      isNumberBond: true,
      numberBondWhole: whole,
      numberBondParts: [part0, part1],
      numberBondBlankIndex: blankIndex,
    });

    // Show answer when configured: blankIndex resolves to the actual value
    // Whole blank: answer is the sum
    // Part blank: answer is the missing part
  }

  return problems;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
