import type { DifficultyRatios, MultiOperationConfig, CustomDifficultyRange } from 'src/types';

import { ProblemType, DisplayMode, MulDivLevel, OperationType, DifficultyLevel, ComparisonSubType, MultiOperationMode, SpecialPracticeType } from 'src/types';

import { generateFillBlankProblems } from './fill-blank';
import { generateMultiOperationProblems } from './multi-op';
import { generateZeroDrillProblems } from './special-practice/zero-drill';
import { generateComparisonProblems } from './special-practice/comparison';
import { generateFactFamilyProblems } from './special-practice/fact-family';
import { generateNumberBondProblems } from './special-practice/number-bond';
import { generateWordProblems, generateMultiStepWordProblems } from './word-problem';
import { generateColumnArithmeticProblems } from './special-practice/column-arithmetic';
import { generateProblemsForDifficulty, generateProblemsForCustomRange } from './standard';
import { THEME_EMOJIS, THEME_TITLES, isChineseTheme, problemContainsZero } from './shared/types';
import { getMixedTargetCounts, getMulDivMixedTargetCounts, selectBalancedMixedProblems } from './shared/mixed-balance';

import type { RawMathProblem } from './shared/types';

export { generateMathProblems };
export type { RawMathProblem };

function operationToMultiMode(op: OperationType): MultiOperationMode {
  switch (op) {
    case OperationType.ADDITION: return MultiOperationMode.CHAIN_ADDITION;
    case OperationType.SUBTRACTION: return MultiOperationMode.CHAIN_SUBTRACTION;
    case OperationType.MULTIPLICATION: return MultiOperationMode.CHAIN_MULTIPLICATION;
    case OperationType.DIVISION: return MultiOperationMode.CHAIN_DIVISION;
    case OperationType.MULT_DIV_MIXED: return MultiOperationMode.MULT_DIV_MIXED_CHAIN;
    case OperationType.ALL: return MultiOperationMode.ALL_MIXED;
    default: return MultiOperationMode.MIXED_OPERATIONS;
  }
}

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
  comparisonConfig?: { subType: ComparisonSubType },
  mulDivLevel: MulDivLevel = MulDivLevel.ONE_DIGIT,
  excludeCarry: boolean = false,
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

      const titleSuggestion = isChineseTheme(theme) ? '应用题练习' : 'Word Problems';

      // Multi-step word problems (连加/连减/加减混合)
      if (problemType === ProblemType.MULTI_STEP && multiOperationConfig) {
        const mode = operationToMultiMode(operation);
        const msMode = mode === MultiOperationMode.CHAIN_ADDITION
          ? 'chain_addition' as const
          : mode === MultiOperationMode.CHAIN_SUBTRACTION
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

    // ×/÷ only supported in TEXT mode; fall back to ADDITION for EMOJI / WORD_PROBLEM
    if (displayMode !== DisplayMode.TEXT) {
      const mulDivOps: OperationType[] = [
        OperationType.MULTIPLICATION,
        OperationType.DIVISION,
        OperationType.MULT_DIV_MIXED,
      ];
      if (mulDivOps.includes(operation)) {
        operation = OperationType.ADDITION;
      }
    }

    if (problemType === ProblemType.MULTI_STEP && multiOperationConfig) {
      const themeKey = theme.toLowerCase();
      const emojis = THEME_EMOJIS[themeKey] || ['⭐', '🌟', '✨', '💫', '🪐', '🌠', '🔭', '🛸'];

      const titleInfo = THEME_TITLES[themeKey] || THEME_TITLES.default;
      const titleSuggestion = isChineseTheme(theme) ? titleInfo.zh : titleInfo.en;

      const multiProblems = generateMultiOperationProblems(
        count,
        difficulty,
        operationToMultiMode(operation),
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
        problemType === ProblemType.MULTI_STEP ? OperationType.MIXED : operation,
        emojis,
        activeCustomDifficulty,
        usedProblems,
        problemType,
        excludeZeroProblems
      );
      return { problems: zeroProblems, titleSuggestion };
    }

    if (specialPracticeType === SpecialPracticeType.COLUMN_ARITHMETIC) {
      const usedCol = new Set<string>();
      const colProblems = generateColumnArithmeticProblems(
        count,
        difficulty,
        problemType === ProblemType.MULTI_STEP ? OperationType.MIXED : operation,
        emojis,
        activeCustomDifficulty,
        usedCol,
        excludeZeroProblems,
        mulDivLevel,
        excludeCarry
      );
      return { problems: colProblems, titleSuggestion };
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
        excludeZeroProblems,
        operation
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

    if (specialPracticeType === SpecialPracticeType.COMPARISON && comparisonConfig) {
      const rangeLabel = activeCustomDifficulty ? `${activeCustomDifficulty.min}-${activeCustomDifficulty.max}` : `1-${maxNumber}`;
      // WORD_PROBLEM → always 比多少
      const effectiveSubType = comparisonConfig.subType;
      const isMagnitude = effectiveSubType === ComparisonSubType.MAGNITUDE;
      const cmpTitle = isChineseTheme(theme)
        ? `${isMagnitude ? '比大小' : '比多少'} ${rangeLabel}`
        : `${isMagnitude ? 'Compare Magnitude' : 'Compare Difference'} ${rangeLabel}`;
      const cmpProblems = generateComparisonProblems({
        count,
        subType: effectiveSubType,
        emojiPool: emojis,
        countRange: activeCustomDifficulty
          ? { min: activeCustomDifficulty.min, max: activeCustomDifficulty.max }
          : { min: 1, max: maxNumber },
        displayMode,
      });
      return { problems: cmpProblems, titleSuggestion: cmpTitle };
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

    if (operation === OperationType.MIXED || operation === OperationType.MULT_DIV_MIXED || operation === OperationType.ALL) {
      problems.push(...selectBalancedMixedProblems(allPossibleProblems, targetCount, operation));
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
      } else if (operation === OperationType.MULT_DIV_MIXED) {
        const { multiplicationCount } = getMulDivMixedTargetCounts(count);
        const currentMultiplications = problems.filter((p) => p.op === '×').length;
        fallbackOperation =
          currentMultiplications < multiplicationCount ? OperationType.MULTIPLICATION : OperationType.DIVISION;
      } else if (operation === OperationType.ALL) {
        fallbackOperation = [OperationType.ADDITION, OperationType.SUBTRACTION, OperationType.MULTIPLICATION, OperationType.DIVISION][Math.floor(Math.random() * 4)];
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
      for (let b = 0; b <= maxNumber - a; b++) count++;
    }
    return count;
  } else if (operation === OperationType.SUBTRACTION) {
    let count = 0;
    for (let a = 0; a <= maxNumber; a++) {
      for (let b = 0; b <= a; b++) count++;
    }
    return count;
  } else if (operation === OperationType.MULTIPLICATION) {
    let count = 0;
    for (let a = 0; a <= maxNumber; a++) {
      for (let b = 0; b <= maxNumber; b++) {
        if (a * b <= maxNumber) count++;
      }
    }
    return count;
  } else if (operation === OperationType.DIVISION) {
    let count = 0;
    for (let b = 1; b <= maxNumber; b++) {
      for (let c = 0; c <= Math.floor(maxNumber / b); c++) count++;
    }
    return count;
  } else if (operation === OperationType.MULT_DIV_MIXED) {
    return (
      calculateMaxUniqueProblems(maxNumber, OperationType.MULTIPLICATION) +
      calculateMaxUniqueProblems(maxNumber, OperationType.DIVISION)
    );
  } else if (operation === OperationType.ALL) {
    return (
      calculateMaxUniqueProblems(maxNumber, OperationType.ADDITION) +
      calculateMaxUniqueProblems(maxNumber, OperationType.SUBTRACTION) +
      calculateMaxUniqueProblems(maxNumber, OperationType.MULTIPLICATION) +
      calculateMaxUniqueProblems(maxNumber, OperationType.DIVISION)
    );
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

  if (operation === OperationType.ADDITION || operation === OperationType.MIXED || operation === OperationType.ALL) {
    if (customDifficulty) {
      for (let sum = Math.max(0, actualMin); sum <= actualMax; sum++) {
        for (let a = 0; a <= sum; a++) {
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

  if (operation === OperationType.SUBTRACTION || operation === OperationType.MIXED || operation === OperationType.ALL) {
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

  if (operation === OperationType.MULTIPLICATION || operation === OperationType.MULT_DIV_MIXED || operation === OperationType.ALL) {
    if (customDifficulty) {
      const generated = generateProblemsForCustomRange(
        Math.min(1000, (actualMax + 1) * (actualMax + 2)),
        { min: actualMin, max: actualMax },
        OperationType.MULTIPLICATION,
        emojis,
        undefined,
        excludeZeroProblems
      );
      problems.push(...generated);
    } else {
      const generated = generateProblemsForDifficulty(
        Math.min(1000, (maxNumber + 1) * (maxNumber + 1)),
        maxNumber as DifficultyLevel,
        OperationType.MULTIPLICATION,
        emojis,
        undefined,
        undefined,
        excludeZeroProblems
      );
      problems.push(...generated);
    }
  }

  if (operation === OperationType.DIVISION || operation === OperationType.MULT_DIV_MIXED || operation === OperationType.ALL) {
    if (customDifficulty) {
      const generated = generateProblemsForCustomRange(
        Math.min(1000, (actualMax + 1) * (actualMax + 1)),
        { min: actualMin, max: actualMax },
        OperationType.DIVISION,
        emojis,
        undefined,
        excludeZeroProblems
      );
      problems.push(...generated);
    } else {
      const generated = generateProblemsForDifficulty(
        Math.min(1000, (maxNumber + 1) * (maxNumber + 1)),
        maxNumber as DifficultyLevel,
        OperationType.DIVISION,
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
    let op: '+' | '-' | '×' | '÷';
    let genOp: OperationType;
    if (operation === OperationType.MIXED) {
      op = Math.random() > 0.5 ? '+' : '-';
      genOp = op === '+' ? OperationType.ADDITION : OperationType.SUBTRACTION;
    } else if (operation === OperationType.MULT_DIV_MIXED) {
      op = Math.random() > 0.5 ? '×' : '÷';
      genOp = op === '×' ? OperationType.MULTIPLICATION : OperationType.DIVISION;
    } else if (operation === OperationType.ADDITION) {
      op = '+'; genOp = OperationType.ADDITION;
    } else if (operation === OperationType.SUBTRACTION) {
      op = '-'; genOp = OperationType.SUBTRACTION;
    } else if (operation === OperationType.MULTIPLICATION) {
      op = '×'; genOp = OperationType.MULTIPLICATION;
    } else if (operation === OperationType.ALL) {
      const allOps: Array<{ op: '+' | '-' | '×' | '÷'; genOp: OperationType }> = [
        { op: '+', genOp: OperationType.ADDITION },
        { op: '-', genOp: OperationType.SUBTRACTION },
        { op: '×', genOp: OperationType.MULTIPLICATION },
        { op: '÷', genOp: OperationType.DIVISION },
      ];
      const pick = allOps[Math.floor(Math.random() * 4)];
      op = pick.op; genOp = pick.genOp;
    } else {
      op = '÷'; genOp = OperationType.DIVISION;
    }

    const candidate = generateProblemsForDifficulty(1, maxNumber as DifficultyLevel, genOp, emojis, undefined, customDifficulty, false)[0];

    if (candidate && (!excludeZeroProblems || !problemContainsZero(candidate))) {
      return candidate;
    }
  }

  return { op: '+', a: 1, b: 1, emoji1: '⭐', emoji2: '🌟' };
}
