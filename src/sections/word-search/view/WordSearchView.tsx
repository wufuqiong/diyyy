import type { WordSearchSheet, WordSearchConfig } from 'src/features/word-search/types';

import React from 'react';

import { Workbench } from 'src/shared/worksheet';
import { wordSearchTool } from 'src/features/word-search';

export const WordSearchView: React.FC = () => (
  <Workbench<WordSearchConfig, WordSearchSheet>
    tool={wordSearchTool}
    configVersion={1}
    autoGenerate
    debounceMs={300}
  />
);
