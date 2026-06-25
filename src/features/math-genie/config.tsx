import type { WorksheetTool } from 'src/shared/worksheet';
import type { MathProblem, WorksheetConfig } from 'src/types';

import React from 'react';
import { v4 as uuidv4 } from 'uuid';

import CalculateIcon from '@mui/icons-material/Calculate';

import {
  DisplayMode,
  ProblemType,
  OperationType,
  DifficultyLevel,
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
  excludeComparisonProblems: false,
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
    config.operation === OperationType.MULTI_OPERATIONS ? config.multiOperationConfig : undefined,
    config.excludeZeroProblems || false,
    config.displayMode,
    config.excludeComparisonProblems || false,
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
      : p.op === '+' ? p.a + p.b : p.a - p.b,
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
    return `加减一家人 ${rangeStr}`;
  }
  if (config.specialPracticeType === SpecialPracticeType.NUMBER_BOND) {
    return `数字分解小乐园 ${rangeStr}`;
  }

  // Word problem display mode
  if (config.displayMode === DisplayMode.WORD_PROBLEM) {
    if (config.operation === OperationType.MULTI_OPERATIONS) {
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
  if (config.operation === OperationType.MULTI_OPERATIONS) {
    const mode = config.multiOperationConfig?.mode;
    const opLabel = mode === MultiOperationMode.CHAIN_ADDITION ? '连加'
      : mode === MultiOperationMode.CHAIN_SUBTRACTION ? '连减'
      : '加减混合运算';
    return `${opLabel}练习 ${rangeStr}`;
  }

  // Standard / fill-blank
  const opLabel = config.operation === OperationType.ADDITION ? '加法'
    : config.operation === OperationType.SUBTRACTION ? '减法'
    : '加减混合';
  const typeSuffix = config.problemType === ProblemType.FILL_BLANK ? '填空' : '练习';
  return `${opLabel}${typeSuffix} ${rangeStr}`;
}

const Preview: React.FC<{ config: WorksheetConfig; problems: MathProblem[]; pdfContainerRef?: React.RefObject<HTMLDivElement | null> }> = ({
  config,
  problems,
  pdfContainerRef,
}) => (
  <WorksheetPreview
    problems={problems}
    title={deriveWorksheetTitle(config)}
    theme={config.theme}
    showAnswers={config.showAnswers || false}
    displayMode={config.displayMode}
    textColumns={config.textColumns || 2}
    problemsPerPage={config.problemsPerPage}
    pdfContainerRef={pdfContainerRef}
  />
);

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
    if (config.displayMode === DisplayMode.WORD_PROBLEM) return 1;
    if (config.displayMode === DisplayMode.EMOJI) return 2;
    return config.textColumns || 2;
  },
};
