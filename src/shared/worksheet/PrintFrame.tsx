import React from 'react';

import { Box } from '@mui/material';

import { colors } from 'src/theme/tokens';

import { usePreviewScale } from './usePreviewScale';

interface PrintFrameProps {
  children: React.ReactNode;
  paperSize?: 'A4' | 'letter';
}

export const PrintFrame: React.FC<PrintFrameProps> = ({
  children,
  paperSize = 'A4'
}) => {
  const paperDimensions = {
    A4: { width: '210mm', height: '297mm' },
    letter: { width: '8.5in', height: '11in' },
  };

  const { width, height } = paperDimensions[paperSize];
  const { containerRef, scale } = usePreviewScale();

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        minHeight: '100%',
        backgroundColor: colors.paperDark,
        padding: { xs: 2, sm: 3 },
        overflow: 'hidden',
        '@media print': {
          padding: 0,
          backgroundColor: 'white',
          minHeight: 'auto',
          overflow: 'visible',
        },
      }}
    >
      <Box
        sx={{
          height: `calc(${height} * ${scale})`,
          overflow: 'hidden',
          '@media print': {
            height: 'auto',
            overflow: 'visible',
          },
        }}
      >
        <Box
          sx={{
            width,
            minHeight: height,
            margin: '0 auto',
            backgroundColor: 'white',
            boxShadow: { xs: 'none', sm: '0 2px 8px rgba(0,0,0,0.1)' },
            transform: scale < 1 ? `scale(${scale})` : 'none',
            transformOrigin: 'top center',
            '@media print': {
              width,
              height,
              margin: 0,
              transform: 'none',
              boxShadow: 'none',
              pageBreakAfter: 'always',
              '&:last-child': {
                pageBreakAfter: 'auto',
              },
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};
