export type ChartMode = 'grid' | 'cross';

export enum BlankMode {
  RANDOM = 'random',
  PATTERN = 'pattern',
  MANUAL = 'manual',
  ANSWER_KEY = 'answerKey',
}

export type Difficulty = 'easy' | 'medium' | 'hard';

// ---------- shared cell ----------

export interface CellData {
  number: number;
  isBlank: boolean;
}

// ---------- cross puzzle ----------

export interface ShapeCell extends CellData {
  row: number;
  col: number;
}

export interface CrossPuzzle {
  id: string;
  /** 2D grid: cells[row][col]. null = no cell (empty slot, hidden). */
  grid: (ShapeCell | null)[][];
  rows: number;
  cols: number;
  questionNumber: number;
}

// ---------- cross mode sub-options ----------

export type EasyHintPosition = 'random' | 'top_center' | 'left_center' | 'center_right_bottom';
export type MediumCellCount = 'random5-6' | 'fixed5' | 'fixed6';
export type MediumHintCount = 'random2-3' | 'fixed2' | 'fixed3';
export type HardCellCount = 'random5-9' | 'fixed5' | 'fixed7' | 'fixed9';

// ---------- config ----------

export interface HundredChartConfig {
  // shared
  mode: ChartMode;
  pageTitle: string;
  pageInfo: string;
  versionCount: number;
  includeAnswerKey: boolean;

  // grid mode
  startNumber: number;
  blankMode: BlankMode;
  blankCount: number;
  step: number;
  offset: number;
  manualBlanks: number[];

  // cross mode
  showFormula: boolean;
  showExample: boolean;
  showNumbering: boolean;
  minCenter: number;
  maxCenter: number;
  questionsPerPage: number;
  columnsPerRow: number;
  difficulty: Difficulty;

  // difficulty sub-options
  easyHintCount: 2 | 3;
  easyHintPosition: EasyHintPosition;
  mediumCellCount: MediumCellCount;
  mediumHintCount: MediumHintCount;
  hardCellCount: HardCellCount;
}

// ---------- sheet ----------

export interface HundredChartSheet {
  id: string;
  mode: ChartMode;
  pageTitle: string;
  pageInfo: string;
  isAnswerKey: boolean;

  // grid mode
  cells?: CellData[];
  startNumber?: number;

  // cross mode
  puzzles?: CrossPuzzle[];
  subtitle?: string;
  showName?: boolean;
  showDate?: boolean;
  showFormula?: boolean;
  showExample?: boolean;
  showNumbering?: boolean;
  columnsPerRow?: number;
  examplePuzzle?: CrossPuzzle;
}
