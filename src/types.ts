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