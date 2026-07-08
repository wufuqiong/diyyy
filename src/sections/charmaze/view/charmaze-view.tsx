import type { MazePageData, CharMazeConfig } from 'src/features/charmaze/types';

import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { CssBaseline } from '@mui/material';

import { Workbench } from 'src/shared/worksheet';
import { charmazeTool } from 'src/features/charmaze/config';
import { getTemplateConfig } from 'src/features/templates/registry';

export const CharMazeView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');

  return (
    <>
      <CssBaseline />
      <Workbench<CharMazeConfig, MazePageData>
        tool={charmazeTool}
        autoGenerate
        debounceMs={300}
        initialConfig={getTemplateConfig('charmaze', templateId)}
      />
    </>
  );
};
