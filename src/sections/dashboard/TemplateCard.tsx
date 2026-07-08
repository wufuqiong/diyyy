import type { WorksheetTool } from 'src/shared/worksheet';
import type { Template } from 'src/features/templates/types';

import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import React, { memo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { ink } from 'src/theme/tokens';

/** Fixed card dimensions (desktop, A4 ratio). */
const CARD_W = 180;
const CARD_H = Math.round(CARD_W * 1.414);

// --------------------------------------------------------------------------
// In-memory cache for generate() results.
// Survives component unmount/remount (e.g. navigating away and back to the
// dashboard) so revisits are instant. Reset on page refresh — acceptable
// since generating 28 templates still takes < 1 s.
// --------------------------------------------------------------------------
const cache = new Map<string, { problems: any[]; isAsync: boolean }>();

function cacheKey(toolId: string, templateId: string) {
  return `${toolId}/${templateId}`;
}

function TemplateThumbnail<Config, Problem>({
  template,
  tool,
}: {
  template: Template<Config>;
  tool: WorksheetTool<Config, Problem>;
}) {
  const key = cacheKey(tool.id, template.id);
  const cached = cache.get(key);
  const [problems, setProblems] = useState<Problem[] | null>(cached?.problems ?? null);
  const [ready, setReady] = useState(!!cached);

  useEffect(() => {
    if (cached) return undefined; // already loaded from cache
    let cancelled = false;
    Promise.resolve(tool.generate(template.config))
      .then((result) => {
        if (cancelled) return;
        cache.set(key, { problems: result, isAsync: true });
        setProblems(result);
        // Let useFitScale measure and settle before showing
        setTimeout(() => {
          if (!cancelled) setReady(true);
        }, 300);
      })
      .catch(() => {
        if (!cancelled) setProblems(null);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!problems) {
    return <Skeleton variant="rectangular" width="100%" height="100%" />;
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.15s',
        // Strip worksheet chrome
        '& > *': { bgcolor: 'transparent !important' },
        '& .MuiPagination-root': { display: 'none !important' },
        '& .MuiPaper-root': {
          padding: '0 !important',
          boxShadow: 'none !important',
          borderRadius: '0 !important',
        },
        '& *': { pointerEvents: 'none !important' as any },
      }}
    >
      <tool.Preview config={template.config} problems={problems} />
    </Box>
  );
}

export const TemplateCard = memo(function TemplateCard<Config = any, Problem = any>({
  template,
  tool,
  toolColor,
}: {
  template: Template<Config>;
  tool: WorksheetTool<Config, Problem>;
  toolColor: string;
}) {
  const { t } = useTranslation();

  return (
    <Box sx={{ flexShrink: 0, width: { xs: 140, sm: CARD_W }, scrollSnapAlign: 'start' }}>
      {/* A4 paper card with theme-color border */}
      <Box
        component={RouterLink}
        to={`${tool.meta.route}?template=${template.id}`}
        sx={{
          display: 'block',
          width: CARD_W,
          height: CARD_H,
          overflow: 'hidden',
          textDecoration: 'none',
          bgcolor: '#fff',
          border: `2px solid ${toolColor}`,
        }}
      >
        <TemplateThumbnail template={template} tool={tool} />
      </Box>

      <Typography
        sx={{
          mt: 0.75,
          textAlign: 'center',
          fontFamily: '"Quicksand", "Noto Sans SC", sans-serif',
          fontWeight: 600,
          fontSize: '0.75rem',
          color: ink.soft,
          lineHeight: 1.3,
          px: 0.5,
        }}
      >
        {t(template.titleKey)}
      </Typography>
    </Box>
  );
});
