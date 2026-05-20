import type { CustomDifficultyRange } from 'src/types';

import { ProblemType, DifficultyLevel } from 'src/types';

import { getRandomInt, getTwoDifferentEmojis, getRandomIntIncludingZero } from '../shared/types';

import type { RawMathProblem } from '../shared/types';

export function generateFactFamilyProblems(
  count: number,
  difficulty: DifficultyLevel,
  emojis: string[],
  customDifficulty?: CustomDifficultyRange,
  usedFamilies?: Set<string>,
  mode: ProblemType = ProblemType.FILL_BLANK,
  excludeZeroProblems: boolean = false
): RawMathProblem[] {
  const problems: RawMathProblem[] = [];
  const maxNumber =
    difficulty === DifficultyLevel.CUSTOM && customDifficulty ? customDifficulty.max : difficulty;
  const minNumber =
    difficulty === DifficultyLevel.CUSTOM && customDifficulty ? Math.max(0, customDifficulty.min) : 0;

  let attempts = 0;
  const maxAttempts = Math.max(count * 20, 200);

  while (problems.length < count && attempts < maxAttempts) {
    attempts += 1;
    const c = getRandomInt(Math.max(1, minNumber), maxNumber);
    const minA = excludeZeroProblems ? 1 : 0;
    if (c < minA) {
      continue;
    }
    const a = getRandomIntIncludingZero(minA, c);
    const b = c - a;
    if (excludeZeroProblems && b === 0) {
      continue;
    }

    const familyKey = `${Math.min(a, b)}_${Math.max(a, b)}_${c}`;
    if (usedFamilies?.has(familyKey)) {
      continue;
    }
    usedFamilies?.add(familyKey);

    const { emoji1, emoji2 } = getTwoDifferentEmojis(emojis);
    const blankPositions: Array<'first' | 'second' | 'result'> = ['first', 'second', 'result'];
    const nextBlankPosition = () =>
      blankPositions[getRandomIntIncludingZero(0, blankPositions.length - 1)];
    const familyProblems: RawMathProblem[] = [
      { op: '+', a, b, emoji1, emoji2 },
      { op: '+', a: b, b: a, emoji1, emoji2 },
      { op: '-', a: c, b: a, emoji1, emoji2: emoji1 },
      { op: '-', a: c, b, emoji1, emoji2: emoji1 },
    ];

    familyProblems.forEach((problem) => {
      if (problems.length >= count) {
        return;
      }

      if (mode === ProblemType.FILL_BLANK) {
        problem.blankPosition = nextBlankPosition();
      }

      problems.push(problem);
    });
  }

  return problems;
}
