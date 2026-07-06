import type { WorksheetTool } from 'src/shared/worksheet';

import React from 'react';
import { v4 as uuidv4 } from 'uuid';

import SearchIcon from '@mui/icons-material/Search';

import i18n from 'src/i18n/config';
import { candyColors } from 'src/theme/tokens';

import { generateSeed, generateWordSearchGrid } from './generators/grid-generator';
import WordSearchPreview from '../../sections/word-search/components/PreviewSheet';
import WordSearchSettings from '../../sections/word-search/components/ControlPanel';
import { GridSizePreset, WORDS_PER_PAGE, GRID_DIMENSIONS, WordSearchDifficulty } from './types';

import type { WordSearchSheet, WordSearchConfig } from './types';

const isEn = i18n.language?.startsWith('en');

/** Font sizes per grid size, matching PreviewSheet.tsx */
const LIST_FONT_SIZE: Record<GridSizePreset, number> = {
  small: 24,
  medium: 21,
  large: 18,
};

/** Estimated available vertical px for the word list on one A4 page. */
const LIST_AVAILABLE: Record<GridSizePreset, number> = {
  small: 132,
  medium: 138,
  large: 200,
};

/** Estimate default column count so the word list fits on one page. */
function getDefaultListColumns(words: string[], gridSize: GridSizePreset): 1 | 2 | 3 | 4 | 5 {
  if (words.length === 0) return 3;

  const fontSize = LIST_FONT_SIZE[gridSize];
  const rowHeight = fontSize * 1.4 + 8; // line-height 1.4 + gap
  const containerPad = 26; // py 2.5 (20px) + border (6px)
  const availableHeight = LIST_AVAILABLE[gridSize];
  const maxRows = Math.max(1, Math.floor((availableHeight - containerPad) / rowHeight));

  for (let cols = 1; cols <= 5; cols++) {
    if (Math.ceil(words.length / cols) <= maxRows) return cols as 1 | 2 | 3 | 4 | 5;
  }
  return 5;
}

const defaultConfig: WordSearchConfig = {
  words: [],
  gridSize: GridSizePreset.MEDIUM,
  difficulty: WordSearchDifficulty.MEDIUM,
  title: 'Word Search',
  showAnswerKey: false,
  listColumns: 3,
  letterCase: 'lower',
  themeColor: candyColors.pink,
};

function generate(config: WordSearchConfig): WordSearchSheet[] {
  const words = config.words;
  if (words.length === 0) return [];

  const maxPerPage = WORDS_PER_PAGE[config.gridSize];
  const totalPages = Math.ceil(words.length / maxPerPage);

  // Even distribution: each page gets baseCount or baseCount+1 words
  const baseCount = Math.floor(words.length / totalPages);
  const remainder = words.length % totalPages;

  const sheets: WordSearchSheet[] = [];
  const baseSeed = generateSeed();
  const themeColor = config.themeColor || candyColors.pink;

  let offset = 0;
  for (let page = 0; page < totalPages; page++) {
    const size = baseCount + (page < remainder ? 1 : 0);
    const batch = words.slice(offset, offset + size);
    offset += size;
    const pageSeed = baseSeed + page;
    const res = generateWordSearchGrid(batch, config.gridSize, config.difficulty, pageSeed, config.letterCase);

    const adaptiveColumns = getDefaultListColumns(batch, config.gridSize);
    const effectiveColumns = Math.max(config.listColumns, adaptiveColumns) as 1 | 2 | 3 | 4 | 5;

    sheets.push({
      id: uuidv4(),
      title: config.title,
      grid: res.grid,
      placedWords: res.placedWords,
      unplacedWords: res.unplacedWords,
      listColumns: effectiveColumns,
      isAnswerKey: false,
      themeColor,
      pageNumber: totalPages > 1 ? page + 1 : undefined,
      totalPages: totalPages > 1 ? totalPages : undefined,
    });

    if (config.showAnswerKey) {
      sheets.push({
        id: uuidv4(),
        title: `${config.title} - ${isEn ? 'Answer Key' : '答案'}`,
        grid: res.grid,
        placedWords: res.placedWords,
        unplacedWords: res.unplacedWords,
        listColumns: effectiveColumns,
        isAnswerKey: true,
        themeColor,
        pageNumber: totalPages > 1 ? page + 1 : undefined,
        totalPages: totalPages > 1 ? totalPages : undefined,
      });
    }
  }

  return sheets;
}

function deriveTitle(config: WordSearchConfig): string {
  return config.title || 'WordSearch';
}

const Preview: React.FC<{
  config: WordSearchConfig;
  problems: WordSearchSheet[];
  pdfContainerRef?: React.RefObject<HTMLDivElement | null>;
  onConfigChange?: (config: WordSearchConfig) => void;
}> = ({ config, problems, pdfContainerRef }) => (
  <WordSearchPreview config={config} sheets={problems} pdfContainerRef={pdfContainerRef} />
);

const Settings: React.FC<{
  config: WordSearchConfig;
  onChange: (c: WordSearchConfig) => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
}> = ({ config, onChange }) => (
  <WordSearchSettings config={config} onChange={onChange} />
);

export const wordSearchTool: WorksheetTool<WordSearchConfig, WordSearchSheet> = {
  id: 'word-search',
  defaultConfig,
  generate,
  Preview,
  Settings,
  deriveTitle,
  meta: {
    title: 'Word Search - DIYYY',
    icon: <SearchIcon />,
    route: '/word-search',
  },
  deriveContentColumns: (config) => GRID_DIMENSIONS[config.gridSize]?.cols,
};
