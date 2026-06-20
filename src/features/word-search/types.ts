export interface WordSearchConfig {
  /** 待查找单词列表，用户输入或主题加载 */
  words: string[];
  gridSize: GridSizePreset;
  difficulty: WordSearchDifficulty;
  title: string;
  /** 是否生成答案页 */
  showAnswerKey: boolean;
  /** 单词列表展示列数 */
  listColumns: 1 | 2 | 3;
  /** 网格字母大小写 */
  letterCase: 'upper' | 'lower';
  /** 主题词库选择（可选） */
  selectedTheme?: string;
}

export enum GridSizePreset {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export enum WordSearchDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export type Direction =
  | 'horizontal' | 'horizontal-reverse'
  | 'vertical'   | 'vertical-reverse'
  | 'diagonal-down' | 'diagonal-down-reverse'
  | 'diagonal-up'   | 'diagonal-up-reverse';

export const DIFFICULTY_DIRECTIONS: Record<WordSearchDifficulty, Direction[]> = {
  easy:   ['horizontal', 'vertical'],
  medium: ['horizontal', 'vertical', 'diagonal-down', 'diagonal-up'],
  hard:   ['horizontal', 'horizontal-reverse', 'vertical', 'vertical-reverse',
           'diagonal-down', 'diagonal-down-reverse', 'diagonal-up', 'diagonal-up-reverse'],
};

/** 网格尺寸映射（rows, cols） */
export const GRID_DIMENSIONS: Record<GridSizePreset, { rows: number; cols: number }> = {
  small:  { rows: 10, cols: 10 },
  medium: { rows: 14, cols: 14 },
  large:  { rows: 16, cols: 18 },
};

/** 每页建议单词数；超过时 generate() 自动拆分成多页 */
export const WORDS_PER_PAGE: Record<GridSizePreset, number> = {
  small:  8,
  medium: 14,
  large:  20,
};

export interface PlacedWord {
  word: string;
  start: { row: number; col: number };
  end: { row: number; col: number };
  direction: Direction;
  cells: { row: number; col: number }[];
}

/** 核心算法返回 */
export interface GridGenResult {
  grid: string[][];
  placedWords: PlacedWord[];
  unplacedWords: string[];
}

/** generate() 返回的"一页" */
export interface WordSearchSheet {
  id: string;
  title: string;
  grid: string[][];
  placedWords: PlacedWord[];
  unplacedWords: string[];
  listColumns: 1 | 2 | 3;
  isAnswerKey: boolean;
  /** 1-based page number (undefined when single-page) */
  pageNumber?: number;
  /** Total page count (undefined when single-page) */
  totalPages?: number;
}
