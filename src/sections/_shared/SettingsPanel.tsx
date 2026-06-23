// src/sections/_shared/SettingsPanel.tsx
//
// Shared layout primitives for tool config panels (math-genie style).
// Use these to keep header / section / field typography & spacing consistent
// across chartrace / charmaze / charcolor / math-genie.

import React from 'react';

import { Box, Stack, Tooltip, Typography } from '@mui/material';

import { ink, settingCardTypography } from 'src/theme/tokens';
import { HelpTooltip } from 'src/shared/worksheet/HelpTooltip';

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
  width = 340,
  header,
  footer,
  children,
}) => (
  <Box
    className="diyyy-settings-panel"
    sx={{
      width: { xs: '100%', md: 260, lg: width },
      flexShrink: 0,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      '@media print': { display: 'none' },
    }}
  >
    {header && (
      <Box sx={{ px: 2.5, pt: 2 }}>{header}</Box>
    )}
    <Box
      className="diyyy-settings-scroll"
      sx={{
        flex: 1,
        overflowY: 'auto',
        p: '20px',
      }}
    >
      {children}
    </Box>
    {footer && (
      <Box sx={{ px: 2.5, py: 2, borderTop: '2px dashed', borderColor: 'rgba(58,53,80,0.1)' }}>
        {footer}
      </Box>
    )}
  </Box>
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
      sx={{
        fontFamily: '"Baloo 2", "Noto Sans SC", sans-serif',
        fontWeight: 700,
        fontSize: '1.3rem',
        color: 'primary.main',
        mb: 0.5,
      }}
    >
      {title}
    </Typography>
    {subtitle && (
      <Typography sx={{ fontFamily: '"Quicksand", "Noto Sans SC", sans-serif', fontSize: 13, color: ink.soft }}>
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
      sx={{
        display: 'block',
        fontFamily: '"Baloo 2", "Noto Sans SC", sans-serif',
        fontWeight: 700,
        fontSize: '0.85rem',
        color: 'primary.main',
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
  /** toolId for help documentation lookup */
  toolId?: string;
  /** anchor in the help doc for field reference */
  helpAnchor?: string;
}

/**
 * Optional bold label, child control, optional small caption.
 */
export const SettingsField: React.FC<SettingsFieldProps> = ({ label, caption, children, toolId, helpAnchor }) => (
  <Box>
    {label && (
      <Typography
        sx={{
          fontFamily: "'Quicksand', 'Noto Sans SC', sans-serif",
          fontSize: settingCardTypography.fieldLabel.fontSize,
          fontWeight: settingCardTypography.fieldLabel.fontWeight,
          mb: 0.75,
          display: 'flex',
          alignItems: 'center',
          color: ink.primary,
        }}
      >
        {label}
        {toolId && helpAnchor && <HelpTooltip toolId={toolId} anchor={helpAnchor} />}
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
