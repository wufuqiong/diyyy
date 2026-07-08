import type { Template } from 'src/features/templates/types';

import type { CharMazeConfig } from './types';

export const charmazeTemplates: Template<CharMazeConfig>[] = [
  {
    id: 'charmaze-single-wo',
    titleKey: 'templates.charmaze.singleWo.title',
    descKey: 'templates.charmaze.singleWo.desc',
    config: {
      userInput: '我',
      selectedMode: 0,
      wordsPerPage: 5,
      selectedTableSize: 0,
      selectedLevel: '',
      fullSelectedValue: '',
      selectedBook: '',
    },
    scale: 0.23,
  },
  {
    id: 'charmaze-phrase-woshizhongguoren',
    titleKey: 'templates.charmaze.phraseWoshizhongguoren.title',
    descKey: 'templates.charmaze.phraseWoshizhongguoren.desc',
    config: {
      userInput: '中国 我们 都是',
      selectedMode: 1,
      wordsPerPage: 5,
      selectedTableSize: 1,
      selectedLevel: '',
      fullSelectedValue: '',
      selectedBook: '',
    },
    scale: 0.23,
  },
  {
    id: 'charmaze-sentence-yuwenyuandi1',
    titleKey: 'templates.charmaze.sentenceYuwenyuandi1.title',
    descKey: 'templates.charmaze.sentenceYuwenyuandi1.desc',
    config: {
      userInput: '一片两片三四片，五片六片七八片。',
      selectedMode: 2,
      wordsPerPage: 5,
      selectedTableSize: 1,
      selectedLevel: '',
      fullSelectedValue: '',
      selectedBook: '',
    },
    scale: 0.23,
  },
];
