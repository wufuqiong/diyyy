import React from 'react';

import { styled } from '@mui/material/styles';
import { Box, Paper, Typography, Divider } from '@mui/material';

import { MathProblem } from 'src/types';

import ProblemVisualizer from './ProblemVisualizer';

interface Props {
  problems: MathProblem[];
  title: string;
  theme: string;
}

const WorksheetContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  backgroundColor: theme.palette.grey[50],
  overflowY: 'auto',
  padding: theme.spacing(1),
  '@media print': {
    backgroundColor: 'white',
    padding: 0,
    overflow: 'visible',
  },
}));

const PageContainer = styled(Paper)(({ theme }) => ({
  width: '210mm',
  minHeight: '297mm',
  maxHeight: '297mm',
  overflow: 'hidden',
  margin: '0 auto',
  marginBottom: theme.spacing(4),
  padding: '20mm',
  paddingBottom: '15mm',
  backgroundColor: 'white',
  boxShadow: theme.shadows[5],
  '&:last-child': {
    marginBottom: 0,
  },
  '@media print': {
    boxShadow: 'none',
    marginBottom: 0,
    padding: '15mm',
    minHeight: 0,
  },
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderBottom: '2px solid',
  borderColor: theme.palette.grey[300],
  paddingBottom: theme.spacing(2),
  '@media print': {
    marginBottom: theme.spacing(2),
  },
}));

const ProblemsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(80mm, 1fr))',
  gap: theme.spacing(2),
  gridAutoRows: 'minmax(120px, auto)',
  justifyItems: 'center',
  alignItems: 'center',
}));

const WorksheetPreview: React.FC<Props> = ({ problems, title, theme }) => {
  const PROBLEMS_PER_PAGE = problems.length <= 12 ? 8 : 10;
  const pages = [];
  
  for (let i = 0; i < problems.length; i += PROBLEMS_PER_PAGE) {
    pages.push(problems.slice(i, i + PROBLEMS_PER_PAGE));
  }

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
        Generating preview...
      </Box>
    );
  }

  return (
    <WorksheetContainer className="worksheet-container">
      {pages.map((pageProblems, pageIndex) => (
        <PageContainer
          key={pageIndex}
          elevation={0}
          sx={{
            pageBreakAfter: pageIndex < pages.length - 1 ? 'always' : 'auto',
            pageBreakInside: 'avoid',
          }}
        >
          {/* Header */}
          <HeaderSection>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 'bold',
                    color: 'grey.800',
                    mb: 0.5,
                    fontSize: { xs: '1.5rem', md: '1.875rem' },
                    '@media print': {
                      fontSize: '1.5rem',
                    },
                  }}
                >
                  {title || `${theme} Math Worksheet`}
                </Typography>
              </Box>
              
              {pages.length > 1 && (
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: 'right',
                    color: 'grey.500',
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    '@media print': {
                      fontSize: '0.75rem',
                    },
                  }}
                >
                  Page {pageIndex + 1} of {pages.length}
                </Typography>
              )}
            </Box>
          </HeaderSection>

          <ProblemsGrid>
            {pageProblems.map((problem, index) => (
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
                  index={pageIndex * PROBLEMS_PER_PAGE + index}
                />
              </Box>
            ))}
          </ProblemsGrid>
        </PageContainer>
      ))}
    </WorksheetContainer>
  );
};

export default WorksheetPreview;