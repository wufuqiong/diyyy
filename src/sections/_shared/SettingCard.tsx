import React from 'react';

import { Box, Typography } from '@mui/material';

import { settingCardLayout, settingCardTypography } from 'src/theme/tokens';

interface SettingCardProps {
  label?: string;
  toolColor?: string;
  children: React.ReactNode;
}

export const SettingCard: React.FC<SettingCardProps> = ({
  label,
  toolColor,
  children,
}) => (
  <Box className="diyyy-setting-card">
    {label && (
      <Box
        className="section-head"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          mb: settingCardLayout.gapTitleToFields,
        }}
      >
        <Box
          className="section-dot"
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: toolColor || 'primary.main',
            flexShrink: 0,
          }}
        />
        <Typography
          sx={{
            fontFamily: "'Baloo 2', 'Noto Sans SC', sans-serif",
            fontSize: settingCardTypography.sectionTitle.fontSize,
            fontWeight: settingCardTypography.sectionTitle.fontWeight,
            textTransform: settingCardTypography.sectionTitle.textTransform,
            letterSpacing: settingCardTypography.sectionTitle.letterSpacing,
            color: toolColor || 'primary.main',
            lineHeight: 1.3,
          }}
        >
          {label}
        </Typography>
      </Box>
    )}
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: settingCardLayout.gapBetweenFields }}>
      {children}
    </Box>
  </Box>
);
