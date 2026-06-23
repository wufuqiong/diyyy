import React, { useState } from 'react';

import { Menu as MenuIcon } from '@mui/icons-material';
import { Box, Fab, Drawer, useTheme, useMediaQuery } from '@mui/material';

interface ResponsiveWorkbenchProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export const ResponsiveWorkbench: React.FC<ResponsiveWorkbenchProps> = ({
  sidebar,
  children,
}) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isNarrow = isDesktop || isTablet;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: { xs: 'auto', md: '100vh' },
        minHeight: { xs: '100vh', md: 'auto' },
        width: '100%',
        overflow: 'hidden',
        '@media print': {
          height: 'auto',
          overflow: 'visible',
          display: 'block',
        },
      }}
    >
      {/* Desktop / Tablet: Fixed Sidebar */}
      {isNarrow ? (
        sidebar
      ) : (
        <>
          {/* Mobile: Drawer */}
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={handleDrawerToggle}
            sx={{
              '& .MuiDrawer-paper': {
                width: '85vw',
                maxWidth: 360,
              },
            }}
          >
            {sidebar}
          </Drawer>

          {/* Mobile: FAB to open drawer */}
          <Fab
            color="primary"
            aria-label="settings"
            onClick={handleDrawerToggle}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000,
              '@media print': {
                display: 'none',
              },
            }}
          >
            <MenuIcon />
          </Fab>
        </>
      )}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          '@media print': {
            height: 'auto',
            overflow: 'visible',
            display: 'block',
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
