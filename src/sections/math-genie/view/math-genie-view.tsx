// src/sections/math-genie/view/math-genie-view.tsx
import { v4 as uuidv4 } from 'uuid';
import React, { useState, useEffect, useRef, useCallback } from 'react';

import { Box, Backdrop, Paper, Alert, Typography } from '@mui/material';

import { DifficultyLevel, OperationType, DisplayMode, MathProblem, WorksheetConfig, CustomDifficultyRange, DifficultyRatios, ProblemType } from 'src/types';

import WorksheetPreview from '../components/WorksheetPreview';
import WorksheetSettings from '../components/WorksheetSettings';

// Update the interface to match what the function expects
interface RawMathProblem {
  op: '+' | '-';
  a: number;
  b: number;
  emoji1: string;
  emoji2?: string;
  blankPosition?: 'first' | 'second';
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

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isChineseTheme(theme: string): boolean {
  return /[\u4e00-\u9fff]/.test(theme);
}

// Helper function to generate problems for a specific difficulty level
const generateProblemsForDifficulty = (
  count: number,
  difficulty: DifficultyLevel,
  operation: OperationType,
  emojis: string[],
  usedProblems?: Set<string>,
  customDifficulty?: CustomDifficultyRange
): RawMathProblem[] => {
  const problems: RawMathProblem[] = [];
  const maxNumber = difficulty;
  
  for (let i = 0; i < count; i++) {
    let problem: RawMathProblem;
    const op = (operation === OperationType.MIXED) 
      ? (Math.random() > 0.5 ? '+' : '-')
      : (operation === OperationType.ADDITION ? '+' : '-');
    
    if (op === '+') {
      const a = getRandomInt(1, maxNumber - 1);
      const b = getRandomInt(1, maxNumber - a);
      const { emoji1, emoji2 } = getTwoDifferentEmojis(emojis);
      problem = { op: '+', a, b, emoji1, emoji2 };
    } else {
      const a = getRandomInt(2, maxNumber);
      const b = getRandomInt(1, a - 1);
      const emoji1 = getRandomEmoji(emojis);
      problem = { op: '-', a, b, emoji1 };
    }
    
    // Create a unique key to avoid duplicate problems
    const problemKey = `${problem.op}_${problem.a}_${problem.b}`;
    
    if (!usedProblems?.has(problemKey)) {
      usedProblems?.add(problemKey);
      problems.push(problem);
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
  usedProblems?: Set<string>
): RawMathProblem[] => {
  const problems: RawMathProblem[] = [];
  
  while (problems.length < count) {
    let problem: RawMathProblem;
    
    if (operation === OperationType.ADDITION || (operation === OperationType.MIXED && Math.random() > 0.5)) {
      // Addition: ensure the largest number is within custom range
      // For addition, the result (sum) should be in the custom range
      const maxResult = customRange.max;
      const minResult = Math.max(customRange.min, 2); // Minimum sum is 2 (1+1)
      const targetSum = getRandomInt(minResult, maxResult);
      
      // Generate a and b such that their sum equals targetSum
      const a = getRandomInt(1, targetSum - 1);
      const b = targetSum - a;
      
      const { emoji1, emoji2 } = getTwoDifferentEmojis(emojis);
      problem = { op: '+', a, b, emoji1, emoji2 };
    } else {
      // Subtraction: ensure the largest number (a) is within custom range
      const a = getRandomInt(Math.max(customRange.min, 2), customRange.max);
      const b = getRandomInt(1, Math.min(a - 1, customRange.max));
      const emoji1 = getRandomEmoji(emojis);
      problem = { op: '-', a, b, emoji1 };
    }
    
    const problemKey = `${problem.op}-${problem.a}-${problem.b}`;
    if (!usedProblems?.has(problemKey)) {
      usedProblems?.add(problemKey);
      problems.push(problem);
    }
  }
  
  return problems;
};

// Helper function to generate fill-in-the-blank problems
const generateFillBlankProblems = (
  count: number,
  difficulty: DifficultyLevel,
  operation: OperationType,
  emojis: string[],
  customDifficulty?: CustomDifficultyRange,
  usedProblems?: Set<string>
): Array<{op: '+' | '-', a: number, b: number, emoji1: string, emoji2?: string, blankPosition: 'first' | 'second'}> => {
  const problems: Array<{op: '+' | '-', a: number, b: number, emoji1: string, emoji2?: string, blankPosition: 'first' | 'second'}> = [];
  let maxNumber: number;
  
  if (difficulty === DifficultyLevel.CUSTOM && customDifficulty) {
    maxNumber = customDifficulty.max;
  } else {
    maxNumber = difficulty;
  }
  
  while (problems.length < count) {
    const blankPositions: Array<'first' | 'second'> = ['first', 'second'];
    const blankPosition = blankPositions[Math.floor(Math.random() * blankPositions.length)];
    
    if (operation === OperationType.ADDITION || (operation === OperationType.MIXED && Math.random() > 0.5)) {
      // Addition: a + b = result, ensure result is within custom range
      const maxResult = customDifficulty?.max || maxNumber;
      const minResult = Math.max(customDifficulty?.min || 2, 2);
      const result = getRandomInt(minResult, maxResult);
      let a: number, b: number;
      
      if (blankPosition === 'first') {
        // _ + b = result
        b = getRandomInt(1, Math.min(result - 1, maxNumber));
        a = result - b;
      } else {
        // a + _ = result
        a = getRandomInt(1, Math.min(result - 1, maxNumber));
        b = result - a;
      }
      
      const { emoji1, emoji2 } = getTwoDifferentEmojis(emojis);
      problems.push({ op: '+', a, b, emoji1, emoji2, blankPosition });
    } else {
      // Subtraction: a - b = result, ensure a is within custom range
      let a: number, b: number;
      
      const maxA = customDifficulty?.max || maxNumber;
      const minA = Math.max(customDifficulty?.min || 2, 2);
      
      if (blankPosition === 'first') {
        // _ - b = result (so a = result + b)
        b = getRandomInt(1, Math.min(maxA - 1, maxA));
        const result = getRandomInt(1, maxA - b);
        a = result + b;
      } else {
        // a - _ = result (so b = a - result)
        a = getRandomInt(minA, maxA);
        const result = getRandomInt(1, a - 1);
        b = a - result;
      }
      
      const emoji1 = getRandomEmoji(emojis);
      problems.push({ op: '-', a, b, emoji1, blankPosition });
    }
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
  problemType?: ProblemType
): Promise<{ problems: RawMathProblem[], titleSuggestion: string }> => {
  try {
    // Determine the max number based on difficulty or custom range
    let maxNumber: number;
    if (difficulty === DifficultyLevel.CUSTOM && customDifficulty) {
      maxNumber = customDifficulty.max;
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
    
    // If problem type is fill_blank, generate fill-in-the-blank problems
    if (problemType === ProblemType.FILL_BLANK) {
      if (difficultyRatios) {
        const total = difficultyRatios.easy + difficultyRatios.medium + difficultyRatios.hard + difficultyRatios.custom;
        
        if (total === 100) {
          // Calculate number of problems for each difficulty
          const easyCount = Math.round(count * difficultyRatios.easy / 100);
          const mediumCount = Math.round(count * difficultyRatios.medium / 100);
          const hardCount = Math.round(count * difficultyRatios.hard / 100);
          const customCount = count - easyCount - mediumCount - hardCount;
          
          // Generate problems for each difficulty in order: easy -> medium -> hard -> custom
          const orderedProblems: RawMathProblem[] = [];
          const usedProblems = new Set<string>();
          
          if (easyCount > 0) {
            const easyProblems = generateFillBlankProblems(easyCount, DifficultyLevel.EASY, operation, emojis, customDifficulty, usedProblems);
            orderedProblems.push(...easyProblems);
          }
          
          if (mediumCount > 0) {
            const mediumProblems = generateFillBlankProblems(mediumCount, DifficultyLevel.MEDIUM, operation, emojis, customDifficulty, usedProblems);
            orderedProblems.push(...mediumProblems);
          }
          
          if (hardCount > 0) {
            const hardProblems = generateFillBlankProblems(hardCount, DifficultyLevel.HARD, operation, emojis, customDifficulty, usedProblems);
            orderedProblems.push(...hardProblems);
          }
          
          if (customCount > 0 && customDifficulty) {
            const customProblems = generateFillBlankProblems(customCount, DifficultyLevel.CUSTOM, operation, emojis, customDifficulty, usedProblems);
            orderedProblems.push(...customProblems);
          }
          
          return { problems: orderedProblems, titleSuggestion };
        }
      } else {
        // Single difficulty mode for fill blank problems
        const fillBlankProblems = generateFillBlankProblems(count, difficulty, operation, emojis, customDifficulty);
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
        const usedProblems = new Set<string>(); // Track used problems to avoid duplicates
        
        if (easyCount > 0) {
          const easyProblems = generateProblemsForDifficulty(easyCount, DifficultyLevel.EASY, operation, emojis, usedProblems);
          orderedProblems.push(...easyProblems);
        }
        
        if (mediumCount > 0) {
          const mediumProblems = generateProblemsForDifficulty(mediumCount, DifficultyLevel.MEDIUM, operation, emojis, usedProblems);
          orderedProblems.push(...mediumProblems);
        }
        
        if (hardCount > 0) {
          const hardProblems = generateProblemsForDifficulty(hardCount, DifficultyLevel.HARD, operation, emojis, usedProblems);
          orderedProblems.push(...hardProblems);
        }
        
        if (customCount > 0 && customDifficulty) {
          const customProblems = generateProblemsForCustomRange(customCount, customDifficulty, operation, emojis, usedProblems);
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
    const allPossibleProblems = generateAllPossibleProblems(maxNumber, operation, emojis, customDifficulty);
    
    // Shuffle and take required number
    const shuffled = allPossibleProblems.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < targetCount; i++) {
      if (shuffled[i]) {
        problems.push(shuffled[i]);
      }
    }
    
    // If we still need more problems (very rare case), generate with duplicates
    while (problems.length < count && problems.length < 100) { // Safety limit
      const problem = generateRandomProblem(maxNumber, operation, emojis, customDifficulty);
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
    // For addition: a + b where a, b >= 1 and a + b <= maxNumber
    let count = 0;
    for (let a = 1; a < maxNumber; a++) {
      for (let b = 1; b <= maxNumber - a; b++) {
        count++;
      }
    }
    return count;
  } else if (operation === OperationType.SUBTRACTION) {
    // For subtraction: a - b where a > b >= 1 and a <= maxNumber
    let count = 0;
    for (let a = 2; a <= maxNumber; a++) {
      for (let b = 1; b < a; b++) {
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
  customDifficulty?: CustomDifficultyRange
): RawMathProblem[] => {
  const problems: RawMathProblem[] = [];
  
  // For custom difficulty, we need to respect the range
  const actualMax = customDifficulty ? customDifficulty.max : maxNumber;
  const actualMin = customDifficulty ? customDifficulty.min : 1;
  
  if (operation === OperationType.ADDITION || operation === OperationType.MIXED) {
    if (customDifficulty) {
      // For custom range, generate addition problems where sum is in range
      for (let sum = Math.max(2, actualMin); sum <= actualMax; sum++) {
        for (let a = 1; a < sum; a++) {
          const b = sum - a;
          const { emoji1, emoji2 } = getTwoDifferentEmojis(emojis);
          problems.push({ op: '+', a, b, emoji1, emoji2 });
        }
      }
    } else {
      // For standard difficulty, use original logic
      for (let a = 1; a < maxNumber; a++) {
        for (let b = 1; b <= maxNumber - a; b++) {
          const { emoji1, emoji2 } = getTwoDifferentEmojis(emojis);
          problems.push({ op: '+', a, b, emoji1, emoji2 });
        }
      }
    }
  }
  
  if (operation === OperationType.SUBTRACTION || operation === OperationType.MIXED) {
    if (customDifficulty) {
      // For custom range, ensure a is in range
      for (let a = Math.max(2, actualMin); a <= actualMax; a++) {
        for (let b = 1; b < a; b++) {
          const emoji1 = getRandomEmoji(emojis);
          problems.push({ op: '-', a, b, emoji1 });
        }
      }
    } else {
      // For standard difficulty, use original logic
      for (let a = 2; a <= maxNumber; a++) {
        for (let b = 1; b < a; b++) {
          const emoji1 = getRandomEmoji(emojis);
          problems.push({ op: '-', a, b, emoji1 });
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
  customDifficulty?: CustomDifficultyRange
): RawMathProblem => {
  const op = (operation === OperationType.MIXED) 
    ? (Math.random() > 0.5 ? '+' : '-')
    : (operation === OperationType.ADDITION ? '+' : '-');
  
  if (op === '+') {
    if (customDifficulty) {
      // For custom range, ensure sum is in range
      const maxSum = customDifficulty.max;
      const minSum = Math.max(customDifficulty.min, 2);
      const targetSum = getRandomInt(minSum, maxSum);
      const a = getRandomInt(1, targetSum - 1);
      const b = targetSum - a;
      const { emoji1, emoji2 } = getTwoDifferentEmojis(emojis);
      return { op: '+', a, b, emoji1, emoji2 };
    } else {
      const a = getRandomInt(1, maxNumber - 1);
      const b = getRandomInt(1, maxNumber - a);
      const { emoji1, emoji2 } = getTwoDifferentEmojis(emojis);
      return { op: '+', a, b, emoji1, emoji2 };
    }
  } else {
    if (customDifficulty) {
      // For custom range, ensure a is in range
      const a = getRandomInt(Math.max(customDifficulty.min, 2), customDifficulty.max);
      const b = getRandomInt(1, a - 1);
      const emoji1 = getRandomEmoji(emojis);
      return { op: '-', a, b, emoji1 };
    } else {
      const a = getRandomInt(2, maxNumber);
      const b = getRandomInt(1, a - 1);
      const emoji1 = getRandomEmoji(emojis);
      return { op: '-', a, b, emoji1 };
    }
  }
};

export const MathGenieView: React.FC = () => {
  const [config, setConfig] = useState<WorksheetConfig>({
    theme: 'Animals 🐶',
    difficulty: DifficultyLevel.EASY,
    operation: OperationType.ADDITION,
    count: 16,
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

  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await generateMathProblems(
        config.theme,
        config.difficulty,
        config.operation,
        config.count,
        customDifficulty,
        useMixMode ? difficultyRatios : undefined,
        config.problemType
      );
      
      const newProblems: MathProblem[] = response.problems.map(p => {
        // For fill blank problems, extract blank position from the problem data
        let blankPosition: 'first' | 'second' | undefined;
        if (config.problemType === ProblemType.FILL_BLANK && 'blankPosition' in p) {
          blankPosition = (p as any).blankPosition as 'first' | 'second';
        }
        
        return {
          id: uuidv4(),
          operation: p.op,
          num1: p.a,
          num2: p.b,
          emoji1: p.emoji1,
          emoji2: (p as any).emoji2 || p.emoji1, // Use emoji1 as fallback for emoji2
          answer: p.op === '+' ? p.a + p.b : p.a - p.b,
          problemType: config.problemType,
          blankPosition: blankPosition
        };
      });

      setProblems(newProblems);
      if (response.titleSuggestion) {
        setConfig(prev => ({ ...prev, title: response.titleSuggestion }));
      }
    } catch (err) {
      console.error("Failed to generate", err);
      setError('Failed to generate worksheet. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [config.theme, config.difficulty, config.operation, config.count, config.problemType, customDifficulty, difficultyRatios, useMixMode]);

  // Generate initial preview on component mount
  useEffect(() => {
    if (!isGenerating && config.count > 0) {
      handleGenerate();
    }
  }, [handleGenerate]); // Use handleGenerate as dependency

  // Track previous display mode to avoid infinite loops
  const prevDisplayMode = useRef(config.displayMode);

  // Auto-generate preview when config changes
  useEffect(() => {
    // Debounce the auto-generation to avoid too many calls
    const timeoutId = setTimeout(() => {
      if (!isGenerating && config.count > 0) {
        handleGenerate();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [handleGenerate]); // Use handleGenerate as dependency

  // Adjust count when display mode changes
  useEffect(() => {
    if (prevDisplayMode.current !== config.displayMode) {
      if (config.displayMode === DisplayMode.TEXT) {
        // For Text mode, ensure count is a multiple of 16 and within range
        const validCount = Math.max(16, Math.min(48, Math.round(config.count / 16) * 16));
        if (validCount !== config.count) {
          setConfig(prev => ({ ...prev, count: validCount }));
        }
      } else {
        // For Emoji mode, ensure count is a multiple of 8 and within range
        const validCount = Math.max(8, Math.min(60, Math.round(config.count / 8) * 8));
        if (validCount !== config.count) {
          setConfig(prev => ({ ...prev, count: validCount }));
        }
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
          boxShadow: 5,
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
        />
        
        {/* Loading Overlay */}
        {isGenerating && (
          <Backdrop
            open
            sx={{
              position: 'absolute',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: (muiTheme) => muiTheme.zIndex.drawer + 1,
              '@media print': {
                display: 'none',
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
                padding: (muiTheme) => muiTheme.spacing(2, 4),
                borderRadius: '2rem',
                boxShadow: 5,
                border: (muiTheme) => `1px solid ${muiTheme.palette.primary.light}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={(muiTheme) => ({
                    position: 'relative',
                    width: muiTheme.spacing(1.5),
                    height: muiTheme.spacing(1.5),
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      backgroundColor: muiTheme.palette.primary.light,
                      animation: 'pulse 1.5s ease-in-out infinite',
                    },
                    '&::after': {
                      content: '""',
                      position: 'relative',
                      display: 'block',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      backgroundColor: muiTheme.palette.primary.main,
                    },
                    '@keyframes pulse': {
                      '0%': {
                        transform: 'scale(1)',
                        opacity: 0.75,
                      },
                      '100%': {
                        transform: 'scale(2)',
                        opacity: 0,
                      },
                    },
                  })}
                />
                <Typography variant="body1" color="primary" fontWeight={500}>
                  Generating {config.theme} problems...
                </Typography>
              </Box>
            </Box>
          </Backdrop>
        )}
      </Box>
    </Box>
  );
};