import { it, expect, describe } from 'vitest';

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const mockMiemieData = {
  Chinese: {
    test: ['山', '水', '火', '木', '金', '土', '日', '月', '星', '天'],
  },
};

// ---------------------------------------------------------------------------
// generateMaze
// ---------------------------------------------------------------------------

describe('generateMaze', () => {
  describe('WORD mode', () => {
    it('produces a grid of the correct dimensions', async () => {
      const { generateMaze } = await import('src/features/charmaze/utils');
      const rows = 8;
      const cols = 8;
      const maze = generateMaze(['山'], rows, cols, 'WORD', mockMiemieData);
      expect(maze).toHaveLength(rows);
      expect(maze[0]).toHaveLength(cols);
    });

    it('places the target character on the path starting at (0,0)', async () => {
      const { generateMaze } = await import('src/features/charmaze/utils');
      const rows = 8;
      const cols = 8;
      const target = '山';
      const maze = generateMaze([target], rows, cols, 'WORD', mockMiemieData);
      expect(maze[0][0]).toBe(target);
    });

    it('places the target character on the path ending at (rows-1, cols-1)', async () => {
      const { generateMaze } = await import('src/features/charmaze/utils');
      const rows = 8;
      const cols = 8;
      const target = '火';
      const maze = generateMaze([target], rows, cols, 'WORD', mockMiemieData);
      expect(maze[rows - 1][cols - 1]).toBe(target);
    });

    it('fills every cell of the grid', async () => {
      const { generateMaze } = await import('src/features/charmaze/utils');
      const rows = 8;
      const cols = 8;
      const maze = generateMaze(['木'], rows, cols, 'WORD', mockMiemieData);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          expect(maze[r][c]).toBeTruthy();
        }
      }
    });

    it('path cells all contain the target character (monotone connectivity check)', async () => {
      const { generateMaze } = await import('src/features/charmaze/utils');
      const rows = 9;
      const cols = 9;
      const target = '金';
      const maze = generateMaze([target], rows, cols, 'WORD', mockMiemieData);

      // The path guarantee: start and end are at (0,0) and (rows-1,cols-1).
      // Build a 4-directional visited set of target-char cells reachable from (0,0).
      const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
      const stack: [number, number][] = [[0, 0]];
      while (stack.length > 0) {
        const [r, c] = stack.pop()!;
        if (visited[r][c]) continue;
        visited[r][c] = true;
        const neighbors: [number, number][] = [
          [r - 1, c],
          [r + 1, c],
          [r, c - 1],
          [r, c + 1],
        ];
        for (const [nr, nc] of neighbors) {
          if (
            nr >= 0 &&
            nr < rows &&
            nc >= 0 &&
            nc < cols &&
            !visited[nr][nc] &&
            maze[nr][nc] === target
          ) {
            stack.push([nr, nc]);
          }
        }
      }

      // The target-char component containing (0,0) must also reach (rows-1, cols-1).
      expect(visited[rows - 1][cols - 1]).toBe(true);
    });

    it('behaves correctly with a multi-char string: picks the first char', async () => {
      const { generateMaze } = await import('src/features/charmaze/utils');
      const rows = 8;
      const cols = 8;
      const maze = generateMaze(['山水'], rows, cols, 'WORD', mockMiemieData);
      // chars[0] = '山水'; char[0] = '山', so each path cell uses '山'
      // Since '山水' has length 2, char[Math.floor(Math.random()*2)] can be '山' or '水'
      // So the path cells contain ONLY '山' or '水'.
      // All cells are filled, and path start/end are in target set.
      const targetSet = new Set(['山', '水']);
      expect(targetSet.has(maze[0][0])).toBe(true);
      expect(targetSet.has(maze[rows - 1][cols - 1])).toBe(true);

      // Every cell should be one of the two target chars or a filler char.
      for (const row of maze) {
        for (const cell of row) {
          expect(cell).toBeTruthy();
        }
      }
    });

    it('handles a char array with multiple elements: only first char is used on path', async () => {
      const { generateMaze } = await import('src/features/charmaze/utils');
      const rows = 8;
      const cols = 8;
      // Only chars[0] = '天' is placed on the path.
      const maze = generateMaze(['天', '日', '月'], rows, cols, 'WORD', mockMiemieData);
      expect(maze[0][0]).toBe('天');
      expect(maze[rows - 1][cols - 1]).toBe('天');
    });

    it('respects explicit fillerChars', async () => {
      const { generateMaze } = await import('src/features/charmaze/utils');
      const rows = 5;
      const cols = 5;
      const target = '土';
      const fillers = ['A', 'B', 'C', 'D', 'E'];
      const maze = generateMaze([target], rows, cols, 'WORD', mockMiemieData, fillers);

      expect(maze[0][0]).toBe(target);
      expect(maze[rows - 1][cols - 1]).toBe(target);

      // Non-path cells should be from the filler pool.
      const allCells = maze.flat();
      for (const cell of allCells) {
        expect([target, ...fillers]).toContain(cell);
      }
    });
  });

  describe('PHRASE mode', () => {
    it('produced grid has correct dimensions', async () => {
      const { generateMaze } = await import('src/features/charmaze/utils');
      const rows = 10;
      const cols = 10;
      const words = ['山水', '火木'];
      const maze = generateMaze(words, rows, cols, 'PHRASE', mockMiemieData);
      expect(maze).toHaveLength(rows);
      expect(maze[0]).toHaveLength(cols);
    });

    it('fills every cell', async () => {
      const { generateMaze } = await import('src/features/charmaze/utils');
      const rows = 8;
      const cols = 8;
      const words = ['山水', '金土'];
      const maze = generateMaze(words, rows, cols, 'PHRASE', mockMiemieData);
      for (const row of maze) {
        for (const cell of row) {
          expect(cell).toBeTruthy();
        }
      }
    });

    it('all placed words can be found in the grid (horizontally or vertically)', async () => {
      const { generateMaze } = await import('src/features/charmaze/utils');
      const rows = 8;
      const cols = 8;
      const words = ['山水', '金土'];
      const maze = generateMaze(words, rows, cols, 'PHRASE', mockMiemieData);

      for (const word of words) {
        const chars = [...word];
        let found = false;

        // Search horizontal
        for (let r = 0; r < rows && !found; r++) {
          for (let c = 0; c <= cols - chars.length && !found; c++) {
            if (chars.every((ch, i) => maze[r][c + i] === ch)) {
              found = true;
            }
          }
        }

        // Search vertical
        for (let r = 0; r <= rows - chars.length && !found; r++) {
          for (let c = 0; c < cols && !found; c++) {
            if (chars.every((ch, i) => maze[r + i][c] === ch)) {
              found = true;
            }
          }
        }

        expect(found).toBe(true);
      }
    });

    it('does not throw when words are unplaceable (too long for grid)', async () => {
      const { generateMaze } = await import('src/features/charmaze/utils');
      const rows = 3;
      const cols = 3;
      // A 10-char word cannot fit in a 3x3 grid.
      expect(() =>
        generateMaze(['山水火木金土日月星天'], rows, cols, 'PHRASE', mockMiemieData)
      ).not.toThrow();
    });

    it('handles single-word input', async () => {
      const { generateMaze } = await import('src/features/charmaze/utils');
      const rows = 8;
      const cols = 8;
      const maze = generateMaze(['山水'], rows, cols, 'PHRASE', mockMiemieData);

      expect(maze).toHaveLength(rows);
      expect(maze[0]).toHaveLength(cols);

      // The word '山水' should be findable horizontally or vertically.
      const word = '山水';
      const chars = [...word];
      let found = false;
      for (let r = 0; r < rows && !found; r++) {
        for (let c = 0; c <= cols - chars.length && !found; c++) {
          if (chars.every((ch, i) => maze[r][c + i] === ch)) found = true;
        }
      }
      for (let r = 0; r <= rows - chars.length && !found; r++) {
        for (let c = 0; c < cols && !found; c++) {
          if (chars.every((ch, i) => maze[r + i][c] === ch)) found = true;
        }
      }
      expect(found).toBe(true);
    });
  });

  describe('SENTENCE mode', () => {
    it('places sentence chars on path positions', async () => {
      const { generateMaze } = await import('src/features/charmaze/utils');
      const rows = 8;
      const cols = 8;
      const sentence = '山水火木金';
      const maze = generateMaze(
        [...sentence],
        rows,
        cols,
        'SENTENCE',
        mockMiemieData
      );

      // The sentence characters should appear in the grid.
      // Count total matches of sentence chars in the grid.
      let matchCount = 0;
      for (const row of maze) {
        for (const cell of row) {
          if (sentence.includes(cell)) matchCount++;
        }
      }
      // At least sentence.length chars placed (may include duplicates from filler pool).
      expect(matchCount).toBeGreaterThanOrEqual(sentence.length);
    });

    it('throws error when sentence exceeds grid capacity', async () => {
      const { generateMaze } = await import('src/features/charmaze/utils');
      const rows = 3;
      const cols = 3;
      // 10 chars > 3*3 = 9
      const longSentence = '山山水水火火木木金土';

      expect(() =>
        generateMaze(
          [...longSentence],
          rows,
          cols,
          'SENTENCE',
          mockMiemieData
        )
      ).toThrow(/句子太长/);
    });

    it('throws error when sentence exactly equals grid capacity + 1', async () => {
      const { generateMaze } = await import('src/features/charmaze/utils');
      const rows = 4;
      const cols = 4;
      // 17 chars > 4*4 = 16
      const chars = Array.from({ length: 17 }, (_, i) => i < 10 ? '山水火木金土日月星天'[i] : '山');
      expect(() =>
        generateMaze(chars, rows, cols, 'SENTENCE', mockMiemieData)
      ).toThrow(/句子太长/);
    });

    it('works normally when sentence fits exactly in grid', async () => {
      const { generateMaze } = await import('src/features/charmaze/utils');
      const rows = 4;
      const cols = 4;
      // Exactly 16 chars = 4*4
      const chars = Array.from({ length: 16 }, (_, i) => i < 10 ? '山水火木金土日月星天'[i] : '山');
      expect(() =>
        generateMaze(chars, rows, cols, 'SENTENCE', mockMiemieData)
      ).not.toThrow();
    });

    it('fills every cell', async () => {
      const { generateMaze } = await import('src/features/charmaze/utils');
      const rows = 8;
      const cols = 8;
      const sentence = '山水火木';
      const maze = generateMaze(
        [...sentence],
        rows,
        cols,
        'SENTENCE',
        mockMiemieData
      );
      for (const row of maze) {
        for (const cell of row) {
          expect(cell).toBeTruthy();
        }
      }
    });
  });
});

// ---------------------------------------------------------------------------
// generateMazePages
// ---------------------------------------------------------------------------

describe('generateMazePages', () => {
  function makeConfig(overrides: {
    userInput?: string;
    selectedMode?: number;   // 0=WORD, 1=PHRASE, 2=SENTENCE
    wordsPerPage?: number;
    selectedTableSize?: number; // 0=8x8, 1=9x9, 2=10x10, 3=12x12
  } = {}): import('src/features/charmaze/types').CharMazeConfig {
    return {
      userInput: overrides.userInput ?? '',
      selectedMode: overrides.selectedMode ?? 0,
      wordsPerPage: overrides.wordsPerPage ?? 4,
      selectedTableSize: overrides.selectedTableSize ?? 0,
      selectedLevel: '',
      fullSelectedValue: '',
      selectedBook: '',
    };
  }

  describe('empty input', () => {
    it('returns an empty array when userInput is empty string', async () => {
      const { generateMazePages } = await import('src/features/charmaze/utils');
      const config = makeConfig({ userInput: '' });
      expect(generateMazePages(config, mockMiemieData)).toEqual({ pages: [], skippedSentences: [] });
    });

    it('returns an empty array when userInput is whitespace only', async () => {
      const { generateMazePages } = await import('src/features/charmaze/utils');
      const config = makeConfig({ userInput: '   \n  ' });
      expect(generateMazePages(config, mockMiemieData)).toEqual({ pages: [], skippedSentences: [] });
    });

    it('returns an empty array when userInput contains no Chinese characters', async () => {
      const { generateMazePages } = await import('src/features/charmaze/utils');
      const config = makeConfig({ userInput: 'abc, 123, xyz' });
      expect(generateMazePages(config, mockMiemieData)).toEqual({ pages: [], skippedSentences: [] });
    });
  });

  describe('WORD mode (selectedMode=0)', () => {
    it('produces one page per Chinese character', async () => {
      const { generateMazePages } = await import('src/features/charmaze/utils');
      const config = makeConfig({ userInput: '山,水,火', selectedMode: 0 });
      const { pages } = generateMazePages(config, mockMiemieData);
      expect(pages).toHaveLength(3);
      expect(pages[0].mode).toBe('WORD');
      expect(pages[1].mode).toBe('WORD');
      expect(pages[2].mode).toBe('WORD');
    });

    it('each page refChars is a single character', async () => {
      const { generateMazePages } = await import('src/features/charmaze/utils');
      const config = makeConfig({ userInput: '山,水,火,木', selectedMode: 0 });
      const { pages } = generateMazePages(config, mockMiemieData);
      for (const page of pages) {
        expect(page.refChars).toHaveLength(1);
        expect(page.refChars[0]).toBeTruthy();
      }
    });

    it('splits continuous characters without separator into individual chars', async () => {
      const { generateMazePages } = await import('src/features/charmaze/utils');
      // "山水火" without any separator — should split into 山, 水, 火
      const config = makeConfig({ userInput: '山水火', selectedMode: 0 });
      const { pages } = generateMazePages(config, mockMiemieData);
      expect(pages).toHaveLength(3);
      expect(pages[0].refChars).toEqual(['山']);
      expect(pages[1].refChars).toEqual(['水']);
      expect(pages[2].refChars).toEqual(['火']);
    });

    it('each page has correct table dimensions', async () => {
      const { generateMazePages } = await import('src/features/charmaze/utils');
      // selectedTableSize=0 -> 8x8
      const config = makeConfig({
        userInput: '山,水',
        selectedMode: 0,
        selectedTableSize: 1, // 9x9
      });
      const { pages } = generateMazePages(config, mockMiemieData);
      for (const page of pages) {
        expect(page.rows).toBe(9);
        expect(page.cols).toBe(9);
        expect(page.chars).toHaveLength(9);
        expect(page.chars[0]).toHaveLength(9);
      }
    });

    it('ignores wordsPerPage in WORD mode (always 1 per page)', async () => {
      const { generateMazePages } = await import('src/features/charmaze/utils');
      const config = makeConfig({
        userInput: '山,水,火,木,金',
        selectedMode: 0,
        wordsPerPage: 3,
      });
      const { pages } = generateMazePages(config, mockMiemieData);
      // WORD mode: each char is a page, regardless of wordsPerPage
      expect(pages).toHaveLength(5);
    });

    it('capped at MAX_PAGES=50', async () => {
      const { generateMazePages } = await import('src/features/charmaze/utils');
      const manyChars = Array.from({ length: 60 }, (_, i) =>
        i < 10 ? '山水火木金土日月星天'[i] : '山'
      ).join(',');
      const config = makeConfig({ userInput: manyChars, selectedMode: 0 });
      const { pages } = generateMazePages(config, mockMiemieData);
      expect(pages.length).toBe(50);
    });
  });

  describe('PHRASE mode (selectedMode=1)', () => {
    it('groups words into pages by wordsPerPage', async () => {
      const { generateMazePages } = await import('src/features/charmaze/utils');
      // 6 words, wordsPerPage=3 -> 2 pages
      const config = makeConfig({
        userInput: '山水,火木,金土,日月,星天,山水',
        selectedMode: 1,
        wordsPerPage: 3,
      });
      const { pages } = generateMazePages(config, mockMiemieData);
      expect(pages).toHaveLength(2);
      expect(pages[0].refChars).toHaveLength(3);
      expect(pages[1].refChars).toHaveLength(3);
    });

    it('last page may have fewer words if not evenly divisible', async () => {
      const { generateMazePages } = await import('src/features/charmaze/utils');
      const config = makeConfig({
        userInput: '山水,火木,金土,日月,星天',
        selectedMode: 1,
        wordsPerPage: 3,
      });
      const { pages } = generateMazePages(config, mockMiemieData);
      // 5 words, 3/page -> ceil(5/3) = 2 pages
      expect(pages).toHaveLength(2);
      expect(pages[0].refChars).toHaveLength(3);
      expect(pages[1].refChars).toHaveLength(2);
    });

    it('refChars are multi-character tokens (words, not split)', async () => {
      const { generateMazePages } = await import('src/features/charmaze/utils');
      const config = makeConfig({
        userInput: '山水,火木',
        selectedMode: 1,
        wordsPerPage: 2,
      });
      const { pages } = generateMazePages(config, mockMiemieData);
      expect(pages[0].refChars).toEqual(['山水', '火木']);
    });

    it('all page modes are PHRASE', async () => {
      const { generateMazePages } = await import('src/features/charmaze/utils');
      const config = makeConfig({
        userInput: '山水,火木,金土,日月',
        selectedMode: 1,
      });
      const { pages } = generateMazePages(config, mockMiemieData);
      for (const page of pages) {
        expect(page.mode).toBe('PHRASE');
      }
    });

    it('capped at MAX_PAGES=50', async () => {
      const { generateMazePages } = await import('src/features/charmaze/utils');
      // 100 words, wordsPerPage=1 -> 100 pages, capped at 50
      const manyWords = Array.from({ length: 100 }, () => '山水').join(',');
      const config = makeConfig({
        userInput: manyWords,
        selectedMode: 1,
        wordsPerPage: 1,
      });
      const { pages } = generateMazePages(config, mockMiemieData);
      expect(pages.length).toBe(50);
    });
  });

  describe('SENTENCE mode (selectedMode=2)', () => {
    it('each sentence (separated by newline) becomes one page', async () => {
      const { generateMazePages } = await import('src/features/charmaze/utils');
      const config = makeConfig({
        userInput: '山水火木\n金土日月\n星天山水',
        selectedMode: 2,
      });
      const { pages } = generateMazePages(config, mockMiemieData);
      expect(pages).toHaveLength(3);
      expect(pages[0].mode).toBe('SENTENCE');
      expect(pages[1].mode).toBe('SENTENCE');
      expect(pages[2].mode).toBe('SENTENCE');
    });

    it('skips sentences that are empty or have no Chinese characters', async () => {
      const { generateMazePages } = await import('src/features/charmaze/utils');
      const config = makeConfig({
        userInput: '山水火木\n\n金土日月',
        selectedMode: 2,
      });
      const { pages } = generateMazePages(config, mockMiemieData);
      expect(pages).toHaveLength(2);
    });

    it('ignores wordsPerPage in SENTENCE mode (always 1 per page)', async () => {
      const { generateMazePages } = await import('src/features/charmaze/utils');
      const config = makeConfig({
        userInput: '山水火木\n金土日月',
        selectedMode: 2,
        wordsPerPage: 2,
      });
      const { pages } = generateMazePages(config, mockMiemieData);
      expect(pages).toHaveLength(2);
    });

    it('capped at MAX_PAGES=50', async () => {
      const { generateMazePages } = await import('src/features/charmaze/utils');
      const manySentences = Array.from({ length: 60 }, (_, i) => '山水').join('\n');
      const config = makeConfig({ userInput: manySentences, selectedMode: 2 });
      const { pages } = generateMazePages(config, mockMiemieData);
      expect(pages.length).toBe(50);
    });

    it('refChars is a single-element array containing the full sentence', async () => {
      const { generateMazePages } = await import('src/features/charmaze/utils');
      const config = makeConfig({
        userInput: '山水火木',
        selectedMode: 2,
      });
      const { pages } = generateMazePages(config, mockMiemieData);
      expect(pages[0].refChars).toEqual(['山水火木']);
    });
  });

  describe('table size handling', () => {
    it('selectedTableSize=0 uses 8x8', async () => {
      const { generateMazePages } = await import('src/features/charmaze/utils');
      const config = makeConfig({
        userInput: '山',
        selectedMode: 0,
        selectedTableSize: 0,
      });
      const { pages } = generateMazePages(config, mockMiemieData);
      expect(pages[0].rows).toBe(8);
      expect(pages[0].cols).toBe(8);
    });

    it('selectedTableSize=3 uses 12x12', async () => {
      const { generateMazePages } = await import('src/features/charmaze/utils');
      const config = makeConfig({
        userInput: '山',
        selectedMode: 0,
        selectedTableSize: 3,
      });
      const { pages } = generateMazePages(config, mockMiemieData);
      expect(pages[0].rows).toBe(12);
      expect(pages[0].cols).toBe(12);
    });
  });

  describe('cross-mode', () => {
    it('PHRASE mode with comma+space separator correctly splits tokens', async () => {
      const { generateMazePages } = await import('src/features/charmaze/utils');
      const config = makeConfig({
        userInput: '山水, 火木, 金土',
        selectedMode: 1,
        wordsPerPage: 3,
      });
      const { pages } = generateMazePages(config, mockMiemieData);
      expect(pages).toHaveLength(1);
      // Spaces inside tokens are stripped (Chinese-only extraction), so
      // tokens become ['山水', '火木', '金土']
      expect(pages[0].refChars).toEqual(['山水', '火木', '金土']);
    });

    it('SENTENCE mode splits only on newlines, not commas', async () => {
      const { generateMazePages } = await import('src/features/charmaze/utils');
      // In SENTENCE mode, commas inside a line stay as part of the sentence
      // (but non-Chinese chars are filtered out, so commas disappear)
      const config = makeConfig({
        userInput: '山水火,木金土\n日月星',
        selectedMode: 2,
      });
      const { pages } = generateMazePages(config, mockMiemieData);
      expect(pages).toHaveLength(2);
      // Commas are filtered by the Chinese-only regex, so '山水火,木金土' -> '山水火木金土'
    });
  });
});
