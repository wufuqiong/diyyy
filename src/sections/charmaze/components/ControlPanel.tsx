import type { SelectChangeEvent } from '@mui/material';
import type { MiemieLesson, MiemieDetails } from 'src/types';
import type { CharMazeConfig } from 'src/features/charmaze/types';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Clear as ClearIcon,
  Shuffle as ShuffleIcon,
} from '@mui/icons-material';
import {
  Box,
  Stack,
  Button,
  Select,
  Dialog,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';

import { shuffleArray } from 'src/utils/array-tools';

import miemieDetails from 'src/data/miemie-details.json';
import { loadMiemieLessons } from 'src/shared/data/lessons';
import {
  MODE_PRESETS,
  parseSelectedMode,
  TABLE_SIZE_PRESETS,
  SELECTER_TITLE_PRESETS,
} from 'src/features/charmaze/types';

import {
  SettingsField,
  SettingsSection,
} from 'src/sections/_shared/SettingsPanel';

const miemieDetailsTyped = miemieDetails as MiemieDetails;

const miemieWordData = loadMiemieLessons(miemieDetailsTyped, 'word');
const miemiePhraseData = loadMiemieLessons(miemieDetailsTyped, 'phrase');
const miemieSentenceData = loadMiemieLessons(miemieDetailsTyped, 'sentence');

const MIEMIE_PRESETS = {
  WORD: miemieWordData,
  PHRASE: miemiePhraseData,
  SENTENCE: miemieSentenceData,
};

const MAX_INPUT_LENGTH = 300;

interface ControlPanelProps {
  config: CharMazeConfig;
  onChange: (c: CharMazeConfig) => void;
  onGenerate?: () => void;
  onPrint: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  onChange,
  onGenerate,
  onPrint,
}) => {
  const { userInput, selectedMode, wordsPerPage, selectedTableSize, selectedLevel, fullSelectedValue, selectedBook } = config;
  const mode = parseSelectedMode(selectedMode);
  const { t } = useTranslation();

  const modeLabelKeys = { WORD: 'wordPractice', PHRASE: 'phrasePractice', SENTENCE: 'sentencePractice' } as const;

  const [pendingMode, setPendingMode] = useState<number | null>(null);

  const handleModeChange = (e: SelectChangeEvent<number>) => {
    const newMode = e.target.value as number;
    if (userInput) {
      // Show confirmation before clearing user content
      setPendingMode(newMode);
      return;
    }
    applyModeChange(newMode);
  };

  const applyModeChange = (newMode: number) => {
    onChange({
      ...config,
      selectedMode: newMode,
      selectedLevel: '',
      fullSelectedValue: '',
      selectedBook: '',
      userInput: '',
    });
  };

  const getDataInMiemieDetails = (selectedLesson: MiemieLesson): string[] => {
    switch (mode) {
      case 'WORD':
        return selectedLesson.word || [];
      case 'PHRASE':
        return selectedLesson.phrase || [];
      case 'SENTENCE':
        return selectedLesson.sentence || [];
      default:
        return [];
    }
  };

  const resolveLessonCharacters = (level: string, book: string, fullValue: string): string[] | null => {
    if (!level && !fullValue) return null;

    try {
      if (level) {
        const levelKey = level as keyof MiemieDetails;
        const lessons = miemieDetailsTyped[levelKey];

        if (lessons && lessons.length > 0) {
          if (book) {
            const selectedLesson = lessons.find((lesson) => lesson.title === book);
            if (!selectedLesson) return null;
            return getDataInMiemieDetails(selectedLesson);
          }
          const chars: string[] = [];
          lessons.forEach((lesson) => {
            chars.push(...getDataInMiemieDetails(lesson));
          });
          return chars;
        }
      } else if (fullValue) {
        const [language, lvl] = fullValue.split('|');
        const presetsForMode = MIEMIE_PRESETS[mode] || {};
        return presetsForMode[language]?.[lvl] || [];
      }
    } catch (error) {
      console.error('Error resolving lesson characters:', error);
    }
    return null;
  };

  const handleLevelChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    if (value.includes('|')) {
      const [, level] = value.split('|');
      const characters = resolveLessonCharacters(level, '', value);
      onChange({
        ...config,
        fullSelectedValue: value,
        selectedLevel: level,
        selectedBook: '',
        userInput: characters ? characters.join(mode === 'SENTENCE' ? '\n' : ',') : config.userInput,
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
    const characters = resolveLessonCharacters(selectedLevel, selectedBookTitle, fullSelectedValue);
    onChange({
      ...config,
      selectedBook: selectedBookTitle,
      userInput: characters ? characters.join(mode === 'SENTENCE' ? '\n' : ',') : config.userInput,
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

  const getShuffleInputItems = () => {
    const splitPattern = mode === 'SENTENCE' ? /[\n]+/ : /[\s,;，；、]+/;
    return userInput
      .split(splitPattern)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const handleShuffleInput = () => {
    const joiner = mode === 'SENTENCE' ? '\n' : ', ';
    const items = getShuffleInputItems();
    if (items.length < 2) return;
    onChange({ ...config, userInput: shuffleArray(items).join(joiner) });
  };

  const shuffleInputItems = getShuffleInputItems();

  const renderBookOptions = () => {
    if (!selectedLevel) {
      return <MenuItem value="">{t('charMaze.settings.pleaseSelectLevel')}</MenuItem>;
    }

    const levelKey = selectedLevel as keyof MiemieDetails;
    const lessons = miemieDetailsTyped[levelKey];

    if (!lessons || lessons.length === 0) {
      return <MenuItem value="">{t('charMaze.settings.noBooks')}</MenuItem>;
    }

    return lessons.map((lesson, index) => (
      <MenuItem key={index} value={lesson.title}>
        {lesson.title}
      </MenuItem>
    ));
  };

  const currentMiemieData = MIEMIE_PRESETS[mode] || {};

  return (
    <>
      <SettingsSection title={t('charMaze.settings.load')}>
        <SettingsField label={t('charMaze.settings.modeSelect')}>
          <FormControl fullWidth size="small">
            <Select value={selectedMode} onChange={handleModeChange}>
              {Object.keys(MODE_PRESETS).map((preset, index) => (
                <MenuItem key={index} value={index}>
                  {t(`charMaze.settings.${modeLabelKeys[preset as 'WORD' | 'PHRASE' | 'SENTENCE']}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </SettingsField>

        <SettingsField label={SELECTER_TITLE_PRESETS[mode]}>
          <FormControl fullWidth size="small">
            <InputLabel>{SELECTER_TITLE_PRESETS[mode]}</InputLabel>
            <Select value={fullSelectedValue} onChange={handleLevelChange} label={SELECTER_TITLE_PRESETS[mode]}>
              <MenuItem value="">{t('charMaze.settings.pleaseSelect')}</MenuItem>
              {Object.keys(currentMiemieData).map((language) =>
                Object.keys(currentMiemieData[language] || {}).map((level) => (
                  <MenuItem key={`${language}-${level}`} value={`${language}|${level}`}>
                    {language} - {level}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </SettingsField>

        <SettingsField label={t('charMaze.settings.presetBook')}>
          <FormControl fullWidth size="small" disabled={!selectedLevel}>
            <Select value={selectedBook} onChange={handleSelectBookChange} displayEmpty>
              <MenuItem value="">{t('charMaze.settings.all')}</MenuItem>
              {renderBookOptions()}
            </Select>
          </FormControl>
        </SettingsField>
      </SettingsSection>

      <SettingsSection title={t('charMaze.settings.content')}>
        <SettingsField
          label={t('charMaze.settings.manualInput')}
          caption={
            (() => {
              const count = `${userInput.length}/${MAX_INPUT_LENGTH}`;
              if (mode === 'WORD') {
                const tokens = userInput.split(/[\s,;，；、]+/).filter((c: string) => c.trim() !== '');
                const multiChar = tokens.filter((token: string) => token.length > 1);
                if (multiChar.length > 0) {
                  return <Typography variant="caption" color="warning.main">{count} — {t('charMaze.settings.wordModeMultiCharWarning', { examples: multiChar.slice(0, 3).join(', ') })}</Typography>;
                }
              }
              return `${count} characters`;
            })()
          }
        >
          <Stack spacing={1}>
            <TextField
              multiline
              rows={4}
              size="small"
              value={userInput}
              onChange={(e) => onChange({ ...config, userInput: e.target.value })}
              placeholder={t('charMaze.settings.manualInput')}
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
                disabled={shuffleInputItems.length < 2}
                sx={{ textTransform: 'none' }}
              >
                {t('common.shuffle')}
              </Button>
            </Box>
          </Stack>
        </SettingsField>
      </SettingsSection>

      <SettingsSection title={t('charMaze.settings.options')}>
        <SettingsField label={t('charMaze.settings.mazeSize')}>
          <FormControl fullWidth size="small">
            <Select
              value={selectedTableSize}
              onChange={(e) => onChange({ ...config, selectedTableSize: e.target.value as number })}
            >
              {TABLE_SIZE_PRESETS.map((preset, index) => (
                <MenuItem key={index} value={index}>
                  {preset.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </SettingsField>

        <SettingsField
          label={t('charMaze.settings.wordsPerPage')}
          caption={mode !== 'PHRASE' ? t('charMaze.settings.wordsPerPageHint') : undefined}
        >
          <FormControl fullWidth size="small" disabled={mode !== 'PHRASE'}>
            <Select
              value={wordsPerPage}
              onChange={(e) => onChange({ ...config, wordsPerPage: e.target.value as number })}
            >
              {[3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <MenuItem key={num} value={num}>
                  {num} 字/页
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </SettingsField>
      </SettingsSection>

      <Dialog
        open={pendingMode !== null}
        onClose={() => setPendingMode(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t('common.confirm')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('charMaze.settings.modeChangeWarning')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingMode(null)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (pendingMode !== null) {
                applyModeChange(pendingMode);
                setPendingMode(null);
              }
            }}
          >
            {t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
