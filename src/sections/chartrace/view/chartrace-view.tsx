import type { SheetConfig } from 'src/types';

import React from 'react';

import { CssBaseline } from '@mui/material';

import { Workbench } from 'src/shared/worksheet';
import { chartraceTool } from 'src/features/chartrace/config';

export const CharTraceView: React.FC = () => (
  <>
    <CssBaseline />
    <Workbench<SheetConfig, null>
      tool={chartraceTool}
      autoGenerate={false}
    />
  </>
);
