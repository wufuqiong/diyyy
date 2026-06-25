import type { WorksheetTool } from 'src/shared/worksheet';

import React from 'react';
import { v4 as uuidv4 } from 'uuid';

import SearchIcon from '@mui/icons-material/Search';

import i18n from 'src/i18n/config';

import { generateSeed, generateWordSearchGrid } from './generators/grid-generator';
import WordSearchPreview from '../../sections/word-search/components/PreviewSheet';
import WordSearchSettings from '../../sections/word-search/components/ControlPanel';
import { GridSizePreset, WORDS_PER_PAGE, GRID_DIMENSIONS, WordSearchDifficulty } from './types';

import type { WordSearchSheet, WordSearchConfig } from './types';

const isEn = i18n.language?.startsWith('en');

const defaultConfig: WordSearchConfig = {
  words: [],
  gridSize: GridSizePreset.MEDIUM,
  difficulty: WordSearchDifficulty.MEDIUM,
  title: 'Word Search',
  showAnswerKey: false,
  listColumns: 3,
  letterCase: 'lower',
};

function generate(config: WordSearchConfig): WordSearchSheet[] {
  const words = config.words;
  if (words.length === 0) return [];

  const maxPerPage = WORDS_PER_PAGE[config.gridSize];
  const totalPages = Math.ceil(words.length / maxPerPage);

  // Even distribution: each page gets ceil(total/totalPages) words
  const perPage = Math.ceil(words.length / totalPages);

  const sheets: WordSearchSheet[] = [];
  const baseSeed = generateSeed();

  for (let page = 0; page < totalPages; page++) {
    const batch = words.slice(page * perPage, (page + 1) * perPage);
    const pageSeed = baseSeed + page;
    const res = generateWordSearchGrid(batch, config.gridSize, config.difficulty, pageSeed, config.letterCase);

    sheets.push({
      id: uuidv4(),
      title: config.title,
      grid: res.grid,
      placedWords: res.placedWords,
      unplacedWords: res.unplacedWords,
      listColumns: config.listColumns,
      isAnswerKey: false,
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
        listColumns: config.listColumns,
        isAnswerKey: true,
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
