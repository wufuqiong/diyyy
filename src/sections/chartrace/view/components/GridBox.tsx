import React from 'react';

import { Box } from '@mui/material';

import { GridType } from 'src/types';

interface GridBoxProps {
  type: GridType;
  color: string;
  opacity: number;
  content?: string;
  contentColor?: string;
  contentOpacity?: number;
  fontFamily?: string;
  showOuterBorder?: boolean;
}

const getFontStack = (fontClass: string) => {
  if (fontClass === 'font-kaiti') {
    return 'KaiTi, STKaiti, "Kaiti SC", "SimKai", serif';
  }
  return undefined;
};

export const GridBox: React.FC<GridBoxProps> = ({
  type,
  color,
  opacity,
  content,
  contentColor = '#000000',
  contentOpacity = 1,
  fontFamily = 'font-kaiti',
  showOuterBorder = true,
}) => (
  <Box sx={{ 
    position: 'relative', 
    width: '100%', 
    height: '100%', 
    aspectRatio: '1/1', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    overflow: 'hidden' 
  }}>
    {/* 
        Use SVG for everything including text to ensure perfect scaling relative to the box.
        viewBox 0 0 100 100 defines the coordinate system.
    */}
    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      
      {/* Grid Lines */}
      {showOuterBorder && (
        <rect x="0" y="0" width="100" height="100" fill="none" stroke={color} strokeWidth="1.5" opacity={opacity} />
      )}
      
      {(type === GridType.TIAN || type === GridType.MI) && (
        <>
          <line x1="50" y1="0" x2="50" y2="100" stroke={color} strokeWidth="1" strokeDasharray="4,4" opacity={opacity * 0.8} />
          <line x1="0" y1="50" x2="100" y2="50" stroke={color} strokeWidth="1" strokeDasharray="4,4" opacity={opacity * 0.8} />
        </>
      )}
      
      {type === GridType.MI && (
        <>
          <line x1="0" y1="0" x2="100" y2="100" stroke={color} strokeWidth="1" strokeDasharray="4,4" opacity={opacity * 0.8} />
          <line x1="100" y1="0" x2="0" y2="100" stroke={color} strokeWidth="1" strokeDasharray="4,4" opacity={opacity * 0.8} />
        </>
      )}

      {/* Text Layer - Scaled to viewBox */}
      {content && (
        <text
          x="50"
          y="50"
          dominantBaseline="central"
          textAnchor="middle"
          fill={contentColor}
          fillOpacity={contentOpacity}
          className={fontFamily}
          style={{ 
              // 85px font size in a 100x100 viewBox means it fills ~85% of the box
              fontSize: '85px', 
              fontFamily: getFontStack(fontFamily),
              // Ensure pointer events don't block interaction if needed
              pointerEvents: 'none'
          }}
        >
          {content}
        </text>
      )}
    </svg>
  </Box>
);
