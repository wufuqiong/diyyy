export type MazeMode = 'WORD' | 'PHRASE' | 'SENTENCE';

export interface TableSizePreset {
  name: string;
  rows: number;
  cols: number;
}

export interface CharMazeConfig {
  userInput: string;
  selectedMode: number;
  wordsPerPage: number;
  selectedTableSize: number;
  selectedLevel: string;
  fullSelectedValue: string;
  selectedBook: string;
}

export interface MazePageData {
  refChars: string[];
  chars: string[][];
  rows: number;
  cols: number;
  mode: string;
}

export const TABLE_SIZE_PRESETS: TableSizePreset[] = [
  { name: '8 x 8', rows: 8, cols: 8 },
  { name: '9 x 9', rows: 9, cols: 9 },
  { name: '10 x 10', rows: 10, cols: 10 },
  { name: '12 x 12', rows: 12, cols: 12 },
];

export const MODE_PRESETS: Record<MazeMode, string> = {
  WORD: '单字练习',
  PHRASE: '词语练习',
  SENTENCE: '句子练习',
};

export const SELECTER_TITLE_PRESETS: Record<MazeMode, string> = {
  WORD: '预设字库',
  PHRASE: '预设词库',
  SENTENCE: '预设句库',
};

export function parseSelectedMode(selectedMode: number): MazeMode {
  return Object.keys(MODE_PRESETS)[selectedMode] as MazeMode;
}

export function getSplitter(mode: MazeMode): string {
  return mode === 'SENTENCE' ? '\n' : ',';
}
