import type { GridSizePreset, WordSearchSheet, WordSearchConfig, WordSearchDifficulty } from 'src/features/word-search/types';

import { useTranslation } from 'react-i18next';
import React, { useLayoutEffect, useRef, useState } from 'react';

import { Box, Alert, Typography, useTheme } from '@mui/material';

import { DIFFICULTY_DIRECTIONS } from 'src/features/word-search/types';

// ---------------------------------------------------------------------------
// Page scaling (same logic as usePreviewScale but applied to all pages at once)
// ---------------------------------------------------------------------------

const MM_TO_PX = 96 / 25.4;
const PAPER_WIDTH_PX = 210 * MM_TO_PX; // ~794px
const MIN_SCALE = 0.35;

function useScale() {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => {
      const s = Math.max(MIN_SCALE, Math.min(1, el.offsetWidth / PAPER_WIDTH_PX));
      setScale((prev) => (Math.abs(prev - s) > 0.005 ? s : prev));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return { ref, scale };
}

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

const BubbleTitle: React.FC<{ title: string }> = ({ title }) => {
  const theme = useTheme();
  return (
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
              border: `3px solid ${theme.palette.primary.main}`,
              backgroundColor: '#fff', color: theme.palette.primary.main,
              fontSize: 36, fontWeight: 800, lineHeight: 1, textTransform: 'uppercase',
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
  const theme = useTheme();
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
        border: `3px solid ${theme.palette.primary.main}`, backgroundColor: '#fff',
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
  const theme = useTheme();
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
        border: `3px solid ${theme.palette.primary.main}`,
        backgroundColor: theme.palette.primary.lighter,
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
// A4 page wrapper — no PrintFrame, direct mm sizing, vertically centered
// ---------------------------------------------------------------------------

const A4Page: React.FC<{
  pageNumber?: number;
  totalPages?: number;
  children: React.ReactNode;
}> = ({ pageNumber, totalPages, children }) => (
  <Box
    sx={{
      width: '210mm',
      height: '297mm',
      mx: 'auto',
      mb: { xs: 2, sm: 3 },
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      boxShadow: { xs: 'none', sm: '0 2px 8px rgba(0,0,0,0.1)' },
      position: 'relative',
      overflow: 'hidden',
      '@media print': {
        width: '210mm',
        height: '297mm',
        margin: 0,
        mb: 0,
        boxShadow: 'none',
        pageBreakAfter: 'always',
        '&:last-child': { pageBreakAfter: 'auto' },
      },
    }}
  >
    {/* Centered content area */}
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 0, py: 3 }}>
      {children}
    </Box>

    {/* Page number at bottom center */}
    {pageNumber !== undefined && totalPages !== undefined && (
      <Typography sx={{ pb: 1.5, fontSize: 11, color: '#999' }}>
        Page {pageNumber} / {totalPages}
      </Typography>
    )}
  </Box>
);

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
  const { ref: scaleRef, scale } = useScale();

  if (sheets.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography variant="body2" color="text.secondary">
          {t('wordSearch.emptyState')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box ref={pdfContainerRef}>
      <Box
        ref={scaleRef}
        sx={{
          transform: scale < 1 ? `scale(${scale})` : 'none',
          transformOrigin: 'top center',
        }}
      >
        {sheets.map((sheet) => (
          <A4Page key={sheet.id} pageNumber={sheet.pageNumber} totalPages={sheet.totalPages}>
            <PageContent sheet={sheet} config={config} />
          </A4Page>
        ))}
      </Box>
    </Box>
  );
};

export default PreviewSheet;
