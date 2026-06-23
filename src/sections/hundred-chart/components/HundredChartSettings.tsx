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
  ToggleButton,
  FormControlLabel,
  ToggleButtonGroup,
} from '@mui/material';

import { candyColors } from 'src/theme/tokens';
import { BlankMode } from 'src/features/hundred-chart/types';

import { SettingCard } from 'src/sections/_shared/SettingCard';
import { SettingsField } from 'src/sections/_shared/SettingsPanel';

import CrossPuzzleSettings from './CrossPuzzleSettings';

interface Props {
  config: HundredChartConfig;
  onChange: (c: HundredChartConfig) => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
}

const HundredChartSettings: React.FC<Props> = ({ config, onChange }) => {
  const { t } = useTranslation();

  const handleModeChange = (_: React.MouseEvent<HTMLElement>, mode: string | null) => {
    if (mode !== null && mode !== config.mode) {
      onChange({ ...config, mode: mode as 'grid' | 'cross' });
    }
  };

  // --- mode toggle shared by both grid and cross ---
  const modeToggle = (
    <SettingsField>
      <ToggleButtonGroup value={config.mode} exclusive onChange={handleModeChange} size="small" fullWidth>
        <ToggleButton value="grid">{t('hundredChart.cross.tabBasic')}</ToggleButton>
        <ToggleButton value="cross">{t('hundredChart.cross.tabCross')}</ToggleButton>
      </ToggleButtonGroup>
    </SettingsField>
  );

  // --- cross mode ---
  if (config.mode === 'cross') {
    return (
      <>
        <SettingCard toolColor={candyColors.purple} label={t('hundredChart.cross.chartType')}>
          {modeToggle}
        </SettingCard>
        <CrossPuzzleSettings config={config} onChange={onChange} />
      </>
    );
  }

  // --- grid mode ---
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
    <>
      <SettingCard toolColor={candyColors.purple} label={t('hundredChart.cross.chartType')}>
        {modeToggle}
      </SettingCard>

      <SettingCard toolColor={candyColors.purple} label={t('hundredChart.settings.pageSetup')}>
        <SettingsField>
          <TextField label={t('hundredChart.settings.pageTitle')} value={config.pageTitle} onChange={(e) => update({ pageTitle: e.target.value })} size="small" fullWidth />
        </SettingsField>
        <SettingsField>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <TextField type="number" label={t('hundredChart.settings.startNumber')} value={config.startNumber}
              onChange={(e) => update({ startNumber: Math.max(0, Math.min(990, Number(e.target.value) || 0)) })}
              size="small" sx={{ width: 120 }} slotProps={{ htmlInput: { min: 0, max: 990 } }} />
            <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
              – {config.startNumber + 99} (10 × 10)
            </Box>
          </Box>
        </SettingsField>
        <SettingsField label={t('hundredChart.settings.versionCount')}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Slider value={config.versionCount} onChange={(_, v) => update({ versionCount: v as number })} min={1} max={10} step={1} marks valueLabelDisplay="auto" sx={{ flex: 1 }} />
            <TextField value={config.versionCount} onChange={(e) => update({ versionCount: Math.max(1, Math.min(10, Number(e.target.value) || 1)) })} size="small" sx={{ width: 72 }} slotProps={{ htmlInput: { min: 1, max: 10 } }} />
          </Stack>
        </SettingsField>
        <SettingsField>
          <FormControlLabel control={<Switch checked={config.includeAnswerKey} onChange={(e) => update({ includeAnswerKey: e.target.checked })} size="small" />} label={t('hundredChart.settings.includeAnswerKey')} />
        </SettingsField>
      </SettingCard>

      <SettingCard toolColor={candyColors.purple} label={t('hundredChart.settings.blankStrategy')}>
        <SettingsField>
          <ToggleButtonGroup value={config.blankMode} exclusive onChange={handleBlankModeChange} size="small" fullWidth>
            {blankModeOptions.map((opt) => (<ToggleButton key={opt.value} value={opt.value}>{opt.label}</ToggleButton>))}
          </ToggleButtonGroup>
        </SettingsField>

        {config.blankMode === BlankMode.RANDOM && (
          <SettingsField label={t('hundredChart.settings.blankCount', { count: config.blankCount })}>
            <Slider value={config.blankCount} onChange={(_, v) => update({ blankCount: v as number })} min={1} max={99} step={1} size="small" />
          </SettingsField>
        )}

        {config.blankMode === BlankMode.PATTERN && (
          <SettingsField>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <TextField label={t('hundredChart.settings.step')} type="number" value={config.step}
                onChange={(e) => update({ step: Math.max(2, Math.min(10, Number(e.target.value) || 2)) })}
                size="small" sx={{ width: 100 }} slotProps={{ htmlInput: { min: 2, max: 10 } }} />
              <TextField label={t('hundredChart.settings.offset')} type="number" value={config.offset}
                onChange={(e) => update({ offset: Math.max(0, Math.min(config.step - 1, Number(e.target.value) || 0)) })}
                size="small" sx={{ width: 100 }} slotProps={{ htmlInput: { min: 0, max: config.step - 1 } }} />
            </Box>
          </SettingsField>
        )}

        {config.blankMode === BlankMode.MANUAL && (
          <>
            <SettingsField caption={t('hundredChart.settings.manualHint')}>
              <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                {t('hundredChart.settings.manualCount', { count: config.manualBlanks.length })}
              </Box>
            </SettingsField>
            <SettingsField>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small" onClick={() => update({ manualBlanks: [] })}>
                  {t('hundredChart.settings.clearAll')}
                </Button>
                <Button variant="outlined" size="small" onClick={() => {
                  const allIndices = Array.from({ length: 100 }, (_, i) => i);
                  const currentSet = new Set(config.manualBlanks);
                  update({ manualBlanks: allIndices.filter((i) => !currentSet.has(i)) });
                }}>
                  {t('hundredChart.settings.invert')}
                </Button>
              </Box>
            </SettingsField>
          </>
        )}

        {config.blankMode === BlankMode.ANSWER_KEY && (
          <SettingsField caption={t('hundredChart.settings.answerKeyHint')}><Box /></SettingsField>
        )}
      </SettingCard>
    </>
  );
};

export default HundredChartSettings;
