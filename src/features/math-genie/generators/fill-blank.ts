import type { CustomDifficultyRange } from 'src/types';

import { DisplayMode, OperationType, DifficultyLevel } from 'src/types';

import { getMixedTargetCounts, getNextMixedOperator } from './shared/mixed-balance';
import {
  getRandomInt,
  getSameEmojiPair,
  problemContainsZero,
  getTwoDifferentEmojis,
  getRandomIntIncludingZero,
} from './shared/types';

import type { RawMathProblem } from './shared/types';

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
  const mixedTargets = operation === OperationType.MIXED ? getMixedTargetCounts(count) : null;
  let remainingAdditions = mixedTargets?.additionCount ?? 0;
  let remainingSubtractions = mixedTargets?.subtractionCount ?? 0;

  if (difficulty === DifficultyLevel.CUSTOM && activeCustomDifficulty) {
    maxNumber = activeCustomDifficulty.max;
  } else {
    maxNumber = difficulty;
  }

  while (problems.length < count && attempts < maxAttempts) {
    attempts += 1;
    const blankPositions: Array<'first' | 'second' | 'result'> =
      displayMode === DisplayMode.EMOJI ? ['first', 'second'] : ['first', 'second', 'result'];
    const blankPosition = blankPositions[Math.floor(Math.random() * blankPositions.length)];
    const op =
      operation === OperationType.MIXED
        ? getNextMixedOperator(remainingAdditions, remainingSubtractions)
        : operation === OperationType.ADDITION
          ? '+'
          : '-';

    if (op === '+') {
      const maxResult = activeCustomDifficulty?.max ?? maxNumber;
      const minResult = Math.max(activeCustomDifficulty?.min ?? 2, 2);
      const result = getRandomInt(minResult, maxResult);
      let a: number;
      let b: number;

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

      const { emoji1, emoji2 } = getTwoDifferentEmojis(emojis);
      if (excludeZeroProblems && problemContainsZero({ op: '+', a, b, emoji1, emoji2 })) {
        continue;
      }

      const problemKey = `fill_+_${a}_${b}_${blankPosition}`;
      if (!usedProblems?.has(problemKey)) {
        usedProblems?.add(problemKey);
        problems.push({ op: '+', a, b, emoji1, emoji2, blankPosition });
        if (operation === OperationType.MIXED) {
          remainingAdditions = Math.max(0, remainingAdditions - 1);
        }
      }
    } else {
      let a: number;
      let b: number;

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

      const { emoji1, emoji2 } = getSameEmojiPair(emojis);
      if (excludeZeroProblems && problemContainsZero({ op: '-', a, b, emoji1, emoji2 })) {
        continue;
      }

      const problemKey = `fill_-_${a}_${b}_${blankPosition}`;
      if (!usedProblems?.has(problemKey)) {
        usedProblems?.add(problemKey);
        problems.push({ op: '-', a, b, emoji1, emoji2, blankPosition });
        if (operation === OperationType.MIXED) {
          remainingSubtractions = Math.max(0, remainingSubtractions - 1);
        }
      }
    }
  }

  return problems;
}
