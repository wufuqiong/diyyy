// src/sections/_shared/SettingsPanel.tsx
//
// Shared layout primitives for tool config panels (math-genie style).
// Use these to keep header / section / field typography & spacing consistent
// across chartrace / charmaze / charcolor / math-genie.

import React from 'react';

import { Box, Paper, Stack, Divider, Tooltip, Typography } from '@mui/material';

import { colors } from 'src/theme/tokens';

// ---------- SettingsPanel ----------

interface SettingsPanelProps {
  width?: number | string;
  header: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Outer Paper sidebar with sticky header / scrollable body / sticky footer.
 * Hidden in print. Pass arbitrary header / footer nodes; use the helpers
 * `SettingsHeader` / `SettingsSection` / `SettingsField` for consistent style.
 */
export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  width = 300,
  header,
  footer,
  children,
}) => (
  <Paper
    elevation={0}
    sx={{
      width: { xs: '100%', lg: width },
      flexShrink: 0,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'white',
      borderRight: '1px solid',
      borderColor: 'grey.200',
      borderRadius: 0,
      zIndex: 20,
      overflow: 'hidden',
      '@media print': { display: 'none' },
    }}
  >
    {header}
    <Divider />
    <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
      <Stack spacing={3.5}>{children}</Stack>
    </Box>
    {footer && (
      <Box
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid',
          borderColor: 'grey.200',
          bgcolor: 'grey.50',
        }}
      >
        {footer}
      </Box>
    )}
  </Paper>
);

// ---------- SettingsHeader ----------

interface SettingsHeaderProps {
  title: string;
  subtitle?: string;
}

/**
 * Gradient title + caption subtitle, matching MathGenie panel header.
 */
export const SettingsHeader: React.FC<SettingsHeaderProps> = ({ title, subtitle }) => (
  <Box sx={{ px: 3, pt: 3, pb: 2 }}>
    <Typography
      variant="h5"
      sx={{
        fontWeight: 'bold',
        background: `linear-gradient(135deg, ${colors.primaryGradientStart}, ${colors.primaryGradientEnd})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        mb: 0.5,
      }}
    >
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="caption" color="text.secondary">
        {subtitle}
      </Typography>
    )}
  </Box>
);

// ---------- SettingsSection ----------

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

/**
 * Section block with overline-style title and 2-unit spacing between fields.
 */
export const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => (
  <Box>
    <Typography
      variant="overline"
      sx={{
        display: 'block',
        color: 'text.secondary',
        fontWeight: 700,
        letterSpacing: 0.6,
        lineHeight: 1.4,
      }}
    >
      {title}
    </Typography>
    <Stack spacing={2} sx={{ mt: 1 }}>
      {children}
    </Stack>
  </Box>
);

// ---------- SettingsField ----------

interface SettingsFieldProps {
  label?: string;
  caption?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Optional bold label, child control, optional small caption.
 */
export const SettingsField: React.FC<SettingsFieldProps> = ({ label, caption, children }) => (
  <Box>
    {label && (
      <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
        {label}
      </Typography>
    )}
    {children}
    {caption && (
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        {caption}
      </Typography>
    )}
  </Box>
);

// ---------- MaybeTooltip ----------

/**
 * Tooltip wrapper that works on disabled children (wraps in span when shown).
 */
export const MaybeTooltip: React.FC<{
  title: string;
  show: boolean;
  children: React.ReactElement;
}> = ({ title, show, children }) =>
  show ? (
    <Tooltip title={title} arrow placement="top">
      <span style={{ display: 'inline-flex', flex: 1 }}>{children}</span>
    </Tooltip>
  ) : (
    children
  );
