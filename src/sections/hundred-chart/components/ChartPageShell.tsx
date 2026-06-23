import type { HundredChartSheet } from 'src/features/hundred-chart/types';

import React from 'react';
import { useTranslation } from 'react-i18next';

import { Typography } from '@mui/material';

import { WorksheetPaper } from 'src/shared/worksheet';

interface Props {
  sheets: HundredChartSheet[];
  pdfContainerRef?: React.RefObject<HTMLDivElement | null>;
  renderPage: (sheetData: HundredChartSheet, idx: number) => React.ReactElement;
}

/**
 * Thin adapter that maps the hundred-chart `sheets` model onto the shared
 * {@link WorksheetPaper} (unified preview area). Page chrome / navigation /
 * print container all live in the shared component now.
 */
const ChartPageShell: React.FC<Props> = ({ sheets, pdfContainerRef, renderPage }) => {
  const { t } = useTranslation();

  return (
    <WorksheetPaper
      pageCount={sheets?.length ?? 0}
      pdfContainerRef={pdfContainerRef}
      renderPage={(idx) => renderPage(sheets[idx], idx)}
      emptyState={<Typography variant="h6" color="inherit">{t('hundredChart.generating')}</Typography>}
    />
  );
};

export default ChartPageShell;
