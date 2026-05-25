import type { MiemieDetails } from 'src/types';
import type { WorksheetTool } from 'src/shared/worksheet';

import React from 'react';

import MapIcon from '@mui/icons-material/Map';

import miemieDetails from 'src/data/miemie-details.json';
import { loadMiemieLessons } from 'src/shared/data/lessons';

import { PreviewSheet } from 'src/sections/charmaze/view/preview-sheet';
import { ControlPanel } from 'src/sections/charmaze/components/ControlPanel';

import { generateMazePages } from './utils';

import type { MazePageData, CharMazeConfig } from './types';

const miemieDetailsTyped = miemieDetails as MiemieDetails;

const defaultConfig: CharMazeConfig = {
  userInput: '',
  selectedMode: 0,
  wordsPerPage: 5,
  selectedTableSize: 0,
  selectedLevel: '',
  fullSelectedValue: '',
  selectedBook: '',
};

function generate(config: CharMazeConfig): MazePageData[] {
  const wordData = loadMiemieLessons(miemieDetailsTyped, 'word');
  return generateMazePages(config, wordData);
}

const Preview: React.FC<{ config: CharMazeConfig; problems: MazePageData[] }> = ({ problems }) => (
  <PreviewSheet
    pages={problems.map((page, index) => ({
      refChars: page.refChars,
      characters: page.chars,
      rows: page.rows,
      cols: page.cols,
      mode: page.mode,
      pageNumber: index + 1,
      totalPages: problems.length,
    }))}
  />
);

const Settings: React.FC<{
  config: CharMazeConfig;
  onChange: (c: CharMazeConfig) => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
}> = ({ config, onChange, onGenerate }) => (
  <ControlPanel config={config} onChange={onChange} onGenerate={onGenerate} onPrint={() => window.print()} />
);

export const charmazeTool: WorksheetTool<CharMazeConfig, MazePageData> = {
  id: 'charmaze',
  defaultConfig,
  generate,
  Preview,
  Settings,
  meta: {
    title: '识字迷宫 - DIYYY',
    icon: <MapIcon />,
    route: '/charmaze',
  },
};
