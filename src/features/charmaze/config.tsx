import type { MiemieDetails } from 'src/types';
import type { WorksheetTool } from 'src/shared/worksheet';

import React from 'react';

import MapIcon from '@mui/icons-material/Map';

import miemieDetails from 'src/data/miemie-details.json';
import { loadMiemieLessons } from 'src/shared/data/lessons';

import { ControlPanel } from 'src/sections/charmaze/components/ControlPanel';
import { ScaledPreviewSheet } from 'src/sections/charmaze/view/preview-sheet';

import { generateMazePages } from './utils';
import { TABLE_SIZE_PRESETS } from './types';

import type { MazePageData, CharMazeConfig } from './types';

const miemieDetailsTyped = miemieDetails as MiemieDetails;
const miemieWordData = loadMiemieLessons(miemieDetailsTyped, 'word');

const defaultConfig: CharMazeConfig = {
  userInput: '',
  selectedMode: 0,
  wordsPerPage: 5,
  selectedTableSize: 0,
  selectedLevel: '',
  fullSelectedValue: '',
  selectedBook: '',
};

let lastSkippedSentences: string[] = [];

function generate(config: CharMazeConfig): MazePageData[] {
  const result = generateMazePages(config, miemieWordData);
  lastSkippedSentences = result.skippedSentences;
  return result.pages;
}

export function getSkippedSentences(): string[] {
  return lastSkippedSentences;
}

const Preview: React.FC<{ config: CharMazeConfig; problems: MazePageData[]; pdfContainerRef?: React.RefObject<HTMLDivElement | null> }> = ({ problems, pdfContainerRef }) => (
  <ScaledPreviewSheet
    pages={problems.map((page, index) => ({
      refChars: page.refChars,
      characters: page.chars,
      rows: page.rows,
      cols: page.cols,
      mode: page.mode,
      pageNumber: index + 1,
      totalPages: problems.length,
    }))}
    pdfContainerRef={pdfContainerRef}
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
  deriveTitle: (_config) => '识字迷宫',
  deriveContentColumns: (config) => TABLE_SIZE_PRESETS[config.selectedTableSize]?.cols,
};
