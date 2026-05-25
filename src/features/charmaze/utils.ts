import type { MiemieData } from 'src/types';

import { shuffleArray } from 'src/utils/array-tools';
import { generateWordMazePath, generatePhraseMazePath, generateSentenceMazePath } from 'src/utils/maze-tools';

import { parseSelectedMode, TABLE_SIZE_PRESETS } from './types';

import type { MazePageData, CharMazeConfig } from './types';

function hasChineseCharacters(characters: string[]): boolean {
  const chineseRegex = /[\u4e00-\u9fff]/;
  return characters.some((char) => chineseRegex.test(char));
}

export function generateMaze(
  chars: string[],
  rows: number,
  cols: number,
  mode: string,
  miemieWordData: MiemieData
): string[][] {
  const maze: string[][] = [];
  let simpleChars: string[] = [];

  if (hasChineseCharacters(chars)) {
    simpleChars = Object.values(miemieWordData['Chinese'] || {}).flat();
    simpleChars = ['，', '。', '！', ...simpleChars];
  } else {
    simpleChars = miemieWordData['English']?.['英语字母'] || [];
    simpleChars = [...simpleChars, ...simpleChars, ...simpleChars];
  }

  simpleChars = shuffleArray(simpleChars);

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
    inputChars = userInput.split(splitPattern).filter((char) => char.trim() !== '');
  }

  if (inputChars.length === 0) {
    return [];
  }

  if (mode === 'WORD') {
    for (let i = 0; i < inputChars.length; i++) {
      const pageChars = generateMaze([inputChars[i]], rows, cols, mode, miemieWordData);
      newPages.push({ refChars: [inputChars[i]], chars: pageChars, rows, cols, mode });
    }
  } else if (mode === 'PHRASE') {
    const totalPages = Math.ceil(inputChars.length / wordsPerPage);
    for (let i = 0; i < totalPages; i++) {
      const startIndex = i * wordsPerPage;
      const endIndex = startIndex + wordsPerPage;
      const pageCharsSlice = inputChars.slice(startIndex, endIndex);
      if (pageCharsSlice.length > 0) {
        const pageChars = generateMaze(pageCharsSlice, rows, cols, mode, miemieWordData);
        newPages.push({ refChars: pageCharsSlice, chars: pageChars, rows, cols, mode });
      }
    }
  } else if (mode === 'SENTENCE') {
    for (let i = 0; i < inputChars.length; i++) {
      const sentence = inputChars[i];
      const chars = sentence.split('').filter((char) => char.trim() !== '');
      if (chars.length > 0) {
        const pageChars = generateMaze(chars, rows, cols, mode, miemieWordData);
        newPages.push({ refChars: [sentence], chars: pageChars, rows, cols, mode });
      }
    }
  }

  return newPages;
}
