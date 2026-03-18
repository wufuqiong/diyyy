// src/sections/math-genie/components/ProblemVisualizer.tsx
import React from 'react';

import { Box, Paper, Typography, Stack } from '@mui/material';

import { MathProblem, DisplayMode } from 'src/types';

interface Props {
  problem: MathProblem;
  index: number;
  showAnswers: boolean;
  displayMode: DisplayMode;
}

const ProblemVisualizer: React.FC<Props> = React.memo(({ problem, index, showAnswers, displayMode }) => {
  const { operation, num1, num2, emoji1, emoji2, answer } = problem;

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

  // Text mode component
  if (displayMode === DisplayMode.TEXT) {
    return (
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 1,
          border: '1px solid',
          borderColor: 'grey.300',
          borderRadius: 2,
          backgroundColor: 'white',
          height: 70,
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
          }}
        >
          {index + 1}
        </Box>

        {/* Math equation */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              color: 'grey.800',
              minWidth: 35,
              textAlign: 'center',
              fontSize: '1.5rem',
            }}
          >
            {num1}
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              color: 'grey.800',
              minWidth: 20,
              textAlign: 'center',
              fontSize: '1.5rem',
            }}
          >
            {operation}
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              color: 'grey.800',
              minWidth: 35,
              textAlign: 'center',
              fontSize: '1.5rem',
            }}
          >
            {num2}
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              color: 'grey.800',
              fontFamily: '"Comic Neue", cursive',
              fontSize: '1.5rem',
            }}
          >
            =
          </Typography>
          {showAnswers ? (
            <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                color: 'primary.main',
                minWidth: 35,
                textAlign: 'center',
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                fontSize: '1.5rem',
              }}
            >
              {answer}
            </Typography>
          ) : (
            <Box
              sx={{
                width: 50,
                height: 40,
                borderBottom: '2px solid',
                borderColor: 'grey.600',
              }}
            />
          )}
        </Stack>
      </Paper>
    );
  }

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
              {renderGroup(num2, emoji1, !showAnswers)}
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
        {showAnswers ? (
          // Show the complete equation with answer
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                color: 'grey.800',
                minWidth: 40,
                textAlign: 'center',
              }}
            >
              {num1}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                color: 'grey.800',
                minWidth: 20,
                textAlign: 'center',
              }}
            >
              {operation}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                color: 'grey.800',
                minWidth: 40,
                textAlign: 'center',
              }}
            >
              {num2}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                color: 'grey.800',
                fontFamily: '"Comic Neue", cursive',
                mx: 1,
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
        ) : (
          // Show blank boxes (original behavior)
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
        )}
      </Box>
    </Paper>
  );
});

ProblemVisualizer.displayName = 'ProblemVisualizer';

export default ProblemVisualizer;