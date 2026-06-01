import type { HundredChartSheet, HundredChartConfig } from 'src/features/hundred-chart/types';

import React from 'react';

import { Workbench } from 'src/shared/worksheet';
import { hundredChartTool } from 'src/features/hundred-chart';

export const HundredChartView: React.FC = () => (
  <Workbench<HundredChartConfig, HundredChartSheet>
    tool={hundredChartTool}
  />
);
