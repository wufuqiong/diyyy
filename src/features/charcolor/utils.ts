import type { MiemieData } from 'src/types';

import { shuffleArray } from 'src/utils/array-tools';

import type { PageData, ColorPreset, CharColorConfig } from './types';

export const COLOR_PRESETS: ColorPreset[] = [
  { name: '经典组合', colors: ['#FF6B6B', '#f5b63aff', '#45B7D1', '#51db8dff', '#F7DC6F'] },
  { name: '柔和组合', colors: ['#FF9999', '#66CCCC', '#9999FF', '#FFCC99', '#CC99FF'] },
  { name: '鲜艳组合', colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'] },
  { name: '自然组合', colors: ['#8B4513', '#228B22', '#1E90FF', '#FFD700', '#FF6347'] },
];

export function userInputToChars(userInput: string): string[] {
  let inputChars: string[] = [];
  if (userInput.trim() !== '') {
    inputChars = userInput.split(/[\s,;，；、]+/).filter((char) => char.trim() !== '');
  }
  if (inputChars.length === 0 && userInput.trim() !== '') {
    inputChars = userInput.split('').filter((char) => char.trim() !== '');
  }
  return inputChars;
}

function generateRandomColorsForPage(pageChars: string[], presetIndex: number): string[] {
  const presetColors = COLOR_PRESETS[presetIndex].colors;
  const numColors = Math.min(pageChars.length, 5);
  const shuffledColors = shuffleArray(presetColors).slice(0, numColors);
  return pageChars.map((_, index) => shuffledColors[index % shuffledColors.length]);
}

export function generateCharColorPages(config: CharColorConfig): PageData[] {
  const { userInput, wordsPerPage, selectedPreset } = config;

  if (!userInput.trim()) {
    return [];
  }

  if (wordsPerPage < 2 || wordsPerPage > 5) {
    return [];
  }

  const inputChars = userInputToChars(userInput);
  const totalPages = Math.ceil(inputChars.length / wordsPerPage);
  const newPages: PageData[] = [];

  for (let i = 0; i < totalPages; i++) {
    const startIndex = i * wordsPerPage;
    const endIndex = startIndex + wordsPerPage;
    const pageChars = inputChars.slice(startIndex, endIndex);

    if (pageChars.length < wordsPerPage) {
      const neededChars = wordsPerPage - pageChars.length;
      pageChars.push(...inputChars.slice(0, neededChars));
    }

    const pageColors = generateRandomColorsForPage(pageChars, selectedPreset);
    newPages.push({ chars: pageChars, colors: pageColors });
  }

  return newPages;
}

export function hasChineseCharacters(characters: string[]): boolean {
  const chineseRegex = /[\u4e00-\u9fff]/;
  return characters.some((char) => chineseRegex.test(char));
}

export function generatePatterns(characters: string[], miemie: MiemieData): string[][] {
  if (characters.length === 0) return [];

  const chars = characters.flatMap((char) => [...char]);
  let additionalChars: string[] = [];

  if (hasChineseCharacters(characters)) {
    additionalChars = Object.values(miemie['Chinese'] || {}).flat();
  } else {
    additionalChars = miemie['English']?.['英语字母'] || [];
  }
  additionalChars = additionalChars.concat(additionalChars);
  additionalChars = shuffleArray(additionalChars);

  const result: string[][] = [];
  for (let i = 0; i < 7; i++) {
    additionalChars = shuffleArray(additionalChars);
    const randomAdditional = additionalChars.slice(0, 7 - chars.length);
    let line = [...chars, ...randomAdditional];
    line = shuffleArray(line);
    result.push(line);
  }

  return result;
}
