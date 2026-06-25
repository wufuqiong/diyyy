import type { WorksheetTool } from 'src/shared/worksheet';

import React from 'react';
import { v4 as uuidv4 } from 'uuid';

import GridOnIcon from '@mui/icons-material/GridOn';

import i18n from 'src/i18n/config';

import { BlankMode } from './types';
import { generateCrossSheets } from './cross-utils';
import { generateSeed, computeBlanks } from './utils';
import HundredChartPreview from '../../sections/hundred-chart/components/HundredChartPreview';
import HundredChartSettings from '../../sections/hundred-chart/components/HundredChartSettings';

import type { HundredChartSheet, HundredChartConfig } from './types';

const isEn = i18n.language?.startsWith('en');

const defaultConfig: HundredChartConfig = {
  // shared
  mode: 'grid',
  pageTitle: isEn ? 'Hundred Chart Fill' : '百数板填空',
  pageInfo: isEn ? 'Name: __________  Date: __________' : '姓名: __________  日期: __________',
  versionCount: 1,
  includeAnswerKey: false,

  // grid mode
  startNumber: 1,
  blankMode: BlankMode.RANDOM,
  blankCount: 20,
  step: 5,
  offset: 0,
  manualBlanks: [],

  // cross mode
  showFormula: true,
  showExample: true,
  showNumbering: true,
  minCenter: 11,
  maxCenter: 90,
  questionsPerPage: 8,
  columnsPerRow: 4,
  difficulty: 'medium',
  easyHintCount: 2,
  easyHintPosition: 'random',
  mediumCellCount: 'random5-6',
  mediumHintCount: 'random2-3',
  hardCellCount: 'random5-9',
};

// ---------- generate ----------

function generateGridSheets(config: HundredChartConfig): HundredChartSheet[] {
  const sheets: HundredChartSheet[] = [];
  const baseSeed = generateSeed();

  for (let v = 0; v < config.versionCount; v++) {
    const versionSeed = baseSeed + v;

    const blanks = computeBlanks(
      config.blankMode,
      config.blankCount,
      versionSeed,
      config.step,
      config.offset,
      config.manualBlanks,
    );

    const blankSet = new Set(blanks);
    const cells = Array.from({ length: 100 }, (_, i) => ({
      number: config.startNumber + i,
      isBlank: blankSet.has(i),
    }));

    sheets.push({
      id: uuidv4(),
      mode: 'grid',
      cells,
      pageTitle: config.pageTitle,
      pageInfo: config.pageInfo,
      startNumber: config.startNumber,
      isAnswerKey: false,
    });

    if (config.includeAnswerKey) {
      sheets.push({
        id: uuidv4(),
        mode: 'grid',
        cells: Array.from({ length: 100 }, (_, i) => ({
          number: config.startNumber + i,
          isBlank: false,
        })),
        pageTitle: `${config.pageTitle} - ${isEn ? 'Answer Key' : '答案'}`,
        pageInfo: config.pageInfo,
        startNumber: config.startNumber,
        isAnswerKey: true,
      });
    }
  }

  return sheets;
}

function generate(config: HundredChartConfig): HundredChartSheet[] {
  const runSeed = generateSeed();
  if (config.mode === 'cross') {
    return generateCrossSheets(config, runSeed);
  }
  return generateGridSheets(config);
}

function deriveTitle(config: HundredChartConfig): string {
  if (config.mode === 'cross') {
    const label = isEn ? 'CrossPuzzle' : '十字填空';
    return `${label}_${config.minCenter}-${config.maxCenter}`;
  }
  const end = config.startNumber + 99;
  const label = isEn ? 'HundredChart' : '百数板';
  return `${label}_${config.startNumber}-${end}`;
}

// ---------- Preview / Settings wrappers ----------

const Preview: React.FC<{
  config: HundredChartConfig;
  problems: HundredChartSheet[];
  pdfContainerRef?: React.RefObject<HTMLDivElement | null>;
  onConfigChange?: (config: HundredChartConfig) => void;
}> = ({ config, problems, pdfContainerRef, onConfigChange }) => {
  const handleManualBlanksChange = onConfigChange
    ? (blanks: number[]) => onConfigChange({ ...config, manualBlanks: blanks })
    : undefined;

  return (
    <HundredChartPreview
      config={config}
      sheets={problems}
      pdfContainerRef={pdfContainerRef}
      onManualBlanksChange={
        config.mode === 'grid' && config.blankMode === BlankMode.MANUAL
          ? handleManualBlanksChange
          : undefined
      }
    />
  );
};

const Settings: React.FC<{
  config: HundredChartConfig;
  onChange: (c: HundredChartConfig) => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
}> = ({ config, onChange, onGenerate, isGenerating }) => (
  <HundredChartSettings
    config={config}
    onChange={onChange}
    onGenerate={onGenerate}
    isGenerating={isGenerating}
  />
);

export const hundredChartTool: WorksheetTool<HundredChartConfig, HundredChartSheet> = {
  id: 'hundred-chart',
  defaultConfig,
  generate,
  Preview,
  Settings,
  deriveTitle,
  deriveContentColumns: (config) => (config.mode === 'grid' ? 10 : config.columnsPerRow || 4),
  meta: {
    title: '百数板 - DIYYY',
    icon: <GridOnIcon />,
    route: '/hundred-chart',
  },
};
