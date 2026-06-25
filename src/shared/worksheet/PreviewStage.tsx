import React from 'react';

import { Box } from '@mui/material';

import { surface } from 'src/theme/tokens';

import { calculateStageWidth } from './calculateStageWidth';

interface PreviewStageProps {
  children: React.ReactNode;
  /** Number of content columns — used to compute optimal stage max-width. */
  contentColumns?: number;
}

/**
 * The sky-blue "preview-area" shell. It fills the main content region and
 * hosts a single {@link WorksheetPaper}, which owns the centered stage,
 * page navigator, candy paper sheet and print container.
 */
export const PreviewStage: React.FC<PreviewStageProps> = ({ children, contentColumns }) => {
  const maxWidth = calculateStageWidth({ contentColumns });

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        bgcolor: surface.sky,
        display: 'flex',
        flexDirection: 'column',
        maxWidth,
        mx: 'auto',
        width: '100%',
        '@media print': {
          bgcolor: 'white',
          overflow: 'visible',
          display: 'block',
          maxWidth: 'none',
        },
      }}
    >
      {children}
    </Box>
  );
};
