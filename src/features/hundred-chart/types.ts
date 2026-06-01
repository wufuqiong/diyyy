export enum BlankMode {
  RANDOM = 'random',
  PATTERN = 'pattern',
  MANUAL = 'manual',
  ANSWER_KEY = 'answerKey',
}

export interface HundredChartConfig {
  pageTitle: string;
  pageInfo: string;
  startNumber: number;
  blankMode: BlankMode;
  blankCount: number;
  step: number;
  offset: number;
  manualBlanks: number[];
  versionCount: number;
  includeAnswerKey: boolean;
}

export interface HundredChartSheet {
  id: string;
  cells: { number: number; isBlank: boolean }[];
  pageTitle: string;
  pageInfo: string;
  startNumber: number;
  isAnswerKey: boolean;
}
