// src/sections/math-genie/view/math-genie-view.tsx
import { v4 as uuidv4 } from 'uuid';
import React, { useState, useEffect, useRef, useCallback } from 'react';

import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, Paper, Alert, IconButton, Tooltip, LinearProgress } from '@mui/material';

import { DifficultyLevel, OperationType, DisplayMode, MathProblem, WorksheetConfig, CustomDifficultyRange, DifficultyRatios, ProblemType, SpecialPracticeType, MultiOperationMode, MultiOperationConfig } from 'src/types';

import WorksheetPreview from '../components/WorksheetPreview';
import WorksheetSettings from '../components/WorksheetSettings';

// Update the interface to match what the function expects
interface RawMathProblem {
  op: '+' | '-';
  a: number;
  b: number;
  emoji1: string;
  emoji2?: string;
  blankPosition?: 'first' | 'second' | 'result';
  equationText?: string;
  equationAnswerText?: string;
  // 多重运算相关字段
  isMultiOperation?: boolean;
  numbers?: number[];
  operators?: ('+' | '-')[];
  emojis?: string[];
}

// Theme-emoji mapping
const THEME_EMOJIS: Record<string, string[]> = {
  'fruits': ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍑', '🍍', '🥭', '🫐'],
  'animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'],
  'vehicles': ['🚗', '🚌', '🚲', '🛴', '🚀', '✈️', '🚁', '🛳️', '🚂', '🚜'],
  'sports': ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏸', '🏏'],
  'food': ['🍕', '🍔', '🌭', '🍟', '🍦', '🍩', '🍪', '🎂', '🍫', '🍿'],
  'nature': ['🌲', '🌳', '🌴', '🌵', '🌺', '🌸', '🌼', '🌻', '🍁', '🍀'],
  'weather': ['☀️', '⛅', '☁️', '🌧️', '⛈️', '🌩️', '❄️', '☃️', '🌪️', '🌈'],
  'emotions': ['😀', '😁', '😂', '🥲', '😊', '😇', '🥰', '😍', '🤩', '😎']
};

// Title suggestions by theme
const THEME_TITLES: Record<string, { en: string; zh: string }> = {
  'fruits': { en: 'Fruit Fun Math!', zh: '水果数学乐趣！' },
  'animals': { en: 'Animal Math Adventure', zh: '动物数学冒险' },
  'vehicles': { en: 'Vehicle Math Journey', zh: '交通工具数学之旅' },
  'sports': { en: 'Sports Math Challenge', zh: '运动数学挑战' },
  'food': { en: 'Yummy Food Math', zh: '美味食物数学' },
  'nature': { en: 'Nature Math Explorers', zh: '自然数学探索者' },
  'weather': { en: 'Weather Math Fun', zh: '天气数学乐趣' },
  'emotions': { en: 'Feelings Math Party', zh: '情感数学派对' },
  'default': { en: 'Awesome Math Worksheet', zh: '超级数学工作表' }
};

function getRandomEmoji(emojis: string[]): string {
  return emojis[Math.floor(Math.random() * emojis.length)];
}

function getTwoDifferentEmojis(emojis: string[]): { emoji1: string; emoji2: string } {
  if (emojis.length < 2) {
    return { emoji1: '⭐', emoji2: '🌟' };
  }
  
  const index1 = Math.floor(Math.random() * emojis.length);
  let index2 = Math.floor(Math.random() * emojis.length);
  while (index2 === index1) {
    index2 = Math.floor(Math.random() * emojis.length);
  }
  
  return { emoji1: emojis[index1], emoji2: emojis[index2] };
}

function getSameEmojiPair(emojis: string[]): { emoji1: string; emoji2: string } {
  if (!emojis.length) {
    return { emoji1: '⭐', emoji2: '⭐' };
  }

  const emoji = getRandomEmoji(emojis);
  return { emoji1: emoji, emoji2: emoji };
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomIntIncludingZero(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isChineseTheme(theme: string): boolean {
  return /[\u4e00-\u9fff]/.test(theme);
}

const getTextRowsPerPage = (columns: 2 | 3 | 4): number => {
  if (columns === 4) return 6;
  if (columns === 3) return 7;
  return 8;
};

const reorderProblemsByColumnPerPage = <T,>(
  problems: T[],
  columns: 2 | 3 | 4,
  rowsPerPage: number
): T[] => {
  const pageSize = columns * rowsPerPage;
  const reordered: T[] = [];

  for (let pageStart = 0; pageStart < problems.length; pageStart += pageSize) {
    const pageProblems = problems.slice(pageStart, pageStart + pageSize);

    for (let row = 0; row < rowsPerPage; row++) {
      for (let col = 0; col < columns; col++) {
        const index = col * rowsPerPage + row;
        if (index < pageProblems.length) {
          reordered.push(pageProblems[index]);
        }
      }
    }
  }

  return reordered;
};

const evaluateMultiOperation = (numbers: number[], operators: ('+' | '-')[]) => {
  const intermediates: number[] = [numbers[0]];
  let current = numbers[0];

  for (let i = 1; i < numbers.length; i++) {
    current = operators[i - 1] === '+' ? current + numbers[i] : current - numbers[i];
    intermediates.push(current);
  }

  return { intermediates, finalResult: current };
};

const problemContainsZero = (problem: RawMathProblem): boolean => {
  if (problem.isMultiOperation && problem.numbers && problem.operators) {
    const { intermediates, finalResult } = evaluateMultiOperation(problem.numbers, problem.operators);
    return problem.numbers.some((n) => n === 0) || intermediates.some((v) => v === 0) || finalResult === 0;
  }

  const result = problem.op === '+' ? problem.a + problem.b : problem.a - problem.b;
  return problem.a === 0 || problem.b === 0 || result === 0;
};

const getMixedTargetCounts = (count: number) => {
  const additionCount = Math.ceil(count / 2);
  const subtractionCount = count - additionCount;
  return { additionCount, subtractionCount };
};

const getNextMixedOperator = (remainingAdditions: number, remainingSubtractions: number): '+' | '-' => {
  if (remainingAdditions <= 0) return '-';
  if (remainingSubtractions <= 0) return '+';
  if (remainingAdditions === remainingSubtractions) {
    return Math.random() > 0.5 ? '+' : '-';
  }
  return remainingAdditions > remainingSubtractions ? '+' : '-';
};

const selectBalancedMixedProblems = (allProblems: RawMathProblem[], targetCount: number): RawMathProblem[] => {
  const additions = allProblems.filter((problem) => problem.op === '+').sort(() => Math.random() - 0.5);
  const subtractions = allProblems.filter((problem) => problem.op === '-').sort(() => Math.random() - 0.5);
  const { additionCount, subtractionCount } = getMixedTargetCounts(targetCount);

  const selected: RawMathProblem[] = [
    ...additions.slice(0, additionCount),
    ...subtractions.slice(0, subtractionCount),
  ];

  if (selected.length < targetCount) {
    const remaining = [
      ...additions.slice(additionCount),
      ...subtractions.slice(subtractionCount),
    ].sort(() => Math.random() - 0.5);

    selected.push(...remaining.slice(0, targetCount - selected.length));
  }

  return selected.sort(() => Math.random() - 0.5);
};

// Helper function to generate problems for a specific difficulty level
const generateProblemsForDifficulty = (
  count: number,
  difficulty: DifficultyLevel,
  operation: OperationType,
  emojis: string[],
  usedProblems?: Set<string>,
  customDifficulty?: CustomDifficultyRange,
  excludeZeroProblems: boolean = false
): RawMathProblem[] => {
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
    const op = (operation === OperationType.MIXED)
      ? getNextMixedOperator(remainingAdditions, remainingSubtractions)
      : (operation === OperationType.ADDITION ? '+' : '-');
    
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

    // Create a unique key to avoid duplicate problems
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
};

// Helper function to generate problems for custom range
const generateProblemsForCustomRange = (
  count: number,
  customRange: CustomDifficultyRange,
  operation: OperationType,
  emojis: string[],
  usedProblems?: Set<string>,
  excludeZeroProblems: boolean = false
): RawMathProblem[] => {
  const problems: RawMathProblem[] = [];
  let attempts = 0;
  const maxAttempts = Math.max(count * 40, 400);
  const mixedTargets = operation === OperationType.MIXED ? getMixedTargetCounts(count) : null;
  let remainingAdditions = mixedTargets?.additionCount ?? 0;
  let remainingSubtractions = mixedTargets?.subtractionCount ?? 0;
  
  while (problems.length < count && attempts < maxAttempts) {
    attempts += 1;
    let problem: RawMathProblem;
    const op = operation === OperationType.MIXED
      ? getNextMixedOperator(remainingAdditions, remainingSubtractions)
      : (operation === OperationType.ADDITION ? '+' : '-');
    
    if (op === '+') {
      // Addition: ensure the largest number is within custom range
      // For addition, the result (sum) should be in the custom range
      const maxResult = customRange.max;
      const minResult = Math.max(customRange.min, 0); // Allow sum to be 0
      const targetSum = getRandomInt(minResult, maxResult);
      
      // Generate a and b such that their sum equals targetSum
      const a = getRandomIntIncludingZero(0, targetSum);
      const b = targetSum - a;
      
      const { emoji1, emoji2 } = getTwoDifferentEmojis(emojis);
      problem = { op: '+', a, b, emoji1, emoji2 };
    } else {
      // Subtraction: ensure the largest number (a) is within custom range
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
};

// Helper function to generate multi-operation problems
const generateMultiOperationProblems = (
  count: number,
  difficulty: DifficultyLevel,
  mode: MultiOperationMode,
  numberCount: number,
  emojis: string[],
  customDifficulty?: CustomDifficultyRange,
  usedProblems?: Set<string>,
  excludeZeroProblems: boolean = false
): RawMathProblem[] => {
  let minNumber: number;
  let maxNumber: number;
  
  if (difficulty === DifficultyLevel.CUSTOM && customDifficulty) {
    minNumber = customDifficulty.min;
    maxNumber = customDifficulty.max;
  } else {
    minNumber = 1;
    maxNumber = difficulty;
  }
  
  // Pre-generate a large pool of unique problems to avoid duplicates
  const problemPool: RawMathProblem[] = [];
  const problemKeys = new Set<string>();
  
  // Generate a diverse pool based on mode
  const poolSize = Math.min(count * 5, 1000); // Generate 5x more than needed, max 1000
  let attempts = 0;
  const maxAttempts = Math.max(poolSize * 80, 2000);
  
  while (problemPool.length < poolSize && attempts < maxAttempts) {
    attempts += 1;
    let numbers: number[];
    let operators: ('+' | '-')[];
    let answer: number;
    
    if (mode === MultiOperationMode.CHAIN_ADDITION) {
      // 连加模式: 生成numberCount个数字，所有运算符都是+
      numbers = [];
      operators = [];
      
      // 生成数字，确保总和在合理范围内，且每个数字都在[minNumber, maxNumber]范围内
      const minTargetSum = numberCount * minNumber;
      const maxTargetSum = Math.min(Math.floor((maxNumber * numberCount) / 2), maxNumber);
      if (minTargetSum > maxTargetSum) {
        continue;
      }

      const targetSum = getRandomInt(minTargetSum, maxTargetSum);
      let remaining = targetSum;
      let invalid = false;
      
      for (let i = 0; i < numberCount - 1; i++) {
        const maxForThisNumber = Math.min(remaining - (numberCount - i - 1) * minNumber, maxNumber);
        const minForThisNumber = Math.max(minNumber, remaining - (numberCount - i - 1) * maxNumber);

        if (minForThisNumber > maxForThisNumber) {
          invalid = true;
          break;
        }

        const num = getRandomInt(minForThisNumber, maxForThisNumber);
        numbers.push(num);
        operators.push('+');
        remaining -= num;
      }

      if (invalid) {
        continue;
      }

      // 确保最后一个数字也在范围内
      if (remaining < minNumber || remaining > maxNumber) {
        continue;
      }

      const lastNum = remaining;
      numbers.push(lastNum);
      answer = targetSum;
      
    } else if (mode === MultiOperationMode.CHAIN_SUBTRACTION) {
      // 连减模式: 生成numberCount个数字，所有运算符都是-
      numbers = [];
      operators = [];
      
      // 第一个数字要足够大
      const minFirstNum = Math.max(numberCount * 2, minNumber);
      if (minFirstNum > maxNumber) {
        continue;
      }

      const firstNum = getRandomInt(minFirstNum, maxNumber);
      numbers.push(firstNum);
      
      let remaining = firstNum;
      let invalid = false;
      for (let i = 1; i < numberCount; i++) {
        const maxForThisNumber = Math.min(remaining - (numberCount - i), Math.floor(maxNumber / 2));
        if (maxForThisNumber < 1) {
          invalid = true;
          break;
        }

        const num = getRandomInt(1, maxForThisNumber);
        numbers.push(num);
        operators.push('-');
        remaining -= num;
      }

      if (invalid) {
        continue;
      }

      answer = remaining;
      
    } else {
      // 混合运算模式
      numbers = [];
      operators = [];
      
      // 生成数字
      const mixedMaxOperand = Math.floor(maxNumber / 2);
      if (mixedMaxOperand < 1) {
        continue;
      }

      for (let i = 0; i < numberCount; i++) {
        numbers.push(getRandomInt(1, mixedMaxOperand));
      }
      
      // 生成运算符
      for (let i = 0; i < numberCount - 1; i++) {
        operators.push(Math.random() > 0.5 ? '+' : '-');
      }
      
      // 计算答案
      answer = numbers[0];
      for (let i = 1; i < numbers.length; i++) {
        if (operators[i - 1] === '+') {
          answer += numbers[i];
        } else {
          answer -= numbers[i];
        }
      }
      
      // 确保答案为正数且在合理范围内
      if (answer <= 0 || answer > maxNumber) {
        continue; // 跳过这个问题，重新生成
      }
    }

    const { intermediates, finalResult } = evaluateMultiOperation(numbers, operators);
    if (intermediates.some((value) => value < 0) || finalResult < 0) {
      continue;
    }

    if (excludeZeroProblems && (numbers.some((value) => value === 0) || intermediates.some((value) => value === 0) || finalResult === 0)) {
      continue;
    }
    
    // 创建唯一标识
    const problemKey = numbers.join(',') + '|' + operators.join(',');
    
    // 检查是否已经存在于全局usedProblems或当前pool中
    if (!problemKeys.has(problemKey) && !usedProblems?.has(problemKey)) {
      problemKeys.add(problemKey);
      
      // 生成emoji
      const problemEmojis = numbers.map(() => getRandomEmoji(emojis));
      
      problemPool.push({
        op: operators[0], // 使用第一个运算符作为主要运算符
        a: numbers[0],
        b: numbers[1],
        emoji1: problemEmojis[0],
        emoji2: problemEmojis[1],
        isMultiOperation: true,
        numbers,
        operators,
        emojis: problemEmojis
      });
    }
  }
  
  // Shuffle the pool and select required number of problems
  const shuffled = problemPool.sort(() => Math.random() - 0.5);
  const selectedProblems = shuffled.slice(0, Math.min(count, problemPool.length));

  // Backfill when unique pool is insufficient to avoid empty/undersized results in strict constraints
  while (selectedProblems.length < count && problemPool.length > 0) {
    const seed = problemPool[getRandomInt(0, problemPool.length - 1)];
    selectedProblems.push({
      ...seed,
      numbers: seed.numbers ? [...seed.numbers] : seed.numbers,
      operators: seed.operators ? [...seed.operators] : seed.operators,
      emojis: seed.emojis ? [...seed.emojis] : seed.emojis
    });
  }
  
  // Add selected problems to the global usedProblems set
  selectedProblems.forEach(problem => {
    if (problem.numbers && problem.operators) {
      const problemKey = problem.numbers.join(',') + '|' + problem.operators.join('');
      usedProblems?.add(problemKey);
    }
  });
  
  return selectedProblems;
};

const generateFillBlankProblems = (
  count: number,
  difficulty: DifficultyLevel,
  operation: OperationType,
  emojis: string[],
  customDifficulty?: CustomDifficultyRange,
  usedProblems?: Set<string>,
  excludeZeroProblems: boolean = false,
  displayMode: DisplayMode = DisplayMode.TEXT
): Array<{op: '+' | '-', a: number, b: number, emoji1: string, emoji2?: string, blankPosition: 'first' | 'second' | 'result'}> => {
  const problems: Array<{op: '+' | '-', a: number, b: number, emoji1: string, emoji2?: string, blankPosition: 'first' | 'second' | 'result'}> = [];
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
    const blankPositions: Array<'first' | 'second' | 'result'> = displayMode === DisplayMode.EMOJI
      ? ['first', 'second']
      : ['first', 'second', 'result'];
    const blankPosition = blankPositions[Math.floor(Math.random() * blankPositions.length)];
    const op = operation === OperationType.MIXED
      ? getNextMixedOperator(remainingAdditions, remainingSubtractions)
      : (operation === OperationType.ADDITION ? '+' : '-');
    
    if (op === '+') {
      // Addition: a + b = result, ensure result is within custom range
      const maxResult = activeCustomDifficulty?.max ?? maxNumber;
      const minResult = Math.max(activeCustomDifficulty?.min ?? 2, 2);
      const result = getRandomInt(minResult, maxResult);
      let a: number, b: number;
      
      if (blankPosition === 'first') {
        // _ + b = result
        b = getRandomIntIncludingZero(0, Math.min(result, maxNumber));
        a = result - b;
      } else if (blankPosition === 'second') {
        // a + _ = result
        a = getRandomIntIncludingZero(0, Math.min(result, maxNumber));
        b = result - a;
      } else {
        // a + b = _
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
      // Subtraction: a - b = result, ensure a is within custom range
      let a: number, b: number;
      
      const maxA = activeCustomDifficulty?.max ?? maxNumber;
      const minA = Math.max(activeCustomDifficulty?.min ?? 2, 2);
      
      if (blankPosition === 'first') {
        // _ - b = result (so a = result + b)
        b = getRandomIntIncludingZero(0, Math.min(maxA, maxA));
        const result = getRandomIntIncludingZero(0, maxA - b);
        a = result + b;
      } else if (blankPosition === 'second') {
        // a - _ = result (so b = a - result)
        a = getRandomIntIncludingZero(minA, maxA);
        const result = getRandomIntIncludingZero(0, a);
        b = a - result;
      } else {
        // a - b = _
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
};

const generateZeroDrillProblems = (
  count: number,
  difficulty: DifficultyLevel,
  operation: OperationType,
  emojis: string[],
  customDifficulty?: CustomDifficultyRange,
  usedProblems?: Set<string>,
  mode: ProblemType = ProblemType.FILL_BLANK,
  excludeZeroProblems: boolean = false
): RawMathProblem[] => {
  if (excludeZeroProblems) {
    return [];
  }

  const problems: RawMathProblem[] = [];
  const maxNumber = difficulty === DifficultyLevel.CUSTOM && customDifficulty
    ? customDifficulty.max
    : difficulty;
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

    const zeroRole = ['first', 'second', 'result'][getRandomIntIncludingZero(0, 2)] as 'first' | 'second' | 'result';
    const blankPosition: 'first' | 'second' | 'result' = mode === ProblemType.FILL_BLANK
      ? ['first', 'second', 'result'][getRandomIntIncludingZero(0, 2)] as 'first' | 'second' | 'result'
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
};

const generateFactFamilyProblems = (
  count: number,
  difficulty: DifficultyLevel,
  emojis: string[],
  customDifficulty?: CustomDifficultyRange,
  usedFamilies?: Set<string>,
  mode: ProblemType = ProblemType.FILL_BLANK,
  excludeZeroProblems: boolean = false
): RawMathProblem[] => {
  const problems: RawMathProblem[] = [];
  const maxNumber = difficulty === DifficultyLevel.CUSTOM && customDifficulty
    ? customDifficulty.max
    : difficulty;
  const minNumber = difficulty === DifficultyLevel.CUSTOM && customDifficulty
    ? Math.max(0, customDifficulty.min)
    : 0;

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
    const nextBlankPosition = () => blankPositions[getRandomIntIncludingZero(0, blankPositions.length - 1)];
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
};

const generateMathProblems = async (
  theme: string,
  difficulty: DifficultyLevel,
  operation: OperationType,
  count: number,
  customDifficulty?: CustomDifficultyRange,
  difficultyRatios?: DifficultyRatios,
  problemType: ProblemType = ProblemType.STANDARD,
  specialPracticeType: SpecialPracticeType = SpecialPracticeType.NONE,
  multiOperationConfig?: MultiOperationConfig,
  excludeZeroProblems: boolean = false,
  displayMode: DisplayMode = DisplayMode.TEXT
): Promise<{ problems: RawMathProblem[], titleSuggestion: string }> => {
  try {
    const activeCustomDifficulty = difficulty === DifficultyLevel.CUSTOM ? customDifficulty : undefined;
    // Check if this is multi-operation mode
    if (operation === OperationType.MULTI_OPERATIONS && multiOperationConfig) {
      // Get emojis for theme
      const themeKey = theme.toLowerCase();
      const emojis = THEME_EMOJIS[themeKey] || ['⭐', '🌟', '✨', '💫', '🪐', '🌠', '🔭', '🛸'];

      // Get title
      const titleInfo = THEME_TITLES[themeKey] || THEME_TITLES.default;
      const titleSuggestion = isChineseTheme(theme) ? titleInfo.zh : titleInfo.en;

      // Generate multi-operation problems
      const multiProblems = generateMultiOperationProblems(
        count,
        difficulty,
        multiOperationConfig.mode,
        multiOperationConfig.numberCount,
        emojis,
        activeCustomDifficulty,
        undefined,
        excludeZeroProblems
      );

      return { problems: multiProblems, titleSuggestion };
    }

    // Determine the max number based on difficulty or custom range
    let maxNumber: number;
    if (difficulty === DifficultyLevel.CUSTOM && activeCustomDifficulty) {
      maxNumber = activeCustomDifficulty.max;
    } else {
      maxNumber = difficulty;
    }

    const problems: RawMathProblem[] = [];

    // Get emojis for theme
    const themeKey = theme.toLowerCase();
    const emojis = THEME_EMOJIS[themeKey] || ['⭐', '🌟', '✨', '💫', '🪐', '🌠', '🔭', '🛸'];

    // Get title
    const titleInfo = THEME_TITLES[themeKey] || THEME_TITLES.default;
    const titleSuggestion = isChineseTheme(theme) ? titleInfo.zh : titleInfo.en;

    if (specialPracticeType === SpecialPracticeType.ZERO_DRILL) {
      const usedProblems = new Set<string>();
      const zeroProblems = generateZeroDrillProblems(
        count,
        difficulty,
        operation === OperationType.MULTI_OPERATIONS ? OperationType.MIXED : operation,
        emojis,
        activeCustomDifficulty,
        usedProblems,
        problemType,
        excludeZeroProblems
      );
      return { problems: zeroProblems, titleSuggestion };
    }

    if (specialPracticeType === SpecialPracticeType.FACT_FAMILY) {
      const usedFamilies = new Set<string>();
      const familyProblems = generateFactFamilyProblems(
        count,
        difficulty,
        emojis,
        activeCustomDifficulty,
        usedFamilies,
        problemType,
        excludeZeroProblems
      );
      return { problems: familyProblems, titleSuggestion };
    }

    // If problem type is fill_blank, generate fill-in-the-blank problems
    if (problemType === ProblemType.FILL_BLANK) {
      if (difficultyRatios) {
        const total = difficultyRatios.easy + difficultyRatios.medium + difficultyRatios.hard + difficultyRatios.custom;

        if (total === 100) {
          // Calculate number of problems for each difficulty
          const easyCount = Math.round(count * difficultyRatios.easy / 100);
          const mediumCount = Math.round(count * difficultyRatios.medium / 100);
          const hardCount = Math.round(count * difficultyRatios.hard / 100);
          const customCount = count - easyCount - mediumCount - hardCount; // Ensure total equals count

          // Generate problems for each difficulty in order: easy -> medium -> hard -> custom
          const orderedProblems: RawMathProblem[] = [];
          const usedProblems = new Set<string>();

          if (easyCount > 0) {
            const easyProblems = generateFillBlankProblems(easyCount, DifficultyLevel.EASY, operation, emojis, undefined, usedProblems, excludeZeroProblems, displayMode);
            orderedProblems.push(...easyProblems);
          }

          if (mediumCount > 0) {
            const mediumProblems = generateFillBlankProblems(mediumCount, DifficultyLevel.MEDIUM, operation, emojis, undefined, usedProblems, excludeZeroProblems, displayMode);
            orderedProblems.push(...mediumProblems);
          }

          if (hardCount > 0) {
            const hardProblems = generateFillBlankProblems(hardCount, DifficultyLevel.HARD, operation, emojis, undefined, usedProblems, excludeZeroProblems, displayMode);
            orderedProblems.push(...hardProblems);
          }

          if (customCount > 0 && activeCustomDifficulty) {
            const customProblems = generateFillBlankProblems(customCount, DifficultyLevel.CUSTOM, operation, emojis, activeCustomDifficulty, usedProblems, excludeZeroProblems, displayMode);
            orderedProblems.push(...customProblems);
          }

          return { problems: orderedProblems, titleSuggestion };
        }
      } else {
        // Single difficulty mode for fill blank problems
        const fillBlankProblems = generateFillBlankProblems(count, difficulty, operation, emojis, activeCustomDifficulty, undefined, excludeZeroProblems, displayMode);
        return { problems: fillBlankProblems, titleSuggestion };
      }
    }

    // If difficulty ratios are provided, generate problems according to ratios
    if (difficultyRatios) {
      const total = difficultyRatios.easy + difficultyRatios.medium + difficultyRatios.hard + difficultyRatios.custom;

      if (total === 100) {
        // Calculate number of problems for each difficulty
        const easyCount = Math.round(count * difficultyRatios.easy / 100);
        const mediumCount = Math.round(count * difficultyRatios.medium / 100);
        const hardCount = Math.round(count * difficultyRatios.hard / 100);
        const customCount = count - easyCount - mediumCount - hardCount; // Ensure total equals count

        // Generate problems for each difficulty in order: easy -> medium -> hard -> custom
        const orderedProblems: RawMathProblem[] = [];
        const usedProblems = new Set<string>();

        if (easyCount > 0) {
          const easyProblems = generateProblemsForDifficulty(easyCount, DifficultyLevel.EASY, operation, emojis, usedProblems, undefined, excludeZeroProblems);
          orderedProblems.push(...easyProblems);
        }
        
        if (mediumCount > 0) {
          const mediumProblems = generateProblemsForDifficulty(mediumCount, DifficultyLevel.MEDIUM, operation, emojis, usedProblems, undefined, excludeZeroProblems);
          orderedProblems.push(...mediumProblems);
        }
        
        if (hardCount > 0) {
          const hardProblems = generateProblemsForDifficulty(hardCount, DifficultyLevel.HARD, operation, emojis, usedProblems, undefined, excludeZeroProblems);
          orderedProblems.push(...hardProblems);
        }
        
        if (customCount > 0 && customDifficulty) {
          const customProblems = generateProblemsForCustomRange(customCount, customDifficulty, operation, emojis, usedProblems, excludeZeroProblems);
          orderedProblems.push(...customProblems);
        }
        
        return { problems: orderedProblems, titleSuggestion };
      }
    }
    
    // Fallback to original logic if no ratios or invalid total
    // Calculate maximum possible unique problems to prevent infinite loops
    const maxUniqueProblems = calculateMaxUniqueProblems(maxNumber, operation);
    const targetCount = Math.min(count, maxUniqueProblems);
    
    // Pre-generate all possible problems for better performance
    const allPossibleProblems = generateAllPossibleProblems(maxNumber, operation, emojis, activeCustomDifficulty, excludeZeroProblems);

    if (operation === OperationType.MIXED) {
      problems.push(...selectBalancedMixedProblems(allPossibleProblems, targetCount));
    } else {
      // Shuffle and take required number
      const shuffled = allPossibleProblems.sort(() => Math.random() - 0.5);

      for (let i = 0; i < targetCount; i++) {
        if (shuffled[i]) {
          problems.push(shuffled[i]);
        }
      }
    }
    
    // If we still need more problems (very rare case), generate with duplicates
    while (problems.length < count && problems.length < 100) { // Safety limit
      let fallbackOperation = operation;
      if (operation === OperationType.MIXED) {
        const { additionCount } = getMixedTargetCounts(count);
        const currentAdditions = problems.filter((p) => p.op === '+').length;
        fallbackOperation = currentAdditions < additionCount ? OperationType.ADDITION : OperationType.SUBTRACTION;
      }

      const problem = generateRandomProblem(maxNumber, fallbackOperation, emojis, activeCustomDifficulty, excludeZeroProblems);
      problems.push(problem);
    }
    
    return { problems, titleSuggestion };
    
  } catch (error) {
    console.error("Error generating math problems:", error);
    // Fallback problems
    return {
      problems: Array.from({ length: Math.min(count, 20) }).map((_, i) => ({
        op: '+' as const,
        a: Math.floor(Math.random() * 5) + 1,
        b: Math.floor(Math.random() * 4) + 1,
        emoji1: '⭐',
        emoji2: '🌟'
      })),
      titleSuggestion: isChineseTheme(theme) ? "数学练习" : "Math Worksheet"
    };
  }
};

// Helper function to calculate maximum unique problems
const calculateMaxUniqueProblems = (maxNumber: number, operation: OperationType): number => {
  if (operation === OperationType.ADDITION) {
    // For addition: a + b where a, b >= 0 and a + b <= maxNumber
    let count = 0;
    for (let a = 0; a <= maxNumber; a++) {
      for (let b = 0; b <= maxNumber - a; b++) {
        count++;
      }
    }
    return count;
  } else if (operation === OperationType.SUBTRACTION) {
    // For subtraction: a - b where a >= b >= 0 and a <= maxNumber
    let count = 0;
    for (let a = 0; a <= maxNumber; a++) {
      for (let b = 0; b <= a; b++) {
        count++;
      }
    }
    return count;
  } else {
    // Mixed: combination of both
    return calculateMaxUniqueProblems(maxNumber, OperationType.ADDITION) + 
           calculateMaxUniqueProblems(maxNumber, OperationType.SUBTRACTION);
  }
};

// Helper function to generate all possible problems
const generateAllPossibleProblems = (
  maxNumber: number, 
  operation: OperationType, 
  emojis: string[],
  customDifficulty?: CustomDifficultyRange,
  excludeZeroProblems: boolean = false
): RawMathProblem[] => {
  const problems: RawMathProblem[] = [];
  
  // For custom difficulty, we need to respect the range
  const actualMax = customDifficulty ? customDifficulty.max : maxNumber;
  const actualMin = customDifficulty ? customDifficulty.min : 1;
  
  if (operation === OperationType.ADDITION || operation === OperationType.MIXED) {
    if (customDifficulty) {
      // For custom range, generate addition problems where sum is in range
      for (let sum = Math.max(0, actualMin); sum <= actualMax; sum++) {
        for (let a = 0; a <= sum; a++) {
          const b = sum - a;
          const { emoji1, emoji2 } = getTwoDifferentEmojis(emojis);
          const problem = { op: '+' as const, a, b, emoji1, emoji2 };
          if (!excludeZeroProblems || !problemContainsZero(problem)) {
            problems.push(problem);
          }
        }
      }
    } else {
      // For standard difficulty, use original logic including 0
      for (let a = 0; a <= maxNumber; a++) {
        for (let b = 0; b <= maxNumber - a; b++) {
          const { emoji1, emoji2 } = getTwoDifferentEmojis(emojis);
          const problem = { op: '+' as const, a, b, emoji1, emoji2 };
          if (!excludeZeroProblems || !problemContainsZero(problem)) {
            problems.push(problem);
          }
        }
      }
    }
  }
  
  if (operation === OperationType.SUBTRACTION || operation === OperationType.MIXED) {
    if (customDifficulty) {
      // For custom range, ensure a is in range and b <= a
      for (let a = Math.max(0, actualMin); a <= actualMax; a++) {
        for (let b = 0; b <= a; b++) {
          const { emoji1, emoji2 } = getSameEmojiPair(emojis);
          const problem = { op: '-' as const, a, b, emoji1, emoji2 };
          if (!excludeZeroProblems || !problemContainsZero(problem)) {
            problems.push(problem);
          }
        }
      }
    } else {
      // For standard difficulty, use original logic including 0
      for (let a = 0; a <= maxNumber; a++) {
        for (let b = 0; b <= a; b++) {
          const { emoji1, emoji2 } = getSameEmojiPair(emojis);
          const problem = { op: '-' as const, a, b, emoji1, emoji2 };
          if (!excludeZeroProblems || !problemContainsZero(problem)) {
            problems.push(problem);
          }
        }
      }
    }
  }
  
  return problems;
};

// Helper function to generate random problem
const generateRandomProblem = (
  maxNumber: number, 
  operation: OperationType, 
  emojis: string[],
  customDifficulty?: CustomDifficultyRange,
  excludeZeroProblems: boolean = false
): RawMathProblem => {
  const op = (operation === OperationType.MIXED) 
    ? (Math.random() > 0.5 ? '+' : '-')
    : (operation === OperationType.ADDITION ? '+' : '-');
  
  if (op === '+') {
    if (customDifficulty) {
      // For custom range, ensure sum is in range
      const maxSum = customDifficulty.max;
      const minSum = Math.max(customDifficulty.min, 0);
      const targetSum = getRandomInt(minSum, maxSum);
      const a = getRandomIntIncludingZero(0, targetSum);
      const b = targetSum - a;
      const { emoji1, emoji2 } = getTwoDifferentEmojis(emojis);
      const problem = { op: '+' as const, a, b, emoji1, emoji2 };
      if (excludeZeroProblems && problemContainsZero(problem)) {
        return generateRandomProblem(maxNumber, operation, emojis, customDifficulty, excludeZeroProblems);
      }
      return problem;
    } else {
      const a = getRandomIntIncludingZero(0, maxNumber);
      const b = getRandomIntIncludingZero(0, maxNumber - a);
      const { emoji1, emoji2 } = getTwoDifferentEmojis(emojis);
      const problem = { op: '+' as const, a, b, emoji1, emoji2 };
      if (excludeZeroProblems && problemContainsZero(problem)) {
        return generateRandomProblem(maxNumber, operation, emojis, customDifficulty, excludeZeroProblems);
      }
      return problem;
    }
  } else {
    if (customDifficulty) {
      // For custom range, ensure a is in range
      const a = getRandomIntIncludingZero(Math.max(customDifficulty.min, 0), customDifficulty.max);
      const b = getRandomIntIncludingZero(0, a);
      const { emoji1, emoji2 } = getSameEmojiPair(emojis);
      const problem = { op: '-' as const, a, b, emoji1, emoji2 };
      if (excludeZeroProblems && problemContainsZero(problem)) {
        return generateRandomProblem(maxNumber, operation, emojis, customDifficulty, excludeZeroProblems);
      }
      return problem;
    } else {
      const a = getRandomIntIncludingZero(0, maxNumber);
      const b = getRandomIntIncludingZero(0, a);
      const { emoji1, emoji2 } = getSameEmojiPair(emojis);
      const problem = { op: '-' as const, a, b, emoji1, emoji2 };
      if (excludeZeroProblems && problemContainsZero(problem)) {
        return generateRandomProblem(maxNumber, operation, emojis, customDifficulty, excludeZeroProblems);
      }
      return problem;
    }
  }
};

export const MathGenieView: React.FC = () => {
  const [config, setConfig] = useState<WorksheetConfig>({
    theme: 'Animals 🐶',
    difficulty: DifficultyLevel.EASY,
    operation: OperationType.ADDITION,
    count: 1,
    textColumns: 2,
    title: 'Fun Math Time!',
    showAnswers: false, 
    displayMode: DisplayMode.TEXT, 
    customDifficulty: {
      min: 1,
      max: 15,
    },
    difficultyRatios: {
      easy: 20,
      medium: 50,
      hard: 20,
      custom: 10,
    },
    problemType: ProblemType.STANDARD,
    specialPracticeType: SpecialPracticeType.NONE,
    multiOperationConfig: {
      mode: MultiOperationMode.CHAIN_ADDITION,
      numberCount: 3
    }
  });

  const [customDifficulty, setCustomDifficulty] = useState<CustomDifficultyRange>({
    min: 1,
    max: 15,
  });

  const [difficultyRatios, setDifficultyRatios] = useState<DifficultyRatios>({
    easy: 20,
    medium: 50,
    hard: 20,
    custom: 10,
  });

  const [useMixMode, setUseMixMode] = useState(false);

  const [multiOperationConfig, setMultiOperationConfig] = useState<MultiOperationConfig>({
    mode: MultiOperationMode.CHAIN_ADDITION,
    numberCount: 3
  });
  const [excludeZeroProblems, setExcludeZeroProblems] = useState(false);

  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [autoPreview, setAutoPreview] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const hasMounted = useRef(false);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setGenerateProgress(20);
    setError(null);
    try {
      const textColumns = config.textColumns || 2;
      const problemsPerTextPage = textColumns * getTextRowsPerPage(textColumns);
      const EMOJI_PROBLEMS_PER_PAGE = 6;
      const targetProblemCount =
        config.displayMode === DisplayMode.TEXT
          ? config.count * problemsPerTextPage
          : config.count * EMOJI_PROBLEMS_PER_PAGE;

      const response = await generateMathProblems(
        config.theme,
        config.difficulty,
        config.operation,
        targetProblemCount,
        customDifficulty,
        useMixMode ? difficultyRatios : undefined,
        config.problemType,
        config.specialPracticeType,
        config.operation === OperationType.MULTI_OPERATIONS ? multiOperationConfig : undefined,
        excludeZeroProblems,
        config.displayMode
      );

      const shouldUseVerticalFactFamilyOrder =
        config.displayMode === DisplayMode.TEXT &&
        config.specialPracticeType === SpecialPracticeType.FACT_FAMILY;

      const orderedRawProblems = shouldUseVerticalFactFamilyOrder
        ? reorderProblemsByColumnPerPage(response.problems, textColumns, getTextRowsPerPage(textColumns))
        : response.problems;
      
      const newProblems: MathProblem[] = orderedRawProblems.map(p => {
        const blankPosition = p.blankPosition;
        
        return {
          id: uuidv4(),
          operation: p.op,
          num1: p.a,
          num2: p.b,
          emoji1: p.emoji1,
          emoji2: (p as any).emoji2 || p.emoji1, // Use emoji1 as fallback for emoji2
          answer: p.op === '+' ? p.a + p.b : p.a - p.b,
          problemType: config.problemType,
          blankPosition,
          equationText: (p as any).equationText,
          // 多重运算相关字段
          isMultiOperation: (p as any).isMultiOperation || false,
          numbers: (p as any).numbers,
          operators: (p as any).operators,
          emojis: (p as any).emojis
        };
      });

      setGenerateProgress(80);
      setProblems(newProblems);
      if (response.titleSuggestion) {
        setConfig(prev => ({ ...prev, title: response.titleSuggestion }));
      }
      setGenerateProgress(100);
      setTimeout(() => { setGenerateProgress(0); }, 1500);
    } catch (err) {
      console.error("Failed to generate", err);
      setError('Failed to generate worksheet. Please try again.');
      setGenerateProgress(0);
    } finally {
      setIsGenerating(false);
    }
  }, [config.theme, config.difficulty, config.operation, config.count, config.displayMode, config.textColumns, config.problemType, config.specialPracticeType, customDifficulty, difficultyRatios, useMixMode, multiOperationConfig, excludeZeroProblems]);

  // Generate initial preview on component mount (once only)
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track previous display mode to avoid infinite loops
  const prevDisplayMode = useRef(config.displayMode);

  // Auto-generate preview when config changes (only if autoPreview enabled, skip initial mount)
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (hasMounted.current && autoPreview) {
      const isComplexConfig =
        config.operation === OperationType.MULTI_OPERATIONS ||
        config.difficulty === DifficultyLevel.CUSTOM ||
        config.count > 32;
      const debounceMs = isComplexConfig ? 500 : 200;
      timeoutId = setTimeout(() => {
        if (!isGenerating && config.count > 0) {
          handleGenerate();
        }
      }, debounceMs);
    }
    return () => clearTimeout(timeoutId);
  }, [handleGenerate, autoPreview]); // Use handleGenerate as dependency

  // Adjust count when display mode changes (both modes now use page count 1-10)
  useEffect(() => {
    if (prevDisplayMode.current !== config.displayMode) {
      const validCount = Math.max(1, Math.min(10, Math.round(config.count)));
      if (validCount !== config.count) {
        setConfig(prev => ({ ...prev, count: validCount }));
      }
      prevDisplayMode.current = config.displayMode;
    }
  }, [config.displayMode, config.count]);

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        height: '100vh',
        backgroundColor: 'grey.50',
        overflow: 'hidden',
        '@media print': {
          backgroundColor: 'white',
          overflow: 'visible',
          height: 'auto',
          display: 'block',
        },
      }}
    >
      {/* Sidebar - Hidden when printing */}
      <Paper
        sx={{
          display: { xs: 'block', lg: 'flex' },
          height: { xs: 'auto', lg: '100%' },
          width: { xs: '100%', lg: 300 }, // Fixed width for sidebar
          boxShadow: 'none',
          flexShrink: 0,
          zIndex: 10,
          '@media print': {
            display: 'none',
          },
        }}
      >
        <WorksheetSettings
          theme={config.theme}
          setTheme={(t) => setConfig({ ...config, theme: t })}
          difficulty={config.difficulty}
          setDifficulty={(d) => setConfig({ ...config, difficulty: d })}
          operation={config.operation}
          setOperation={(o) => setConfig({ ...config, operation: o })}
          count={config.count}
          setCount={(c) => setConfig({ ...config, count: c })}
          textColumns={config.textColumns || 2}
          setTextColumns={(c) => setConfig({ ...config, textColumns: c })}
          excludeZeroProblems={excludeZeroProblems}
          setExcludeZeroProblems={setExcludeZeroProblems}
          showAnswers={config.showAnswers ?? false}
          setShowAnswers={(s) => setConfig({ ...config, showAnswers: s })}
          displayMode={config.displayMode}
          setDisplayMode={(d) => setConfig({ ...config, displayMode: d })}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
          onPrint={handlePrint}
          customDifficulty={customDifficulty}
          setCustomDifficulty={setCustomDifficulty}
          difficultyRatios={difficultyRatios}
          setDifficultyRatios={setDifficultyRatios}
          useMixMode={useMixMode}
          setUseMixMode={setUseMixMode}
          problemType={config.problemType}
          setProblemType={(p) => setConfig({ ...config, problemType: p })}
          specialPracticeType={config.specialPracticeType || SpecialPracticeType.NONE}
          setSpecialPracticeType={(s) => setConfig({ ...config, specialPracticeType: s })}
          multiOperationConfig={multiOperationConfig}
          setMultiOperationConfig={setMultiOperationConfig}
          autoPreview={autoPreview}
          setAutoPreview={setAutoPreview}
          onResetConfig={() => {
            setConfig({
              theme: 'Animals 🐶',
              difficulty: DifficultyLevel.EASY,
              operation: OperationType.ADDITION,
              count: 1,
              textColumns: 2,
              title: 'Fun Math Time!',
              showAnswers: false,
              displayMode: DisplayMode.TEXT,
              customDifficulty: { min: 1, max: 15 },
              difficultyRatios: { easy: 20, medium: 50, hard: 20, custom: 10 },
              problemType: ProblemType.STANDARD,
              specialPracticeType: SpecialPracticeType.NONE,
              multiOperationConfig: { mode: MultiOperationMode.CHAIN_ADDITION, numberCount: 3 }
            });
            setCustomDifficulty({ min: 1, max: 15 });
            setDifficultyRatios({ easy: 20, medium: 50, hard: 20, custom: 10 });
            setUseMixMode(false);
            setMultiOperationConfig({ mode: MultiOperationMode.CHAIN_ADDITION, numberCount: 3 });
            setExcludeZeroProblems(false);
          }}
        />
      </Paper>

      {/* Main Preview Area */}
      <Box
        ref={previewRef}
        sx={{
          flex: 1,
          width: { xs: '100%', lg: 'calc(100% - 320px)' }, // Take remaining space
          height: '100%',
          overflow: 'auto',
          position: 'relative',
          '@media print': {
            height: 'auto',
            minHeight: 0,
            overflow: 'visible',
            width: '100%',
          },
        }}
      >
        {/* Progress bar */}
        {isGenerating && (
          <LinearProgress
            variant="determinate"
            value={generateProgress}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 20,
              height: 3,
              '@media print': { display: 'none' },
            }}
          />
        )}

        {/* Toolbar */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 1,
            px: 2,
            py: 1,
            bgcolor: 'rgba(249,250,251,0.9)',
            backdropFilter: 'blur(4px)',
            borderBottom: '1px solid',
            borderColor: 'grey.100',
            '@media print': { display: 'none' },
          }}
        >
          <Tooltip title={autoPreview ? 'Auto-preview on. Click to refresh.' : 'Click to generate'} arrow>
            <span>
              <IconButton
                onClick={handleGenerate}
                disabled={isGenerating}
                size="small"
                color="primary"
                sx={{
                  bgcolor: 'white',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  '&:hover': { bgcolor: 'primary.50', borderColor: 'primary.main' },
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ m: 2, '@media print': { display: 'none' } }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        
        <WorksheetPreview 
          problems={problems} 
          title={config.title}
          theme={config.theme}
          showAnswers={config.showAnswers || false}
          displayMode={config.displayMode}
          textColumns={config.textColumns || 2}
        />
      </Box>
    </Box>
  );
};