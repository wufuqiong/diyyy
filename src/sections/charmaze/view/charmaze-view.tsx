import type { MazePageData, CharMazeConfig } from 'src/features/charmaze/types';

import React from 'react';

import { CssBaseline } from '@mui/material';

import { Workbench } from 'src/shared/worksheet';
import { charmazeTool } from 'src/features/charmaze/config';

export const CharMazeView: React.FC = () => (
  <>
    <CssBaseline />
    <Workbench<CharMazeConfig, MazePageData>
      tool={charmazeTool}
      autoGenerate={false}
    />
  </>
);
