import type { SheetConfig } from 'src/types';

import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { CssBaseline } from '@mui/material';

import { Workbench } from 'src/shared/worksheet';
import { chartraceTool } from 'src/features/chartrace/config';
import { getTemplateConfig } from 'src/features/templates/registry';

export const CharTraceView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');

  return (
    <>
      <CssBaseline />
      <Workbench<SheetConfig, null>
        tool={chartraceTool}
        autoGenerate={false}
        initialConfig={getTemplateConfig('chartrace', templateId)}
      />
    </>
  );
};
