import type { CustomDifficultyRange } from 'src/types';

import { MulDivLevel, OperationType, DifficultyLevel } from 'src/types';

import { getRandomInt, problemContainsZero, getTwoDifferentEmojis } from '../shared/types';
import { getMixedTargetCounts, getNextMixedOperator, getMulDivMixedTargetCounts, getNextMulDivMixedOperator } from '../shared/mixed-balance';

import type { RawMathProblem } from '../shared/types';

interface ColumnProblem extends RawMathProblem {
  isColumnArithmetic: true;
  columnTop: number;
  columnBottom: number;
  columnOp: string;
}

/** Check if a+b has carrying (any digit column sum >= 10) */
function hasCarry(a: number, b: number): boolean {
  while (a > 0 || b > 0) {
    if ((a % 10) + (b % 10) >= 10) return true;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return false;
}

/** Check if a-b requires borrowing (any digit of b > corresponding digit of a) */
function hasBorrow(a: number, b: number): boolean {
  while (b > 0) {
    if ((a % 10) < (b % 10)) return true;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return false;
}

/** +/- digit ranges: top has one more digit than bottom */
function getDigits(max: number): { topMin: number; topMax: number; botMin: number; botMax: number } {
  const len = String(max).length;
  const td = Math.min(len, 3);
  const bd = Math.max(1, td - 1);
  return {
    topMin: Math.pow(10, td - 1),
    topMax: Math.min(Math.pow(10, td) - 1, max),
    botMin: Math.pow(10, bd - 1),
    botMax: Math.min(Math.pow(10, bd) - 1, max),
  };
}

interface DigitBounds { topMin: number; topMax: number; botMin: number; botMax: number; }

function getMulBounds(level: MulDivLevel): DigitBounds {
  switch (level) {
    case MulDivLevel.ONE_DIGIT: return { topMin: 1, topMax: 9, botMin: 1, botMax: 9 };
    case MulDivLevel.ONE_BY_TWO: return { topMin: 10, topMax: 99, botMin: 1, botMax: 9 };
    case MulDivLevel.TWO_DIGIT: return { topMin: 10, topMax: 99, botMin: 10, botMax: 99 };
    case MulDivLevel.THREE_DIGIT: return { topMin: 100, topMax: 999, botMin: 10, botMax: 99 };
    default: return { topMin: 1, topMax: 9, botMin: 1, botMax: 9 };
  }
}

function getDivBounds(level: MulDivLevel): DigitBounds {
  switch (level) {
    case MulDivLevel.ONE_DIGIT: return { topMin: 1, topMax: 9, botMin: 1, botMax: 9 };
    case MulDivLevel.ONE_BY_TWO: return { topMin: 10, topMax: 99, botMin: 1, botMax: 9 };
    case MulDivLevel.TWO_DIGIT: return { topMin: 10, topMax: 99, botMin: 10, botMax: 99 };
    case MulDivLevel.THREE_DIGIT: return { topMin: 100, topMax: 999, botMin: 1, botMax: 99 };
    default: return { topMin: 1, topMax: 9, botMin: 1, botMax: 9 };
  }
}

export function generateColumnArithmeticProblems(
  count: number,
  difficulty: DifficultyLevel,
  operation: OperationType,
  emojis: string[],
  customDifficulty?: CustomDifficultyRange,
  usedProblems?: Set<string>,
  excludeZeroProblems: boolean = false,
  mulDivLevel: MulDivLevel = MulDivLevel.ONE_DIGIT,
  excludeCarry: boolean = false
): RawMathProblem[] {
  const maxNumber = difficulty === DifficultyLevel.CUSTOM && customDifficulty
    ? customDifficulty.max
    : difficulty;

  // +/- bounds: strict digit alignment
  const addSub = getDigits(maxNumber);
  // ×/÷ bounds: use selected digit level
  const mul = getMulBounds(mulDivLevel);
  const div = getDivBounds(mulDivLevel);

  const problems: ColumnProblem[] = [];
  let attempts = 0;
  const maxAttempts = Math.max(count * 30, 300);

  const addSubTargets = operation === OperationType.MIXED ? getMixedTargetCounts(count) : null;
  const mulDivTargets = operation === OperationType.MULT_DIV_MIXED ? getMulDivMixedTargetCounts(count) : null;
  let ra = addSubTargets?.additionCount ?? 0;
  let rs = addSubTargets?.subtractionCount ?? 0;
  let rm = mulDivTargets?.multiplicationCount ?? 0;
  let rd = mulDivTargets?.divisionCount ?? 0;

  while (problems.length < count && attempts < maxAttempts) {
    attempts++;

    let op: '+' | '-' | '×' | '÷';
    if (operation === OperationType.MIXED) {
      op = getNextMixedOperator(ra, rs);
    } else if (operation === OperationType.MULT_DIV_MIXED) {
      op = getNextMulDivMixedOperator(rm, rd);
    } else if (operation === OperationType.ADDITION) op = '+';
    else if (operation === OperationType.SUBTRACTION) op = '-';
    else if (operation === OperationType.MULTIPLICATION) op = '×';
    else op = '÷';

    let a: number;
    let b: number;

    if (op === '+') {
      const maxResult = addSub.topMax;
      const minResult = Math.max(addSub.topMin, 2);
      const result = getRandomInt(minResult, maxResult);
      a = getRandomInt(0, result);
      b = result - a;
      if (a < addSub.botMin || b < addSub.botMin || a > addSub.topMax || b > addSub.botMax) continue;
      if (excludeCarry && hasCarry(a, b)) continue;
    } else if (op === '-') {
      a = getRandomInt(Math.max(addSub.topMin, 1), addSub.topMax);
      b = getRandomInt(addSub.botMin, Math.min(a, addSub.botMax));
      if (excludeCarry && hasBorrow(a, b)) continue;
    } else if (op === '×') {
      // Pick operands within digit bounds; product can exceed topMax
      a = getRandomInt(mul.topMin, mul.topMax);
      b = getRandomInt(mul.botMin, mul.botMax);
    } else {
      // Pick quotient within top bounds, divisor within bot bounds; dividend = b × c
      const c = getRandomInt(div.topMin, div.topMax);
      b = getRandomInt(Math.max(div.botMin, 1), div.botMax);
      a = b * c;
    }

    if (excludeZeroProblems && problemContainsZero({ op, a, b, emoji1: '', emoji2: '' })) continue;

    const key = `col_${op}_${a}_${b}`;
    if (usedProblems?.has(key)) continue;
    usedProblems?.add(key);

    const { emoji1, emoji2 } = getTwoDifferentEmojis(emojis);
    problems.push({
      op,
      a,
      b,
      emoji1,
      emoji2,
      isColumnArithmetic: true,
      columnTop: a,
      columnBottom: b,
      columnOp: op,
    });

    if (operation === OperationType.MIXED) {
      if (op === '+') ra = Math.max(0, ra - 1);
      else rs = Math.max(0, rs - 1);
    } else if (operation === OperationType.MULT_DIV_MIXED) {
      if (op === '×') rm = Math.max(0, rm - 1);
      else rd = Math.max(0, rd - 1);
    }
  }

  return problems;
}
