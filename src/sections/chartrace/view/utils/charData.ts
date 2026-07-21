import type { CharData } from 'src/types';

import { pinyin } from 'pinyin-pro';

export const getCharData = (char: string): CharData => {
  // Use pinyin-pro for accurate pinyin
  let pinyinStr = '';
  try {
    pinyinStr = pinyin(char, { toneType: 'symbol' });
  } catch {
    pinyinStr = '';
  }

  return { char, pinyin: pinyinStr };
};
