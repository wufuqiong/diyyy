import React from 'react';

import { Box, Typography, Paper } from '@mui/material';

import { DisplayMode, MathProblem, ProblemType } from 'src/types';

interface Props {
  problem: MathProblem;
  index: number;
  showAnswers: boolean;
  displayMode: DisplayMode;
}

const ProblemVisualizer: React.FC<Props> = React.memo(({ problem, index, showAnswers, displayMode }) => {
  const { operation, num1, num2, emoji1, emoji2, answer, problemType, blankPosition, isMultiOperation, numbers, operators, emojis } = problem;

  // Calculate font size based on number of operands in multi-operation
  const calculateFontSize = (operandCount: number) => {
    if (operandCount <= 3) return '1.5rem';      // 3 operands: normal size
    if (operandCount === 4) return '1.3rem';    // 4 operands: slightly smaller
    if (operandCount === 5) return '1.1rem';    // 5 operands: smaller
    return '0.9rem';                           // 6 operands: much smaller
  };

  const getFontSize = () => {
    if (isMultiOperation && numbers) {
      return calculateFontSize(numbers.length);
    }
    return '1.5rem'; // Default size for regular problems
  };

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
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          sx={{
            fontSize: 24,
            opacity: crossedOut ? 0.4 : 1,
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {emoji}
          {crossedOut && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: 2,
                backgroundColor: 'red',
                transform: 'rotate(-15deg)',
              }}
            />
          )}
        </Box>
      ))}
    </Box>
  );

  // EMOJI mode display
  if (displayMode === DisplayMode.EMOJI) {
    return (
      <Paper
        key={problem.id}
        sx={{
          p: 2,
          mb: 1,
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          backgroundColor: '#fafafa',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', flexWrap: 'nowrap' }}>
          {isMultiOperation && numbers && operators && emojis ? (
            // 多重运算显示
            <>
              {numbers.map((num, idx) => (
                <React.Fragment key={idx}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {renderGroup(Math.min(num, 8), emojis[idx])} {/* Limit emoji count for space */}
                  </Box>
                  {idx < operators.length && (
                    <Typography sx={{ 
                      fontSize: getFontSize(), 
                      fontWeight: 'bold', 
                      minWidth: 20, 
                      textAlign: 'center',
                      flexShrink: 0
                    }}>
                      {operators[idx]}
                    </Typography>
                  )}
                </React.Fragment>
              ))}
              <Typography sx={{ 
                fontSize: getFontSize(), 
                fontWeight: 'bold', 
                minWidth: 25, 
                textAlign: 'center',
                flexShrink: 0
              }}>
                =
              </Typography>
              {showAnswers ? (
                <Typography sx={{ 
                  fontSize: getFontSize(), 
                  fontWeight: 'bold', 
                  minWidth: 30, 
                  textAlign: 'center',
                  flexShrink: 0
                }}>
                  {answer}
                </Typography>
              ) : (
                <Box sx={{ minWidth: 30, height: 20, borderBottom: '2px solid #333', flexShrink: 0 }} />
              )}
            </>
          ) : (
            // 普通运算显示
            <>
              {renderGroup(num1, emoji1)}
              <Typography sx={{ fontSize: 24, fontWeight: 'bold', minWidth: 30, textAlign: 'center' }}>
                {operation}
              </Typography>
              {renderGroup(num2, emoji2)}
              <Typography sx={{ fontSize: 24, fontWeight: 'bold', minWidth: 30, textAlign: 'center' }}>
                =
              </Typography>
              {showAnswers ? (
                <Typography sx={{ fontSize: 24, fontWeight: 'bold', minWidth: 35, textAlign: 'center' }}>
                  {answer}
                </Typography>
              ) : (
                <Box sx={{ minWidth: 35, height: 30, borderBottom: '2px solid #333' }} />
              )}
            </>
          )}
        </Box>
      </Paper>
    );
  }

  // TEXT mode display
  return (
    <Paper
      key={problem.id}
      sx={{
        p: 2,
        mb: 1,
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        backgroundColor: '#fafafa',
      }}
    >
      {/* Fill blank problems */}
      {problemType === ProblemType.FILL_BLANK ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          {blankPosition === 'first' ? (
            <>
              {showAnswers ? (
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: 35, textAlign: 'center', fontSize: '1.5rem' }}>
                  {num1}
                </Typography>
              ) : (
                <Box sx={{ minWidth: 35, height: 30, borderBottom: '2px solid #333' }} />
              )}
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: 20, textAlign: 'center', fontSize: '1.5rem' }}>
                {operation}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: 35, textAlign: 'center', fontSize: '1.5rem' }}>
                {num2}
              </Typography>
            </>
          ) : blankPosition === 'second' ? (
            <>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: 35, textAlign: 'center', fontSize: '1.5rem' }}>
                {num1}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: 20, textAlign: 'center', fontSize: '1.5rem' }}>
                {operation}
              </Typography>
              {showAnswers ? (
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: 35, textAlign: 'center', fontSize: '1.5rem' }}>
                  {num2}
                </Typography>
              ) : (
                <Box sx={{ minWidth: 35, height: 30, borderBottom: '2px solid #333' }} />
              )}
            </>
          ) : (
            // Default: answer blank
            <>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: 35, textAlign: 'center', fontSize: '1.5rem' }}>
                {num1}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: 20, textAlign: 'center', fontSize: '1.5rem' }}>
                {operation}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: 35, textAlign: 'center', fontSize: '1.5rem' }}>
                {num2}
              </Typography>
            </>
          )}
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', fontFamily: '"Comic Neue", cursive', fontSize: '1.5rem' }}>
            =
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: 35, textAlign: 'center', fontSize: '1.5rem' }}>
            {answer}
          </Typography>
        </Box>
      ) : (
        // Standard problems or multi-operation problems
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', flexWrap: 'nowrap' }}>
          {isMultiOperation && numbers && operators ? (
            // 多重运算显示
            <>
              {numbers.map((num, idx) => (
                <React.Fragment key={idx}>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 'bold', 
                    color: 'grey.800', 
                    minWidth: 25, 
                    textAlign: 'center', 
                    fontSize: getFontSize(),
                    flexShrink: 0
                  }}>
                    {num}
                  </Typography>
                  {idx < operators.length && (
                    <Typography variant="h3" sx={{ 
                      fontWeight: 'bold', 
                      color: 'grey.800', 
                      minWidth: 15, 
                      textAlign: 'center', 
                      fontSize: getFontSize(),
                      flexShrink: 0
                    }}>
                      {operators[idx]}
                    </Typography>
                  )}
                </React.Fragment>
              ))}
              <Typography variant="h3" sx={{ 
                fontWeight: 'bold', 
                color: 'grey.800', 
                fontFamily: '"Comic Neue", cursive', 
                fontSize: getFontSize(),
                minWidth: 20, 
                textAlign: 'center',
                flexShrink: 0
              }}>
                =
              </Typography>
              {showAnswers ? (
                <Typography variant="h3" sx={{ 
                  fontWeight: 'bold', 
                  color: 'grey.800', 
                  minWidth: 25, 
                  textAlign: 'center', 
                  fontSize: getFontSize(),
                  flexShrink: 0
                }}>
                  {answer}
                </Typography>
              ) : (
                <Box sx={{ minWidth: 25, height: 20, borderBottom: '2px solid #333', flexShrink: 0 }} />
              )}
            </>
          ) : (
            // 普通运算显示
            <>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: 35, textAlign: 'center', fontSize: '1.5rem' }}>
                {num1}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: 20, textAlign: 'center', fontSize: '1.5rem' }}>
                {operation}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: 35, textAlign: 'center', fontSize: '1.5rem' }}>
                {num2}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', fontFamily: '"Comic Neue", cursive', fontSize: '1.5rem' }}>
                =
              </Typography>
              {showAnswers ? (
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: 35, textAlign: 'center', fontSize: '1.5rem' }}>
                  {answer}
                </Typography>
              ) : (
                <Box sx={{ minWidth: 35, height: 30, borderBottom: '2px solid #333' }} />
              )}
            </>
          )}
        </Box>
      )}
    </Paper>
  );
});

ProblemVisualizer.displayName = 'ProblemVisualizer';

export default ProblemVisualizer;
