import type { SheetConfig } from 'src/types';
import type { WorksheetTool } from 'src/shared/worksheet';

import React from 'react';

import EditNoteIcon from '@mui/icons-material/EditNote';

import { colors } from 'src/theme/tokens';
import { GridType, TraceContentMode } from 'src/types';

import { PaperSheet } from '../../sections/chartrace/view/components/PaperSheet';
import { ControlPanel } from '../../sections/chartrace/view/components/ControlPanel';

const defaultConfig: SheetConfig = {
  text: '一起来练习吧',
  contentMode: TraceContentMode.CHARACTERS,
  gridType: GridType.TIAN,
  gridColor: colors.gridDefault,
  gridOpacity: 1,
  gridSize: 14,
  fontFamily: 'font-kaiti',
  mainTextColor: '#333333',
  traceTextColor: colors.traceDefault,
  traceOpacity: 0.4,
  rowsPerPage: 8,
  colsPerRow: 9,
  traceCount: 5,
  headerTitle: '我会写汉字',
  headerContent: '姓名: __________  日期: __________',
  showPinyin: true,
  showStrokeCount: true,
  showStrokeOrder: false,
  englishLineTheme: 'rainbow',
  showLineNumbers: false,
  traceMode: 'faded',
};

function generate(_config: SheetConfig): null[] {
  return [];
}

const Preview: React.FC<{ config: SheetConfig; problems: null[]; pdfContainerRef?: React.RefObject<HTMLDivElement | null> }> = ({ config, pdfContainerRef }) => (
  <PaperSheet config={config} pdfContainerRef={pdfContainerRef} />
);

const Settings: React.FC<{
  config: SheetConfig;
  onChange: (c: SheetConfig) => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
}> = ({ config, onChange }) => (
  <ControlPanel config={config} setConfig={onChange} onPrint={() => window.print()} />
);

export const chartraceTool: WorksheetTool<SheetConfig, null> = {
  id: 'chartrace',
  defaultConfig,
  generate,
  Preview,
  Settings,
  meta: {
    title: '汉字描红 - DIYYY',
    icon: <EditNoteIcon />,
    route: '/chartrace',
  },
  deriveTitle: (config) => config.headerTitle,
  deriveContentColumns: (config) => (config.gridType === 'english' ? undefined : config.colsPerRow || 4),
};
