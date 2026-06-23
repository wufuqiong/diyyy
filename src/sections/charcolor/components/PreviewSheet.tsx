import type { MiemieDetails } from 'src/types';
import type { PageData } from 'src/features/charcolor/types';

import React from 'react';

import { Box, Typography } from '@mui/material';

import { colors as tokens } from 'src/theme/tokens';
import { WorksheetPaper } from 'src/shared/worksheet';
import miemieDetails from 'src/data/miemie-details.json';
import { loadMiemieLessons } from 'src/shared/data/lessons';
import { generatePatterns } from 'src/features/charcolor/utils';

const miemie = loadMiemieLessons(miemieDetails as MiemieDetails, 'word');

interface PreviewSheetProps {
  pages: PageData[];
  pdfContainerRef?: React.RefObject<HTMLDivElement | null>;
}

const PageContent: React.FC<{ page: PageData; index: number }> = ({ page, index }) => {
  const { chars: characters, colors } = page;
  const patterns = generatePatterns(characters, miemie);
  const totalCircles = 49;

  return (
    <>
      <Typography variant="h1" align="center" gutterBottom sx={{ fontWeight: 'bold', my: 4 }}>
        找一找 涂色
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, my: 5, flexWrap: 'wrap' }}>
        {characters.map((char, idx) => (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: '12mm', height: '12mm',
                backgroundColor: colors[idx],
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.6)',
                outline: `1px solid ${tokens.inkSecondary}`,
                outlineOffset: '1px',
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
                width: '20mm', height: '20mm', aspectRatio: '1',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'white',
                border: `0.75pt solid ${tokens.inkSecondary}`,
                outline: '0.4pt solid rgba(58,53,80,0.15)',
                outlineOffset: '1.5pt',
                boxShadow: '0 2px 0 0 rgba(0,0,0,0.06)',
              }}
            >
              <Typography variant="h3">{char}</Typography>
            </Box>
          );
        })}
      </Box>

      <Box
        component="footer"
        sx={{
          mt: 'auto', borderTop: 1, borderColor: 'grey.100', pt: 1,
          textAlign: 'center', color: 'grey.400', fontSize: '0.75rem',
        }}
      >
        Page {index + 1}
      </Box>
    </>
  );
};

export const PreviewSheet: React.FC<PreviewSheetProps> = ({ pages, pdfContainerRef }) => (
  <WorksheetPaper
    pageCount={pages?.length ?? 0}
    pdfContainerRef={pdfContainerRef}
    paperPadding="15mm"
    renderPage={(idx) => <PageContent page={pages[idx]} index={idx} />}
    emptyState={
      <Typography variant="h6" color="textSecondary">
        请输入文字并点击&ldquo;生成练习页&rdquo;来预览
      </Typography>
    }
  />
);
