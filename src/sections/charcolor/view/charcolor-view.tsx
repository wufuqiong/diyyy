import type { PageData, CharColorConfig } from 'src/features/charcolor/types';

import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { CssBaseline } from '@mui/material';

import { Workbench } from 'src/shared/worksheet';
import { charcolorTool } from 'src/features/charcolor/config';
import { getTemplateConfig } from 'src/features/templates/registry';

export const CharColorView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');

  return (
    <>
      <CssBaseline />
      <Workbench<CharColorConfig, PageData>
        tool={charcolorTool}
        autoGenerate
        debounceMs={300}
        initialConfig={getTemplateConfig('charcolor', templateId)}
      />
    </>
  );
};
