import type { CustomDifficultyRange } from 'src/types';

import { DisplayMode, OperationType, DifficultyLevel } from 'src/types';

import { getMixedTargetCounts, getNextMixedOperator, getMulDivMixedTargetCounts, getNextMulDivMixedOperator } from './shared/mixed-balance';
import {
  getRandomInt,
  getSameEmojiPair,
  problemContainsZero,
  getTwoDifferentEmojis,
  getRandomIntIncludingZero,
} from './shared/types';

import type { RawMathProblem } from './shared/types';

function resolveFillOp(op: OperationType, ra: number, rs: number, rm: number, rd: number): '+' | '-' | '×' | '÷' {
  if (op === OperationType.MIXED) return getNextMixedOperator(ra, rs);
  if (op === OperationType.MULT_DIV_MIXED) return getNextMulDivMixedOperator(rm, rd);
  if (op === OperationType.ADDITION) return '+';
  if (op === OperationType.SUBTRACTION) return '-';
  if (op === OperationType.MULTIPLICATION) return '×';
  return '÷';
}

export function generateFillBlankProblems(
  count: number,
  difficulty: DifficultyLevel,
  operation: OperationType,
  emojis: string[],
  customDifficulty?: CustomDifficultyRange,
  usedProblems?: Set<string>,
  excludeZeroProblems: boolean = false,
  displayMode: DisplayMode = DisplayMode.TEXT
): RawMathProblem[] {
  const problems: RawMathProblem[] = [];
  const activeCustomDifficulty = difficulty === DifficultyLevel.CUSTOM ? customDifficulty : undefined;
  let maxNumber: number;
  let attempts = 0;
  const maxAttempts = Math.max(count * 30, 300);
  const addSubTargets = operation === OperationType.MIXED ? getMixedTargetCounts(count) : null;
  const mulDivTargets = operation === OperationType.MULT_DIV_MIXED ? getMulDivMixedTargetCounts(count) : null;
  let ra = addSubTargets?.additionCount ?? 0;
  let rs = addSubTargets?.subtractionCount ?? 0;
  let rm = mulDivTargets?.multiplicationCount ?? 0;
  let rd = mulDivTargets?.divisionCount ?? 0;

  if (difficulty === DifficultyLevel.CUSTOM && activeCustomDifficulty) {
    maxNumber = activeCustomDifficulty.max;
  } else {
    maxNumber = difficulty;
  }

  // ×/÷ do not support EMOJI mode, so restrict blank positions
  const isMulDiv = operation === OperationType.MULTIPLICATION
    || operation === OperationType.DIVISION
    || operation === OperationType.MULT_DIV_MIXED;

  while (problems.length < count && attempts < maxAttempts) {
    attempts += 1;
    const blankPositions: Array<'first' | 'second' | 'result'> =
      displayMode === DisplayMode.EMOJI || isMulDiv ? ['first', 'second'] : ['first', 'second', 'result'];
    const blankPosition = blankPositions[Math.floor(Math.random() * blankPositions.length)];
    const op = resolveFillOp(operation, ra, rs, rm, rd);

    let a: number;
    let b: number;
    const { emoji1, emoji2 } = getTwoDifferentEmojis(emojis);

    if (op === '+') {
      const maxResult = activeCustomDifficulty?.max ?? maxNumber;
      const minResult = Math.max(activeCustomDifficulty?.min ?? 2, 2);
      const result = getRandomInt(minResult, maxResult);

      if (blankPosition === 'first') {
        b = getRandomIntIncludingZero(0, Math.min(result, maxNumber));
        a = result - b;
      } else if (blankPosition === 'second') {
        a = getRandomIntIncludingZero(0, Math.min(result, maxNumber));
        b = result - a;
      } else {
        a = getRandomIntIncludingZero(0, Math.min(result, maxNumber));
        b = result - a;
      }

      if (excludeZeroProblems && problemContainsZero({ op: '+', a, b, emoji1, emoji2 })) continue;

      const pKey = `fill_+_${a}_${b}_${blankPosition}`;
      if (!usedProblems?.has(pKey)) {
        usedProblems?.add(pKey);
        problems.push({ op: '+', a, b, emoji1, emoji2, blankPosition });
        if (operation === OperationType.MIXED) ra = Math.max(0, ra - 1);
      }
    } else if (op === '-') {
      const maxA = activeCustomDifficulty?.max ?? maxNumber;
      const minA = Math.max(activeCustomDifficulty?.min ?? 2, 2);

      if (blankPosition === 'first') {
        b = getRandomIntIncludingZero(0, Math.min(maxA, maxA));
        const result = getRandomIntIncludingZero(0, maxA - b);
        a = result + b;
      } else if (blankPosition === 'second') {
        a = getRandomIntIncludingZero(minA, maxA);
        const result = getRandomIntIncludingZero(0, a);
        b = a - result;
      } else {
        a = getRandomIntIncludingZero(minA, maxA);
        b = getRandomIntIncludingZero(0, a);
      }

      const { emoji1: e1, emoji2: e2 } = getSameEmojiPair(emojis);
      if (excludeZeroProblems && problemContainsZero({ op: '-', a, b, emoji1: e1, emoji2: e2 })) continue;

      const pKey = `fill_-_${a}_${b}_${blankPosition}`;
      if (!usedProblems?.has(pKey)) {
        usedProblems?.add(pKey);
        problems.push({ op: '-', a, b, emoji1: e1, emoji2: e2, blankPosition });
        if (operation === OperationType.MIXED) rs = Math.max(0, rs - 1);
      }
    } else if (op === '×') {
      const maxResult = activeCustomDifficulty?.max ?? maxNumber;
      const minResult = Math.max(activeCustomDifficulty?.min ?? 2, 2);
      const result = getRandomInt(minResult, maxResult);

      if (blankPosition === 'first') {
        // result ÷ b = a, so pick b as a factor of result
        const factors = getFactors(result);
        if (factors.length === 0) continue;
        b = factors[getRandomInt(0, factors.length - 1)];
        a = result / b;
      } else if (blankPosition === 'second') {
        const factors = getFactors(result);
        if (factors.length === 0) continue;
        a = factors[getRandomInt(0, factors.length - 1)];
        b = result / a;
      } else {
        a = getRandomIntIncludingZero(0, Math.min(result, maxNumber));
        const maxB = a === 0 ? maxNumber : Math.floor(result / Math.max(a, 1));
        b = getRandomIntIncludingZero(0, Math.max(0, maxB));
      }

      if (excludeZeroProblems && problemContainsZero({ op: '×', a, b, emoji1, emoji2 })) continue;

      const pKey = `fill_×_${a}_${b}_${blankPosition}`;
      if (!usedProblems?.has(pKey)) {
        usedProblems?.add(pKey);
        problems.push({ op: '×', a, b, emoji1, emoji2, blankPosition });
        if (operation === OperationType.MULT_DIV_MIXED) rm = Math.max(0, rm - 1);
      }
    } else {
      // ÷: a / b = c; blank position is first (a), second (b), or result (c)
      const maxVal = activeCustomDifficulty?.max ?? maxNumber;
      const minVal = Math.max(activeCustomDifficulty?.min ?? 1, 1);

      if (blankPosition === 'first') {
        b = getRandomInt(Math.max(1, minVal), maxVal);
        const c = getRandomIntIncludingZero(minVal, Math.floor(maxVal / b));
        a = b * c;
      } else if (blankPosition === 'second') {
        const c = getRandomIntIncludingZero(minVal, maxVal);
        a = c * getRandomInt(Math.max(1, minVal), maxVal);
        b = 0; // will be set to blank — just need valid (a,c) for key
        // Regenerate: pick divisor properly
        const factors = getFactors(a);
        const validFactors = factors.filter((f) => f >= 1 && f <= maxVal);
        if (validFactors.length === 0) continue;
        b = validFactors[getRandomInt(0, validFactors.length - 1)];
      } else {
        b = getRandomInt(Math.max(1, minVal), maxVal);
        const maxC = Math.floor(maxVal / b);
        const c = getRandomIntIncludingZero(minVal, Math.max(0, maxC));
        a = b * c;
      }

      if (b === 0) continue;
      if (excludeZeroProblems && problemContainsZero({ op: '÷', a, b, emoji1, emoji2 })) continue;

      const pKey = `fill_÷_${a}_${b}_${blankPosition}`;
      if (!usedProblems?.has(pKey)) {
        usedProblems?.add(pKey);
        problems.push({ op: '÷', a, b, emoji1, emoji2, blankPosition });
        if (operation === OperationType.MULT_DIV_MIXED) rd = Math.max(0, rd - 1);
      }
    }
  }

  return problems;
}

function getFactors(n: number): number[] {
  if (n <= 0) return [];
  const factors: number[] = [];
  for (let i = 1; i <= n; i++) {
    if (n % i === 0) factors.push(i);
  }
  return factors;
}
