import type { MiemieDetails } from 'src/types';
import type { SelectChangeEvent } from '@mui/material';
import type { CharColorMode, CharColorConfig } from 'src/features/charcolor/types';

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
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

import { shuffleArray } from 'src/utils/array-tools';

import { candyColors } from 'src/theme/tokens';
import miemieDetails from 'src/data/miemie-details.json';
import { loadMiemieLessons } from 'src/shared/data/lessons';
import { COLOR_PRESETS, userInputToChars, hasNonChineseChars } from 'src/features/charcolor/utils';

import { SettingCard } from 'src/sections/_shared/SettingCard';
import { SettingsField } from 'src/sections/_shared/SettingsPanel';

import {
  UNDERLINE_MARKS,
  ENCLOSING_SHAPES,
  UnderlineMarkMarker,
  EnclosingShapeMarker,
} from './PracticeMarkers';

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
  const practiceMode = config.practiceMode ?? 'color';
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

  const handlePracticeMode = (mode: CharColorMode | null) => {
    if (!mode || mode === practiceMode) return;
    const nextWordsPerPage = mode === 'enclosing-shape'
      ? 3
      : mode === 'underline-mark'
        ? (wordsPerPage === 4 ? 4 : 3)
        : wordsPerPage;
    onChange({ ...config, practiceMode: mode, wordsPerPage: nextWordsPerPage });
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
        <SettingsField label={t('charColor.settings.practiceMode')}>
          <ToggleButtonGroup
            value={practiceMode}
            exclusive
            fullWidth
            onChange={(_, value) => handlePracticeMode(value as CharColorMode | null)}
            sx={{
              gap: 1,
              '& .MuiToggleButtonGroup-grouped': {
                m: 0,
                border: '1px solid !important',
                borderColor: 'divider !important',
                borderRadius: '10px !important',
              },
            }}
          >
            <ToggleButton value="color" sx={{ flex: 1, py: 1, px: 0.5, display: 'flex', flexDirection: 'column', gap: 0.75, textTransform: 'none' }}>
              <Box sx={{ display: 'flex', gap: 0.4 }}>
                {COLOR_PRESETS[selectedPreset].colors.slice(0, 3).map((color) => (
                  <Box key={color} sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: color }} />
                ))}
              </Box>
              <Typography variant="caption" fontWeight={700}>{t('charColor.settings.modeColor')}</Typography>
            </ToggleButton>
            <ToggleButton value="enclosing-shape" sx={{ flex: 1, py: 1, px: 0.5, display: 'flex', flexDirection: 'column', gap: 0.25, textTransform: 'none' }}>
              <EnclosingShapeMarker char="字" shape="triangle" size={34} />
              <Typography variant="caption" fontWeight={700}>{t('charColor.settings.modeEnclosingShape')}</Typography>
            </ToggleButton>
            <ToggleButton value="underline-mark" sx={{ flex: 1, py: 1, px: 0.5, display: 'flex', flexDirection: 'column', gap: 0.25, textTransform: 'none' }}>
              <UnderlineMarkMarker char="字" mark="wave" size={34} />
              <Typography variant="caption" fontWeight={700}>{t('charColor.settings.modeUnderlineMark')}</Typography>
            </ToggleButton>
          </ToggleButtonGroup>
        </SettingsField>

        {practiceMode === 'color' && (
          <>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <SettingsField label={t('charColor.settings.wordsPerPage')}>
                  <FormControl fullWidth size="small">
                    <Select value={wordsPerPage} onChange={(e) => onChange({ ...config, wordsPerPage: e.target.value as number })}>
                      {[2, 3, 4, 5].map((count) => <MenuItem key={count} value={count}>{count} {t('charColor.settings.charsPerPage')}</MenuItem>)}
                    </Select>
                  </FormControl>
                </SettingsField>
              </Box>
              <Box sx={{ flex: 1 }}>
                <SettingsField label={t('charColor.settings.colorScheme')}>
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
          </>
        )}

        {practiceMode === 'enclosing-shape' && (
          <SettingsField label={t('charColor.settings.shapeLegend')} caption={t('charColor.settings.fixedThreeChars')}>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', py: 0.5 }}>
              {ENCLOSING_SHAPES.map((shape) => <EnclosingShapeMarker key={shape} char="字" shape={shape} size={52} />)}
            </Box>
          </SettingsField>
        )}

        {practiceMode === 'underline-mark' && (
          <>
            <SettingsField label={t('charColor.settings.wordsPerPage')}>
              <ToggleButtonGroup
                value={wordsPerPage === 4 ? 4 : 3}
                exclusive
                fullWidth
                size="small"
                onChange={(_, value) => value && onChange({ ...config, wordsPerPage: value as number })}
              >
                <ToggleButton value={3}>3 {t('charColor.settings.charsPerPage')}</ToggleButton>
                <ToggleButton value={4}>4 {t('charColor.settings.charsPerPage')}</ToggleButton>
              </ToggleButtonGroup>
            </SettingsField>
            <SettingsField label={t('charColor.settings.markLegend')}>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', py: 0.5 }}>
                {UNDERLINE_MARKS.slice(0, wordsPerPage === 4 ? 4 : 3).map((mark) => (
                  <UnderlineMarkMarker key={mark} char="字" mark={mark} size={48} />
                ))}
              </Box>
            </SettingsField>
          </>
        )}
      </SettingCard>    </>
  );
};
