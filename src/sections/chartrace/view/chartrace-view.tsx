import React, { useState } from 'react';

import { Box, CssBaseline } from '@mui/material';

import { SheetConfig, GridType } from 'src/types';

import { PaperSheet } from './components/PaperSheet';
import { ControlPanel } from './components/ControlPanel';

export const CharTraceView: React.FC = () => {
  const [config, setConfig] = useState<SheetConfig>({
    text: '一起来练习吧',
    gridType: GridType.TIAN,
    gridColor: '#ff9c9c', // A nice light reddish color standard for zitie
    gridOpacity: 0.6,
    gridSize: 100,
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
    <Box sx={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', '@media print': { height: 'auto', overflow: 'visible', display: 'block' } }}>
      <CssBaseline />
      {/* Left Config Panel */}
      <ControlPanel 
        config={config} 
        setConfig={setConfig} 
        onPrint={handlePrint} 
      />
      
      {/* Right Preview Area */}
      <Box component="main" sx={{ flex: 1, height: '100%', position: 'relative', zIndex: 10, '@media print': { height: 'auto', overflow: 'visible' } }}>
        <PaperSheet config={config} />
      </Box>
    </Box>
  );
};