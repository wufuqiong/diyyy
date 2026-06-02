import type { PageData, CharColorConfig } from 'src/features/charcolor/types';

import React from 'react';

import { CssBaseline } from '@mui/material';

import { Workbench } from 'src/shared/worksheet';
import { charcolorTool } from 'src/features/charcolor/config';

export const CharColorView: React.FC = () => (
  <>
    <CssBaseline />
    <Workbench<CharColorConfig, PageData>
      tool={charcolorTool}
      autoGenerate
      debounceMs={300}
    />
  </>
);
