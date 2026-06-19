import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, useCallback } from 'react';

import { Close as CloseIcon } from '@mui/icons-material';
import {
  Box,
  Chip,
  Stack,
  Table,
  Drawer,
  Divider,
  TableRow,
  TableBody,
  TableCell,
  Typography,
  IconButton,
} from '@mui/material';

const LABEL_MAP: Record<string, { zh: string; en: string }> = {
  what: { zh: '是什么', en: 'What' },
  example: { zh: '示例', en: 'Example' },
  note: { zh: '注意事项', en: 'Note' },
  options: { zh: '选项', en: 'Options' },
};

interface FieldDoc {
  [key: string]: { zh: string; en: string } | string;
  _title_zh: string;
  _title_en: string;
}

interface FeatureItem {
  feature_zh: string;
  feature_en: string;
  location: string;
  description_zh: string;
  description_en: string;
}

interface FaqItem {
  question_zh: string;
  question_en: string;
  answer_zh: string;
  answer_en: string;
}

interface DocData {
  title: { zh: string; en: string };
  fieldRefs: Record<string, FieldDoc>;
  featureItems: FeatureItem[];
  faq: FaqItem[];
}

interface HelpDrawerProps {
  toolId: string;
  open: boolean;
  onClose: () => void;
}

export const HelpDrawer: React.FC<HelpDrawerProps> = ({ toolId, open, onClose }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('zh') ? 'zh' : 'en';
  const [doc, setDoc] = useState<DocData | null>(null);

  useEffect(() => {
    if (!open) return;
    import(`src/data/docs/${toolId}.json`)
      .then((m) => setDoc(m.default as DocData))
      .catch(() => setDoc(null));
  }, [toolId, open]);

  const fieldLabel = useCallback(
    (key: string) => LABEL_MAP[key]?.[lang] || key,
    [lang],
  );

  if (!doc) return null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 480 } } }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight="bold" noWrap>
            {doc.title[lang]}
          </Typography>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2 }}>
          <Stack spacing={3}>
            {/* Field Reference */}
            {Object.keys(doc.fieldRefs).length > 0 && (
              <Box>
                <Typography variant="overline" fontWeight="bold" color="primary.main">
                  {lang === 'zh' ? '配置项说明' : 'Field Reference'}
                </Typography>
                <Stack spacing={0} sx={{ mt: 1 }}>
                  {Object.entries(doc.fieldRefs).map(([anchor, ref], idx) => {
                    const title = lang === 'zh' ? ref._title_zh : ref._title_en;
                    const entries = Object.entries(ref).filter(([k]) => !k.startsWith('_'));
                    return (
                      <Box key={anchor} id={anchor}>
                        {idx > 0 && <Divider sx={{ my: 2 }} />}
                        {title && (
                          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
                            {title}
                          </Typography>
                        )}
                        <Table size="small">
                          <TableBody>
                            {entries.map(([key, val]) => (
                              <TableRow key={key}>
                                <TableCell
                                  sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', width: '25%', color: 'text.secondary', borderBottom: 'none', py: 0.5 }}
                                >
                                  {fieldLabel(key)}
                                </TableCell>
                                <TableCell sx={{ borderBottom: 'none', py: 0.5 }}>{(val as { zh: string; en: string })[lang]}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            )}

            {/* Feature Map */}
            {doc.featureItems.length > 0 && (
              <Box>
                <Divider />
                <Typography variant="overline" fontWeight="bold" color="primary.main" sx={{ mt: 2, display: 'block' }}>
                  {lang === 'zh' ? '功能地图' : 'Feature Map'}
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  {doc.featureItems.map((item, i) => {
                    const label = lang === 'zh' ? item.feature_zh : item.feature_en;
                    const desc = lang === 'zh' ? item.description_zh : item.description_en;
                    const cleanLabel = label.split('<br')[0];
                    return (
                      <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        <Chip
                          label={cleanLabel}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ minWidth: 70, height: 'auto', '& .MuiChip-label': { whiteSpace: 'normal' } }}
                        />
                        <Typography variant="body2">{desc}</Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            )}

            {/* FAQ */}
            {doc.faq.length > 0 && (
              <Box>
                <Divider />
                <Typography variant="overline" fontWeight="bold" color="primary.main" sx={{ mt: 2, display: 'block' }}>
                  FAQ
                </Typography>
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                  {doc.faq.map((item, i) => (
                    <Box key={i}>
                      <Typography variant="body2" fontWeight="bold">
                        {lang === 'zh' ? item.question_zh : item.question_en}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>
                        {lang === 'zh' ? item.answer_zh : item.answer_en}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};
