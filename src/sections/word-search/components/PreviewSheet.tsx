import type { GridSizePreset, WordSearchSheet, WordSearchConfig, WordSearchDifficulty } from 'src/features/word-search/types';

import { useTranslation } from 'react-i18next';
import React, { useRef, useState, useCallback, useLayoutEffect } from 'react';

import { Box, Alert, Typography } from '@mui/material';

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

/** Light background color for each candy color (word list background). */
const SOFT_COLOR: Record<string, string> = {
  '#FF6B6B': '#FFE8E8',
  '#FFA63D': '#FFF0E0',
  '#FFD23F': '#FFF8E0',
  '#4ECB71': '#E8F8EC',
  '#2EC4B6': '#E0F8F6',
  '#4D9DE0': '#E6F2FB',
  '#9B72CF': '#F2ECFA',
  '#FF7AAE': '#FFE4F0',
};

const getSoftColor = (themeColor: string) => SOFT_COLOR[themeColor.toUpperCase()] || '#FFE4F0';

/** Estimated available vertical px for the word list on one A4 page, per grid size. */
const LIST_AVAILABLE_HEIGHT: Record<GridSizePreset, number> = {
  small: 132,
  medium: 138,
  large: 200,
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

const MAX_TITLE_WIDTH = 580;
const TITLE_GAP = 8;
const MAX_BUBBLE = 58;

const BubbleTitle: React.FC<{ title: string; themeColor: string }> = ({ title, themeColor }) => {
  const chars = Array.from(title).filter((ch) => ch.trim() !== '');
  const bubbleSize = Math.min(MAX_BUBBLE, Math.floor((MAX_TITLE_WIDTH - (chars.length - 1) * TITLE_GAP) / chars.length));
  const fontSize = Math.round(bubbleSize * 0.62);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: `${TITLE_GAP}px`, flexWrap: 'nowrap' }}>
      {Array.from(title).map((ch, i) =>
        ch.trim() === '' ? (
          <Box key={i} sx={{ width: `${Math.round(bubbleSize * 0.25)}px`, flexShrink: 0 }} />
        ) : (
          <Box
            key={i}
            sx={{
              width: `${bubbleSize}px`,
              height: `${bubbleSize}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              borderRadius: '999px',
              border: `3px solid ${themeColor}`,
              backgroundColor: '#fff',
              color: themeColor,
              fontSize,
              fontWeight: 800,
              lineHeight: 1,
              textTransform: 'uppercase',
            }}
          >
            {ch}
          </Box>
        ),
      )}
    </Box>
  );
};

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
  const { grid, placedWords, isAnswerKey, themeColor } = sheet;
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
        border: `3px solid ${themeColor}`, backgroundColor: '#fff',
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

const LONG_WORD_THRESHOLD = 9;

const WordList: React.FC<{
  words: string[];
  columns: 1 | 2 | 3 | 4 | 5;
  gridSize: GridSizePreset;
  themeColor: string;
}> = ({ words, columns, gridSize, themeColor }) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [effectiveColumns, setEffectiveColumns] = useState(columns);

  // Increase columns if content overflows the estimated available height.
  const checkOverflow = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const availableHeight = LIST_AVAILABLE_HEIGHT[gridSize];
    if (el.scrollHeight > availableHeight && effectiveColumns < 5) {
      setEffectiveColumns((prev) => Math.min(5, prev + 1) as 1 | 2 | 3 | 4 | 5);
    }
  }, [gridSize, effectiveColumns]);

  useLayoutEffect(() => {
    checkOverflow();
  }, [checkOverflow, words, columns]);

  // Reset effective columns when inputs change
  useLayoutEffect(() => {
    setEffectiveColumns(columns);
  }, [columns, words]);

  if (words.length === 0) return null;

  const fontSize = LIST_FONT_SIZE[gridSize];
  const softBg = getSoftColor(themeColor);

  // Distribute words into columns, balancing by weight.
  // Long words (>= LONG_WORD_THRESHOLD chars) count as weight 2 and
  // may span 2 grid columns so they don't overflow narrow columns.
  type GridItem = { word: string; col: number; colSpan: 1 | 2; row: number };
  const items: GridItem[] = [];
  const colRow: number[] = Array.from({ length: effectiveColumns }, () => 1);

  for (const word of words) {
    const colSpan: 1 | 2 = word.length >= LONG_WORD_THRESHOLD ? 2 : 1;

    // Pick the column with fewest occupied rows
    let col = 0;
    for (let c = 1; c < effectiveColumns; c++) {
      if (colRow[c] < colRow[col]) col = c;
    }

    // Span-2 words must fit within the grid
    const actualCol = colSpan === 2 && col >= effectiveColumns - 1 ? effectiveColumns - 2 : col;
    const actualSpan: 1 | 2 = actualCol + colSpan <= effectiveColumns ? colSpan : 1;

    items.push({ word, col: actualCol, colSpan: actualSpan, row: colRow[actualCol] });
    colRow[actualCol]++;
    if (actualSpan === 2) {
      colRow[actualCol + 1] = Math.max(colRow[actualCol + 1], colRow[actualCol]);
    }
  }

  const totalRows = Math.max(...colRow) - 1;

  return (
    <Box
      ref={listRef}
      sx={{
        mx: 'auto', width: 'fit-content', minWidth: 360, maxWidth: PRINT_WIDTH + 80,
        px: 4, py: 2.5, borderRadius: '24px',
        border: `3px solid ${themeColor}`,
        backgroundColor: softBg,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${effectiveColumns}, auto)`,
          gridTemplateRows: `repeat(${totalRows}, auto)`,
          justifyContent: 'space-between',
          columnGap: 6,
          rowGap: 1,
        }}
      >
        {items.map(({ word, col, colSpan, row }) => (
          <Typography
            key={`${row}-${col}-${word}`}
            sx={{
              fontSize,
              fontWeight: 500,
              color: '#333',
              lineHeight: 1.4,
              gridColumn: colSpan === 2 ? `${col + 1} / span 2` : `${col + 1}`,
              gridRow: row,
              whiteSpace: 'nowrap',
            }}
          >
            {word}
          </Typography>
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
  const themeColor = sheet.themeColor;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, px: 2 }}>
      <BubbleTitle title={sheet.title} themeColor={themeColor} />

      {sheet.unplacedWords.length > 0 && !sheet.isAnswerKey && (
        <Alert severity="warning" sx={{ mx: 'auto', maxWidth: 500 }}>
          {t('wordSearch.unplacedWordsWarning', { words: sheet.unplacedWords.join(', ') })}
        </Alert>
      )}

      <WordGrid sheet={sheet} />

      {!sheet.isAnswerKey && sheet.placedWords.length > 0 && (
        <>
          <Instruction difficulty={config.difficulty} />
          <WordList
            words={sheet.placedWords.map((p) => p.word)}
            columns={sheet.listColumns}
            gridSize={config.gridSize}
            themeColor={themeColor}
          />
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
