import type { WorksheetTool } from 'src/shared/worksheet';
import type { MathProblem, WorksheetConfig } from 'src/types';

import React from 'react';
import { v4 as uuidv4 } from 'uuid';

import CalculateIcon from '@mui/icons-material/Calculate';

import {
  DisplayMode,
  ProblemType,
  MulDivLevel,
  OperationType,
  DifficultyLevel,
  ComparisonSubType,
  MultiOperationMode,
  SpecialPracticeType,
} from 'src/types';

import { generateMathProblems } from './generators';
import { reorderProblemsByColumnPerPage } from './generators/shared/problem-key';
import { derivePageLayout, calculateOptimalProblemsPerPage } from './shared/layout';
import WorksheetPreview from '../../sections/math-genie/components/WorksheetPreview';
import WorksheetSettings from '../../sections/math-genie/components/WorksheetSettings';

const defaultConfig: WorksheetConfig = {
  theme: 'Animals 🐶',
  difficulty: DifficultyLevel.EASY,
  operation: OperationType.ADDITION,
  count: 1,
  textColumns: 2,
  title: 'Fun Math Time!',
  showAnswers: false,
  displayMode: DisplayMode.TEXT,
  problemsPerPage: calculateOptimalProblemsPerPage({
    displayMode: DisplayMode.TEXT,
    columns: 2,
    problemType: ProblemType.STANDARD,
    specialPracticeType: SpecialPracticeType.NONE,
    operation: OperationType.ADDITION,
    difficulty: DifficultyLevel.EASY,
  }),
  customDifficulty: { min: 1, max: 15 },
  problemType: ProblemType.STANDARD,
  specialPracticeType: SpecialPracticeType.NONE,
  multiOperationConfig: { mode: MultiOperationMode.CHAIN_ADDITION, numberCount: 3 },
  excludeZeroProblems: false,
  autoPreview: true,
};

async function generate(config: WorksheetConfig): Promise<MathProblem[]> {
  const textColumns = config.textColumns || 2;
  const perPage = config.problemsPerPage || (textColumns * 8);
  const layout = derivePageLayout({ columns: textColumns, problemsPerPage: perPage });
  const targetProblemCount = config.count * perPage;

  const response = await generateMathProblems(
    config.theme,
    config.difficulty,
    config.operation,
    targetProblemCount,
    config.customDifficulty,
    config.difficultyRatios,
    config.problemType || ProblemType.STANDARD,
    config.specialPracticeType || SpecialPracticeType.NONE,
    config.problemType === ProblemType.MULTI_STEP ? config.multiOperationConfig : undefined,
    config.excludeZeroProblems || false,
    config.displayMode,
    config.comparisonConfig,
    config.mulDivLevel,
    config.excludeCarry,
  );

  const shouldUseVerticalFactFamilyOrder =
    config.displayMode === DisplayMode.TEXT &&
    config.specialPracticeType === SpecialPracticeType.FACT_FAMILY;

  const orderedRawProblems = shouldUseVerticalFactFamilyOrder
    ? reorderProblemsByColumnPerPage(response.problems, textColumns, layout.rows)
    : response.problems;

  return orderedRawProblems.map((p) => ({
    id: uuidv4(),
    operation: p.op,
    num1: p.a,
    num2: p.b,
    emoji1: p.emoji1,
    emoji2: p.emoji2 || p.emoji1,
    answer: p.answer !== undefined
      ? p.answer
      : p.isNumberBond
      ? p.numberBondBlankIndex === 0 ? p.a
        : p.numberBondBlankIndex === 1 ? p.b
        : p.numberBondWhole!
      : p.op === '+' ? p.a + p.b
      : p.op === '-' ? p.a - p.b
      : p.op === '×' ? p.a * p.b
      : p.b !== 0 ? p.a / p.b : 0,
    problemType: config.problemType,
    blankPosition: p.blankPosition,
    equationText: p.equationText,
    isMultiOperation: p.isMultiOperation || false,
    numbers: p.numbers,
    operators: p.operators,
    emojis: p.emojis,
    isNumberBond: p.isNumberBond || false,
    isWordProblem: p.isWordProblem || false,
    wordProblemText: p.wordProblemText,
    wordProblemOperation: p.wordProblemOperation,
    wordProblemMeasure: p.wordProblemMeasure,
    numberBondWhole: p.numberBondWhole,
    numberBondParts: p.numberBondParts,
    numberBondBlankIndex: p.numberBondBlankIndex,
    isComparison: p.isComparison || false,
    comparisonData: p.comparisonData,
    isColumnArithmetic: (p as any).isColumnArithmetic || false,
    columnTop: (p as any).columnTop,
    columnBottom: (p as any).columnBottom,
    columnOp: (p as any).columnOp,
  }));
}

function deriveWorksheetTitle(config: WorksheetConfig): string {
  const range = config.difficulty === DifficultyLevel.CUSTOM
    ? config.customDifficulty!
    : { min: 1, max: config.difficulty as number };
  const rangeStr = `${range.min}-${range.max}`;

  // Special practice types override the standard naming
  if (config.specialPracticeType === SpecialPracticeType.ZERO_DRILL) {
    return `零的魔法练习 ${rangeStr}`;
  }
  if (config.specialPracticeType === SpecialPracticeType.FACT_FAMILY) {
    const isFFMulDiv = config.operation === OperationType.MULTIPLICATION
      || config.operation === OperationType.DIVISION
      || config.operation === OperationType.MULT_DIV_MIXED;
    const ffDiff = isFFMulDiv && config.mulDivLevel
      ? (config.mulDivLevel === MulDivLevel.ONE_DIGIT ? '1位数'
        : config.mulDivLevel === MulDivLevel.ONE_BY_TWO ? '1位数×2位数'
        : config.mulDivLevel === MulDivLevel.TWO_DIGIT ? '2位数'
        : '3位数')
      : rangeStr;
    return isFFMulDiv ? `乘除一家人 ${ffDiff}` : `加减一家人 ${ffDiff}`;
  }
  if (config.specialPracticeType === SpecialPracticeType.NUMBER_BOND) {
    return `数字分解小乐园 ${rangeStr}`;
  }
  if (config.specialPracticeType === SpecialPracticeType.COLUMN_ARITHMETIC) {
    const opLabel = config.operation === OperationType.ADDITION ? '加法'
      : config.operation === OperationType.SUBTRACTION ? '减法'
      : config.operation === OperationType.MULTIPLICATION ? '乘法'
      : config.operation === OperationType.DIVISION ? '除法'
      : config.operation === OperationType.MULT_DIV_MIXED ? '乘除法'
      : '加减法';
    const isMulDiv2 = config.operation === OperationType.MULTIPLICATION
      || config.operation === OperationType.DIVISION
      || config.operation === OperationType.MULT_DIV_MIXED;
    const diffLabel2 = isMulDiv2 && config.mulDivLevel
      ? (config.mulDivLevel === MulDivLevel.ONE_DIGIT ? '1位数'
        : config.mulDivLevel === MulDivLevel.ONE_BY_TWO ? '1位数×2位数'
        : config.mulDivLevel === MulDivLevel.TWO_DIGIT ? '2位数'
        : '3位数')
      : rangeStr;
    return `${diffLabel2}${opLabel}列竖式`;
  }
  if (config.specialPracticeType === SpecialPracticeType.COMPARISON && config.comparisonConfig) {
    const subLabel = config.comparisonConfig.subType === ComparisonSubType.MAGNITUDE ? '比大小' : '比多少';
    return `${subLabel} ${rangeStr}`;
  }

  // Word problem display mode
  if (config.displayMode === DisplayMode.WORD_PROBLEM) {
    if (config.problemType === ProblemType.MULTI_STEP) {
      const mode = config.multiOperationConfig?.mode;
      const msLabel = mode === MultiOperationMode.CHAIN_ADDITION ? '连加'
        : mode === MultiOperationMode.CHAIN_SUBTRACTION ? '连减'
        : '加减混合';
      return `${msLabel}应用题 ${rangeStr}`;
    }
    const opLabel = config.operation === OperationType.ADDITION ? '加法'
      : config.operation === OperationType.SUBTRACTION ? '减法'
      : '加减混合';
    return `${opLabel}应用题 ${rangeStr}`;
  }

  // Multi operations
  if (config.problemType === ProblemType.MULTI_STEP) {
    const mode = config.multiOperationConfig?.mode;
    const opLabel = mode === MultiOperationMode.CHAIN_ADDITION ? '连加'
      : mode === MultiOperationMode.CHAIN_SUBTRACTION ? '连减'
      : mode === MultiOperationMode.CHAIN_MULTIPLICATION ? '连乘'
      : mode === MultiOperationMode.CHAIN_DIVISION ? '连除'
      : mode === MultiOperationMode.MULT_DIV_MIXED_CHAIN ? '乘除混合运算'
      : mode === MultiOperationMode.ALL_MIXED ? '加减乘除混合运算'
      : '加减混合运算';
    return `${opLabel}练习 ${rangeStr}`;
  }

  // Standard / fill-blank
  const getOpLabel = () => {
    switch (config.operation) {
      case OperationType.ADDITION: return '加法';
      case OperationType.SUBTRACTION: return '减法';
      case OperationType.MULTIPLICATION: return '乘法';
      case OperationType.DIVISION: return '除法';
      case OperationType.MULT_DIV_MIXED: return '乘除混合';
      case OperationType.ALL: return '四则运算';
      default: return '加减混合';
    }
  };
  const isMulDivOp = config.operation === OperationType.MULTIPLICATION
    || config.operation === OperationType.DIVISION
    || config.operation === OperationType.MULT_DIV_MIXED
    || config.operation === OperationType.ALL;
  const diffLabel = isMulDivOp && config.mulDivLevel
    ? (config.mulDivLevel === MulDivLevel.ONE_DIGIT ? '1位数'
      : config.mulDivLevel === MulDivLevel.ONE_BY_TWO ? '1位数×2位数'
      : config.mulDivLevel === MulDivLevel.TWO_DIGIT ? '2位数'
      : '3位数')
    : rangeStr;
  const pt = config.problemType as ProblemType;
  const typeSuffix = pt === ProblemType.FILL_BLANK ? '填空'
    : pt === ProblemType.MULTI_STEP ? '多步'
    : '练习';
  return `${getOpLabel()}${typeSuffix} ${diffLabel}`;
}

const Preview: React.FC<{ config: WorksheetConfig; problems: MathProblem[]; pdfContainerRef?: React.RefObject<HTMLDivElement | null> }> = ({
  config,
  problems,
  pdfContainerRef,
}) => {
  const instruction = config.specialPracticeType === SpecialPracticeType.COMPARISON && config.comparisonConfig?.subType === ComparisonSubType.MAGNITUDE
    ? '在 ○ 中填上 >、< 或 ='
    : undefined;

  return (
    <WorksheetPreview
      problems={problems}
      title={deriveWorksheetTitle(config)}
      theme={config.theme}
      showAnswers={config.showAnswers || false}
      displayMode={config.displayMode}
      textColumns={config.textColumns || 2}
      problemsPerPage={config.problemsPerPage}
      pdfContainerRef={pdfContainerRef}
      instruction={instruction}
    />
  );
};

const Settings: React.FC<{
  config: WorksheetConfig;
  onChange: (c: WorksheetConfig) => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
}> = ({ config, onChange, onGenerate, isGenerating }) => (
  <WorksheetSettings
    config={config}
    onChange={onChange}
    onGenerate={onGenerate}
    isGenerating={isGenerating}
  />
);

export const mathGenieTool: WorksheetTool<WorksheetConfig, MathProblem> = {
  id: 'math-genie',
  defaultConfig,
  generate,
  Preview,
  Settings,
  meta: {
    title: '数学练习 - DIYYY',
    icon: <CalculateIcon />,
    route: '/math-genie',
  },
  deriveContentColumns: (config) => {
    if (config.specialPracticeType === SpecialPracticeType.COLUMN_ARITHMETIC) return 3;
    if (config.specialPracticeType === SpecialPracticeType.COMPARISON) {
      return config.displayMode === DisplayMode.EMOJI ? 2 : config.textColumns || 1;
    }
    if (config.displayMode === DisplayMode.WORD_PROBLEM) return 1;
    if (config.displayMode === DisplayMode.EMOJI) return 2;
    if (config.problemType === ProblemType.MULTI_STEP) return 1;
    return config.textColumns || 2;
  },
};
