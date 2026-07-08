import type { Template } from 'src/features/templates/types';

import { candyColors } from 'src/theme/tokens';

import { GridSizePreset, WordSearchDifficulty } from './types';

import type { WordSearchConfig } from './types';

export const wordSearchTemplates: Template<WordSearchConfig>[] = [
  {
    id: 'word-search-sports',
    titleKey: 'templates.wordSearch.sports.title',
    descKey: 'templates.wordSearch.sports.desc',
    config: {
      words: ['ball', 'bat', 'goal', 'team', 'score', 'run', 'kick', 'play'],
      gridSize: GridSizePreset.SMALL,
      difficulty: WordSearchDifficulty.EASY,
      title: 'Word Search',
      showAnswerKey: false,
      listColumns: 3,
      letterCase: 'lower',
      themeColor: candyColors.pink,
    },
    scale: 0.23,
  },
  {
    id: 'word-search-days',
    titleKey: 'templates.wordSearch.days.title',
    descKey: 'templates.wordSearch.days.desc',
    config: {
      words: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      gridSize: GridSizePreset.MEDIUM,
      difficulty: WordSearchDifficulty.MEDIUM,
      title: 'Word Search',
      showAnswerKey: false,
      listColumns: 3,
      letterCase: 'lower',
      themeColor: candyColors.blue,
    },
    scale: 0.23,
  },
];
