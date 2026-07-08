import type { MathProblem, WorksheetConfig } from 'src/types';

import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Workbench } from 'src/shared/worksheet';
import { mathGenieTool } from 'src/features/math-genie';
import { getTemplateConfig } from 'src/features/templates/registry';

export const MathGenieView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');

  const autoGenerate = useCallback(
    (config: WorksheetConfig) => config.autoPreview !== false,
    []
  );

  return (
    <Workbench<WorksheetConfig, MathProblem>
      tool={mathGenieTool}
      debounceMs={200}
      autoGenerate={autoGenerate}
      initialConfig={getTemplateConfig('math-genie', templateId)}
    />
  );
};
