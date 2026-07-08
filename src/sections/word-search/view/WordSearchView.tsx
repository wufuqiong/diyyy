import type { WordSearchSheet, WordSearchConfig } from 'src/features/word-search/types';

import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { Workbench } from 'src/shared/worksheet';
import { wordSearchTool } from 'src/features/word-search';
import { getTemplateConfig } from 'src/features/templates/registry';

export const WordSearchView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');

  return (
    <Workbench<WordSearchConfig, WordSearchSheet>
      tool={wordSearchTool}
      configVersion={1}
      autoGenerate
      debounceMs={300}
      initialConfig={getTemplateConfig('word-search', templateId)}
    />
  );
};
