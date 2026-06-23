import type { GridSizePreset, WordSearchSheet, WordSearchConfig, WordSearchDifficulty } from 'src/features/word-search/types';

import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Alert, Typography } from '@mui/material';

import { candyColors } from 'src/theme/tokens';
import { WorksheetPaper } from 'src/shared/worksheet';
import { DIFFICULTY_DIRECTIONS } from 'src/features/word-search/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

interface PreviewSheetProps {
  config: WordSearchConfig;
  sheets: WordSearchSheet[];
  pdfContainerRef?: React.RefObject<HTMLDivElement | null>;
}

const PRINT_WIDTH = 640;

const LIST_FONT_SIZE: Record<GridSizePreset, number> = {
  small: 24,
  medium: 21,
  large: 18,
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const buildDirectionHint = (difficulty: WordSearchDifficulty): string => {
  const dirs = DIFFICULTY_DIRECTIONS[difficulty];
  const parts: string[] = [];
  if (dirs.some((d) => d.startsWith('horizontal'))) parts.push('horizontally');
  if (dirs.some((d) => d.startsWith('vertical'))) parts.push('vertically');
  if (dirs.some((d) => d.startsWith('diagonal'))) parts.push('diagonally');
  const hasReverse = dirs.some((d) => d.endsWith('reverse'));
  let joined = parts.join(', ');
  const lastComma = joined.lastIndexOf(', ');
  if (lastComma >= 0) joined = `${joined.slice(0, lastComma)} and ${joined.slice(lastComma + 2)}`;
  return `Words may be hidden ${joined}${hasReverse ? ' (including backwards)' : ''}.`;
};

const BubbleTitle: React.FC<{ title: string }> = ({ title }) => (

    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
      {Array.from(title).map((ch, i) =>
        ch.trim() === '' ? (
          <Box key={i} sx={{ width: 14 }} />
        ) : (
          <Box
            key={i}
            sx={{
              minWidth: 58, height: 58, px: 1.5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '999px',
              border: `3px solid ${candyColors.pink}`,
              backgroundColor: '#fff', color: candyColors.pink,
              fontSize: 36, fontWeight: 800, lineHeight: 1, textTransform: 'uppercase',
            }}
          >
            {ch}
          </Box>
        ),
      )}
    </Box>
  );

const Instruction: React.FC<{ difficulty: WordSearchDifficulty }> = ({ difficulty }) => (
  <Box sx={{ textAlign: 'center', maxWidth: 520 }}>
    <Typography sx={{ fontSize: 20, fontWeight: 700, color: 'primary.main' }}>
      Find below words
    </Typography>
    <Typography sx={{ fontSize: 14, color: '#555', mt: 0.5 }}>
      {buildDirectionHint(difficulty)}
    </Typography>
  </Box>
);

const WordGrid: React.FC<{ sheet: WordSearchSheet }> = ({ sheet }) => {
  const { grid, placedWords, isAnswerKey } = sheet;
  const cols = grid[0].length;
  const rows = grid.length;
  const CARD_PADDING = 28;
  const innerWidth = PRINT_WIDTH - CARD_PADDING * 2;
  const cellSize = Math.floor(innerWidth / cols);
  const fontSize = Math.max(13, Math.floor(cellSize * 0.62));

  const highlightMap = new Map<string, string>();
  if (isAnswerKey) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFB347', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    for (let i = 0; i < placedWords.length; i++) {
      for (const cell of placedWords[i].cells) {
        highlightMap.set(`${cell.row},${cell.col}`, colors[i % colors.length]);
      }
    }
  }

  return (
    <Box
      sx={{
        mx: 'auto', width: 'fit-content',
        p: `${CARD_PADDING}px`, borderRadius: '24px',
        border: `3px solid ${candyColors.pink}`, backgroundColor: '#fff',
      }}
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`, gridTemplateRows: `repeat(${rows}, ${cellSize}px)` }}>
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const bg = highlightMap.get(`${r},${c}`);
            return (
              <Box
                key={`${r},${c}`}
                sx={{
                  width: cellSize, height: cellSize,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize, fontWeight: bg ? 700 : 500, color: '#333',
                  backgroundColor: bg || 'transparent', borderRadius: bg ? '50%' : 0,
                  userSelect: 'none', lineHeight: 1,
                }}
              >
                {cell}
              </Box>
            );
          }),
        )}
      </Box>
    </Box>
  );
};

const WordList: React.FC<{ words: string[]; columns: 1 | 2 | 3; gridSize: GridSizePreset }> = ({
  words, columns, gridSize,
}) => {
  if (words.length === 0) return null;

  const fontSize = LIST_FONT_SIZE[gridSize];
  const cols: string[][] = Array.from({ length: columns }, () => []);
  for (let i = 0; i < words.length; i++) cols[i % columns].push(words[i]);
  const filled = cols.filter((c) => c.length > 0);

  return (
    <Box
      sx={{
        mx: 'auto', width: 'fit-content', minWidth: 360, maxWidth: PRINT_WIDTH + 80,
        px: 4, py: 2.5, borderRadius: '24px',
        border: `3px solid ${candyColors.pink}`,
        backgroundColor: '#FFE4F0',
      }}
    >
      <Box
        sx={{
          display: 'grid', gridTemplateColumns: `repeat(${filled.length}, auto)`,
          justifyContent: 'space-between', columnGap: 6, rowGap: 1,
        }}
      >
        {filled.map((colWords, ci) => (
          <Box key={ci} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {colWords.map((w, wi) => (
              <Typography key={wi} sx={{ fontSize, fontWeight: 500, color: '#333', lineHeight: 1.4, overflowWrap: 'anywhere' }}>
                {w}
              </Typography>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Page content (without page wrapper)
// ---------------------------------------------------------------------------

const PageContent: React.FC<{ sheet: WordSearchSheet; config: WordSearchConfig }> = ({ sheet, config }) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, px: 2 }}>
      <BubbleTitle title={sheet.title} />

      {sheet.unplacedWords.length > 0 && !sheet.isAnswerKey && (
        <Alert severity="warning" sx={{ mx: 'auto', maxWidth: 500 }}>
          {t('wordSearch.unplacedWordsWarning', { words: sheet.unplacedWords.join(', ') })}
        </Alert>
      )}

      <WordGrid sheet={sheet} />

      {!sheet.isAnswerKey && sheet.placedWords.length > 0 && (
        <>
          <Instruction difficulty={config.difficulty} />
          <WordList words={sheet.placedWords.map((p) => p.word)} columns={sheet.listColumns} gridSize={config.gridSize} />
        </>
      )}
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Main preview
// ---------------------------------------------------------------------------

export const PreviewSheet: React.FC<PreviewSheetProps> = ({ config, sheets, pdfContainerRef }) => {
  const { t } = useTranslation();

  const renderPage = (idx: number) => {
    const sheet = sheets[idx];
    return (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 0,
            py: 3,
          }}
        >
          <PageContent sheet={sheet} config={config} />
        </Box>
        {sheet.pageNumber !== undefined && sheet.totalPages !== undefined && (
          <Typography sx={{ textAlign: 'center', fontSize: 11, color: '#999' }}>
            Page {sheet.pageNumber} / {sheet.totalPages}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <WorksheetPaper
      pageCount={sheets?.length ?? 0}
      pdfContainerRef={pdfContainerRef}
      paperPadding="12mm"
      renderPage={renderPage}
      emptyState={
        <Typography variant="body2" color="text.secondary">
          {t('wordSearch.emptyState')}
        </Typography>
      }
    />
  );
};

export default PreviewSheet;
