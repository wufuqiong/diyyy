import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';

import { HelpOutline as HelpIcon } from '@mui/icons-material';
import { Box, Tooltip, IconButton, Typography } from '@mui/material';

interface FieldDoc {
  [key: string]: { zh: string; en: string };
}

interface DocData {
  fieldRefs: Record<string, FieldDoc>;
}

const docCache: Record<string, DocData> = {};

function useDocData(toolId: string): DocData | null {
  const [data, setData] = useState<DocData | null>(() => docCache[toolId] || null);

  useEffect(() => {
    if (docCache[toolId]) {
      setData(docCache[toolId]);
      return;
    }
    import(`src/data/docs/${toolId}.json`)
      .then((mod) => {
        docCache[toolId] = mod.default as DocData;
        setData(docCache[toolId]);
      })
      .catch(() => setData(null));
  }, [toolId]);

  return data;
}

const LABEL_MAP: Record<string, { zh: string; en: string }> = {
  what: { zh: '是什么', en: 'What' },
  when: { zh: '何时使用', en: 'When' },
  example: { zh: '示例', en: 'Example' },
  note: { zh: '注意事项', en: 'Note' },
  options: { zh: '选项', en: 'Options' },
};

interface HelpTooltipProps {
  toolId: string;
  anchor: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ toolId, anchor }) => {
  const docData = useDocData(toolId);
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('zh') ? 'zh' : 'en';

  if (!docData) return null;

  const fieldDoc = docData.fieldRefs?.[anchor];
  if (!fieldDoc) return null;

  const title = (
    <Box sx={{ maxWidth: 320, py: 0.5 }}>
      {Object.entries(fieldDoc).map(([key, val]) => {
        const label = LABEL_MAP[key];
        if (!label) return null;
        return (
          <Box key={key} sx={{ mb: 1, '&:last-child': { mb: 0 } }}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary">
              {label[lang]}
            </Typography>
            <Typography variant="body2">{val[lang]}</Typography>
          </Box>
        );
      })}
    </Box>
  );

  return (
    <Tooltip title={title} arrow placement="top" enterTouchDelay={0}>
      <IconButton size="small" sx={{ ml: 0.5, p: 0.25 }}>
        <HelpIcon sx={{ fontSize: 16 }} color="disabled" />
      </IconButton>
    </Tooltip>
  );
};
