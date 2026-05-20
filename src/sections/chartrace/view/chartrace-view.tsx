import type { SheetConfig} from 'src/types';

import React from 'react';

import { CssBaseline } from '@mui/material';

import { usePersistedConfig } from 'src/hooks/use-persisted-config';

import { GridType, TraceContentMode } from 'src/types';

import { ResponsiveWorkbench } from 'src/sections/_shared/ResponsiveWorkbench';

import { PaperSheet } from './components/PaperSheet';
import { ControlPanel } from './components/ControlPanel';

export const CharTraceView: React.FC = () => {
  const pageTitle = '汉字描红 - DIYYY';
  const pageDescription = '免费的汉字描红练习工具，支持田字格、米字格等多种格式，帮助孩子练习汉字书写。';

  const [config, setConfig] = usePersistedConfig<SheetConfig>('chartrace.config', {
    text: '一起来练习吧',
    contentMode: TraceContentMode.CHARACTERS,
    gridType: GridType.TIAN,
    gridColor: '#ff9c9c', // A nice light reddish color standard for zitie
    gridOpacity: 0.6,
    gridSize: 14,
    fontFamily: 'font-kaiti',
    mainTextColor: '#000000',
    traceTextColor: '#ff9c9c',
    traceOpacity: 0.4,
    rowsPerPage: 8,
    colsPerRow: 9,
    traceCount: 5, // Default: 5 trace chars + main char = 6 filled, 3 blank
    headerTitle: '我会写汉字',
    headerContent: '姓名: __________  日期: __________',
    showPinyin: true,
    showStrokeCount: true,
    showStrokeOrder: false,
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <CssBaseline />
      <ResponsiveWorkbench
        sidebar={
          <ControlPanel 
            config={config} 
            setConfig={setConfig} 
            onPrint={handlePrint} 
          />
        }
      >
        <PaperSheet config={config} />
      </ResponsiveWorkbench>
    </>
  );
};