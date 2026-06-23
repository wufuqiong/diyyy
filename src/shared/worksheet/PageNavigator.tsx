import React from 'react';

import Pagination from '@mui/material/Pagination';
import { Box, Typography, PaginationItem } from '@mui/material';

import { previewLayout } from 'src/theme/tokens';

interface PageNavigatorProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  toolColor: string;
}

export const PageNavigator: React.FC<PageNavigatorProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  toolColor,
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 2,
      py: 1.25,
      borderRadius: previewLayout.navBarRadius,
      backgroundColor: '#fff',
      boxShadow: previewLayout.navBarShadow,
      mb: `${previewLayout.navBarGap}`,
    }}
  >
    {/* Left: page indicator pill */}
    <Typography
      sx={{
        fontFamily: '"Baloo 2", "Noto Sans SC", sans-serif',
        fontWeight: 700,
        fontSize: 13,
        color: toolColor,
        bgcolor: `${toolColor}14`,
        px: 1.5,
        py: 0.5,
        borderRadius: '999px',
        whiteSpace: 'nowrap',
      }}
    >
      {currentPage} / {totalPages}
    </Typography>

    {/* Right: pagination */}
    <Pagination
      count={totalPages}
      page={currentPage}
      onChange={(_, page) => onPageChange(page)}
      size="small"
      siblingCount={1}
      boundaryCount={1}
      renderItem={(item) => (
        <PaginationItem
          {...item}
          sx={{
            fontFamily: '"Quicksand", "Noto Sans SC", sans-serif',
            fontWeight: 600,
            fontSize: 13,
            borderRadius: '10px',
            minWidth: 32,
            height: 32,
            '&.Mui-selected': {
              bgcolor: toolColor,
              color: '#fff',
              '&:hover': { bgcolor: toolColor },
            },
          }}
        />
      )}
    />
  </Box>
);
