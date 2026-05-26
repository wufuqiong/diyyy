import type { DifficultyLevel , CustomDifficultyRange} from 'src/types';

import { OperationType } from 'src/types';

import { getMixedTargetCounts, getNextMixedOperator } from './shared/mixed-balance';
import {
  getRandomInt,
  getSameEmojiPair,
  problemContainsZero,
  getTwoDifferentEmojis,
  getRandomIntIncludingZero,
} from './shared/types';

import type { RawMathProblem } from './shared/types';

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
  const mixedTargets = operation === OperationType.MIXED ? getMixedTargetCounts(count) : null;
  let remainingAdditions = mixedTargets?.additionCount ?? 0;
  let remainingSubtractions = mixedTargets?.subtractionCount ?? 0;

  while (problems.length < count && attempts < maxAttempts) {
    attempts += 1;
    let problem: RawMathProblem;
    const op =
      operation === OperationType.MIXED
        ? getNextMixedOperator(remainingAdditions, remainingSubtractions)
        : operation === OperationType.ADDITION
          ? '+'
          : '-';

    if (op === '+') {
      const a = getRandomIntIncludingZero(0, maxNumber);
      const b = getRandomIntIncludingZero(0, maxNumber - a);
      const { emoji1, emoji2 } = getTwoDifferentEmojis(emojis);
      problem = { op: '+', a, b, emoji1, emoji2 };
    } else {
      const a = getRandomIntIncludingZero(1, maxNumber);
      const b = getRandomIntIncludingZero(0, a);
      const { emoji1, emoji2 } = getSameEmojiPair(emojis);
      problem = { op: '-', a, b, emoji1, emoji2 };
    }

    if (excludeZeroProblems && problemContainsZero(problem)) {
      continue;
    }

    const problemKey = `${problem.op}_${problem.a}_${problem.b}`;

    if (!usedProblems?.has(problemKey)) {
      usedProblems?.add(problemKey);
      problems.push(problem);
      if (operation === OperationType.MIXED) {
        if (problem.op === '+') {
          remainingAdditions = Math.max(0, remainingAdditions - 1);
        } else {
          remainingSubtractions = Math.max(0, remainingSubtractions - 1);
        }
      }
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
  const mixedTargets = operation === OperationType.MIXED ? getMixedTargetCounts(count) : null;
  let remainingAdditions = mixedTargets?.additionCount ?? 0;
  let remainingSubtractions = mixedTargets?.subtractionCount ?? 0;

  while (problems.length < count && attempts < maxAttempts) {
    attempts += 1;
    let problem: RawMathProblem;
    const op =
      operation === OperationType.MIXED
        ? getNextMixedOperator(remainingAdditions, remainingSubtractions)
        : operation === OperationType.ADDITION
          ? '+'
          : '-';

    if (op === '+') {
      const maxResult = customRange.max;
      const minResult = Math.max(customRange.min, 0);
      const targetSum = getRandomInt(minResult, maxResult);

      const a = getRandomIntIncludingZero(0, targetSum);
      const b = targetSum - a;

      const { emoji1, emoji2 } = getTwoDifferentEmojis(emojis);
      problem = { op: '+', a, b, emoji1, emoji2 };
    } else {
      const a = getRandomIntIncludingZero(Math.max(customRange.min, 0), customRange.max);
      const b = getRandomIntIncludingZero(0, a);
      const { emoji1, emoji2 } = getSameEmojiPair(emojis);
      problem = { op: '-', a, b, emoji1, emoji2 };
    }

    if (excludeZeroProblems && problemContainsZero(problem)) {
      continue;
    }

    const problemKey = `${problem.op}-${problem.a}-${problem.b}`;
    if (!usedProblems?.has(problemKey)) {
      usedProblems?.add(problemKey);
      problems.push(problem);
      if (operation === OperationType.MIXED) {
        if (problem.op === '+') {
          remainingAdditions = Math.max(0, remainingAdditions - 1);
        } else {
          remainingSubtractions = Math.max(0, remainingSubtractions - 1);
        }
      }
    }
  }

  return problems;
}
