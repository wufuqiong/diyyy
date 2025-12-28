// src/sections/math-genie/components/ProblemVisualizer.tsx
import React from 'react';

import { Box, Paper, Typography, Stack } from '@mui/material';

import { MathProblem } from 'src/types';

interface Props {
  problem: MathProblem;
  index: number;
}

const ProblemVisualizer: React.FC<Props> = ({ problem, index }) => {
  const { operation, num1, num2, emoji1, emoji2 } = problem;

  const renderGroup = (count: number, emoji: string, crossedOut: boolean = false) => (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.5,
        maxWidth: '100%',
        maxHeight: 100,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 0.5,
        overflow: 'hidden',
      }}
    >
      {Array.from({ length: Math.min(count, 10) }).map((_, i) => (
        <Box
          key={i}
          component="span"
          sx={{
            fontSize: '1.5rem',
            lineHeight: 1,
            userSelect: 'none',
            position: crossedOut ? 'relative' : 'static',
            '&::after': crossedOut ? {
              content: '"/"',
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'error.main',
              fontWeight: 'bold',
              fontSize: '2rem',
              pointerEvents: 'none',
            } : undefined,
          }}
        >
          {emoji}
        </Box>
      ))}
      {count > 10 && (
        <Typography variant="caption" sx={{ ml: 0.5, color: 'grey.500' }}>
          +{count - 10}
        </Typography>
      )}
    </Box>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 1,
        border: '2px dashed',
        borderColor: 'grey.300',
        borderRadius: 2,
        backgroundColor: 'white',
        height: 200,
        width: '100%',
        breakInside: 'avoid',
        overflow: 'hidden',
      }}
    >
      {/* Index Badge */}
      <Box
        sx={{
          position: 'absolute',
          top: 1,
          left: 1,
          width: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'grey.100',
          borderRadius: '50%',
          color: 'grey.600',
          fontWeight: 'bold',
          fontSize: '0.75rem',
          border: '1px solid',
          borderColor: 'grey.200',
          zIndex: 1,
          '@media print': {
            borderColor: 'grey.300',
          },
        }}
      >
        {index + 1}
      </Box>

      {/* Top Part: Visuals */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          py: 1,
          overflow: 'hidden',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" flexWrap="wrap">
          {operation === '+' ? (
            <>
              {renderGroup(num1, emoji1)}
              <Box width={16} />
              {renderGroup(num2, emoji2 || emoji1)}
            </>
          ) : (
            <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center" flexWrap="wrap">
              {renderGroup(num1 - num2, emoji1, false)}
              {renderGroup(num2, emoji1, true)}
            </Stack>
          )}
        </Stack>
      </Box>
      
      {/* Bottom Part: Fill-in-the-blank Equation */}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 1,
          paddingBottom: 1,
          borderTop: '1px solid',
          borderColor: 'grey.100',
          marginTop: 'auto',
        }}
      >
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              border: '2px solid',
              borderColor: 'grey.400',
              borderRadius: 1,
              backgroundColor: 'white',
              boxShadow: 1,
            }}
          />
          <Box
            sx={{
              width: 36,
              height: 36,
              border: '2px solid',
              borderColor: 'grey.400',
              borderRadius: '50%',
              backgroundColor: 'white',
              boxShadow: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
          <Box
            sx={{
              width: 40,
              height: 40,
              border: '2px solid',
              borderColor: 'grey.400',
              borderRadius: 1,
              backgroundColor: 'white',
              boxShadow: 1,
            }}
          />
          <Typography 
            variant="h4"
            sx={{
              fontWeight: 'bold',
              color: 'grey.800',
              fontFamily: '"Comic Neue", cursive',
            }}
          >
            =
          </Typography>
          <Box
            sx={{
              width: 50,
              height: 40,
              border: '2px solid',
              borderColor: 'grey.800',
              borderRadius: 1,
              backgroundColor: 'white',
              boxShadow: 1,
            }}
          />
        </Stack>
      </Box>
    </Paper>
  );
};

export default ProblemVisualizer;