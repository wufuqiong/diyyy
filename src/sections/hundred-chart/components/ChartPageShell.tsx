import type { HundredChartSheet } from 'src/features/hundred-chart/types';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Paper, Typography, Pagination } from '@mui/material';

import { usePreviewScale } from 'src/shared/worksheet/usePreviewScale';

interface Props {
  sheets: HundredChartSheet[];
  pdfContainerRef?: React.RefObject<HTMLDivElement | null>;
  renderPage: (sheetData: HundredChartSheet, idx: number) => React.ReactElement;
}

const ChartPageShell: React.FC<Props> = ({ sheets, pdfContainerRef, renderPage }) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const { containerRef, scale } = usePreviewScale();

  if (!sheets || sheets.length === 0) {
    return (
      <Box sx={{ width: '100%', height: '100%', bgcolor: 'grey.100', p: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'grey.400' }}>
        <Typography variant="h6" color="inherit">{t('hundredChart.generating')}</Typography>
      </Box>
    );
  }

  const totalPages = sheets.length;
  const sheet = sheets[currentPage - 1];

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => setCurrentPage(page);

  return (
    <Box sx={{ width: '100%', height: '100%', backgroundColor: 'grey.50', overflow: 'hidden', padding: 2, '@media print': { backgroundColor: 'white', padding: 0, overflow: 'visible' } }} className="worksheet-preview">
      {/* Screen view */}
      <Box ref={containerRef} sx={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', '@media print': { display: 'none !important' } }}>
        <Paper elevation={0} sx={{ width: '210mm', minHeight: '297mm', overflow: 'hidden', margin: '0 auto', marginBottom: totalPages > 1 ? 0 : 4, padding: '20mm', paddingBottom: '15mm', backgroundColor: 'white', boxShadow: 'none', transform: scale < 1 ? `scale(${scale})` : undefined, transformOrigin: 'top center', '&:last-child': { marginBottom: 0 } }}>
          {renderPage(sheet, currentPage - 1)}
        </Paper>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" size="large" />
          </Box>
        )}
      </Box>

      {/* Print view */}
      <Box ref={pdfContainerRef as React.RefObject<HTMLDivElement>}
        sx={{ position: 'absolute', left: '-9999px', top: 0, opacity: 0, pointerEvents: 'none',
          '@media print': { position: 'static', left: 'auto', opacity: 1, pointerEvents: 'auto' } }}>
        {sheets.map((s, idx) => (
          <Box key={s.id} sx={{ pageBreakAfter: idx < sheets.length - 1 ? 'always' : 'auto', '&:last-child': { pageBreakAfter: 'auto' } }}>
            <Paper elevation={0} sx={{ width: '210mm', minHeight: '297mm', overflow: 'hidden', margin: '0 auto', padding: '20mm', paddingBottom: '15mm', backgroundColor: 'white', boxShadow: 'none' }}>
              {renderPage(s, idx)}
            </Paper>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ChartPageShell;
