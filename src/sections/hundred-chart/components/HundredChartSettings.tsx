import type { HundredChartConfig } from 'src/features/hundred-chart/types';

import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  Box,
  Stack,
  Switch,
  Slider,
  Button,
  TextField,
  Typography,
  ToggleButton,
  FormControlLabel,
  ToggleButtonGroup,
} from '@mui/material';

import { BlankMode } from 'src/features/hundred-chart/types';

interface Props {
  config: HundredChartConfig;
  onChange: (c: HundredChartConfig) => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
}

const HundredChartSettings: React.FC<Props> = ({ config, onChange }) => {
  const { t } = useTranslation();
  const update = (patch: Partial<HundredChartConfig>) => onChange({ ...config, ...patch });

  const handleBlankModeChange = (_: React.MouseEvent<HTMLElement>, mode: BlankMode | null) => {
    if (mode === null) return;
    update({ blankMode: mode });
  };

  const blankModeOptions = [
    { value: BlankMode.RANDOM, label: t('hundredChart.settings.modeRandom') },
    { value: BlankMode.PATTERN, label: t('hundredChart.settings.modePattern') },
    { value: BlankMode.MANUAL, label: t('hundredChart.settings.modeManual') },
    { value: BlankMode.ANSWER_KEY, label: t('hundredChart.settings.modeAnswerKey') },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ---- 页面设置 ---- */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold', color: 'text.secondary' }}>
          {t('hundredChart.settings.pageSetup')}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            label={t('hundredChart.settings.pageTitle')}
            value={config.pageTitle}
            onChange={(e) => update({ pageTitle: e.target.value })}
            size="small"
            fullWidth
          />
          <TextField
            label={t('hundredChart.settings.pageInfo')}
            value={config.pageInfo}
            onChange={(e) => update({ pageInfo: e.target.value })}
            size="small"
            fullWidth
          />
        </Box>
      </Box>

      {/* ---- 数字范围 ---- */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold', color: 'text.secondary' }}>
          {t('hundredChart.settings.numberRange')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <TextField
            label={t('hundredChart.settings.startNumber')}
            type="number"
            value={config.startNumber}
            onChange={(e) => {
              const v = Math.max(0, Math.min(990, Number(e.target.value) || 0));
              update({ startNumber: v });
            }}
            size="small"
            sx={{ width: 120 }}
            slotProps={{ htmlInput: { min: 0, max: 990 } }}
          />
          <Typography variant="body2" color="text.secondary">
            – {config.startNumber + 99}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            (10 × 10)
          </Typography>
        </Box>
      </Box>

      {/* ---- 空格策略 ---- */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold', color: 'text.secondary' }}>
          {t('hundredChart.settings.blankStrategy')}
        </Typography>
        <ToggleButtonGroup
          value={config.blankMode}
          exclusive
          onChange={handleBlankModeChange}
          size="small"
          fullWidth
          sx={{ mb: 2 }}
        >
          {blankModeOptions.map((opt) => (
            <ToggleButton key={opt.value} value={opt.value}>
              {opt.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {/* Random mode params */}
        {config.blankMode === BlankMode.RANDOM && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box>
              <Typography variant="body2" gutterBottom>
                {t('hundredChart.settings.blankCount', { count: config.blankCount })}
              </Typography>
              <Slider
                value={config.blankCount}
                onChange={(_, v) => update({ blankCount: v as number })}
                min={1}
                max={99}
                step={1}
                size="small"
              />
            </Box>
          </Box>
        )}

        {/* Pattern mode params */}
        {config.blankMode === BlankMode.PATTERN && (
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField
              label={t('hundredChart.settings.step')}
              type="number"
              value={config.step}
              onChange={(e) => {
                const v = Math.max(2, Math.min(10, Number(e.target.value) || 2));
                update({ step: v });
              }}
              size="small"
              sx={{ width: 100 }}
              slotProps={{ htmlInput: { min: 2, max: 10 } }}
            />
            <TextField
              label={t('hundredChart.settings.offset')}
              type="number"
              value={config.offset}
              onChange={(e) => {
                const v = Math.max(0, Math.min(config.step - 1, Number(e.target.value) || 0));
                update({ offset: v });
              }}
              size="small"
              sx={{ width: 100 }}
              slotProps={{ htmlInput: { min: 0, max: config.step - 1 } }}
            />
          </Box>
        )}

        {/* Manual mode info */}
        {config.blankMode === BlankMode.MANUAL && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t('hundredChart.settings.manualHint')}<br />
              {t('hundredChart.settings.manualCount', { count: config.manualBlanks.length })}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => update({ manualBlanks: [] })}
              >
                {t('hundredChart.settings.clearAll')}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const allIndices = Array.from({ length: 100 }, (_, i) => i);
                  const currentSet = new Set(config.manualBlanks);
                  const inverted = allIndices.filter((i) => !currentSet.has(i));
                  update({ manualBlanks: inverted });
                }}
              >
                {t('hundredChart.settings.invert')}
              </Button>
            </Box>
          </Box>
        )}

        {/* Answer Key mode info */}
        {config.blankMode === BlankMode.ANSWER_KEY && (
          <Typography variant="body2" color="text.secondary">
            {t('hundredChart.settings.answerKeyHint')}
          </Typography>
        )}
      </Box>

      {/* ---- 多张生成 ---- */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold', color: 'text.secondary' }}>
          {t('hundredChart.settings.multiVersion')}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Slider
              value={config.versionCount}
              onChange={(_, v) => update({ versionCount: v as number })}
              min={1}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
              sx={{ flex: 1 }}
            />
            <TextField
              value={config.versionCount}
              onChange={(e) => {
                const v = Math.max(1, Math.min(10, Number(e.target.value) || 1));
                update({ versionCount: v });
              }}
              size="small"
              sx={{ width: 72 }}
              slotProps={{ htmlInput: { min: 1, max: 10 } }}
            />
          </Stack>
          <FormControlLabel
            control={
              <Switch
                checked={config.includeAnswerKey}
                onChange={(e) => update({ includeAnswerKey: e.target.checked })}
                size="small"
              />
            }
            label={t('hundredChart.settings.includeAnswerKey')}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default HundredChartSettings;
