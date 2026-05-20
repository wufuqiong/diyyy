import type { CustomDifficultyRange } from 'src/types';

import { ProblemType, OperationType, DifficultyLevel } from 'src/types';

import { getSameEmojiPair, getTwoDifferentEmojis, getRandomIntIncludingZero } from '../shared/types';

import type { RawMathProblem } from '../shared/types';

export function generateZeroDrillProblems(
  count: number,
  difficulty: DifficultyLevel,
  operation: OperationType,
  emojis: string[],
  customDifficulty?: CustomDifficultyRange,
  usedProblems?: Set<string>,
  mode: ProblemType = ProblemType.FILL_BLANK,
  excludeZeroProblems: boolean = false
): RawMathProblem[] {
  if (excludeZeroProblems) {
    return [];
  }

  const problems: RawMathProblem[] = [];
  const maxNumber =
    difficulty === DifficultyLevel.CUSTOM && customDifficulty ? customDifficulty.max : difficulty;
  let attempts = 0;
  const maxAttempts = Math.max(count * 40, 400);

  while (problems.length < count && attempts < maxAttempts) {
    attempts += 1;
    const op: '+' | '-' =
      operation === OperationType.ADDITION
        ? '+'
        : operation === OperationType.SUBTRACTION
          ? '-'
          : Math.random() > 0.5
            ? '+'
            : '-';

    const zeroRole = ['first', 'second', 'result'][getRandomIntIncludingZero(0, 2)] as
      | 'first'
      | 'second'
      | 'result';
    const blankPosition: 'first' | 'second' | 'result' =
      mode === ProblemType.FILL_BLANK
        ? (['first', 'second', 'result'][getRandomIntIncludingZero(0, 2)] as
            | 'first'
            | 'second'
            | 'result')
        : 'result';

    let a = 0;
    let b = 0;

    if (op === '+') {
      if (zeroRole === 'first') {
        a = 0;
        b = getRandomIntIncludingZero(0, maxNumber);
      } else if (zeroRole === 'second') {
        a = getRandomIntIncludingZero(0, maxNumber);
        b = 0;
      } else {
        a = 0;
        b = 0;
      }
    } else {
      if (zeroRole === 'first') {
        a = 0;
        b = 0;
      } else if (zeroRole === 'second') {
        a = getRandomIntIncludingZero(0, maxNumber);
        b = 0;
      } else {
        const same = getRandomIntIncludingZero(0, maxNumber);
        a = same;
        b = same;
      }
    }

    const problemKey = `zero_${mode}_${op}_${a}_${b}_${blankPosition}`;
    if (usedProblems?.has(problemKey)) {
      continue;
    }

    const { emoji1, emoji2 } = op === '-' ? getSameEmojiPair(emojis) : getTwoDifferentEmojis(emojis);
    usedProblems?.add(problemKey);
    const problem: RawMathProblem = { op, a, b, emoji1, emoji2 };
    if (mode === ProblemType.FILL_BLANK) {
      problem.blankPosition = blankPosition;
    }
    problems.push(problem);
  }

  return problems;
}
