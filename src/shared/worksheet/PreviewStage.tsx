import React from 'react';

import { Box } from '@mui/material';

import { surface } from 'src/theme/tokens';

interface PreviewStageProps {
  children: React.ReactNode;
}

/**
 * The sky-blue "preview-area" shell. It fills the main content region and
 * hosts a single {@link WorksheetPaper}, which owns the centered stage,
 * page navigator, candy paper sheet and print container.
 */
export const PreviewStage: React.FC<PreviewStageProps> = ({ children }) => (
  <Box
    sx={{
      flex: 1,
      minHeight: 0,
      bgcolor: surface.sky,
      display: 'flex',
      flexDirection: 'column',
      '@media print': {
        bgcolor: 'white',
        overflow: 'visible',
        display: 'block',
      },
    }}
  >
    {children}
  </Box>
);
