import type { CustomDifficultyRange } from 'src/types';

import { ProblemType, OperationType, DifficultyLevel } from 'src/types';

import { getRandomInt, getTwoDifferentEmojis, getRandomIntIncludingZero } from '../shared/types';

import type { RawMathProblem } from '../shared/types';

function getFactors(n: number): number[] {
  const factors: number[] = [];
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) {
      factors.push(i);
      if (i !== n / i && n / i !== 1) factors.push(n / i);
    }
  }
  return factors.sort(() => Math.random() - 0.5);
}

export function generateFactFamilyProblems(
  count: number,
  difficulty: DifficultyLevel,
  emojis: string[],
  customDifficulty?: CustomDifficultyRange,
  usedFamilies?: Set<string>,
  mode: ProblemType = ProblemType.FILL_BLANK,
  excludeZeroProblems: boolean = false,
  operation: OperationType = OperationType.ADDITION
): RawMathProblem[] {
  const problems: RawMathProblem[] = [];
  const maxNumber =
    difficulty === DifficultyLevel.CUSTOM && customDifficulty ? customDifficulty.max : difficulty;
  const minNumber =
    difficulty === DifficultyLevel.CUSTOM && customDifficulty ? Math.max(0, customDifficulty.min) : 0;

  const isMulDiv = operation === OperationType.MULTIPLICATION
    || operation === OperationType.DIVISION
    || operation === OperationType.MULT_DIV_MIXED;

  let attempts = 0;
  const maxAttempts = Math.max(count * 20, 200);

  const blankPositions: Array<'first' | 'second' | 'result'> = ['first', 'second', 'result'];
  const nextBlankPosition = () =>
    blankPositions[getRandomIntIncludingZero(0, blankPositions.length - 1)];

  while (problems.length < count && attempts < maxAttempts) {
    attempts += 1;

    if (isMulDiv) {
      // Multiplication/Division fact family: a × b = c, b × a = c, c ÷ a = b, c ÷ b = a
      const c = getRandomInt(Math.max(2, minNumber), maxNumber);
      const factors = getFactors(c);
      if (factors.length === 0) continue;

      const a = factors[0];
      const b = c / a;

      const familyKey = `${Math.min(a, b)}_${Math.max(a, b)}_${c}_md`;
      if (usedFamilies?.has(familyKey)) continue;
      usedFamilies?.add(familyKey);

      const { emoji1, emoji2 } = getTwoDifferentEmojis(emojis);
      const familyProblems: RawMathProblem[] = [
        { op: '×', a, b, emoji1, emoji2 },
        { op: '×', a: b, b: a, emoji1, emoji2 },
        { op: '÷', a: c, b: a, emoji1, emoji2: emoji1 },
        { op: '÷', a: c, b, emoji1, emoji2: emoji1 },
      ];

      familyProblems.forEach((problem) => {
        if (problems.length >= count) return;
        if (mode === ProblemType.FILL_BLANK) problem.blankPosition = nextBlankPosition();
        problems.push(problem);
      });
    } else {
      // Addition/Subtraction fact family: a + b = c, b + a = c, c - a = b, c - b = a
      const c = getRandomInt(Math.max(1, minNumber), maxNumber);
      const minA = excludeZeroProblems ? 1 : 0;
      if (c < minA) continue;
      const a = getRandomIntIncludingZero(minA, c);
      const b = c - a;
      if (excludeZeroProblems && b === 0) continue;

      const familyKey = `${Math.min(a, b)}_${Math.max(a, b)}_${c}`;
      if (usedFamilies?.has(familyKey)) continue;
      usedFamilies?.add(familyKey);

      const { emoji1, emoji2 } = getTwoDifferentEmojis(emojis);
      const familyProblems: RawMathProblem[] = [
        { op: '+', a, b, emoji1, emoji2 },
        { op: '+', a: b, b: a, emoji1, emoji2 },
        { op: '-', a: c, b: a, emoji1, emoji2: emoji1 },
        { op: '-', a: c, b, emoji1, emoji2: emoji1 },
      ];

      familyProblems.forEach((problem) => {
        if (problems.length >= count) return;
        if (mode === ProblemType.FILL_BLANK) problem.blankPosition = nextBlankPosition();
        problems.push(problem);
      });
    }
  }

  return problems;
}
