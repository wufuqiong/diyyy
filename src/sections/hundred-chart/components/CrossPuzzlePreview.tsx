import type { CrossPuzzle, HundredChartSheet } from 'src/features/hundred-chart/types';

import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Typography } from '@mui/material';

import { colors } from 'src/theme/tokens';

import ChartPageShell from './ChartPageShell';

interface Props {
  sheets: HundredChartSheet[];
  pdfContainerRef?: React.RefObject<HTMLDivElement | null>;
}

const QUESTION_NUMBERS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪', '⑫', '⑬', '⑭', '⑮', '⑯'];

function renderPuzzleGrid(puzzle: CrossPuzzle, isAnswer: boolean, showNumbering: boolean, cellSize: string, fontSize: string) {
  const { grid, rows, cols, questionNumber } = puzzle;
  const qNum = QUESTION_NUMBERS[questionNumber - 1] || '';
  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      {showNumbering && (
        <Typography sx={{ position: 'absolute', top: `calc(-${fontSize} * 1.5)`, left: 2, fontSize, color: 'text.secondary', zIndex: 1 }}>
          {qNum}
        </Typography>
      )}
      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cellSize})`, gridTemplateRows: `repeat(${rows}, ${cellSize})`, gap: 0 }}>
        {Array.from({ length: rows }).map((_row, r) =>
          Array.from({ length: cols }).map((_col, c) => {
            const cell = grid[r]?.[c];
            if (!cell) return <Box key={`${r}-${c}`} sx={{ width: cellSize, height: cellSize, visibility: 'hidden' }} />;
            return (
              <Box key={`${r}-${c}`} sx={{ width: cellSize, height: cellSize, border: `1.5px solid ${colors.inkSecondary}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isAnswer && cell.isBlank ? 'red' : 'text.primary', fontWeight: 'bold', fontSize }}>
                {cell.isBlank && !isAnswer ? '' : cell.number}
              </Box>
            );
          }),
        )}
      </Box>
    </Box>
  );
}

const CrossPuzzlePreview: React.FC<Props> = ({ sheets, pdfContainerRef }) => {
  const { t } = useTranslation();
  const totalPages = sheets.length;
  const cols = sheets[0]?.columnsPerRow || 4;

  // Dynamic cell sizing: content area = 170mm (210mm - 40mm padding), max 5 cells wide per puzzle
  const cellSize = `${Math.round(170 / (cols * 5))}mm`;
  const fontSize = `${Math.round(170 / (cols * 5) * 0.45)}mm`;

  const renderPage = (sheetData: HundredChartSheet, idx: number): React.ReactElement => {
    const { pageTitle, showFormula, showExample, puzzles, examplePuzzle, isAnswerKey, showNumbering: sNum } = sheetData;
    const puzs = puzzles || [];
    const isAnswer = isAnswerKey || false;
    const showNum = sNum || false;

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
          {isAnswer && (
            <Typography variant="body2" sx={{ color: 'grey.500', fontStyle: 'italic', mt: 0.5 }}>{t('hundredChart.answerKey')}</Typography>
          )}
        </Box>

        {/* Formula + Example */}
        {(showFormula || (showExample && examplePuzzle)) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 3, flexWrap: 'wrap' }}>
            {showFormula && (
              <Box sx={{ border: '2px solid', borderColor: 'grey.300', borderRadius: 1, p: 1, px: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5, color: 'grey.700' }}>{t('hundredChart.cross.formulaTitle')}</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{t('hundredChart.cross.formulaLine1')}</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{t('hundredChart.cross.formulaLine2')}</Typography>
              </Box>
            )}
            {showExample && examplePuzzle && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>{t('hundredChart.cross.example')}</Typography>
                {renderPuzzleGrid(examplePuzzle, false, false, cellSize, fontSize)}
              </Box>
            )}
          </Box>
        )}

        {/* Puzzles grid */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Array.from({ length: Math.ceil(puzs.length / cols) }).map((_, rowIdx) => (
            <Box key={rowIdx} sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              {puzs.slice(rowIdx * cols, (rowIdx + 1) * cols).map((p) => (
                <Box key={p.id} sx={{ pt: showNum ? 2.5 : 0 }}>{renderPuzzleGrid(p, isAnswer, showNum, cellSize, fontSize)}</Box>
              ))}
            </Box>
          ))}
        </Box>
      </>
    );
  };

  return <ChartPageShell sheets={sheets} pdfContainerRef={pdfContainerRef} renderPage={renderPage} />;
};

export default CrossPuzzlePreview;
