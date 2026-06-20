import type { SelectChangeEvent } from '@mui/material';
import type { WordSearchConfig } from 'src/features/word-search/types';

import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Chip,
  Switch,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
  ToggleButton,
  FormControlLabel,
  ToggleButtonGroup,
} from '@mui/material';

import { WORD_THEMES } from 'src/features/word-search/data/word-themes';
import { GridSizePreset, GRID_DIMENSIONS, WordSearchDifficulty } from 'src/features/word-search/types';

import {
  SettingsField,
  SettingsSection,
} from 'src/sections/_shared/SettingsPanel';

const CAPACITY_HINTS: Record<GridSizePreset, number> = {
  [GridSizePreset.SMALL]: 6,
  [GridSizePreset.MEDIUM]: 10,
  [GridSizePreset.LARGE]: 14,
};

/** Hard upper bound on the number of words, to keep the sheet legible on one page */
const MAX_WORDS = 30;
/** Hard upper bound on a single word's length (longest grid dimension) */
const MAX_WORD_LEN = 18;

interface ControlPanelProps {
  config: WordSearchConfig;
  onChange: (c: WordSearchConfig) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ config, onChange }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('zh') ? 'zh' : 'en';

  // Split by whitespace (space / newline / tab) or comma
  const parseWords = (input: string): string[] =>
    input
      .split(/[\s,]+/)
      .map((w) => w.trim().slice(0, MAX_WORD_LEN))
      .filter((w) => w.length > 0)
      .slice(0, MAX_WORDS);

  // Keep the raw text the user types so separators are not stripped on re-render
  const [text, setText] = useState<string>(() => config.words.join(', '));

  // Re-sync the textarea when words change externally (theme load / reset),
  // but leave it untouched while the user is typing (same parsed result).
  useEffect(() => {
    const parsed = parseWords(text);
    const sameAsConfig =
      parsed.length === config.words.length &&
      parsed.every((w, i) => w === config.words[i]);
    if (!sameAsConfig) {
      setText(config.words.join(', '));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.words]);

  const handleInputChange = (value: string) => {
    setText(value);
    const words = parseWords(value);
    onChange({ ...config, words, selectedTheme: undefined });
  };

  const handleThemeChange = (e: SelectChangeEvent<string>) => {
    const themeId = e.target.value;
    if (!themeId) {
      onChange({ ...config, selectedTheme: undefined });
      return;
    }
    const theme = WORD_THEMES.find((th) => th.id === themeId);
    if (theme) {
      const title = lang === 'zh' ? theme.label_zh : theme.label_en;
      onChange({ ...config, words: theme.words, selectedTheme: themeId, title });
    }
  };

  const handleGridSizeChange = (_: React.MouseEvent<HTMLElement>, value: GridSizePreset | null) => {
    if (value) onChange({ ...config, gridSize: value });
  };

  const handleDifficultyChange = (_: React.MouseEvent<HTMLElement>, value: WordSearchDifficulty | null) => {
    if (value) onChange({ ...config, difficulty: value });
  };

  const handleListColumnsChange = (e: SelectChangeEvent<number>) => {
    onChange({ ...config, listColumns: e.target.value as 1 | 2 | 3 });
  };

  const capacity = CAPACITY_HINTS[config.gridSize];

  return (
    <>
      <SettingsSection title={t('wordSearch.settings.words')}>
        <SettingsField label={t('wordSearch.settings.themeLibrary')}>
          <FormControl fullWidth size="small">
            <InputLabel>{t('wordSearch.settings.themeLibrary')}</InputLabel>
            <Select
              value={config.selectedTheme || ''}
              onChange={handleThemeChange}
              label={t('wordSearch.settings.themeLibrary')}
            >
              <MenuItem value="">{t('wordSearch.settings.manualInput')}</MenuItem>
              {WORD_THEMES.map((theme) => (
                <MenuItem key={theme.id} value={theme.id}>
                  {lang === 'zh' ? theme.label_zh : theme.label_en}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </SettingsField>
        <SettingsField
          label={t('wordSearch.settings.wordsInput')}
          caption={`${config.words.length} ${t('wordSearch.settings.wordsParsed')} · ${t('wordSearch.settings.capacityHint', { capacity })}`}
        >
          <TextField
            multiline
            rows={4}
            size="small"
            value={text}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={t('wordSearch.settings.wordsPlaceholder')}
            fullWidth
          />
        </SettingsField>
        {config.words.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {config.words.map((w, i) => (
              <Chip key={`${w}-${i}`} label={w} size="small" variant="outlined" />
            ))}
          </Box>
        )}
      </SettingsSection>

      <SettingsSection title={t('wordSearch.settings.gridSettings')}>
        <SettingsField
          label={t('wordSearch.settings.gridSize')}
          toolId="word-search"
          helpAnchor="field-grid-size"
        >
          <ToggleButtonGroup
            value={config.gridSize}
            exclusive
            onChange={handleGridSizeChange}
            size="small"
            fullWidth
          >
            <ToggleButton value={GridSizePreset.SMALL}>
              {t('wordSearch.gridSize.small')} ({GRID_DIMENSIONS.small.rows}x{GRID_DIMENSIONS.small.cols})
            </ToggleButton>
            <ToggleButton value={GridSizePreset.MEDIUM}>
              {t('wordSearch.gridSize.medium')} ({GRID_DIMENSIONS.medium.rows}x{GRID_DIMENSIONS.medium.cols})
            </ToggleButton>
            <ToggleButton value={GridSizePreset.LARGE}>
              {t('wordSearch.gridSize.large')} ({GRID_DIMENSIONS.large.rows}x{GRID_DIMENSIONS.large.cols})
            </ToggleButton>
          </ToggleButtonGroup>
        </SettingsField>
        <SettingsField
          label={t('wordSearch.settings.difficulty')}
          toolId="word-search"
          helpAnchor="field-difficulty"
        >
          <ToggleButtonGroup
            value={config.difficulty}
            exclusive
            onChange={handleDifficultyChange}
            size="small"
            fullWidth
          >
            <ToggleButton value={WordSearchDifficulty.EASY}>
              {t('wordSearch.difficulty.easy')}
            </ToggleButton>
            <ToggleButton value={WordSearchDifficulty.MEDIUM}>
              {t('wordSearch.difficulty.medium')}
            </ToggleButton>
            <ToggleButton value={WordSearchDifficulty.HARD}>
              {t('wordSearch.difficulty.hard')}
            </ToggleButton>
          </ToggleButtonGroup>
        </SettingsField>
      </SettingsSection>

      <SettingsSection title={t('wordSearch.settings.display')}>
        <SettingsField label={t('wordSearch.settings.titleLabel')}>
          <TextField
            size="small"
            value={config.title}
            onChange={(e) => onChange({ ...config, title: e.target.value })}
            fullWidth
          />
        </SettingsField>
        <SettingsField label={t('wordSearch.settings.listColumns')}>
          <FormControl fullWidth size="small">
            <Select value={config.listColumns} onChange={handleListColumnsChange}>
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
              <MenuItem value={3}>3</MenuItem>
            </Select>
          </FormControl>
        </SettingsField>
        <SettingsField label={t('wordSearch.settings.letterCase')}>
          <ToggleButtonGroup
            value={config.letterCase}
            exclusive
            onChange={(_, v) => v && onChange({ ...config, letterCase: v })}
            size="small"
            fullWidth
          >
            <ToggleButton value="upper">ABC</ToggleButton>
            <ToggleButton value="lower">abc</ToggleButton>
          </ToggleButtonGroup>
        </SettingsField>
        <SettingsField>
          <FormControlLabel
            control={
              <Switch
                checked={config.showAnswerKey}
                onChange={(e) => onChange({ ...config, showAnswerKey: e.target.checked })}
              />
            }
            label={t('wordSearch.settings.showAnswerKey')}
          />
        </SettingsField>
      </SettingsSection>
    </>
  );
};

export default ControlPanel;
