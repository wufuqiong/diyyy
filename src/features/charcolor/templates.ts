import type { Template } from 'src/features/templates/types';

import type { CharColorConfig } from './types';

export const charcolorTemplates: Template<CharColorConfig>[] = [
  {
    id: 'charcolor-wo-shi-zhongguoren',
    titleKey: 'templates.charcolor.woShiZhongguoren.title',
    descKey: 'templates.charcolor.woShiZhongguoren.desc',
    config: {
      userInput: '我是中国人',
      wordsPerPage: 5,
      practiceMode: 'color',
      selectedPreset: 0,
      selectedLevel: '',
      fullSelectedValue: '',
      selectedBook: '',
    },
    scale: 0.23,
  },
];
