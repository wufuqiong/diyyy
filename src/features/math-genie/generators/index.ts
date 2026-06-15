import type { DifficultyRatios, MultiOperationConfig, CustomDifficultyRange } from 'src/types';

import { ProblemType, DisplayMode, OperationType, DifficultyLevel, MultiOperationMode, SpecialPracticeType } from 'src/types';

import { generateFillBlankProblems } from './fill-blank';
import { generateMultiOperationProblems } from './multi-op';
import { generateZeroDrillProblems } from './special-practice/zero-drill';
import { THEME_EMOJIS, THEME_TITLES, isChineseTheme } from './shared/types';
import { generateFactFamilyProblems } from './special-practice/fact-family';
import { generateNumberBondProblems } from './special-practice/number-bond';
import { generateWordProblems, generateMultiStepWordProblems } from './word-problem';
import { getMixedTargetCounts, selectBalancedMixedProblems } from './shared/mixed-balance';
import { generateProblemsForDifficulty, generateProblemsForCustomRange } from './standard';

import type { RawMathProblem } from './shared/types';

export { generateMathProblems };
export type { RawMathProblem };

async function generateMathProblems(
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
  displayMode: DisplayMode = DisplayMode.TEXT,
  excludeComparisonProblems: boolean = false,
): Promise<{ problems: RawMathProblem[]; titleSuggestion: string }> {
  try {
    const activeCustomDifficulty = difficulty === DifficultyLevel.CUSTOM ? customDifficulty : undefined;

    // Word problem mode — short-circuit before standard generation
    if (displayMode === DisplayMode.WORD_PROBLEM) {
      const wpRange: [number, number] = activeCustomDifficulty
        ? [activeCustomDifficulty.min, activeCustomDifficulty.max]
        : difficulty === DifficultyLevel.EASY ? [1, 5]
        : difficulty === DifficultyLevel.MEDIUM ? [1, 10]
        : [1, 20];

      const comparisonOnly = specialPracticeType === SpecialPracticeType.WORD_PROBLEM_COMPARISON;

      const titleSuggestion = isChineseTheme(theme)
        ? comparisonOnly ? '比多少高阶练习' : '应用题练习'
        : comparisonOnly ? 'Comparison Word Problems' : 'Word Problems';

      // Multi-step word problems (连加/连减/加减混合)
      if (operation === OperationType.MULTI_OPERATIONS && multiOperationConfig) {
        const msMode = multiOperationConfig.mode === MultiOperationMode.CHAIN_ADDITION
          ? 'chain_addition' as const
          : multiOperationConfig.mode === MultiOperationMode.CHAIN_SUBTRACTION
          ? 'chain_subtraction' as const
          : 'mixed' as const;

        const multiStepProblems = generateMultiStepWordProblems({
          mode: msMode,
          numberCount: multiOperationConfig.numberCount,
          range: wpRange,
          count,
          excludeZero: excludeZeroProblems,
        });

        return {
          problems: multiStepProblems.map((wp) => ({
            op: wp.operators[0] ?? '+' as const,
            a: wp.numbers[0],
            b: wp.numbers[1] ?? 0,
            emoji1: '📝',
            equationText: wp.text,
            isWordProblem: true,
            wordProblemText: wp.text,
            wordProblemOperation: 'addition' as const,
            wordProblemMeasure: wp.measure,
            numbers: wp.numbers,
            operators: wp.operators,
            answer: wp.answer,
          })),
          titleSuggestion,
        };
      }

      const wpOperation = operation === OperationType.ADDITION ? 'addition' as const
        : operation === OperationType.SUBTRACTION ? 'subtraction' as const
        : 'mixed' as const;

      const wordProblems = generateWordProblems({
        operation: wpOperation,
        range: wpRange,
        count,
        excludeZero: excludeZeroProblems,
        excludeComparison: excludeComparisonProblems,
        comparisonOnly,
      });

      return {
        problems: wordProblems.map((wp) => ({
          op: wp.operation === 'addition' ? '+' as const : '-' as const,
          a: wp.n1,
          b: wp.n2,
          emoji1: '📝',
          equationText: wp.text,
          isWordProblem: true,
          wordProblemText: wp.text,
          wordProblemOperation: wp.operation,
          wordProblemMeasure: wp.measure,
        })),
        titleSuggestion,
      };
    }

    if (operation === OperationType.MULTI_OPERATIONS && multiOperationConfig) {
      const themeKey = theme.toLowerCase();
      const emojis = THEME_EMOJIS[themeKey] || ['⭐', '🌟', '✨', '💫', '🪐', '🌠', '🔭', '🛸'];

      const titleInfo = THEME_TITLES[themeKey] || THEME_TITLES.default;
      const titleSuggestion = isChineseTheme(theme) ? titleInfo.zh : titleInfo.en;

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

    let maxNumber: number;
    if (difficulty === DifficultyLevel.CUSTOM && activeCustomDifficulty) {
      maxNumber = activeCustomDifficulty.max;
    } else {
      maxNumber = difficulty;
    }

    const problems: RawMathProblem[] = [];

    const themeKey = theme.toLowerCase();
    const emojis = THEME_EMOJIS[themeKey] || ['⭐', '🌟', '✨', '💫', '🪐', '🌠', '🔭', '🛸'];

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

    if (specialPracticeType === SpecialPracticeType.NUMBER_BOND) {
      const usedBonds = new Set<string>();
      const bondProblems = generateNumberBondProblems(
        count,
        difficulty,
        emojis,
        activeCustomDifficulty,
        usedBonds,
        excludeZeroProblems
      );
      return { problems: bondProblems, titleSuggestion };
    }

    if (problemType === ProblemType.FILL_BLANK) {
      if (difficultyRatios) {
        const total =
          difficultyRatios.easy +
          difficultyRatios.medium +
          difficultyRatios.hard +
          difficultyRatios.custom;

        if (total === 100) {
          const easyCount = Math.round((count * difficultyRatios.easy) / 100);
          const mediumCount = Math.round((count * difficultyRatios.medium) / 100);
          const hardCount = Math.round((count * difficultyRatios.hard) / 100);
          const customCount = count - easyCount - mediumCount - hardCount;

          const orderedProblems: RawMathProblem[] = [];
          const usedProblems = new Set<string>();

          if (easyCount > 0) {
            const easyProblems = generateFillBlankProblems(
              easyCount,
              DifficultyLevel.EASY,
              operation,
              emojis,
              undefined,
              usedProblems,
              excludeZeroProblems,
              displayMode
            );
            orderedProblems.push(...easyProblems);
          }

          if (mediumCount > 0) {
            const mediumProblems = generateFillBlankProblems(
              mediumCount,
              DifficultyLevel.MEDIUM,
              operation,
              emojis,
              undefined,
              usedProblems,
              excludeZeroProblems,
              displayMode
            );
            orderedProblems.push(...mediumProblems);
          }

          if (hardCount > 0) {
            const hardProblems = generateFillBlankProblems(
              hardCount,
              DifficultyLevel.HARD,
              operation,
              emojis,
              undefined,
              usedProblems,
              excludeZeroProblems,
              displayMode
            );
            orderedProblems.push(...hardProblems);
          }

          if (customCount > 0 && activeCustomDifficulty) {
            const customProblems = generateFillBlankProblems(
              customCount,
              DifficultyLevel.CUSTOM,
              operation,
              emojis,
              activeCustomDifficulty,
              usedProblems,
              excludeZeroProblems,
              displayMode
            );
            orderedProblems.push(...customProblems);
          }

          return { problems: orderedProblems, titleSuggestion };
        }
      } else {
        const fillBlankProblems = generateFillBlankProblems(
          count,
          difficulty,
          operation,
          emojis,
          activeCustomDifficulty,
          undefined,
          excludeZeroProblems,
          displayMode
        );
        return { problems: fillBlankProblems, titleSuggestion };
      }
    }

    if (difficultyRatios) {
      const total =
        difficultyRatios.easy + difficultyRatios.medium + difficultyRatios.hard + difficultyRatios.custom;

      if (total === 100) {
        const easyCount = Math.round((count * difficultyRatios.easy) / 100);
        const mediumCount = Math.round((count * difficultyRatios.medium) / 100);
        const hardCount = Math.round((count * difficultyRatios.hard) / 100);
        const customCount = count - easyCount - mediumCount - hardCount;

        const orderedProblems: RawMathProblem[] = [];
        const usedProblems = new Set<string>();

        if (easyCount > 0) {
          const easyProblems = generateProblemsForDifficulty(
            easyCount,
            DifficultyLevel.EASY,
            operation,
            emojis,
            usedProblems,
            undefined,
            excludeZeroProblems
          );
          orderedProblems.push(...easyProblems);
        }

        if (mediumCount > 0) {
          const mediumProblems = generateProblemsForDifficulty(
            mediumCount,
            DifficultyLevel.MEDIUM,
            operation,
            emojis,
            usedProblems,
            undefined,
            excludeZeroProblems
          );
          orderedProblems.push(...mediumProblems);
        }

        if (hardCount > 0) {
          const hardProblems = generateProblemsForDifficulty(
            hardCount,
            DifficultyLevel.HARD,
            operation,
            emojis,
            usedProblems,
            undefined,
            excludeZeroProblems
          );
          orderedProblems.push(...hardProblems);
        }

        if (customCount > 0 && customDifficulty) {
          const customProblems = generateProblemsForCustomRange(
            customCount,
            customDifficulty,
            operation,
            emojis,
            usedProblems,
            excludeZeroProblems
          );
          orderedProblems.push(...customProblems);
        }

        return { problems: orderedProblems, titleSuggestion };
      }
    }

    const maxUniqueProblems = calculateMaxUniqueProblems(maxNumber, operation);
    const targetCount = Math.min(count, maxUniqueProblems);

    const allPossibleProblems = generateAllPossibleProblems(
      maxNumber,
      operation,
      emojis,
      activeCustomDifficulty,
      excludeZeroProblems
    );

    if (operation === OperationType.MIXED) {
      problems.push(...selectBalancedMixedProblems(allPossibleProblems, targetCount));
    } else {
      const shuffled = allPossibleProblems.sort(() => Math.random() - 0.5);

      for (let i = 0; i < targetCount; i++) {
        if (shuffled[i]) {
          problems.push(shuffled[i]);
        }
      }
    }

    while (problems.length < count && problems.length < 100) {
      let fallbackOperation = operation;
      if (operation === OperationType.MIXED) {
        const { additionCount } = getMixedTargetCounts(count);
        const currentAdditions = problems.filter((p) => p.op === '+').length;
        fallbackOperation =
          currentAdditions < additionCount ? OperationType.ADDITION : OperationType.SUBTRACTION;
      }

      const problem = generateRandomProblem(
        maxNumber,
        fallbackOperation,
        emojis,
        activeCustomDifficulty,
        excludeZeroProblems
      );
      problems.push(problem);
    }

    return { problems, titleSuggestion };
  } catch (error) {
    console.error('Error generating math problems:', error);
    return {
      problems: Array.from({ length: Math.min(count, 20) }).map(() => ({
        op: '+' as const,
        a: Math.floor(Math.random() * 5) + 1,
        b: Math.floor(Math.random() * 4) + 1,
        emoji1: '⭐',
        emoji2: '🌟',
      })),
      titleSuggestion: isChineseTheme(theme) ? '数学练习' : 'Math Worksheet',
    };
  }
}

function calculateMaxUniqueProblems(maxNumber: number, operation: OperationType): number {
  if (operation === OperationType.ADDITION) {
    let count = 0;
    for (let a = 0; a <= maxNumber; a++) {
      for (let b = 0; b <= maxNumber - a; b++) {
        count++;
      }
    }
    return count;
  } else if (operation === OperationType.SUBTRACTION) {
    let count = 0;
    for (let a = 0; a <= maxNumber; a++) {
      for (let b = 0; b <= a; b++) {
        count++;
      }
    }
    return count;
  } else {
    return (
      calculateMaxUniqueProblems(maxNumber, OperationType.ADDITION) +
      calculateMaxUniqueProblems(maxNumber, OperationType.SUBTRACTION)
    );
  }
}

function generateAllPossibleProblems(
  maxNumber: number,
  operation: OperationType,
  emojis: string[],
  customDifficulty?: CustomDifficultyRange,
  excludeZeroProblems: boolean = false
): RawMathProblem[] {
  const problems: RawMathProblem[] = [];

  const actualMax = customDifficulty ? customDifficulty.max : maxNumber;
  const actualMin = customDifficulty ? customDifficulty.min : 1;

  if (operation === OperationType.ADDITION || operation === OperationType.MIXED) {
    if (customDifficulty) {
      for (let sum = Math.max(0, actualMin); sum <= actualMax; sum++) {
        for (let a = 0; a <= sum; a++) {
          const b = sum - a;
          const problem = generateProblemsForCustomRange(
            1,
            { min: actualMin, max: actualMax },
            OperationType.ADDITION,
            emojis,
            undefined,
            excludeZeroProblems
          )[0];
          if (problem) problems.push(problem);
        }
      }
    } else {
      const generated = generateProblemsForDifficulty(
        Math.min(1000, (maxNumber + 1) * (maxNumber + 2) / 2),
        maxNumber as DifficultyLevel,
        OperationType.ADDITION,
        emojis,
        undefined,
        undefined,
        excludeZeroProblems
      );
      problems.push(...generated);
    }
  }

  if (operation === OperationType.SUBTRACTION || operation === OperationType.MIXED) {
    if (customDifficulty) {
      const generated = generateProblemsForCustomRange(
        Math.min(1000, (actualMax + 1) * (actualMax + 2) / 2),
        { min: actualMin, max: actualMax },
        OperationType.SUBTRACTION,
        emojis,
        undefined,
        excludeZeroProblems
      );
      problems.push(...generated);
    } else {
      const generated = generateProblemsForDifficulty(
        Math.min(1000, (maxNumber + 1) * (maxNumber + 2) / 2),
        maxNumber as DifficultyLevel,
        OperationType.SUBTRACTION,
        emojis,
        undefined,
        undefined,
        excludeZeroProblems
      );
      problems.push(...generated);
    }
  }

  return problems;
}

function generateRandomProblem(
  maxNumber: number,
  operation: OperationType,
  emojis: string[],
  customDifficulty?: CustomDifficultyRange,
  excludeZeroProblems: boolean = false
): RawMathProblem {
  let attempts = 0;
  const maxAttempts = 50;

  while (attempts < maxAttempts) {
    attempts++;
    const op = operation === OperationType.MIXED ? (Math.random() > 0.5 ? '+' : '-') : operation === OperationType.ADDITION ? '+' : '-';

    const candidate =
      op === '+'
        ? generateProblemsForDifficulty(1, maxNumber as DifficultyLevel, OperationType.ADDITION, emojis, undefined, customDifficulty, false)[0]
        : generateProblemsForDifficulty(1, maxNumber as DifficultyLevel, OperationType.SUBTRACTION, emojis, undefined, customDifficulty, false)[0];

    if (candidate && (!excludeZeroProblems || (candidate.a !== 0 && candidate.b !== 0 && (candidate.op === '+' ? candidate.a + candidate.b : candidate.a - candidate.b) !== 0))) {
      return candidate;
    }
  }

  return { op: '+', a: 1, b: 1, emoji1: '⭐', emoji2: '🌟' };
}
