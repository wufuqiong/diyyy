import React, { useState, useEffect } from 'react';

import { Box, Paper, Typography } from '@mui/material';

import { ink, surface, previewLayout } from 'src/theme/tokens';

import { PageNavigator } from './PageNavigator';
import { useToolColor } from './ToolColorContext';
import { useFitScale, A4_WIDTH_PX, A4_HEIGHT_PX } from './useFitScale';

/** Approx. vertical space (px) the nav bar + its gap occupy above the sheet. */
const NAV_BAR_RESERVE_PX = 66;
/** Approx. vertical space (px) the footer hint + its gap occupy below the sheet. */
const FOOTER_HINT_RESERVE_PX = 34;

interface WorksheetPaperProps {
  /** Total number of printable pages. */
  pageCount: number;
  /** Renders the inner A4 content for a single page (0-indexed). */
  renderPage: (pageIndex: number) => React.ReactNode;
  /** Off-screen container used for print / PDF export (all pages). */
  pdfContainerRef?: React.RefObject<HTMLDivElement | null>;
  /** Optional hint rendered under the sheet (e.g. maze direction tip). */
  footerHint?: React.ReactNode;
  /** Shown when pageCount === 0. */
  emptyState?: React.ReactNode;
  /** Inner padding of the A4 sheet. Defaults to 20mm. */
  paperPadding?: string;
}

/**
 * Unified preview "desktop" for every worksheet tool.
 *
 * Structure mirrors `diyyy-charmaze-multipage-layout.html`:
 *   preview-stage (max-width, centered)
 *     > page-nav-bar  (only when pageCount > 1)
 *     > paper-sheet   (candy rounded white sheet, scaled A4)
 *     > sheet-footer-hint (optional)
 *
 * Single-page tools simply omit the nav bar; everything else is identical.
 * A hidden off-screen container renders every page for print / PDF.
 */
export const WorksheetPaper: React.FC<WorksheetPaperProps> = ({
  pageCount,
  renderPage,
  pdfContainerRef,
  footerHint,
  emptyState,
  paperPadding = '20mm',
}) => {
  const toolColor = useToolColor();
  const [currentPage, setCurrentPage] = useState(1);
  const reservedHeight =
    (pageCount > 1 ? NAV_BAR_RESERVE_PX : 0) + (footerHint ? FOOTER_HINT_RESERVE_PX : 0);
  const { containerRef, scale } = useFitScale({ reservedHeight });

  // Clamp current page when the page count shrinks.
  useEffect(() => {
    if (currentPage > pageCount && pageCount > 0) {
      setCurrentPage(pageCount);
    }
  }, [pageCount, currentPage]);

  if (pageCount === 0) {
    return (
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: surface.sky,
          p: 4,
          textAlign: 'center',
          color: ink.soft,
        }}
      >
        {emptyState ?? (
          <Typography variant="body1" color="inherit">
            请调整左侧设置以生成内容
          </Typography>
        )}
      </Box>
    );
  }

  const safePage = Math.min(currentPage, pageCount);

  // Width of the centered stage = the on-screen (scaled) paper width, so the
  // nav bar and sheet always share the exact same width and read as one group.
  const stageWidthPx = A4_WIDTH_PX * scale;

  const screenPaperSx = {
    width: '210mm',
    height: '297mm',
    boxSizing: 'border-box' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#fff',
    padding: paperPadding,
    overflow: 'hidden',
  };

  const printPaperSx = {
    width: '210mm',
    minHeight: '297mm',
    boxSizing: 'border-box' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#fff',
    padding: paperPadding,
    margin: '0 auto',
  };

  return (
    <>
      {/* ---- Screen view (hidden when printing) ---- */}
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: 3,
          pt: 3,
          pb: 4,
          '@media print': { display: 'none !important' },
        }}
      >
        <Box
          sx={{
            width: stageWidthPx,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {pageCount > 1 && (
            <PageNavigator
              currentPage={safePage}
              totalPages={pageCount}
              onPageChange={setCurrentPage}
              toolColor={toolColor}
            />
          )}

          {/* Wrapper sized to the SCALED paper so the transform leaves no
              phantom layout box (prevents overflow / dead whitespace). */}
          <Box sx={{ width: stageWidthPx, height: A4_HEIGHT_PX * scale, flexShrink: 0 }}>
            <Paper
              elevation={0}
              sx={{
                ...screenPaperSx,
                borderRadius: previewLayout.sheetRadius,
                boxShadow: previewLayout.sheetShadow,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              {renderPage(safePage - 1)}
            </Paper>
          </Box>

          {footerHint && (
            <Typography
              sx={{
                textAlign: 'center',
                mt: `${previewLayout.navBarGap}px`,
                fontSize: 12,
                fontWeight: 600,
                color: ink.soft,
              }}
            >
              {footerHint}
            </Typography>
          )}
        </Box>
      </Box>

      {/* ---- Print view (off-screen on screen, visible when printing) ---- */}
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
        {Array.from({ length: pageCount }).map((_, pageIndex) => (
          <Box
            key={pageIndex}
            sx={{
              pageBreakAfter: pageIndex < pageCount - 1 ? 'always' : 'auto',
              '&:last-child': { pageBreakAfter: 'auto' },
            }}
          >
            <Paper elevation={0} sx={{ ...printPaperSx, boxShadow: 'none' }}>
              {renderPage(pageIndex)}
            </Paper>
          </Box>
        ))}
      </Box>
    </>
  );
};
