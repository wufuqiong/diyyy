// src/sections/math-genie/components/WorksheetPreview.tsx
import React, { useState, useEffect } from 'react';

import PrintIcon from '@mui/icons-material/Print';
import { Box, Paper, Typography, Pagination, Stack, IconButton } from '@mui/material';

import { MathProblem } from 'src/types';

import ProblemVisualizer from './ProblemVisualizer';

interface Props {
  problems: MathProblem[];
  title: string;
  theme: string;
  showAnswers: boolean;
}

const WorksheetPreview: React.FC<Props> = ({ problems, title, theme, showAnswers }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const PROBLEMS_PER_PAGE = 8;
  
  // Calculate pages
  const totalPages = Math.ceil(problems.length / PROBLEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * PROBLEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + PROBLEMS_PER_PAGE, problems.length);
  const currentProblems = problems.slice(startIndex, endIndex);

  // Reset to page 1 when problems change
  useEffect(() => {
    setCurrentPage(1);
  }, [problems]);

  if (problems.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          bgcolor: 'grey.100',
          p: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'grey.400',
        }}
      >
        <Typography variant="h6" color="inherit">
          Generating preview...
        </Typography>
      </Box>
    );
  }

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: 'grey.50',
        overflowY: 'auto',
        padding: 2,
        '@media print': {
          backgroundColor: 'white',
          padding: 0,
          overflow: 'visible',
        },
      }}
      className="worksheet-preview"
    >
      {/* Screen view with pagination - hidden when printing */}
      <Box 
        sx={{ 
          '@media print': { 
            display: 'none !important' 
          } 
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '210mm',
            minHeight: '297mm',
            overflow: 'hidden',
            margin: '0 auto',
            marginBottom: 4,
            padding: '20mm',
            paddingBottom: '15mm',
            backgroundColor: 'white',
            boxShadow: 5,
            '&:last-child': {
              marginBottom: 0,
            },
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 3, borderBottom: '2px solid', borderColor: 'grey.300', pb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 'bold',
                    color: 'grey.800',
                    mb: 0.5,
                    fontSize: { xs: '1.5rem', md: '1.875rem' },
                  }}
                >
                  {title || `${theme} Math Worksheet`}
                </Typography>
                <IconButton onClick={() => window.print()} color="primary">
                  <PrintIcon />
                </IconButton>
              </Box>
              
              {totalPages > 1 && (
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: 'right',
                    color: 'grey.500',
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                  }}
                >
                  Page {currentPage} of {totalPages}
                </Typography>
              )}
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 2,
              gridAutoRows: 'minmax(200px, auto)',
              justifyItems: 'center',
              alignItems: 'center',
              '@media (min-width: 1200px)': {
                gridTemplateColumns: 'repeat(2, 1fr)',
              },
            }}
          >
            {currentProblems.map((problem, index) => (
              <Box
                key={problem.id}
                sx={{
                  width: '100%',
                  height: '100%',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid',
                }}
              >
                <ProblemVisualizer 
                  problem={problem} 
                  index={startIndex + index}
                  showAnswers={showAnswers}
                />
              </Box>
            ))}
          </Box>
        </Paper>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Box>

      {/* Print view - all pages - visible only when printing */}
      <Box 
        sx={{ 
          display: 'none',
          '@media print': { 
            display: 'block !important',
            '& .page-container': {
              pageBreakAfter: 'always',
              '&:last-child': {
                pageBreakAfter: 'auto',
              }
            }
          } 
        }}
      >
        {Array.from({ length: totalPages }).map((_, pageIndex) => {
          const printStartIndex = pageIndex * PROBLEMS_PER_PAGE;
          const printEndIndex = Math.min(printStartIndex + PROBLEMS_PER_PAGE, problems.length);
          const printProblems = problems.slice(printStartIndex, printEndIndex);

          return (
            <Paper
              key={`print-page-${pageIndex}`}
              className="page-container"
              elevation={0}
              sx={{
                width: '210mm',
                minHeight: '297mm',
                overflow: 'hidden',
                margin: '0 auto',
                padding: '20mm',
                paddingBottom: '15mm',
                backgroundColor: 'white',
                boxShadow: 5,
                pageBreakAfter: pageIndex < totalPages - 1 ? 'always' : 'auto',
                pageBreakInside: 'avoid',
              }}
            >
              <Box sx={{ mb: 3, borderBottom: '2px solid', borderColor: 'grey.300', pb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 'bold',
                        color: 'grey.800',
                        mb: 0.5,
                        fontSize: '1.5rem',
                      }}
                    >
                      {title || `${theme} Math Worksheet`}
                    </Typography>
                  </Box>
                  
                  {totalPages > 1 && (
                    <Typography
                      variant="body2"
                      sx={{
                        textAlign: 'right',
                        color: 'grey.500',
                        fontSize: '0.75rem',
                      }}
                    >
                      Page {pageIndex + 1} of {totalPages}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 2,
                  gridAutoRows: 'minmax(200px, auto)',
                  justifyItems: 'center',
                  alignItems: 'center',
                }}
              >
                {printProblems.map((problem, index) => (
                  <Box
                    key={problem.id}
                    sx={{
                      width: '100%',
                      height: '100%',
                      pageBreakInside: 'avoid',
                      breakInside: 'avoid',
                    }}
                  >
                    <ProblemVisualizer 
                      problem={problem} 
                      index={printStartIndex + index}
                      showAnswers={showAnswers}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};

export default WorksheetPreview;