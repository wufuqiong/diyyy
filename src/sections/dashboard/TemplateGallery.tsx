import type { WorksheetTool } from 'src/shared/worksheet';

import React from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { mathGenieTool } from 'src/features/math-genie';
import { wordSearchTool } from 'src/features/word-search';
import { toolColors, candyColors } from 'src/theme/tokens';
import { charmazeTool } from 'src/features/charmaze/config';
import { charcolorTool } from 'src/features/charcolor/config';
import { chartraceTool } from 'src/features/chartrace/config';
import { hundredChartTool } from 'src/features/hundred-chart';
import { templateRegistry } from 'src/features/templates/registry';

import { TemplateCard } from './TemplateCard';

const toolMap: Record<string, WorksheetTool> = {
  charcolor: charcolorTool,
  charmaze: charmazeTool,
  chartrace: chartraceTool,
  'math-genie': mathGenieTool,
  'hundred-chart': hundredChartTool,
  'word-search': wordSearchTool,
};

/** Groups of tool IDs that share a single scrollable card row. */
const rowGroups: string[][] = [
  ['charcolor', 'charmaze'],
  ['chartrace'],
  ['math-genie'],
  ['hundred-chart', 'word-search'],
];

function navKey(toolId: string) {
  return toolId === 'math-genie' ? 'mathGenie' : toolId === 'hundred-chart' ? 'hundredChart' : toolId === 'word-search' ? 'wordSearch' : toolId;
}

function ToolHeader({ toolId, tool, color }: { toolId: string; tool: WorksheetTool; color: string }) {
  const { t } = useTranslation();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5, flexShrink: 0 }}>
      <Box
        sx={{
          width: 22, height: 22,
          borderRadius: '6px',
          bgcolor: `${color}18`,
          color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          '& .MuiSvgIcon-root': { fontSize: 14 },
        }}
      >
        {tool.meta.icon}
      </Box>
      <Typography
        sx={{
          fontFamily: '"Baloo 2", "Noto Sans SC", sans-serif',
          fontWeight: 700,
          fontSize: '0.95rem',
          color,
          whiteSpace: 'nowrap',
        }}
      >
        {t(`nav.${navKey(toolId)}`)}
      </Typography>
    </Box>
  );
}

function ToolRow({ toolIds }: { toolIds: string[] }) {
  const tools = toolIds.map((id) => ({ id, tool: toolMap[id], color: toolColors[id] || candyColors.blue })).filter((x) => x.tool);
  if (tools.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      {/* Each tool is a column: header → cards. Columns scroll together. */}
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          pb: 1,
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
          pr: 4,
        }}
      >
        {tools.map(({ id, tool, color }) => {
          const cards = (templateRegistry[id] || []).map((tmpl) => ({ tmpl, tool, color }));
          if (cards.length === 0) return null;
          return (
            <Box key={id} sx={{ flexShrink: 0 }}>
              <ToolHeader toolId={id} tool={tool} color={color} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                {cards.map(({ tmpl, tool: t, color: c }) => (
                  <TemplateCard key={tmpl.id} template={tmpl} tool={t} toolColor={c} />
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export function TemplateGallery() {
  return (
    <Container maxWidth="md" sx={{ py: 0 }}>
      {rowGroups.map((group, i) => (
        <ToolRow key={i} toolIds={group} />
      ))}
    </Container>
  );
}
