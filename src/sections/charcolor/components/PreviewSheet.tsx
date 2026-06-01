import type { MiemieDetails } from 'src/types';
import type { PageData } from 'src/features/charcolor/types';

import React from 'react';

import { Box, Typography } from '@mui/material';

import { colors as tokens } from 'src/theme/tokens';
import miemieDetails from 'src/data/miemie-details.json';
import { loadMiemieLessons } from 'src/shared/data/lessons';
import { generatePatterns } from 'src/features/charcolor/utils';
import { usePreviewScale } from 'src/shared/worksheet/usePreviewScale';

const miemie = loadMiemieLessons(miemieDetails as MiemieDetails, 'word');

interface PreviewSheetProps {
  pages: PageData[];
  pdfContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export const PreviewSheet: React.FC<PreviewSheetProps> = ({ pages, pdfContainerRef }) => {
  const { containerRef, scale } = usePreviewScale();

  const containerStyle = {
    bgcolor: 'grey.200',
    height: '100%',
    overflow: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 4,
    p: 4,
    '@media print': { p: 0, gap: 0, display: 'block', bgcolor: 'white', overflow: 'visible', height: 'auto' },
  };

  const a4PageStyle = {
    bgcolor: 'white',
    boxShadow: 24,
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    width: '210mm',
    minHeight: '297mm',
    height: '297mm',
    padding: '15mm',
    boxSizing: 'border-box' as const,
    ...(scale < 1 ? { transform: `scale(${scale})`, transformOrigin: 'top center' as const } : {}),
    '@media print': { boxShadow: 'none', minHeight: 'auto', height: '297mm', transform: 'none' },
  };

  if (!pages || pages.length === 0) {
    return (
      <Box sx={{ ...containerStyle, justifyContent: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          请输入文字并点击&quot;生成练习页&quot;来预览
        </Typography>
      </Box>
    );
  }

  return (
    <Box ref={(node: HTMLDivElement | null) => { (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node; if (pdfContainerRef) pdfContainerRef.current = node; }} sx={containerStyle}>
      {pages.map((page, index) => {
        const { chars: characters, colors } = page;
        const patterns = generatePatterns(characters, miemie);
        const totalCircles = 49;

        return (
          <Box
            key={index}
            sx={{
              ...a4PageStyle,
              '@media print': {
                ...a4PageStyle['@media print'],
                breakAfter: index === pages.length - 1 ? 'auto' : 'page',
              },
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography
                variant="h1"
                align="center"
                gutterBottom
                sx={{ fontWeight: 'bold', my: 4 }}
              >
                找一找 涂色
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 3,
                  my: 5,
                  flexWrap: 'wrap',
                }}
              >
                {characters.map((char, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: '12mm',
                        height: '12mm',
                        backgroundColor: colors[idx],
                        borderRadius: '50%',
                        border: `2px solid ${tokens.inkSecondary}`,
                        aspectRatio: '1',
                      }}
                    />
                    <Typography variant="h4" sx={{ width: '12mm', height: '12mm', textAlign: 'center' }}>
                      {char}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '5mm',
                  margin: '0 auto',
                  maxWidth: '180mm',
                }}
              >
                {Array.from({ length: totalCircles }).map((_, i) => {
                  const row = Math.floor(i / 7);
                  const col = i % 7;
                  const char = patterns[row]?.[col] || '';

                  return (
                    <Box
                      key={i}
                      sx={{
                        width: '20mm',
                        height: '20mm',
                        aspectRatio: '1',
                        border: `0.75pt solid ${tokens.inkSecondary}`,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'white',
                      }}
                    >
                      <Typography variant="h3">{char}</Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <Box
              component="footer"
              sx={{
                mt: 'auto',
                borderTop: 1,
                borderColor: 'grey.100',
                pt: 1,
                textAlign: 'center',
                color: 'grey.400',
                fontSize: '0.75rem',
              }}
            >
              Page {index + 1}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
