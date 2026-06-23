import type { MiemieDetails } from 'src/types';
import type { SelectChangeEvent } from '@mui/material';
import type { CharColorConfig } from 'src/features/charcolor/types';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Clear as ClearIcon,
  Shuffle as ShuffleIcon,
} from '@mui/icons-material';
import {
  Box,
  Chip,
  Stack,
  Button,
  Select,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  FormControl,
} from '@mui/material';

import { shuffleArray } from 'src/utils/array-tools';

import { candyColors } from 'src/theme/tokens';
import miemieDetails from 'src/data/miemie-details.json';
import { loadMiemieLessons } from 'src/shared/data/lessons';
import { COLOR_PRESETS, userInputToChars, hasNonChineseChars } from 'src/features/charcolor/utils';

import { SettingCard } from 'src/sections/_shared/SettingCard';
import { SettingsField } from 'src/sections/_shared/SettingsPanel';

const miemieDetailsTyped = miemieDetails as MiemieDetails;
const miemie = loadMiemieLessons(miemieDetailsTyped, 'word');

const MAX_INPUT_LENGTH = 300;

interface ControlPanelProps {
  config: CharColorConfig;
  onChange: (c: CharColorConfig) => void;
  onGenerate?: () => void;
  onPrint: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  onChange,
  onGenerate,
  onPrint,
}) => {
  const { userInput, wordsPerPage, selectedPreset, selectedLevel, fullSelectedValue } = config;
  const { t } = useTranslation();

  const [selectedBookIndexes, setSelectedBookIndexes] = useState<string[]>([]);

  const currentLessons = selectedLevel
    ? (miemieDetailsTyped[selectedLevel as keyof MiemieDetails] || [])
    : [];

  const handleLevelChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    if (value.includes('|')) {
      const [language, level] = value.split('|');
      const characters = miemie[language]?.[level] || [];
      setSelectedBookIndexes([]);
      onChange({
        ...config,
        fullSelectedValue: value,
        selectedLevel: level,
        selectedBook: '',
        userInput: characters.join(''),
      });
    } else {
      setSelectedBookIndexes([]);
      onChange({
        ...config,
        fullSelectedValue: '',
        selectedLevel: '',
        selectedBook: '',
        userInput: '',
      });
    }
  };

  const handleBookChange = (values: string[]) => {
    if (values.includes('__all__')) {
      setSelectedBookIndexes([]);
      // Load all words from all lessons in current level
      const allWords = currentLessons.flatMap((l) => l.word || []).join('');
      onChange({ ...config, userInput: allWords, selectedBook: '' });
      return;
    }

    setSelectedBookIndexes(values);
    const words = values
      .map((idx) => currentLessons[Number(idx)])
      .filter(Boolean)
      .flatMap((l) => l.word || [])
      .join('');
    onChange({ ...config, userInput: words, selectedBook: '' });
  };

  const handleClearInput = () => {
    setSelectedBookIndexes([]);
    onChange({
      ...config,
      userInput: '',
      fullSelectedValue: '',
      selectedLevel: '',
      selectedBook: '',
    });
  };

  const handleShuffleInput = () => {
    let inputChars = userInputToChars(userInput);
    inputChars = shuffleArray(inputChars);
    onChange({ ...config, userInput: inputChars.join('') });
  };

  return (
    <>
      <SettingCard label={t('charColor.settings.sectionMaterial')} toolColor={candyColors.red}>
        <SettingsField toolId="charcolor" helpAnchor="field-preset-word-lib">
          <FormControl fullWidth size="small">
            <InputLabel>{t('charColor.settings.presetWordLib')}</InputLabel>
            <Select value={fullSelectedValue} onChange={handleLevelChange} label={t('charColor.settings.presetWordLib')}>
              <MenuItem value="">{t('charColor.settings.pleaseSelectLib')}</MenuItem>
              {Object.keys(miemie).map((language) =>
                Object.keys(miemie[language] || {}).map((level) => (
                  <MenuItem key={`${language}-${level}`} value={`${language}|${level}`}>
                    {level}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </SettingsField>
        <SettingsField>
          <FormControl fullWidth size="small" disabled={!currentLessons || currentLessons.length === 0}>
            <InputLabel>{t('charColor.settings.presetBook')}</InputLabel>
            <Select
              multiple
              value={selectedBookIndexes}
              label={t('charColor.settings.presetBook')}
              renderValue={(selected) => {
                const values = selected as string[];
                if (values.length === 0) return t('charColor.settings.all');
                return values
                  .map((index) => currentLessons[Number(index)]?.title)
                  .filter(Boolean)
                  .join(', ');
              }}
              onChange={(e) =>
                handleBookChange(
                  typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
                )
              }
            >
              <MenuItem value="__all__">
                <Checkbox size="small" checked={selectedBookIndexes.length === 0} />
                {t('charColor.settings.all')}
              </MenuItem>
              {currentLessons?.map((lesson, index) => (
                <MenuItem key={index} value={String(index)}>
                  <Checkbox size="small" checked={selectedBookIndexes.includes(String(index))} />
                  {lesson.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </SettingsField>

        <SettingsField
          caption={
            (() => {
              const count = `${userInput.length}/${MAX_INPUT_LENGTH}`;
              if (hasNonChineseChars(userInput)) {
                return <Typography variant="caption" color="error.main">{count} · {t('charColor.settings.nonChineseWarning')}</Typography>;
              }
              return `${count} · ${t('charColor.settings.parsingHint')}`;
            })()
          }
        >
          <Stack spacing={1}>
            <TextField multiline rows={4} size="small" value={userInput}
              onChange={(e) => onChange({ ...config, userInput: e.target.value })}
              placeholder={t('charColor.settings.manualInput')}
              inputProps={{ maxLength: MAX_INPUT_LENGTH }} fullWidth />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button variant="outlined" size="small" startIcon={<ClearIcon />} onClick={handleClearInput} disabled={!userInput} sx={{ textTransform: 'none' }}>
                {t('common.clear')}
              </Button>
              <Button variant="outlined" size="small" startIcon={<ShuffleIcon />} onClick={handleShuffleInput} disabled={userInputToChars(userInput).length < 2} sx={{ textTransform: 'none' }}>
                {t('common.shuffle')}
              </Button>
            </Box>
            {(() => {
              const chars = userInputToChars(userInput);
              if (chars.length === 0) return null;
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('charColor.settings.charPreview', { count: chars.length })}:
                  </Typography>
                  {chars.slice(0, 30).map((c, i) => (<Chip key={i} label={c} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />))}
                  {chars.length > 30 && <Typography variant="caption" color="text.secondary">+{chars.length - 30} more</Typography>}
                </Box>
              );
            })()}
          </Stack>
        </SettingsField>
      </SettingCard>

      <SettingCard label={t('charColor.settings.sectionDisplay')} toolColor={candyColors.red}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <SettingsField>
              <FormControl fullWidth size="small">
                <Select value={wordsPerPage} onChange={(e) => onChange({ ...config, wordsPerPage: e.target.value as number })}>
                  <MenuItem value={2}>2 字/页</MenuItem>
                  <MenuItem value={3}>3 字/页</MenuItem>
                  <MenuItem value={4}>4 字/页</MenuItem>
                  <MenuItem value={5}>5 字/页</MenuItem>
                </Select>
              </FormControl>
            </SettingsField>
          </Box>
          <Box sx={{ flex: 1 }}>
            <SettingsField>
              <FormControl fullWidth size="small">
                <Select value={selectedPreset} onChange={(e) => onChange({ ...config, selectedPreset: e.target.value as number })}>
                  {COLOR_PRESETS.map((preset, index) => (
                    <MenuItem key={index} value={index}>{preset.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </SettingsField>
          </Box>
        </Box>
        <SettingsField label={t('charColor.settings.colorPreview')}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {COLOR_PRESETS[selectedPreset].colors.map((color, index) => (
              <Box key={index} sx={{ width: 32, height: 32, backgroundColor: color, borderRadius: 1, border: '1px solid', borderColor: 'grey.300' }} title={color} />
            ))}
          </Box>
        </SettingsField>
      </SettingCard>    </>
  );
};
