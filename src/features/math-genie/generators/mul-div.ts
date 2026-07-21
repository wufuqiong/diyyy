import { ProblemType, MulDivLevel, OperationType } from 'src/types';

import { getRandomInt, getTwoDifferentEmojis } from './shared/types';
import { getMulDivMixedTargetCounts, getNextMulDivMixedOperator } from './shared/mixed-balance';

import type { RawMathProblem } from './shared/types';

interface DigitBounds {
  topMin: number;
  topMax: number;
  bottomMin: number;
  bottomMax: number;
}

function getBounds(level: MulDivLevel): DigitBounds {
  switch (level) {
    case MulDivLevel.ONE_DIGIT:
      return { topMin: 1, topMax: 9, bottomMin: 1, bottomMax: 9 };
    case MulDivLevel.ONE_BY_TWO:
      return { topMin: 10, topMax: 99, bottomMin: 1, bottomMax: 9 };
    case MulDivLevel.TWO_DIGIT:
      return { topMin: 10, topMax: 99, bottomMin: 10, bottomMax: 99 };
    case MulDivLevel.THREE_DIGIT:
      return { topMin: 100, topMax: 999, bottomMin: 10, bottomMax: 99 };
    default:
      return { topMin: 1, topMax: 9, bottomMin: 1, bottomMax: 9 };
  }
}

export function generateMulDivProblems(
  count: number,
  operation: OperationType,
  level: MulDivLevel,
  emojis: string[],
  problemType: ProblemType,
): RawMathProblem[] {
  const bounds = getBounds(level);
  const targets = operation === OperationType.MULT_DIV_MIXED
    ? getMulDivMixedTargetCounts(count)
    : null;
  let remainingMultiplication = targets?.multiplicationCount ?? 0;
  let remainingDivision = targets?.divisionCount ?? 0;
  const problems: RawMathProblem[] = [];
  const usedProblems = new Set<string>();
  let attempts = 0;
  const maxUniqueAttempts = Math.max(300, count * 30);

  while (problems.length < count) {
    attempts += 1;
    const op = operation === OperationType.MULT_DIV_MIXED
      ? getNextMulDivMixedOperator(remainingMultiplication, remainingDivision)
      : operation === OperationType.MULTIPLICATION ? '×' : '÷';
    const top = getRandomInt(bounds.topMin, bounds.topMax);
    const bottom = getRandomInt(bounds.bottomMin, bounds.bottomMax);
    const a = op === '×' ? top : top * bottom;
    const b = bottom;
    const blankPosition = problemType === ProblemType.FILL_BLANK
      ? (Math.random() < 0.5 ? 'first' as const : 'second' as const)
      : undefined;
    const key = `${op}_${a}_${b}_${blankPosition ?? 'standard'}`;

    if (attempts <= maxUniqueAttempts && usedProblems.has(key)) continue;
    usedProblems.add(key);

    const { emoji1, emoji2 } = getTwoDifferentEmojis(emojis);
    problems.push({ op, a, b, emoji1, emoji2, blankPosition });

    if (operation === OperationType.MULT_DIV_MIXED) {
      if (op === '×') remainingMultiplication = Math.max(0, remainingMultiplication - 1);
      else remainingDivision = Math.max(0, remainingDivision - 1);
    }
  }

  return problems;
}
