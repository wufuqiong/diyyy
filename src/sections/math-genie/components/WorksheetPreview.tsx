import type { MathProblem } from 'src/types';

// src/sections/math-genie/components/WorksheetPreview.tsx
import React, { useMemo } from 'react';

import { Box, Typography } from '@mui/material';

import { DisplayMode } from 'src/types';
import { WorksheetPaper } from 'src/shared/worksheet';
import { derivePageLayout } from 'src/features/math-genie/shared/layout';

import ProblemVisualizer from './ProblemVisualizer';

interface Props {
  problems: MathProblem[];
  title: string;
  theme: string;
  showAnswers: boolean;
  displayMode: DisplayMode;
  textColumns?: 2 | 3;
  problemsPerPage?: number;
  pdfContainerRef?: React.RefObject<HTMLDivElement | null>;
}

const WorksheetPreview: React.FC<Props> = React.memo(
  ({ problems, title, theme, showAnswers, displayMode, textColumns = 2, problemsPerPage = 16, pdfContainerRef }) => {
    const layout = derivePageLayout({ columns: textColumns, problemsPerPage });

    const totalPages = useMemo(
      () => Math.max(1, Math.ceil(problems.length / problemsPerPage)),
      [problems.length, problemsPerPage],
    );

    const gridTemplateColumns =
      displayMode === DisplayMode.WORD_PROBLEM
        ? '1fr'
        : displayMode === DisplayMode.TEXT
          ? `repeat(${textColumns}, 1fr)`
          : 'repeat(2, 1fr)';

    const gridAutoRows =
      displayMode === DisplayMode.WORD_PROBLEM ? 'minmax(48mm, auto)' : `minmax(${layout.rowHeight}mm, auto)`;

    const renderPage = (pageIndex: number) => {
      const startIndex = pageIndex * problemsPerPage;
      const pageProblems = problems.slice(startIndex, startIndex + problemsPerPage);

      return (
        <>
          {/* Header */}
          <Box sx={{ mb: 3, borderBottom: '2px solid', borderColor: 'grey.300', pb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 'bold', color: 'grey.800', mb: 0.5, fontSize: { xs: '1.5rem', md: '1.875rem' } }}
              >
                {title || `${theme} Math Worksheet`}
              </Typography>
              {totalPages > 1 && (
                <Typography
                  variant="body2"
                  sx={{ textAlign: 'right', color: 'grey.500', fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                >
                  Page {pageIndex + 1} of {totalPages}
                </Typography>
              )}
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns,
              columnGap: `${layout.columnGap}mm`,
              rowGap: `${layout.rowGap}mm`,
              gridAutoRows,
              justifyItems: 'center',
              alignItems: 'center',
            }}
          >
            {pageProblems.map((problem, index) => (
              <Box
                key={problem.id}
                sx={{ width: '100%', height: '100%', pageBreakInside: 'avoid', breakInside: 'avoid' }}
              >
                <ProblemVisualizer
                  problem={problem}
                  index={startIndex + index}
                  showAnswers={showAnswers}
                  displayMode={displayMode}
                />
              </Box>
            ))}
          </Box>
        </>
      );
    };

    return (
      <WorksheetPaper
        pageCount={problems.length === 0 ? 0 : totalPages}
        pdfContainerRef={pdfContainerRef}
        renderPage={renderPage}
        emptyState={
          <Typography variant="h6" color="inherit">
            Generating preview...
          </Typography>
        }
      />
    );
  },
);

WorksheetPreview.displayName = 'WorksheetPreview';

export default WorksheetPreview;
