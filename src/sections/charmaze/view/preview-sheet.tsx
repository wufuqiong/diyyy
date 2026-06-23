import React from 'react';

import { Box, Typography } from '@mui/material';

import { colors } from 'src/theme/tokens';
import { useToolColor, WorksheetPaper } from 'src/shared/worksheet';

import { useRandomIcon } from 'src/components/iconify/random-icon';

interface PreviewPage {
  refChars: string[];
  characters: string[][];
  rows: number;
  cols: number;
  mode: string;
  pageNumber: number;
  totalPages: number;
}

interface PreviewSheetProps {
  pages: PreviewPage[];
  pdfContainerRef?: React.RefObject<HTMLDivElement | null>;
}

type Mode = 'WORD' | 'PHRASE' | 'SENTENCE';

const TITLE_PRESETS: Record<Mode, string> = {
  WORD: '单字迷宫',
  PHRASE: '请找到以下词语',
  SENTENCE: '请找到以下句子',
};

const StartIcon = ({ char }: { char: string }) => {
  const iconStart = useRandomIcon(`maze-page-start-icon-${char}`);
  return <img src={iconStart} alt="start icon" style={{ width: '2em', height: '2em', verticalAlign: 'middle' }} />;
};

const EndIcon = ({ char }: { char: string }) => {
  const iconEnd = useRandomIcon(`maze-page-end-icon-${char}`);
  return <img src={iconEnd} alt="end icon" style={{ width: '2em', height: '2em', verticalAlign: 'middle' }} />;
};

const Chip: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <Box
    component="span"
    sx={{
      display: 'inline-block',
      mx: 1,
      px: 2,
      py: 0.5,
      backgroundColor: color,
      color: 'white',
      borderRadius: 1,
      fontWeight: 'bold',
      fontSize: '1.2em',
    }}
  >
    {children}
  </Box>
);

const Instruction: React.FC<{ mode: string; refChars: string[]; color: string }> = ({ mode, refChars, color }) => {
  let body: React.ReactNode = null;

  if (mode === 'WORD') {
    body = (
      <>
        请从
        <StartIcon char={refChars[0]} />
        出发，沿着
        <Chip color={color}>{refChars[0]}</Chip>
        字走，走到
        <EndIcon char={refChars[0]} />
        处。
      </>
    );
  } else if (mode === 'PHRASE' || mode === 'SENTENCE') {
    body = refChars.map((c, i) => (
      <Chip key={i} color={color}>
        {c}
      </Chip>
    ));
  }

  return (
    <Box sx={{ textAlign: 'center', mb: 3, p: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color }}>
        {body}
      </Typography>
    </Box>
  );
};

const MazePageContent: React.FC<{ page: PreviewPage; color: string }> = ({ page, color }) => {
  const { refChars, characters, rows, cols, mode } = page;
  const totalCircles = rows * cols;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h2" align="center" gutterBottom sx={{ fontWeight: 'bold', my: 4 }}>
        {TITLE_PRESETS[mode as Mode]}
      </Typography>

      <Instruction mode={mode} refChars={refChars} color={color} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 0fr)`,
          margin: '0 auto',
          justifyContent: 'center',
          maxWidth: 'fit-content',
        }}
      >
        {Array.from({ length: totalCircles }).map((_, i) => {
          const row = Math.floor(i / cols);
          const col = i % cols;
          const char = characters[row]?.[col] || '';
          const isStart = row === 0 && col === 0 && mode === 'WORD';
          const isEnd = row === rows - 1 && col === cols - 1 && mode === 'WORD';
          const width = (20 * 8) / rows;
          const height = (20 * 8) / cols;
          return (
            <Box
              key={i}
              sx={{
                width: `${width}mm`,
                height: `${height}mm`,
                aspectRatio: '1',
                border: `1pt solid ${colors.inkSecondary}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
                position: 'relative',
              }}
            >
              {!isStart && !isEnd && <Typography variant="h3">{char}</Typography>}
              {isStart && <StartIcon char={refChars[0]} />}
              {isEnd && <EndIcon char={refChars[0]} />}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

/** Maze preview rendered inside the shared unified preview area. */
export const ScaledPreviewSheet: React.FC<PreviewSheetProps> = ({ pages, pdfContainerRef }) => {
  const toolColor = useToolColor();

  return (
    <WorksheetPaper
      pageCount={pages?.length ?? 0}
      pdfContainerRef={pdfContainerRef}
      renderPage={(idx) => <MazePageContent page={pages[idx]} color={toolColor} />}
      emptyState={
        <Typography variant="h6" color="textSecondary">
          请输入文字来生成迷宫
        </Typography>
      }
    />
  );
};
