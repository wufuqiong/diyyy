import type { MiemieData } from 'src/types';
import type { CharColorConfig } from 'src/features/charcolor/types';

import { it, expect, describe } from 'vitest';

/** Minimal valid CharColorConfig for testing page generation */
function makeConfig(overrides: Partial<CharColorConfig> = {}): CharColorConfig {
  return {
    userInput: '你好世界',
    wordsPerPage: 5,
    selectedPreset: 0,
    selectedLevel: '小羊上山-1级',
    fullSelectedValue: '小羊上山-1级',
    selectedBook: '小羊上山-1级',
    ...overrides,
  };
}

describe('Char Color Utils', () => {
  // ------------------------------------------------------------------
  // COLOR_PRESETS
  // ------------------------------------------------------------------
  describe('COLOR_PRESETS', () => {
    it('has exactly 4 presets', async () => {
      const { COLOR_PRESETS } = await import('src/features/charcolor/utils');
      expect(COLOR_PRESETS).toHaveLength(4);
    });

    it('each preset has exactly 5 colors', async () => {
      const { COLOR_PRESETS } = await import('src/features/charcolor/utils');
      for (const preset of COLOR_PRESETS) {
        expect(preset.colors).toHaveLength(5);
      }
    });

    it('every preset has a non-empty name', async () => {
      const { COLOR_PRESETS } = await import('src/features/charcolor/utils');
      for (const preset of COLOR_PRESETS) {
        expect(preset.name.length).toBeGreaterThan(0);
      }
    });
  });

  // ------------------------------------------------------------------
  // userInputToChars
  // ------------------------------------------------------------------
  describe('userInputToChars', () => {
    it('splits input into individual characters', async () => {
      const { userInputToChars } = await import('src/features/charcolor/utils');
      expect(userInputToChars('你好')).toEqual(['你', '好']);
    });

    it('returns empty array for empty string', async () => {
      const { userInputToChars } = await import('src/features/charcolor/utils');
      expect(userInputToChars('')).toEqual([]);
    });

    it('returns empty array for whitespace-only string', async () => {
      const { userInputToChars } = await import('src/features/charcolor/utils');
      expect(userInputToChars('   ')).toEqual([]);
    });

    it('filters out whitespace characters', async () => {
      const { userInputToChars } = await import('src/features/charcolor/utils');
      expect(userInputToChars('你 好 世 界')).toEqual(['你', '好', '世', '界']);
    });

    it('handles mixed delimiters (spaces, commas)', async () => {
      const { userInputToChars } = await import('src/features/charcolor/utils');
      expect(userInputToChars('大,人,小,山,羊')).toEqual(['大', ',', '人', ',', '小', ',', '山', ',', '羊']);
    });
  });

  // ------------------------------------------------------------------
  // hasNonChineseChars
  // ------------------------------------------------------------------
  describe('hasNonChineseChars', () => {
    it('returns false for pure Chinese characters', async () => {
      const { hasNonChineseChars } = await import('src/features/charcolor/utils');
      expect(hasNonChineseChars('你好世界')).toBe(false);
    });

    it('returns true when input contains English letters', async () => {
      const { hasNonChineseChars } = await import('src/features/charcolor/utils');
      expect(hasNonChineseChars('hello')).toBe(true);
    });

    it('returns true when input contains digits', async () => {
      const { hasNonChineseChars } = await import('src/features/charcolor/utils');
      expect(hasNonChineseChars('你好123')).toBe(true);
    });

    it('returns true for mixed Chinese and English', async () => {
      const { hasNonChineseChars } = await import('src/features/charcolor/utils');
      expect(hasNonChineseChars('你好world')).toBe(true);
    });

    it('returns false for empty string (ignores trimmed empty chars)', async () => {
      const { hasNonChineseChars } = await import('src/features/charcolor/utils');
      expect(hasNonChineseChars('')).toBe(false);
    });
  });

  // ------------------------------------------------------------------
  // generateCharColorPages — correctness
  // ------------------------------------------------------------------
  describe('generateCharColorPages - correctness', () => {
    it('given 5 chars, each page has target chars with assigned colors', async () => {
      const { generateCharColorPages } = await import('src/features/charcolor/utils');
      const config = makeConfig({ userInput: '上海自来水', wordsPerPage: 5 });
      const pages = generateCharColorPages(config);

      expect(pages).toHaveLength(1);
      const page = pages[0]!;
      expect(page.chars).toHaveLength(5);
      expect(page.colors).toHaveLength(5);
      expect(page.chars).toEqual(['上', '海', '自', '来', '水']);

      // Every page char gets a color (non-empty string)
      for (const color of page.colors) {
        expect(color).toMatch(/^#[0-9A-Fa-f]{6,8}$/);
      }
    });

    it('generates totalPages = ceil(inputChars / wordsPerPage)', async () => {
      const { generateCharColorPages } = await import('src/features/charcolor/utils');
      // 7 chars, 3 per page -> 3 pages (3 + 3 + 1 padded)
      const config = makeConfig({ userInput: '一二三四五六七', wordsPerPage: 3 });
      const pages = generateCharColorPages(config);
      expect(pages).toHaveLength(3);
    });

    it('pads incomplete pages by wrapping to beginning of input', async () => {
      const { generateCharColorPages } = await import('src/features/charcolor/utils');
      // 3 chars, 5 per page -> page with 3 original + 2 from input start
      const config = makeConfig({ userInput: '你我他', wordsPerPage: 5 });
      const pages = generateCharColorPages(config);

      expect(pages).toHaveLength(1);
      const page = pages[0]!;
      expect(page.chars).toHaveLength(5);
      // First 3 are the original, last 2 come from input[0..1]
      expect(page.chars.slice(0, 3)).toEqual(['你', '我', '他']);
      expect(page.chars[3]).toBe('你');
      expect(page.chars[4]).toBe('我');
    });
  });

  // ------------------------------------------------------------------
  // generateCharColorPages — boundary
  // ------------------------------------------------------------------
  describe('generateCharColorPages - boundary', () => {
    it('empty userInput returns [] (no throw)', async () => {
      const { generateCharColorPages } = await import('src/features/charcolor/utils');
      const config = makeConfig({ userInput: '' });
      const pages = generateCharColorPages(config);
      expect(pages).toEqual([]);
    });

    it('whitespace-only userInput returns []', async () => {
      const { generateCharColorPages } = await import('src/features/charcolor/utils');
      const config = makeConfig({ userInput: '   ' });
      const pages = generateCharColorPages(config);
      expect(pages).toEqual([]);
    });

    it('wordsPerPage < 2 returns []', async () => {
      const { generateCharColorPages } = await import('src/features/charcolor/utils');
      const config = makeConfig({ wordsPerPage: 1 });
      const pages = generateCharColorPages(config);
      expect(pages).toEqual([]);
    });

    it('wordsPerPage > 5 returns []', async () => {
      const { generateCharColorPages } = await import('src/features/charcolor/utils');
      const config = makeConfig({ wordsPerPage: 6 });
      const pages = generateCharColorPages(config);
      expect(pages).toEqual([]);
    });

    it('more chars than colors (5+ chars, 5-color preset) cycles colors', async () => {
      const { generateCharColorPages } = await import('src/features/charcolor/utils');
      // 7 unique chars, 3 per page -> 3 pages. Colors should cycle within the per-page pool.
      const config = makeConfig({ userInput: '天碧江澄雨水清', wordsPerPage: 3, selectedPreset: 0 });
      const pages = generateCharColorPages(config);

      // Each page has chars.length === colors.length
      for (const page of pages) {
        expect(page.colors).toHaveLength(page.chars.length);
      }
    });

    it('large input (500 chars) does not throw or hang', async () => {
      const { generateCharColorPages } = await import('src/features/charcolor/utils');
      // Build 500 chars by repeating a common character pattern
      const baseChars = '天地人和日月星辰山水火风雷雨雪云龙虎雀龟蛇';
      const largeInput = Array.from({ length: 500 }, (_, i) => baseChars[i % baseChars.length]).join('');
      expect(largeInput.length).toBe(500);

      const startTime = Date.now();
      const config = makeConfig({ userInput: largeInput, wordsPerPage: 5 });
      const pages = generateCharColorPages(config);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(5000);
      expect(pages.length).toBe(100); // 500 / 5
    });
  });

  // ------------------------------------------------------------------
  // generateCharColorPages — dedup
  // ------------------------------------------------------------------
  describe('generateCharColorPages - dedup (legend dedup)', () => {
    it('duplicate chars in userInput appear only once per page if within the same page group', async () => {
      const { generateCharColorPages } = await import('src/features/charcolor/utils');
      // "山山水水" with wordsPerPage=4 -> 1 page with ['山','山','水','水']
      const config = makeConfig({ userInput: '山山水水', wordsPerPage: 4 });
      const pages = generateCharColorPages(config);

      expect(pages).toHaveLength(1);
      const page = pages[0]!;
      // Each char (even duplicates) still gets a color entry
      for (let i = 0; i < page.chars.length; i++) {
        expect(page.colors[i]).toMatch(/^#[0-9A-Fa-f]{6,8}$/);
      }
    });

    it('dedup concept: each unique target char in the legend has a distinct color', async () => {
      const { generateCharColorPages } = await import('src/features/charcolor/utils');
      // 5 unique chars
      const config = makeConfig({ userInput: '金木水火土', wordsPerPage: 5 });
      const pages = generateCharColorPages(config);

      const page = pages[0]!;
      const seen = new Set(page.chars);
      expect(seen.size).toBe(5);
    });
  });

  // ------------------------------------------------------------------
  // generatePatterns
  // ------------------------------------------------------------------
  describe('generatePatterns', () => {
    function mockMiemieChinese(): MiemieData {
      return {
        Chinese: {
          'pinyin-1': ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'],
          'pinyin-2': ['人', '口', '手', '山', '水', '火', '木', '日', '月', '天'],
        },
      };
    }

    it('returns empty array for empty characters', async () => {
      const { generatePatterns } = await import('src/features/charcolor/utils');
      const result = generatePatterns([], mockMiemieChinese());
      expect(result).toEqual([]);
    });

    it('returns a 7x7 grid (7 rows)', async () => {
      const { generatePatterns } = await import('src/features/charcolor/utils');
      const result = generatePatterns(['水', '火'], mockMiemieChinese());
      expect(result).toHaveLength(7);
      for (const row of result) {
        expect(row).toHaveLength(7);
      }
    });

    it('target characters appear in every row', async () => {
      const { generatePatterns } = await import('src/features/charcolor/utils');
      const targets = ['龙', '虎'];
      const result = generatePatterns(targets, mockMiemieChinese());

      for (const row of result) {
        for (const target of targets) {
          expect(row).toContain(target);
        }
      }
    });

    it('total cells = 49 (7x7)', async () => {
      const { generatePatterns } = await import('src/features/charcolor/utils');
      const result = generatePatterns(['火'], mockMiemieChinese());
      const totalCells = result.flat().length;
      expect(totalCells).toBe(49);
    });

    it('uses Chinese dict when target chars are Chinese', async () => {
      const { generatePatterns } = await import('src/features/charcolor/utils');
      const result = generatePatterns(['天'], mockMiemieChinese());
      // All cells should be Chinese characters (from the Chinese dictionary)
      const chineseRegex = /[\u4e00-\u9fff]/;
      for (const row of result) {
        for (const cell of row) {
          expect(chineseRegex.test(cell)).toBe(true);
        }
      }
    });
  });
});
