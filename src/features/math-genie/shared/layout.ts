import type { ProblemType,
  OperationType,
  MultiOperationConfig} from 'src/types';

import {
  DisplayMode,
  DifficultyLevel,
  SpecialPracticeType,
} from 'src/types';

export interface PageLayout {
  columns: number;
  rows: number;
  problemsPerPage: number;
  fontSize: number;
  rowHeight: number;
  columnGap: number;
  rowGap: number;
}

const PAGE_HEIGHT_MM = 297;
// WorksheetPaper padding + title + safety margin for print.
const HEADER_MM = 85;
const AVAILABLE_HEIGHT_MM = PAGE_HEIGHT_MM - HEADER_MM; // 222
const PAGE_WIDTH_MM = 210;
const MARGIN_MM = 20 * 2; // left + right margins

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Derive page layout from columns, problemsPerPage, and display mode.
 * Single source of truth — replaces all getTextRowsPerPage copies.
 */
export function derivePageLayout(opts: {
  columns: number;
  problemsPerPage: number;
}): PageLayout {
  const { columns, problemsPerPage } = opts;

  const rows = Math.ceil(problemsPerPage / columns);
  const availableHeightMM = AVAILABLE_HEIGHT_MM;
  const availableWidthMM = PAGE_WIDTH_MM - MARGIN_MM;

  // Row height must account for gaps between rows.
  // Relationship: rows * rowH + (rows-1) * rowGap = availableHeight
  // where rowGap ≈ rowH * 0.15 (before clamping).
  // Solve: rowH = availableHeight / (rows + 0.15 * (rows-1))
  const rawRowHeight = availableHeightMM / (rows + 0.15 * (rows - 1));
  const rowGapMM = clamp(rawRowHeight * 0.15, 1, 6);
  // Recompute with actual (possibly clamped) gap for consistency
  const rowHeightMM = clamp((availableHeightMM - (rows - 1) * rowGapMM) / rows, 12, 30);

  const columnGapMM = clamp(availableWidthMM / (columns * 5), 2, 8);
  const fontSize = clamp(rowHeightMM * 0.4, 14, 28);

  return {
    columns,
    rows,
    problemsPerPage,
    fontSize: Math.round(fontSize),
    rowHeight: Math.round(rowHeightMM),
    columnGap: Math.round(columnGapMM),
    rowGap: Math.round(rowGapMM),
  };
}

// ---------- Optimal problems-per-page calculation ----------

interface OptimalParams {
  displayMode: DisplayMode;
  columns: number;
  problemType: ProblemType;
  specialPracticeType: SpecialPracticeType;
  operation: OperationType;
  difficulty: DifficultyLevel;
  customDifficulty?: { min: number; max: number };
  multiOperationConfig?: MultiOperationConfig;
}

function getEffectiveMax(difficulty: DifficultyLevel, customDifficulty?: { min: number; max: number }): number {
  if (difficulty === DifficultyLevel.CUSTOM) {
    return customDifficulty?.max ?? 20;
  }
  return difficulty as number as number;
}

function getMinCellHeightText(
  _problemType: ProblemType,
  specialPracticeType: SpecialPracticeType,
  operation: OperationType,
  multiOperationConfig?: MultiOperationConfig,
): number {
  if (specialPracticeType === SpecialPracticeType.NUMBER_BOND) return 47;
  if (specialPracticeType === SpecialPracticeType.COLUMN_ARITHMETIC) return 32;
  if (specialPracticeType === SpecialPracticeType.COMPARISON) return 22;
  if (multiOperationConfig) {
    if (multiOperationConfig.numberCount >= 5) return 18;
    return 20;
  }
  return 20;
}

function getMinCellHeightEmoji(maxNum: number): number {
  if (maxNum <= 5) return 48;
  if (maxNum <= 10) return 58;
  return 58;
}

function findMaxProblemsByContentHeight(columns: number, minCellHeightMM: number): number {
  const gap = clamp(minCellHeightMM * 0.15, 1, 6);
  const maxRows = Math.floor((AVAILABLE_HEIGHT_MM + gap) / (minCellHeightMM + gap));
  return maxRows * columns;
}

function findMaxProblemsForText(columns: number, minRowHeightMM: number): number {
  let maxValid = columns;
  // Iterate upward — rowHeight decreases as problemsPerPage increases.
  // rowHeight from derivePageLayout is clamped to [12, 30] so
  // minRowHeightMM must be ≤ 30 for this path.
  for (let p = columns; p <= 60; p++) {
    const layout = derivePageLayout({ columns, problemsPerPage: p });
    if (layout.rowHeight >= minRowHeightMM) {
      maxValid = p;
    } else {
      break;
    }
  }
  return maxValid;
}

/**
 * Calculate the maximum number of problems that fit on a single A4 page
 * for the given configuration. Used as the default problemsPerPage value
 * and adapts automatically when display mode, problem type, or difficulty change.
 */
export function calculateOptimalProblemsPerPage(params: OptimalParams): number {
  const { displayMode, columns, problemType, specialPracticeType, operation, difficulty, customDifficulty, multiOperationConfig } = params;

  if (displayMode === DisplayMode.WORD_PROBLEM) {
    return findMaxProblemsByContentHeight(1, 48);
  }

  if (displayMode === DisplayMode.EMOJI) {
    const maxNum = getEffectiveMax(difficulty, customDifficulty);
    const minH = getMinCellHeightEmoji(maxNum);
    return Math.max(2, findMaxProblemsByContentHeight(2, minH));
  }

  // TEXT mode: use derivePageLayout iteration when content fits within [12,30]mm clamp,
  // otherwise fall back to content-height estimate (e.g. number bond SVG > 30mm).
  const minH = getMinCellHeightText(problemType, specialPracticeType, operation, multiOperationConfig);
  if (minH <= 30) {
    const raw = findMaxProblemsForText(columns, minH);
    return clamp(raw, columns, 30);
  }
  const raw = findMaxProblemsByContentHeight(columns, minH);
  return Math.max(columns, raw);
}
