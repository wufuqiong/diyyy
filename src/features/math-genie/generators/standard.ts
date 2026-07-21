import type { DifficultyLevel , CustomDifficultyRange} from 'src/types';

import { OperationType } from 'src/types';

import { getMixedTargetCounts, getNextMixedOperator, getMulDivMixedTargetCounts, getNextMulDivMixedOperator } from './shared/mixed-balance';
import {
  getRandomInt,
  getSameEmojiPair,
  problemContainsZero,
  getTwoDifferentEmojis,
  getRandomIntIncludingZero,
} from './shared/types';

import type { RawMathProblem } from './shared/types';

function resolveOp(op: OperationType, remAdd: number, remSub: number, remMul: number, remDiv: number): '+' | '-' | '×' | '÷' {
  if (op === OperationType.MIXED) return getNextMixedOperator(remAdd, remSub);
  if (op === OperationType.MULT_DIV_MIXED) return getNextMulDivMixedOperator(remMul, remDiv);
  if (op === OperationType.ADDITION) return '+';
  if (op === OperationType.SUBTRACTION) return '-';
  if (op === OperationType.MULTIPLICATION) return '×';
  return '÷';
}

function adjustMixCounts(op: OperationType, problem: RawMathProblem, state: { ra: number; rs: number; rm: number; rd: number }) {
  if (op === OperationType.MIXED) {
    if (problem.op === '+') state.ra = Math.max(0, state.ra - 1);
    else state.rs = Math.max(0, state.rs - 1);
  } else if (op === OperationType.MULT_DIV_MIXED) {
    if (problem.op === '×') state.rm = Math.max(0, state.rm - 1);
    else state.rd = Math.max(0, state.rd - 1);
  }
}

export function generateProblemsForDifficulty(
  count: number,
  difficulty: DifficultyLevel,
  operation: OperationType,
  emojis: string[],
  usedProblems?: Set<string>,
  customDifficulty?: CustomDifficultyRange,
  excludeZeroProblems: boolean = false
): RawMathProblem[] {
  const problems: RawMathProblem[] = [];
  const maxNumber = difficulty;
  let attempts = 0;
  const maxAttempts = Math.max(count * 20, 200);
  const addSubTargets = operation === OperationType.MIXED ? getMixedTargetCounts(count) : null;
  const mulDivTargets = operation === OperationType.MULT_DIV_MIXED ? getMulDivMixedTargetCounts(count) : null;
  const remaining = {
    ra: addSubTargets?.additionCount ?? 0,
    rs: addSubTargets?.subtractionCount ?? 0,
    rm: mulDivTargets?.multiplicationCount ?? 0,
    rd: mulDivTargets?.divisionCount ?? 0,
  };

  while (problems.length < count && attempts < maxAttempts) {
    attempts += 1;
    const op = resolveOp(operation, remaining.ra, remaining.rs, remaining.rm, remaining.rd);

    let problem: RawMathProblem;
    const { emoji1, emoji2 } = getTwoDifferentEmojis(emojis);

    if (op === '+') {
      const a = getRandomIntIncludingZero(0, maxNumber);
      const b = getRandomIntIncludingZero(0, maxNumber - a);
      problem = { op: '+', a, b, emoji1, emoji2 };
    } else if (op === '-') {
      const a = getRandomIntIncludingZero(1, maxNumber);
      const b = getRandomIntIncludingZero(0, a);
      const { emoji1: e1, emoji2: e2 } = getSameEmojiPair(emojis);
      problem = { op: '-', a, b, emoji1: e1, emoji2: e2 };
    } else if (op === '×') {
      const a = getRandomIntIncludingZero(0, maxNumber);
      const maxB = a === 0 ? maxNumber : Math.floor(maxNumber / a);
      const b = getRandomIntIncludingZero(0, maxB);
      problem = { op: '×', a, b, emoji1, emoji2 };
    } else {
      const b = getRandomInt(1, maxNumber);
      const maxC = Math.floor(maxNumber / b);
      const c = getRandomIntIncludingZero(0, maxC);
      const a = b * c;
      problem = { op: '÷', a, b, emoji1, emoji2 };
    }

    if (excludeZeroProblems && problemContainsZero(problem)) continue;

    const problemKey = `${problem.op}_${problem.a}_${problem.b}`;
    if (!usedProblems?.has(problemKey)) {
      usedProblems?.add(problemKey);
      problems.push(problem);
      adjustMixCounts(operation, problem, remaining);
    }
  }

  return problems;
}

export function generateProblemsForCustomRange(
  count: number,
  customRange: CustomDifficultyRange,
  operation: OperationType,
  emojis: string[],
  usedProblems?: Set<string>,
  excludeZeroProblems: boolean = false
): RawMathProblem[] {
  const problems: RawMathProblem[] = [];
  let attempts = 0;
  const maxAttempts = Math.max(count * 40, 400);
  const addSubTargets = operation === OperationType.MIXED ? getMixedTargetCounts(count) : null;
  const mulDivTargets = operation === OperationType.MULT_DIV_MIXED ? getMulDivMixedTargetCounts(count) : null;
  const remaining = {
    ra: addSubTargets?.additionCount ?? 0,
    rs: addSubTargets?.subtractionCount ?? 0,
    rm: mulDivTargets?.multiplicationCount ?? 0,
    rd: mulDivTargets?.divisionCount ?? 0,
  };
  const { min, max } = customRange;

  while (problems.length < count && attempts < maxAttempts) {
    attempts += 1;
    const op = resolveOp(operation, remaining.ra, remaining.rs, remaining.rm, remaining.rd);

    let problem: RawMathProblem;
    const { emoji1, emoji2 } = getTwoDifferentEmojis(emojis);

    if (op === '+') {
      const maxResult = max;
      const minResult = Math.max(min, 0);
      const targetSum = getRandomInt(minResult, maxResult);
      const a = getRandomIntIncludingZero(0, targetSum);
      const b = targetSum - a;
      problem = { op: '+', a, b, emoji1, emoji2 };
    } else if (op === '-') {
      const a = getRandomIntIncludingZero(Math.max(min, 0), max);
      const b = getRandomIntIncludingZero(0, a);
      const { emoji1: e1, emoji2: e2 } = getSameEmojiPair(emojis);
      problem = { op: '-', a, b, emoji1: e1, emoji2: e2 };
    } else if (op === '×') {
      const a = getRandomIntIncludingZero(Math.max(min, 0), max);
      const maxB = a === 0 ? max : Math.floor(max / a);
      const b = getRandomIntIncludingZero(Math.max(min, 0), Math.max(0, maxB));
      problem = { op: '×', a, b, emoji1, emoji2 };
    } else {
      const b = getRandomInt(Math.max(1, min), max);
      const maxC = Math.floor(max / b);
      const c = getRandomIntIncludingZero(Math.max(min, 0), Math.max(0, maxC));
      const a = b * c;
      problem = { op: '÷', a, b, emoji1, emoji2 };
    }

    if (excludeZeroProblems && problemContainsZero(problem)) continue;

    const problemKey = `${problem.op}-${problem.a}-${problem.b}`;
    if (!usedProblems?.has(problemKey)) {
      usedProblems?.add(problemKey);
      problems.push(problem);
      adjustMixCounts(operation, problem, remaining);
    }
  }

  return problems;
}
