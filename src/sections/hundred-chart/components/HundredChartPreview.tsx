import type { HundredChartSheet } from 'src/features/hundred-chart/types';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Typography, IconButton } from '@mui/material';
import { NavigateNext, NavigateBefore } from '@mui/icons-material';

import { colors } from 'src/theme/tokens';
import { BlankMode } from 'src/features/hundred-chart/types';
import { usePreviewScale } from 'src/shared/worksheet/usePreviewScale';

interface Props {
  sheets: HundredChartSheet[];
  blankMode: BlankMode;
  pdfContainerRef?: React.RefObject<HTMLDivElement | null>;
  onManualBlanksChange?: (blanks: number[]) => void;
}

const HundredChartPreview: React.FC<Props> = ({
  sheets,
  blankMode,
  pdfContainerRef,
  onManualBlanksChange,
}) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const { containerRef, scale } = usePreviewScale();

  if (!sheets || sheets.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="textSecondary">
          {t('hundredChart.noPreview')}
        </Typography>
      </Box>
    );
  }

  const totalPages = sheets.length;
  const sheet = sheets[currentPage];
  const isManual = blankMode === BlankMode.MANUAL && !!onManualBlanksChange;

  const handleCellClick = (index: number) => {
    if (!isManual || !onManualBlanksChange) return;
    const newBlanks: number[] = [];
    for (let i = 0; i < 100; i++) {
      const wasBlank = sheet.cells[i].isBlank;
      const toggled = i === index ? !wasBlank : wasBlank;
      if (toggled) newBlanks.push(i);
    }
    onManualBlanksChange(newBlanks);
  };

  const generatePageIndicators = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const indicators: (number | 'ellipsis')[] = [];
    indicators.push(0);

    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) indicators.push(i);
      indicators.push('ellipsis');
      indicators.push(totalPages - 2);
      indicators.push(totalPages - 1);
    } else if (currentPage >= totalPages - 4) {
      indicators.push('ellipsis');
      for (let i = totalPages - 5; i < totalPages; i++) {
        if (i > 0) indicators.push(i);
      }
    } else {
      indicators.push('ellipsis');
      for (let i = currentPage - 2; i <= currentPage + 2; i++) indicators.push(i);
      indicators.push('ellipsis');
      indicators.push(totalPages - 1);
    }

    return indicators;
  };

  const renderSheet = (sheetData: HundredChartSheet): React.ReactElement => {
    const { cells, pageTitle, pageInfo, isAnswerKey } = sheetData;
    const manualBlankCount = cells.filter(c => c.isBlank).length;

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header: page title (left) + info (right), chartrace-style */}
        <Box
          component="header"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderBottom: '2px solid',
            borderColor: 'success.main',
            pb: 1,
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.dark', fontFamily: 'serif' }}>
            {pageTitle}
          </Typography>
          {pageInfo && (
            <Typography variant="body2" sx={{ color: 'success.dark', fontFamily: 'serif' }}>
              {pageInfo}
            </Typography>
          )}
        </Box>

        {/* Answer key badge */}
        {isAnswerKey && (
          <Typography
            variant="subtitle1"
            align="center"
            sx={{ mb: 1, color: 'success.main', fontWeight: 'bold' }}
          >
            {t('hundredChart.answerKey')}
          </Typography>
        )}

        {/* 10×10 Grid */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box
            sx={{
              width: '100%',
              aspectRatio: '1',
              maxHeight: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(10, 1fr)',
              gridTemplateRows: 'repeat(10, 1fr)',
              border: `2px solid ${colors.inkSecondary}`,
            }}
          >
            {cells.map((cell, i) => (
              <Box
                key={i}
                onClick={() => handleCellClick(i)}
                sx={{
                  border: `0.5px solid ${colors.inkSecondary}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: cell.isBlank ? 'grey.100' : 'white',
                  cursor: isManual ? 'pointer' : 'default',
                  transition: 'background-color 0.15s',
                  '&:hover': isManual
                    ? { backgroundColor: cell.isBlank ? 'grey.200' : 'primary.light', opacity: 0.7 }
                    : {},
                  '@media print': {
                    backgroundColor: cell.isBlank ? 'white' : 'white',
                  },
                }}
              >
                {!cell.isBlank && (
                  <Typography
                    sx={{
                      fontSize: {
                        xs: '0.65rem',
                        sm: '0.8rem',
                        md: '1rem',
                      },
                      fontWeight: 'bold',
                      color: 'text.primary',
                    }}
                  >
                    {cell.number}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Manual mode counter */}
        {isManual && (
          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 1, color: 'text.secondary' }}
          >
            {t('hundredChart.selected', { count: manualBlankCount })}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        '@media print': { overflow: 'visible' },
      }}
    >
      <Box
        sx={{
          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
        }}
      >
        {/* Screen view - hidden when printing */}
        <Box sx={{ '@media print': { display: 'none' } }}>
          {/* Pagination controls */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
              <IconButton
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                size="small"
              >
                <NavigateBefore />
              </IconButton>

              {generatePageIndicators().map((item, idx) =>
                item === 'ellipsis' ? (
                  <Typography key={`e-${idx}`} sx={{ px: 0.5 }}>...</Typography>
                ) : (
                  <IconButton
                    key={item}
                    onClick={() => setCurrentPage(item)}
                    color={item === currentPage ? 'primary' : 'default'}
                    size="small"
                  >
                    {item + 1}
                  </IconButton>
                ),
              )}

              <IconButton
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                size="small"
              >
                <NavigateNext />
              </IconButton>
            </Box>
          )}

          {/* Current page */}
          <Box
            sx={{
              width: '210mm',
              minHeight: '297mm',
              margin: '0 auto',
              mb: 4,
              padding: '15mm',
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              display: 'flex',
              flexDirection: 'column',
              '@media print': { boxShadow: 'none', padding: 0 },
            }}
          >
            {renderSheet(sheet)}
          </Box>
        </Box>

        {/* Print view - all pages, off-screen */}
        <Box
          ref={pdfContainerRef}
          sx={{
            position: 'absolute',
            left: '-9999px',
            top: 0,
            opacity: 0,
            pointerEvents: 'none',
            '@media print': {
              position: 'static',
              left: 'auto',
              opacity: 1,
              pointerEvents: 'auto',
            },
          }}
        >
          {sheets.map((s, idx) => (
            <Box
              key={s.id}
              sx={{
                width: '210mm',
                minHeight: '297mm',
                margin: '0 auto',
                padding: '15mm',
                backgroundColor: 'white',
                display: 'flex',
                flexDirection: 'column',
                pageBreakAfter: idx < sheets.length - 1 ? 'always' : 'auto',
                '&:last-child': {
                  pageBreakAfter: 'auto',
                },
              }}
            >
              {renderSheet(s)}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default HundredChartPreview;
