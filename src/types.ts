export interface LanguageLevels {
  [level: string]: string[];
}

export interface MiemieData {
  [language: string]: LanguageLevels;
}

export interface MiemieLesson {
  word: string[];
  title: string;
  phrase: string[];
  sentence: string[];
}

export interface MiemieDetails {
  "小羊上山-1级": MiemieLesson[];
  "小羊上山-2级": MiemieLesson[];
  "小羊上山-3级": MiemieLesson[];
  "小羊上山-4级": MiemieLesson[];
  "小羊上山-5级": MiemieLesson[];
  "小羊上山-6级": MiemieLesson[];
}

export interface PreviewSheetState {
  currentPage: number;
}

export enum DifficultyLevel {
  EASY = 5,
  MEDIUM = 10,
  HARD = 20
}

export enum OperationType {
  ADDITION = 'addition',
  SUBTRACTION = 'subtraction',
  MIXED = 'mixed'
}

export interface MathProblem {
  id: string;
  operation: '+' | '-';
  num1: number;
  num2: number;
  emoji1: string;
  emoji2: string;
  answer: number;
}

export interface WorksheetConfig {
  theme: string;
  difficulty: DifficultyLevel;
  operation: OperationType;
  count: number;
  title: string;
  showAnswers?: boolean; // Add this
}

export interface GenerationResponse {
  problems: Array<{
    op: '+' | '-';
    a: number;
    b: number;
    emoji1: string;
    emoji2?: string;
  }>;
  titleSuggestion: string;
}

export enum GridType {
  TIAN = 'tian', // 田字格
  MI = 'mi',     // 米字格
  SQUARE = 'square', // 方格
  ENGLISH_LINES = 'english', // 四线格 (English 4-lines)
  NONE = 'none'
}

export interface SheetConfig {
  // Content
  text: string;

  // Grid Appearance
  gridType: GridType;
  gridColor: string;
  gridOpacity: number;
  gridSize: number; // in mm roughly, translated to px

  // Text Appearance
  fontFamily: string;
  mainTextColor: string; // The solid character
  traceTextColor: string; // The faded character
  traceOpacity: number;

  // Layout
  rowsPerPage: number;
  colsPerRow: number;
  traceCount: number; // Number of characters to trace after the main one

  // Header/Footer
  headerTitle: string;
  headerContent: string;

  // Advanced
  showPinyin: boolean;
  showStrokeCount: boolean;
  showStrokeOrder: boolean; // Simulates step-by-step
}

export interface CharData {
  char: string;
  pinyin: string;
  strokes: number;
}