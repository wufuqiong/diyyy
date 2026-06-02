import type { Difficulty, HardCellCount, MediumCellCount, MediumHintCount, EasyHintPosition, HundredChartConfig } from 'src/features/hundred-chart/types';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Box,
  Stack,
  Switch,
  Slider,
  Collapse,
  TextField,
  Typography,
  ToggleButton,
  FormControlLabel,
  ToggleButtonGroup,
} from '@mui/material';

import { SettingsField, SettingsSection } from 'src/sections/_shared/SettingsPanel';

interface Props {
  config: HundredChartConfig;
  onChange: (c: HundredChartConfig) => void;
}

const DIFF_OPTS: { value: Difficulty; key: string }[] = [
  { value: 'easy', key: 'easy' },
  { value: 'medium', key: 'medium' },
  { value: 'hard', key: 'hard' },
];

const CrossPuzzleSettings: React.FC<Props> = ({ config, onChange }) => {
  const { t } = useTranslation();
  const update = (patch: Partial<HundredChartConfig>) => onChange({ ...config, ...patch });
  const [showDisplayOpts, setShowDisplayOpts] = useState(false);

  return (
    <>
      <SettingsSection title={t('hundredChart.settings.pageSetup')}>
        <SettingsField label={t('hundredChart.settings.pageTitle')}>
          <TextField value={config.pageTitle} onChange={(e) => update({ pageTitle: e.target.value })} size="small" fullWidth />
        </SettingsField>
      </SettingsSection>

      <SettingsSection title={t('hundredChart.cross.displayOptions')}>
        <Box
          onClick={() => setShowDisplayOpts(!showDisplayOpts)}
          sx={{ cursor: 'pointer', userSelect: 'none', mb: showDisplayOpts ? 1 : 0, '&:hover': { opacity: 0.7 } }}
        >
          <Typography variant="body2" color="text.secondary">{showDisplayOpts ? '▾' : '▸'} {showDisplayOpts ? t('hundredChart.cross.hideOptions') : t('hundredChart.cross.showOptions')}</Typography>
        </Box>
        <Collapse in={showDisplayOpts}>
          <Stack spacing={2}>
            <SettingsField>
              <FormControlLabel control={<Switch checked={config.showFormula} onChange={(e) => update({ showFormula: e.target.checked })} size="small" />} label={t('hundredChart.cross.showFormula')} />
            </SettingsField>
            <SettingsField>
              <FormControlLabel control={<Switch checked={config.showExample} onChange={(e) => update({ showExample: e.target.checked })} size="small" />} label={t('hundredChart.cross.showExample')} />
            </SettingsField>
            <SettingsField>
              <FormControlLabel control={<Switch checked={config.showNumbering} onChange={(e) => update({ showNumbering: e.target.checked })} size="small" />} label={t('hundredChart.cross.showNumbering')} />
            </SettingsField>
          </Stack>
        </Collapse>
      </SettingsSection>

      <SettingsSection title={t('hundredChart.cross.numberRange')}>
        <SettingsField>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField label={t('hundredChart.cross.minCenter')} type="number" value={config.minCenter}
              onChange={(e) => update({ minCenter: Math.max(1, Math.min(90, Number(e.target.value) || 11)) })} size="small" sx={{ width: 100 }} slotProps={{ htmlInput: { min: 1, max: 90 } }} />
            <TextField label={t('hundredChart.cross.maxCenter')} type="number" value={config.maxCenter}
              onChange={(e) => update({ maxCenter: Math.max(config.minCenter, Math.min(90, Number(e.target.value) || 11)) })} size="small" sx={{ width: 100 }} slotProps={{ htmlInput: { min: 1, max: 90 } }} />
          </Box>
        </SettingsField>
      </SettingsSection>

      <SettingsSection title={t('hundredChart.cross.difficulty')}>
        <SettingsField>
          <ToggleButtonGroup value={config.difficulty} exclusive onChange={(_, v) => v !== null && update({ difficulty: v as Difficulty })} size="small" fullWidth>
            {DIFF_OPTS.map((opt) => (<ToggleButton key={opt.value} value={opt.value}>{t(`hundredChart.cross.${opt.key}`)}</ToggleButton>))}
          </ToggleButtonGroup>
        </SettingsField>

        {config.difficulty === 'easy' && (
          <>
            <SettingsField label={t('hundredChart.cross.knownCount')}>
              <ToggleButtonGroup value={config.easyHintCount} exclusive onChange={(_, v) => v !== null && update({ easyHintCount: v })} size="small">
                <ToggleButton value={2}>2 {t('hundredChart.cross.hintsUnit')}</ToggleButton>
                <ToggleButton value={3}>3 {t('hundredChart.cross.hintsUnit')}</ToggleButton>
              </ToggleButtonGroup>
            </SettingsField>
            <SettingsField label={t('hundredChart.cross.knownPosition')}>
              <ToggleButtonGroup value={config.easyHintPosition} exclusive onChange={(_, v) => v !== null && update({ easyHintPosition: v as EasyHintPosition })} size="small" orientation="vertical" fullWidth>
                <ToggleButton value="random" sx={{ justifyContent: 'flex-start' }}>{t('hundredChart.cross.random')}</ToggleButton>
                <ToggleButton value="top_center" sx={{ justifyContent: 'flex-start' }}>{t('hundredChart.cross.topCenter')}</ToggleButton>
                <ToggleButton value="left_center" sx={{ justifyContent: 'flex-start' }}>{t('hundredChart.cross.leftCenter')}</ToggleButton>
                <ToggleButton value="center_right_bottom" sx={{ justifyContent: 'flex-start' }}>{t('hundredChart.cross.centerRightBottom')}</ToggleButton>
              </ToggleButtonGroup>
            </SettingsField>
          </>
        )}

        {config.difficulty === 'medium' && (
          <>
            <SettingsField label={t('hundredChart.cross.cellCount')}>
              <ToggleButtonGroup value={config.mediumCellCount} exclusive onChange={(_, v) => v !== null && update({ mediumCellCount: v as MediumCellCount })} size="small">
                <ToggleButton value="random5-6">{t('hundredChart.cross.cellCount5to6')}</ToggleButton>
                <ToggleButton value="fixed5">{t('hundredChart.cross.cellCount5')}</ToggleButton>
                <ToggleButton value="fixed6">{t('hundredChart.cross.cellCount6')}</ToggleButton>
              </ToggleButtonGroup>
            </SettingsField>
            <SettingsField label={t('hundredChart.cross.knownCount')}>
              <ToggleButtonGroup value={config.mediumHintCount} exclusive onChange={(_, v) => v !== null && update({ mediumHintCount: v as MediumHintCount })} size="small">
                <ToggleButton value="random2-3">{t('hundredChart.cross.hintCount2to3')}</ToggleButton>
                <ToggleButton value="fixed2">{t('hundredChart.cross.hintCount2')}</ToggleButton>
                <ToggleButton value="fixed3">{t('hundredChart.cross.hintCount3')}</ToggleButton>
              </ToggleButtonGroup>
            </SettingsField>
          </>
        )}

        {config.difficulty === 'hard' && (
          <>
            <SettingsField label={t('hundredChart.cross.cellCount')}>
              <ToggleButtonGroup value={config.hardCellCount} exclusive onChange={(_, v) => v !== null && update({ hardCellCount: v as HardCellCount })} size="small">
                <ToggleButton value="random5-9">{t('hundredChart.cross.hardCell5to9')}</ToggleButton>
                <ToggleButton value="fixed5">{t('hundredChart.cross.cellCount5')}</ToggleButton>
                <ToggleButton value="fixed7">{t('hundredChart.cross.hardCell7')}</ToggleButton>
                <ToggleButton value="fixed9">{t('hundredChart.cross.hardCell9')}</ToggleButton>
              </ToggleButtonGroup>
            </SettingsField>
            <SettingsField caption={t('hundredChart.cross.hardFixedHint')}><Box /></SettingsField>
          </>
        )}
      </SettingsSection>

      <SettingsSection title={t('hundredChart.cross.questionCount')}>
        <SettingsField label={t('hundredChart.cross.numberOfQuestions')}>
          <ToggleButtonGroup value={config.questionsPerPage} exclusive onChange={(_, v) => v !== null && update({ questionsPerPage: v })} size="small">
            {[4, 6, 8, 10, 12, 14, 16].map((n) => (<ToggleButton key={n} value={n}>{n}</ToggleButton>))}
          </ToggleButtonGroup>
        </SettingsField>
        <SettingsField label={t('hundredChart.cross.columns')}>
          <ToggleButtonGroup value={config.columnsPerRow} exclusive onChange={(_, v) => v !== null && update({ columnsPerRow: v })} size="small">
            {[2, 3, 4].map((n) => (<ToggleButton key={n} value={n}>{n}</ToggleButton>))}
          </ToggleButtonGroup>
        </SettingsField>
      </SettingsSection>

      <SettingsSection title={t('hundredChart.settings.multiVersion')}>
        <SettingsField label={t('hundredChart.settings.versionCount')}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Slider value={config.versionCount} onChange={(_, v) => update({ versionCount: v as number })} min={1} max={10} step={1} marks valueLabelDisplay="auto" sx={{ flex: 1 }} />
            <TextField value={config.versionCount} onChange={(e) => update({ versionCount: Math.max(1, Math.min(10, Number(e.target.value) || 1)) })} size="small" sx={{ width: 72 }} slotProps={{ htmlInput: { min: 1, max: 10 } }} />
          </Stack>
        </SettingsField>
        <SettingsField>
          <FormControlLabel control={<Switch checked={config.includeAnswerKey} onChange={(e) => update({ includeAnswerKey: e.target.checked })} size="small" />} label={t('hundredChart.settings.includeAnswerKey')} />
        </SettingsField>
      </SettingsSection>
    </>
  );
};

export default CrossPuzzleSettings;
