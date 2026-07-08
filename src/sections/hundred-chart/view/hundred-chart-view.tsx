import type { HundredChartSheet, HundredChartConfig } from 'src/features/hundred-chart/types';

import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { Workbench } from 'src/shared/worksheet';
import { hundredChartTool } from 'src/features/hundred-chart';
import { getTemplateConfig } from 'src/features/templates/registry';

export const HundredChartView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');

  return (
    <Workbench<HundredChartConfig, HundredChartSheet>
      tool={hundredChartTool}
      configVersion={6}
      autoGenerate
      initialConfig={getTemplateConfig('hundred-chart', templateId)}
    />
  );
};
