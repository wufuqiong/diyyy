import { pinyin } from 'pinyin-pro';

import { CharData } from 'src/types';

// Small fallback DB for stroke counts (since pinyin-pro doesn't provide strokes by default).
// In a full app, you might use a library like 'cnchar' for strokes, but for now we keep the structure.
const STROKE_DB: Record<string, number> = {
  '锄': 12, '禾': 5, '日': 4, '当': 6, '午': 4,
  '汗': 6, '滴': 15, '下': 3, '土': 3,
  '谁': 10, '知': 8, '盘': 11, '中': 4, '餐': 16,
  '粒': 11, '皆': 9, '辛': 7, '苦': 8,
  '你': 7, '好': 6, '爸': 8, '妈': 6,
  '我': 7, '爱': 10, '国': 8
};

export const getCharData = (char: string): CharData => {
  // Use pinyin-pro for accurate pinyin
  let pinyinStr = '';
  try {
    pinyinStr = pinyin(char, { toneType: 'symbol' });
  } catch (e) {
    pinyinStr = '';
  }

  // Fallback or lookup for strokes
  const strokes = STROKE_DB[char] || 0;

  return { 
    char, 
    pinyin: pinyinStr, 
    strokes 
  };
};