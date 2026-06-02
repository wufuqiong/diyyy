import type { HundredChartSheet, HundredChartConfig } from 'src/features/hundred-chart/types';

import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Typography } from '@mui/material';

import { colors } from 'src/theme/tokens';
import { BlankMode } from 'src/features/hundred-chart/types';

import ChartPageShell from './ChartPageShell';
import CrossPuzzlePreview from './CrossPuzzlePreview';

interface Props {
  config: HundredChartConfig;
  sheets: HundredChartSheet[];
  pdfContainerRef?: React.RefObject<HTMLDivElement | null>;
  onManualBlanksChange?: (blanks: number[]) => void;
}

const HundredChartPreview: React.FC<Props> = ({
  config,
  sheets,
  pdfContainerRef,
  onManualBlanksChange,
}) => {
  const { t } = useTranslation();

  if (config.mode === 'cross') {
    return <CrossPuzzlePreview sheets={sheets} pdfContainerRef={pdfContainerRef} />;
  }

  // --- Grid mode ---
  const totalPages = sheets.length;
  const blankMode = config.blankMode;
  const isManual = blankMode === BlankMode.MANUAL && !!onManualBlanksChange;

  const renderPage = (sheetData: HundredChartSheet, idx: number): React.ReactElement => {
    const cells = sheetData.cells;
    if (!cells) return <Box sx={{ textAlign: 'center', py: 4 }}><Typography color="textSecondary">{t('hundredChart.generating')}</Typography></Box>;
    const manualBlankCount = cells.filter(c => c.isBlank).length;
    const { pageTitle, isAnswerKey } = sheetData;

    const handleCellClick = (index: number) => {
      if (!isManual || !onManualBlanksChange) return;
      const newBlanks: number[] = [];
      for (let i = 0; i < 100; i++) {
        const wasBlank = cells[i].isBlank;
        const toggled = i === index ? !wasBlank : wasBlank;
        if (toggled) newBlanks.push(i);
      }
      onManualBlanksChange(newBlanks);
    };

    return (
      <>
        {/* Header */}
        <Box sx={{ mb: 3, borderBottom: '2px solid', borderColor: 'grey.300', pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'grey.800', mb: 0.5, fontSize: { xs: '1.5rem', md: '1.875rem' } }}>
              {pageTitle}
            </Typography>
            {totalPages > 1 && (
              <Typography variant="body2" sx={{ color: 'grey.500', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                {t('hundredChart.pageOf', { current: idx + 1, total: totalPages })}
              </Typography>
            )}
          </Box>
          {isAnswerKey && (
            <Typography variant="body2" sx={{ color: 'grey.500', fontStyle: 'italic', mt: 0.5 }}>
              {t('hundredChart.answerKey')}
            </Typography>
          )}
        </Box>

        {/* 10×10 Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', width: '100%', border: `2px solid ${colors.inkSecondary}` }}>
          {cells.map((cell, i) => (
            <Box
              key={i} onClick={() => handleCellClick(i)}
              sx={{
                aspectRatio: '1', border: `0.5px solid ${colors.inkSecondary}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: cell.isBlank ? 'grey.100' : 'white',
                cursor: isManual ? 'pointer' : 'default',
                transition: 'background-color 0.15s',
                '&:hover': isManual ? { backgroundColor: cell.isBlank ? 'grey.200' : 'primary.light', opacity: 0.7 } : {},
                '@media print': { backgroundColor: cell.isBlank ? 'white' : 'white' },
              }}
            >
              {!cell.isBlank && (
                <Typography sx={{ fontSize: { xs: '0.65rem', sm: '0.8rem', md: '1rem' }, fontWeight: 'bold', color: 'text.primary' }}>
                  {cell.number}
                </Typography>
              )}
            </Box>
          ))}
        </Box>

        {isManual && (
          <Typography variant="body2" align="center" sx={{ mt: 1, color: 'text.secondary' }}>{t('hundredChart.selected', { count: manualBlankCount })}</Typography>
        )}
      </>
    );
  };

  return <ChartPageShell sheets={sheets} pdfContainerRef={pdfContainerRef} renderPage={renderPage} />;
};

export default HundredChartPreview;
