import type { MathProblem, WorksheetConfig } from 'src/types';

import React, { useCallback } from 'react';

import { Workbench } from 'src/shared/worksheet';
import { mathGenieTool } from 'src/features/math-genie';

export const MathGenieView: React.FC = () => {
  const autoGenerate = useCallback(
    (config: WorksheetConfig) => config.autoPreview !== false,
    []
  );

  return (
    <Workbench<WorksheetConfig, MathProblem>
      tool={mathGenieTool}
      debounceMs={200}
      autoGenerate={autoGenerate}
    />
  );
};
