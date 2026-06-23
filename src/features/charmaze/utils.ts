import type { MiemieData } from 'src/types';

import { shuffleArray } from 'src/utils/array-tools';
import { generateWordMazePath, generatePhraseMazePath, generateSentenceMazePath } from 'src/utils/maze-tools';

import { parseSelectedMode, TABLE_SIZE_PRESETS } from './types';

import type { MazePageData, CharMazeConfig } from './types';

const MAX_PAGES = 50;

function hasChineseCharacters(characters: string[]): boolean {
  const chineseRegex = /[\u4e00-\u9fff]/;
  return characters.some((char) => chineseRegex.test(char));
}

export function generateMaze(
  chars: string[],
  rows: number,
  cols: number,
  mode: string,
  miemieWordData: MiemieData,
  fillerChars?: string[]
): string[][] {
  const maze: string[][] = [];
  let simpleChars: string[];

  if (fillerChars) {
    simpleChars = fillerChars;
  } else if (hasChineseCharacters(chars)) {
    simpleChars = Object.values(miemieWordData['Chinese'] || {}).flat();
    simpleChars = ['，', '。', '！', ...simpleChars];
    simpleChars = shuffleArray(simpleChars);
  } else {
    simpleChars = miemieWordData['English']?.['英语字母'] || [];
    simpleChars = [...simpleChars, ...simpleChars, ...simpleChars];
    simpleChars = shuffleArray(simpleChars);
  }

  for (let i = 0; i < rows; i++) {
    const row: string[] = [];
    for (let j = 0; j < cols; j++) {
      row.push(simpleChars[(i * rows + j) % simpleChars.length]);
    }
    maze.push(row);
  }

  if (mode === 'WORD' && chars.length > 0) {
    const char = chars[0];
    const path = generateWordMazePath(rows, cols);
    for (let i = 0; i < path.length; i++) {
      const randomChar = char[Math.floor(Math.random() * char.length)];
      maze[path[i][0]][path[i][1]] = randomChar;
    }
  } else if (mode === 'PHRASE') {
    const wordPositions = generatePhraseMazePath(chars, rows, cols);
    wordPositions.forEach((wordPos) => {
      const { word, positions } = wordPos;
      for (let i = 0; i < word.length; i++) {
        if (positions[i]) {
          maze[positions[i][0]][positions[i][1]] = word[i];
        }
      }
    });
  } else if (mode === 'SENTENCE') {
    if (chars.length > 0) {
      const sentence = chars.join('');
      const path = generateSentenceMazePath(sentence, rows, cols);
      for (let i = 0; i < Math.min(sentence.length, path.length); i++) {
        maze[path[i][0]][path[i][1]] = sentence[i];
      }
    }
  }

  return maze;
}

export function generateMazePages(
  config: CharMazeConfig,
  miemieWordData: MiemieData
): MazePageData[] {
  const { userInput, selectedMode, wordsPerPage, selectedTableSize } = config;

  if (!userInput.trim()) {
    return [];
  }

  const rows = TABLE_SIZE_PRESETS[selectedTableSize].rows;
  const cols = TABLE_SIZE_PRESETS[selectedTableSize].cols;
  const mode = parseSelectedMode(selectedMode);
  const newPages: MazePageData[] = [];

  let inputChars: string[] = [];
  if (userInput.trim() !== '') {
    const splitPattern = mode === 'SENTENCE' ? /[\n]+/ : /[\s,;，；、]+/;
    const tokens = userInput
      .split(splitPattern)
      .map((token) => {
        const chineseOnly = [...token].filter((c) => /[\u4e00-\u9fff]/.test(c)).join('');
        return chineseOnly.trim();
      })
      .filter((token) => token.length > 0);

    if (mode === 'WORD') {
      // In WORD mode, split each token into individual Chinese characters
      inputChars = tokens.flatMap((token) => [...token]);
    } else {
      inputChars = tokens;
    }
  }

  if (inputChars.length === 0) {
    return [];
  }

  // Precompute the filler character pool once for all pages (avoid per-page rebuild).
  const isChinese = hasChineseCharacters(inputChars);
  let fillerPool: string[];
  if (isChinese) {
    fillerPool = Object.values(miemieWordData['Chinese'] || {}).flat();
    fillerPool = ['，', '。', '！', ...fillerPool];
  } else {
    fillerPool = miemieWordData['English']?.['英语字母'] || [];
    fillerPool = [...fillerPool, ...fillerPool, ...fillerPool];
  }
  fillerPool = shuffleArray(fillerPool);

  // Re-shuffle per page for variation (maze-tools uses per-cell cycling).
  const shuffledFiller = () => shuffleArray([...fillerPool]);

  if (mode === 'WORD') {
    const count = Math.min(inputChars.length, MAX_PAGES);
    for (let i = 0; i < count; i++) {
      const pageChars = generateMaze([inputChars[i]], rows, cols, mode, miemieWordData, shuffledFiller());
      newPages.push({ refChars: [inputChars[i]], chars: pageChars, rows, cols, mode });
    }
  } else if (mode === 'PHRASE') {
    const totalPages = Math.min(Math.ceil(inputChars.length / wordsPerPage), MAX_PAGES);
    for (let i = 0; i < totalPages; i++) {
      const startIndex = i * wordsPerPage;
      const endIndex = startIndex + wordsPerPage;
      const pageCharsSlice = inputChars.slice(startIndex, endIndex);
      if (pageCharsSlice.length > 0) {
        const pageChars = generateMaze(pageCharsSlice, rows, cols, mode, miemieWordData, shuffledFiller());
        newPages.push({ refChars: pageCharsSlice, chars: pageChars, rows, cols, mode });
      }
    }
  } else if (mode === 'SENTENCE') {
    const count = Math.min(inputChars.length, MAX_PAGES);
    for (let i = 0; i < count; i++) {
      const sentence = inputChars[i];
      const chars = sentence.split('').filter((char) => char.trim() !== '');
      if (chars.length > 0) {
        const pageChars = generateMaze(chars, rows, cols, mode, miemieWordData, shuffledFiller());
        newPages.push({ refChars: [sentence], chars: pageChars, rows, cols, mode });
      }
    }
  }

  return newPages;
}
