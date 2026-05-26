import type { MiemieDetails } from 'src/types';
import type { SelectChangeEvent } from '@mui/material';
import type { CharColorConfig } from 'src/features/charcolor/types';

import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  Box,
  Stack,
  Button,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
} from '@mui/material';
import {
  Clear as ClearIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Shuffle as ShuffleIcon,
} from '@mui/icons-material';

import { shuffleArray } from 'src/utils/array-tools';

import miemieDetails from 'src/data/miemie-details.json';
import { loadMiemieLessons } from 'src/shared/data/lessons';
import { COLOR_PRESETS, userInputToChars } from 'src/features/charcolor/utils';

import {
  SettingsField,
  SettingsSection,
} from 'src/sections/_shared/SettingsPanel';

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
  const { userInput, wordsPerPage, selectedPreset, selectedLevel, fullSelectedValue, selectedBook } = config;
  const { t } = useTranslation();

  const handleLevelChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    if (value.includes('|')) {
      const [language, level] = value.split('|');
      const characters = miemie[language]?.[level] || [];
      onChange({
        ...config,
        fullSelectedValue: value,
        selectedLevel: level,
        selectedBook: '',
        userInput: characters.join(','),
      });
    } else {
      onChange({
        ...config,
        fullSelectedValue: '',
        selectedLevel: '',
        selectedBook: '',
        userInput: '',
      });
    }
  };

  const handleSelectBookChange = (e: SelectChangeEvent<string>) => {
    const selectedBookTitle = e.target.value;
    const levelKey = selectedLevel as keyof MiemieDetails;
    const lessons = miemieDetailsTyped[levelKey];
    const selectedLesson = lessons?.find((lesson) => lesson.title === selectedBookTitle);
    onChange({
      ...config,
      selectedBook: selectedBookTitle,
      userInput: selectedLesson ? selectedLesson.word.join(',') : '',
    });
  };

  const handleClearInput = () => {
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
    onChange({ ...config, userInput: inputChars.join(',') });
  };

  const renderBookOptions = () => {
    if (!selectedLevel) {
      return <MenuItem value="">{t('charColor.settings.pleaseSelectLevel')}</MenuItem>;
    }

    const levelKey = selectedLevel as keyof MiemieDetails;
    const lessons = miemieDetailsTyped[levelKey];

    if (!lessons || lessons.length === 0) {
      return <MenuItem value="">{t('charColor.settings.noBooks')}</MenuItem>;
    }

    return lessons.map((lesson, index) => (
      <MenuItem key={index} value={lesson.title}>
        {lesson.title}
      </MenuItem>
    ));
  };

  return (
    <>
      <SettingsSection title={t('charColor.settings.load')}>
        <SettingsField label={t('charColor.settings.presetWordLib')}>
          <FormControl fullWidth size="small">
            <InputLabel>{t('charColor.settings.presetWordLib')}</InputLabel>
            <Select value={fullSelectedValue} onChange={handleLevelChange} label={t('charColor.settings.presetWordLib')}>
              <MenuItem value="">{t('charColor.settings.pleaseSelectLib')}</MenuItem>
              {Object.keys(miemie).map((language) =>
                Object.keys(miemie[language] || {}).map((level) => (
                  <MenuItem key={`${language}-${level}`} value={`${language}|${level}`}>
                    {language} - {level}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </SettingsField>
        <SettingsField label={t('charColor.settings.presetBook')}>
          <FormControl fullWidth size="small">
            <InputLabel>{t('charColor.settings.presetBook')}</InputLabel>
            <Select value={selectedBook} onChange={handleSelectBookChange} label={t('charColor.settings.presetBook')}>
              <MenuItem value="">{t('charColor.settings.pleaseSelectBook')}</MenuItem>
              {renderBookOptions()}
            </Select>
          </FormControl>
        </SettingsField>
      </SettingsSection>

      <SettingsSection title={t('charColor.settings.content')}>
        <SettingsField
          label={t('charColor.settings.manualInput')}
          caption={`${userInput.length}/${MAX_INPUT_LENGTH} characters`}
        >
          <Stack spacing={1}>
            <TextField
              multiline
              rows={4}
              size="small"
              value={userInput}
              onChange={(e) => onChange({ ...config, userInput: e.target.value })}
              placeholder={t('charColor.settings.manualInput')}
              inputProps={{ maxLength: MAX_INPUT_LENGTH }}
              fullWidth
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleClearInput}
                disabled={!userInput}
                sx={{ textTransform: 'none' }}
              >
                {t('common.clear')}
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ShuffleIcon />}
                onClick={handleShuffleInput}
                disabled={userInputToChars(userInput).length < 2}
                sx={{ textTransform: 'none' }}
              >
                {t('common.shuffle')}
              </Button>
            </Box>
          </Stack>
        </SettingsField>
      </SettingsSection>

      <SettingsSection title={t('charColor.settings.options')}>
        <SettingsField label={t('charColor.settings.wordsPerPage')}>
          <FormControl fullWidth size="small">
            <Select
              value={wordsPerPage}
              onChange={(e) => onChange({ ...config, wordsPerPage: e.target.value as number })}
            >
              <MenuItem value={2}>2 字/页</MenuItem>
              <MenuItem value={3}>3 字/页</MenuItem>
              <MenuItem value={4}>4 字/页</MenuItem>
              <MenuItem value={5}>5 字/页</MenuItem>
            </Select>
          </FormControl>
        </SettingsField>
        <SettingsField label={t('charColor.settings.colorScheme')}>
          <FormControl fullWidth size="small">
            <Select
              value={selectedPreset}
              onChange={(e) => onChange({ ...config, selectedPreset: e.target.value as number })}
            >
              {COLOR_PRESETS.map((preset, index) => (
                <MenuItem key={index} value={index}>
                  {preset.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </SettingsField>
        <SettingsField label={t('charColor.settings.colorPreview')}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {COLOR_PRESETS[selectedPreset].colors.map((color, index) => (
              <Box
                key={index}
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: color,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.300',
                }}
                title={color}
              />
            ))}
          </Box>
        </SettingsField>
      </SettingsSection>

      <Box
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid',
          borderColor: 'grey.200',
          bgcolor: 'grey.50',
        }}
      >
        <Stack direction="row" spacing={1}>
          <Button
            onClick={onGenerate}
            variant="outlined"
            startIcon={<RefreshIcon />}
            fullWidth
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {t('common.regenerate')}
          </Button>
          <Button
            onClick={onPrint}
            variant="contained"
            startIcon={<PrintIcon />}
            fullWidth
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {t('common.print')}
          </Button>
        </Stack>
      </Box>
    </>
  );
};
