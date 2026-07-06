import type { CustomDifficultyRange } from 'src/types';

import { DifficultyLevel, MultiOperationMode } from 'src/types';

import { getRandomInt, getRandomEmoji, evaluateMultiOperation } from './shared/types';

import type { RawMathProblem } from './shared/types';

export function generateMultiOperationProblems(
  count: number,
  difficulty: DifficultyLevel,
  mode: MultiOperationMode,
  numberCount: number,
  emojis: string[],
  customDifficulty?: CustomDifficultyRange,
  usedProblems?: Set<string>,
  excludeZeroProblems: boolean = false
): RawMathProblem[] {
  let minNumber: number;
  let maxNumber: number;

  if (difficulty === DifficultyLevel.CUSTOM && customDifficulty) {
    minNumber = customDifficulty.min;
    maxNumber = customDifficulty.max;
  } else {
    minNumber = 1;
    maxNumber = difficulty;
  }

  const problemPool: RawMathProblem[] = [];
  const problemKeys = new Set<string>();

  const poolSize = Math.min(count * 5, 1000);
  let attempts = 0;
  const maxAttempts = Math.max(poolSize * 80, 2000);

  const isMulDivMode = mode === MultiOperationMode.CHAIN_MULTIPLICATION
    || mode === MultiOperationMode.CHAIN_DIVISION
    || mode === MultiOperationMode.MULT_DIV_MIXED_CHAIN
    || mode === MultiOperationMode.ALL_MIXED;

  while (problemPool.length < poolSize && attempts < maxAttempts) {
    attempts += 1;
    let numbers: number[];
    let operators: ('+' | '-' | '×' | '÷')[];

    if (mode === MultiOperationMode.CHAIN_ADDITION) {
      numbers = [];
      operators = [];

      const minTargetSum = numberCount * minNumber;
      const maxTargetSum = Math.min(Math.floor((maxNumber * numberCount) / 2), maxNumber);
      if (minTargetSum > maxTargetSum) continue;

      const targetSum = getRandomInt(minTargetSum, maxTargetSum);
      let remaining = targetSum;
      let invalid = false;

      for (let i = 0; i < numberCount - 1; i++) {
        const maxForThisNumber = Math.min(remaining - (numberCount - i - 1) * minNumber, maxNumber);
        const minForThisNumber = Math.max(minNumber, remaining - (numberCount - i - 1) * maxNumber);
        if (minForThisNumber > maxForThisNumber) { invalid = true; break; }
        const num = getRandomInt(minForThisNumber, maxForThisNumber);
        numbers.push(num);
        operators.push('+');
        remaining -= num;
      }

      if (invalid) continue;
      if (remaining < minNumber || remaining > maxNumber) continue;
      numbers.push(remaining);
    } else if (mode === MultiOperationMode.CHAIN_SUBTRACTION) {
      numbers = [];
      operators = [];

      const minFirstNum = Math.max(numberCount * 2, minNumber);
      if (minFirstNum > maxNumber) continue;

      const firstNum = getRandomInt(minFirstNum, maxNumber);
      numbers.push(firstNum);

      let remaining = firstNum;
      let invalid = false;
      for (let i = 1; i < numberCount; i++) {
        const maxForThisNumber = Math.min(remaining - (numberCount - i), Math.floor(maxNumber / 2));
        if (maxForThisNumber < 1) { invalid = true; break; }
        const num = getRandomInt(1, maxForThisNumber);
        numbers.push(num);
        operators.push('-');
        remaining -= num;
      }

      if (invalid) continue;
    } else if (mode === MultiOperationMode.MIXED_OPERATIONS) {
      numbers = [];
      operators = [];

      const mixedMaxOperand = Math.floor(maxNumber / 2);
      if (mixedMaxOperand < 1) continue;

      for (let i = 0; i < numberCount; i++) {
        numbers.push(getRandomInt(1, mixedMaxOperand));
      }

      for (let i = 0; i < numberCount - 1; i++) {
        operators.push(Math.random() > 0.5 ? '+' : '-');
      }

      let answer = numbers[0];
      for (let i = 1; i < numbers.length; i++) {
        answer = operators[i - 1] === '+' ? answer + numbers[i] : answer - numbers[i];
      }
      if (answer <= 0 || answer > maxNumber) continue;
    } else if (mode === MultiOperationMode.CHAIN_MULTIPLICATION) {
      numbers = [];
      operators = [];

      let product = 1;
      let invalid = false;
      for (let i = 0; i < numberCount; i++) {
        const maxForThis = i === 0 ? maxNumber : (product === 0 ? maxNumber : Math.min(Math.floor(maxNumber / product), maxNumber));
        if (maxForThis < 1) { invalid = true; break; }
        const num = getRandomInt(1, maxForThis);
        numbers.push(num);
        if (i < numberCount - 1) operators.push('×');
        product *= num;
      }
      if (invalid) continue;

      let finalResult = numbers[0];
      for (let i = 1; i < numbers.length; i++) finalResult *= numbers[i];
      if (finalResult > maxNumber) continue;
    } else if (mode === MultiOperationMode.CHAIN_DIVISION) {
      numbers = [];
      operators = Array(numberCount - 1).fill('÷');

      // Work backwards: start with a small final result, multiply up
      const finalResult = getRandomInt(1, Math.max(2, Math.floor(maxNumber / 4)));
      const divisors: number[] = [];
      let current = finalResult;
      let invalid = false;
      for (let i = 0; i < numberCount - 1; i++) {
        const maxDiv = Math.min(9, Math.floor(maxNumber / Math.max(current, 1)));
        if (maxDiv < 2) { invalid = true; break; }
        const div = getRandomInt(2, maxDiv);
        divisors.push(div);
        current *= div;
      }
      if (invalid || current > maxNumber * 3) continue;

      numbers = [current, ...divisors.reverse()];
    } else if (mode === MultiOperationMode.MULT_DIV_MIXED_CHAIN) {
      numbers = [];
      operators = [];

      const smallMax = Math.max(1, Math.floor(maxNumber / 3));
      for (let i = 0; i < numberCount; i++) {
        numbers.push(getRandomInt(1, smallMax));
      }

      for (let i = 0; i < numberCount - 1; i++) {
        operators.push(Math.random() > 0.5 ? '×' : '÷');
      }

      // Validate: all intermediate values integers, >= 0, result <= maxNumber
      const { intermediates, finalResult } = evaluateMultiOperation(numbers, operators);
      if (intermediates.some((v) => !Number.isInteger(v) || v < 0)) continue;
      if (finalResult < 0 || finalResult > maxNumber) continue;
    } else {
      // ALL_MIXED: all four operators
      numbers = [];
      operators = [];

      const smallMax = Math.max(1, Math.floor(maxNumber / 3));
      for (let i = 0; i < numberCount; i++) {
        numbers.push(getRandomInt(1, smallMax));
      }

      const allOps: ('+' | '-' | '×' | '÷')[] = ['+', '-', '×', '÷'];
      for (let i = 0; i < numberCount - 1; i++) {
        operators.push(allOps[Math.floor(Math.random() * allOps.length)]);
      }

      const { intermediates, finalResult } = evaluateMultiOperation(numbers, operators);
      if (intermediates.some((v) => !Number.isInteger(v) || v < 0)) continue;
      if (finalResult < 0 || finalResult > maxNumber) continue;
    }

    const { intermediates, finalResult } = evaluateMultiOperation(numbers, operators);
    if (intermediates.some((value) => value < 0) || finalResult < 0) continue;

    if (isMulDivMode && intermediates.some((v) => !Number.isInteger(v))) continue;

    if (
      excludeZeroProblems &&
      (numbers.some((value) => value === 0) ||
        intermediates.some((value) => value === 0) ||
        finalResult === 0)
    ) {
      continue;
    }

    const problemKey = `${numbers.join(',')}|${operators.join(',')}`;

    if (!problemKeys.has(problemKey) && !usedProblems?.has(problemKey)) {
      problemKeys.add(problemKey);

      const problemEmojis = numbers.map(() => getRandomEmoji(emojis));

      problemPool.push({
        op: operators[0],
        a: numbers[0],
        b: numbers[1],
        emoji1: problemEmojis[0],
        emoji2: problemEmojis[1],
        isMultiOperation: true,
        numbers,
        operators,
        emojis: problemEmojis,
      });
    }
  }

  const shuffled = problemPool.sort(() => Math.random() - 0.5);
  const selectedProblems = shuffled.slice(0, Math.min(count, problemPool.length));

  while (selectedProblems.length < count && problemPool.length > 0) {
    const seed = problemPool[getRandomInt(0, problemPool.length - 1)];
    selectedProblems.push({
      ...seed,
      numbers: seed.numbers ? [...seed.numbers] : seed.numbers,
      operators: seed.operators ? [...seed.operators] : seed.operators,
      emojis: seed.emojis ? [...seed.emojis] : seed.emojis,
    });
  }

  selectedProblems.forEach((problem) => {
    if (problem.numbers && problem.operators) {
      const problemKey = `${problem.numbers.join(',')}|${problem.operators.join('')}`;
      usedProblems?.add(problemKey);
    }
  });

  return selectedProblems;
}
