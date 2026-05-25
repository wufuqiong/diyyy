export interface RawMathProblem {
  op: '+' | '-';
  a: number;
  b: number;
  emoji1: string;
  emoji2?: string;
  blankPosition?: 'first' | 'second' | 'result';
  equationText?: string;
  equationAnswerText?: string;
  isMultiOperation?: boolean;
  numbers?: number[];
  operators?: ('+' | '-')[];
  emojis?: string[];
  // Number bond fields
  isNumberBond?: boolean;
  numberBondWhole?: number;
  numberBondParts?: [number, number];
  numberBondBlankIndex?: 0 | 1 | 'whole';
  // Word problem fields
  isWordProblem?: boolean;
  wordProblemText?: string;
  wordProblemOperation?: 'addition' | 'subtraction';
  wordProblemMeasure?: string;
}

export const THEME_EMOJIS: Record<string, string[]> = {
  fruits: ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍑', '🍍', '🥭', '🫐'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'],
  vehicles: ['🚗', '🚌', '🚲', '🛴', '🚀', '✈️', '🚁', '🛳️', '🚂', '🚜'],
  sports: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏸', '🏏'],
  food: ['🍕', '🍔', '🌭', '🍟', '🍦', '🍩', '🍪', '🎂', '🍫', '🍿'],
  nature: ['🌲', '🌳', '🌴', '🌵', '🌺', '🌸', '🌼', '🌻', '🍁', '🍀'],
  weather: ['☀️', '⛅', '☁️', '🌧️', '⛈️', '🌩️', '❄️', '☃️', '🌪️', '🌈'],
  emotions: ['😀', '😁', '😂', '🥲', '😊', '😇', '🥰', '😍', '🤩', '😎'],
};

export const THEME_TITLES: Record<string, { en: string; zh: string }> = {
  fruits: { en: 'Fruit Fun Math!', zh: '水果数学乐趣！' },
  animals: { en: 'Animal Math Adventure', zh: '动物数学冒险' },
  vehicles: { en: 'Vehicle Math Journey', zh: '交通工具数学之旅' },
  sports: { en: 'Sports Math Challenge', zh: '运动数学挑战' },
  food: { en: 'Yummy Food Math', zh: '美味食物数学' },
  nature: { en: 'Nature Math Explorers', zh: '自然数学探索者' },
  weather: { en: 'Weather Math Fun', zh: '天气数学乐趣' },
  emotions: { en: 'Feelings Math Party', zh: '情感数学派对' },
  default: { en: 'Awesome Math Worksheet', zh: '超级数学工作表' },
};

export function getRandomEmoji(emojis: string[]): string {
  return emojis[Math.floor(Math.random() * emojis.length)];
}

export function getTwoDifferentEmojis(emojis: string[]): { emoji1: string; emoji2: string } {
  if (emojis.length < 2) {
    return { emoji1: '⭐', emoji2: '🌟' };
  }

  const index1 = Math.floor(Math.random() * emojis.length);
  let index2 = Math.floor(Math.random() * emojis.length);
  while (index2 === index1) {
    index2 = Math.floor(Math.random() * emojis.length);
  }

  return { emoji1: emojis[index1], emoji2: emojis[index2] };
}

export function getSameEmojiPair(emojis: string[]): { emoji1: string; emoji2: string } {
  if (!emojis.length) {
    return { emoji1: '⭐', emoji2: '⭐' };
  }

  const emoji = getRandomEmoji(emojis);
  return { emoji1: emoji, emoji2: emoji };
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomIntIncludingZero(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function isChineseTheme(theme: string): boolean {
  return /[\u4e00-\u9fff]/.test(theme);
}

export function evaluateMultiOperation(numbers: number[], operators: ('+' | '-')[]) {
  const intermediates: number[] = [numbers[0]];
  let current = numbers[0];

  for (let i = 1; i < numbers.length; i++) {
    current = operators[i - 1] === '+' ? current + numbers[i] : current - numbers[i];
    intermediates.push(current);
  }

  return { intermediates, finalResult: current };
}

export function problemContainsZero(problem: RawMathProblem): boolean {
  if (problem.isMultiOperation && problem.numbers && problem.operators) {
    const { intermediates, finalResult } = evaluateMultiOperation(problem.numbers, problem.operators);
    return problem.numbers.some((n) => n === 0) || intermediates.some((v) => v === 0) || finalResult === 0;
  }

  const result = problem.op === '+' ? problem.a + problem.b : problem.a - problem.b;
  return problem.a === 0 || problem.b === 0 || result === 0;
}
