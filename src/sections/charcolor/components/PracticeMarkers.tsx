import type { UnderlineMark, EnclosingShape } from 'src/features/charcolor/types';

import React from 'react';

import { Box, Typography } from '@mui/material';

import { colors } from 'src/theme/tokens';

interface MarkerProps {
  char: string;
  size?: number | string;
}

export const ENCLOSING_SHAPES: EnclosingShape[] = ['square', 'triangle', 'circle'];
export const UNDERLINE_MARKS: UnderlineMark[] = ['triangle', 'circle', 'wave', 'line'];

export const EnclosingShapeMarker: React.FC<MarkerProps & { shape: EnclosingShape }> = ({
  char,
  shape,
  size = 58,
}) => (
  <Box
    data-testid={`enclosing-shape-${shape}`}
    sx={{
      position: 'relative',
      width: size,
      height: size,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    {shape === 'triangle' ? (
      <Box component="svg" viewBox="0 0 100 92" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <polygon points="50,4 96,88 4,88" fill="none" stroke={colors.inkSecondary} strokeWidth="3" />
      </Box>
    ) : (
      <Box
        sx={{
          position: 'absolute',
          inset: 2,
          border: `2px solid ${colors.inkSecondary}`,
          borderRadius: shape === 'circle' ? '50%' : 0.5,
        }}
      />
    )}
    <Typography sx={{ position: 'relative', mt: shape === 'triangle' ? 1.2 : 0, fontSize: '1.75rem', fontWeight: 600, lineHeight: 1 }}>
      {char}
    </Typography>
  </Box>
);

export const UnderlineMarkMarker: React.FC<MarkerProps & { mark: UnderlineMark }> = ({
  char,
  mark,
  size = 58,
}) => (
  <Box
    data-testid={`underline-mark-${mark}`}
    sx={{ width: size, minHeight: size, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
  >
    <Typography sx={{ fontSize: '1.75rem', fontWeight: 600, lineHeight: 1 }}>{char}</Typography>
    <Box sx={{ width: '65%', height: 14, mt: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {mark === 'triangle' && (
        <Box component="svg" viewBox="0 0 24 14" sx={{ width: 24, height: 14 }}>
          <polygon points="12,1 23,13 1,13" fill="none" stroke={colors.inkSecondary} strokeWidth="1.8" />
        </Box>
      )}
      {mark === 'circle' && <Box sx={{ width: 13, height: 13, border: `1.8px solid ${colors.inkSecondary}`, borderRadius: '50%' }} />}
      {mark === 'wave' && (
        <Box component="svg" viewBox="0 0 40 10" sx={{ width: '100%', height: 10 }}>
          <path d="M1 6 C6 0, 11 0, 16 6 S26 12, 31 6 S36 0, 39 4" fill="none" stroke={colors.inkSecondary} strokeWidth="1.8" strokeLinecap="round" />
        </Box>
      )}
      {mark === 'line' && <Box sx={{ width: '100%', borderTop: `2px solid ${colors.inkSecondary}` }} />}
    </Box>
  </Box>
);
