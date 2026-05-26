import type { WorksheetTool } from 'src/shared/worksheet';

import React from 'react';

import PaletteIcon from '@mui/icons-material/Palette';

import { ControlPanel } from 'src/sections/charcolor/components/ControlPanel';
import { PreviewSheet } from 'src/sections/charcolor/components/PreviewSheet';

import { generateCharColorPages } from './utils';

import type { PageData, CharColorConfig } from './types';

const defaultConfig: CharColorConfig = {
  userInput: '',
  wordsPerPage: 3,
  selectedPreset: 0,
  selectedLevel: '',
  fullSelectedValue: '',
  selectedBook: '',
};

function generate(config: CharColorConfig): PageData[] {
  return generateCharColorPages(config);
}

const Preview: React.FC<{ config: CharColorConfig; problems: PageData[] }> = ({ problems }) => (
  <PreviewSheet pages={problems} />
);

const Settings: React.FC<{
  config: CharColorConfig;
  onChange: (c: CharColorConfig) => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
}> = ({ config, onChange, onGenerate }) => (
  <ControlPanel config={config} onChange={onChange} onGenerate={onGenerate} onPrint={() => window.print()} />
);

export const charcolorTool: WorksheetTool<CharColorConfig, PageData> = {
  id: 'charcolor',
  defaultConfig,
  generate,
  Preview,
  Settings,
  meta: {
    title: '识字涂色 - DIYYY',
    icon: <PaletteIcon />,
    route: '/charcolor',
  },
};
