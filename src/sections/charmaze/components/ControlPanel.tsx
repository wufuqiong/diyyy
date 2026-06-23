import type { MiemieLesson } from 'src/types';
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
  Checkbox,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

import { shuffleArray } from 'src/utils/array-tools';

import { candyColors } from 'src/theme/tokens';
import miemieDetailsJson from 'src/data/miemie-details.json';
import { parseSelectedMode, TABLE_SIZE_PRESETS } from 'src/features/charmaze/types';

import { SettingCard } from 'src/sections/_shared/SettingCard';
import { SettingsField } from 'src/sections/_shared/SettingsPanel';

const miemieDetails: Record<string, MiemieLesson[]> = miemieDetailsJson;

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
  const { userInput, selectedMode, wordsPerPage, selectedTableSize } = config;
  const mode = parseSelectedMode(selectedMode);
  const { t } = useTranslation();

  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedLessonIndexes, setSelectedLessonIndexes] = useState<string[]>([]);

  const currentLessons = selectedLevel ? miemieDetails[selectedLevel] || [] : [];
  const selectedLessons =
    selectedLessonIndexes.length > 0
      ? selectedLessonIndexes.map((index) => currentLessons[Number(index)]).filter(Boolean)
      : currentLessons;

  const hasWords = selectedLessons.some((lesson) => Array.isArray(lesson.word) && lesson.word.length > 0);
  const hasPhrases = selectedLessons.some((lesson) => Array.isArray(lesson.phrase) && lesson.phrase.length > 0);
  const hasSentences = selectedLessons.some((lesson) => Array.isArray(lesson.sentence) && lesson.sentence.length > 0);

  const modeIndex = { word: 0, phrase: 1, sentence: 2 };
  const modeFromIndex = ['word', 'phrase', 'sentence'] as const;

  const handleLoadContent = (type: 'word' | 'phrase' | 'sentence') => {
    const targetLessons = selectedLessons;
    if (targetLessons.length === 0) return;

    let content = '';
    if (type === 'word') {
      content = targetLessons.map((l) => (l.word || []).join('')).join('');
    } else if (type === 'phrase') {
      content = targetLessons.flatMap((l) => l.phrase || []).filter(Boolean).join(',');
    } else if (type === 'sentence') {
      content = targetLessons.flatMap((l) => l.sentence || []).filter(Boolean).join('\n');
    }

    onChange({ ...config, userInput: content, selectedMode: modeIndex[type], selectedLevel, selectedBook: '' });
  };

  const handleModeChange = (_: React.MouseEvent<HTMLElement>, newMode: number | null) => {
    if (newMode === null) return;
    const type = modeFromIndex[newMode];
    // Load content if lessons selected and content type available, otherwise just switch mode
    const hasContent = type === 'word' ? hasWords : type === 'phrase' ? hasPhrases : hasSentences;
    if (selectedLevel && hasContent) {
      handleLoadContent(type);
    } else {
      onChange({ ...config, selectedMode: newMode });
    }
  };

  const handleLessonChange = (values: string[]) => {
    if (values.includes('__all__')) {
      setSelectedLessonIndexes([]);
      return;
    }

    setSelectedLessonIndexes(values);

    if (values.length !== 1) return;

    const lesson = currentLessons[Number(values[0])];
    if (lesson) {
      const w = Array.isArray(lesson.word) && lesson.word.length > 0;
      const p = Array.isArray(lesson.phrase) && lesson.phrase.length > 0;
      const s = Array.isArray(lesson.sentence) && lesson.sentence.length > 0;

      const availableCounts = [w, p, s].filter(Boolean).length;
      if (availableCounts === 1) {
        if (w) handleLoadContent('word');
        else if (p) handleLoadContent('phrase');
        else if (s) handleLoadContent('sentence');
      }
    }
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

  const handleClearInput = () => {
    setSelectedLevel('');
    setSelectedLessonIndexes([]);
    onChange({
      ...config,
      userInput: '',
      fullSelectedValue: '',
      selectedLevel: '',
      selectedBook: '',
    });
  };

  const shuffleInputItems = getShuffleInputItems();

  return (
    <>
      <SettingCard label={t('charMaze.settings.sectionMaterial')} toolColor={candyColors.orange}>
        <SettingsField>
          <Stack spacing={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('charMaze.settings.level')}</InputLabel>
              <Select
                value={selectedLevel}
                label={t('charMaze.settings.level')}
                onChange={(e) => {
                  setSelectedLevel(e.target.value);
                  setSelectedLessonIndexes([]);
                }}
              >
                {Object.keys(miemieDetails).map((level) => {
                  const lessons = miemieDetails[level];
                  const isDisabled = !Array.isArray(lessons) || lessons.length === 0;
                  return (
                    <MenuItem key={level} value={level} disabled={isDisabled}>
                      {level}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl
              fullWidth
              size="small"
              disabled={!currentLessons || currentLessons.length === 0}
            >
              <InputLabel>{t('charMaze.settings.lesson')}</InputLabel>
              <Select
                multiple
                value={selectedLessonIndexes}
                label={t('charMaze.settings.lesson')}
                renderValue={(selected) => {
                  const values = selected as string[];
                  if (values.length === 0) return t('charMaze.settings.allLessons');
                  return values
                    .map((index) => currentLessons[Number(index)]?.title)
                    .filter(Boolean)
                    .join(', ');
                }}
                onChange={(e) =>
                  handleLessonChange(
                    typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
                  )
                }
              >
                <MenuItem value="__all__">
                  <Checkbox size="small" checked={selectedLessonIndexes.length === 0} />
                  {t('charMaze.settings.allLessons')}
                </MenuItem>
                {currentLessons?.map((lesson, index) => (
                  <MenuItem key={index} value={String(index)}>
                    <Checkbox size="small" checked={selectedLessonIndexes.includes(String(index))} />
                    {lesson.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <ToggleButtonGroup
              value={selectedMode}
              exclusive
              fullWidth
              size="small"
              onChange={handleModeChange}
            >
              <ToggleButton value={0} disabled={!!selectedLevel && !hasWords}>
                {t('charMaze.settings.words')}
              </ToggleButton>
              <ToggleButton value={1} disabled={!!selectedLevel && !hasPhrases}>
                {t('charMaze.settings.phrases')}
              </ToggleButton>
              <ToggleButton value={2} disabled={!!selectedLevel && !hasSentences}>
                {t('charMaze.settings.sentences')}
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </SettingsField>

        <SettingsField
          caption={
            (() => {
              const countStr = t('charMaze.settings.manualInputCaption', { length: userInput.length });

              const nonChinese = [...userInput].filter((c) => {
                const trimmed = c.trim();
                if (!trimmed) return false;
                return !/[\u4e00-\u9fff]/.test(trimmed) && !/[\s,;，；、\n]/.test(c);
              });
              if (nonChinese.length > 0) {
                return <Typography variant="caption" color="error.main">{countStr} · {t('charMaze.settings.nonChineseWarning')}</Typography>;
              }

              if (mode === 'WORD') {
                const tokens = userInput.split(/[\s,;，；、]+/).filter((c: string) => c.trim() !== '');
                const multiChar = tokens.filter((token: string) => token.length > 1);
                if (multiChar.length > 0) {
                  return <Typography variant="caption" color="warning.main">{countStr} · {t('charMaze.settings.wordModeMultiCharWarning', { examples: multiChar.slice(0, 3).join(', ') })}</Typography>;
                }
              }

              const hintKey = mode === 'WORD' ? 'parsingHintWord' : mode === 'PHRASE' ? 'parsingHintPhrase' : 'parsingHintSentence';
              return `${countStr} · ${t('charMaze.settings.' + hintKey)}`;
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
              placeholder={t('charMaze.settings.manualInputPlaceholder')}
              inputProps={{
                style: {
                  fontFamily: 'KaiTi, STKaiti, "Kaiti SC", "SimKai", serif',
                  fontSize: '1.1rem',
                },
              }}
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
      </SettingCard>

      <SettingCard label={t('charMaze.settings.sectionMaze')} toolColor={candyColors.orange}>
        <SettingsField>
          <FormControl fullWidth size="small">
            <InputLabel>{t('charMaze.settings.mazeSize')}</InputLabel>
            <Select
              value={selectedTableSize}
              label={t('charMaze.settings.mazeSize')}
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
          caption={mode !== 'PHRASE' ? t('charMaze.settings.wordsPerPageHint') : undefined}
        >
          <FormControl fullWidth size="small" disabled={mode !== 'PHRASE'}>
            <InputLabel>{t('charMaze.settings.wordsPerPage')}</InputLabel>
            <Select
              value={wordsPerPage}
              label={t('charMaze.settings.wordsPerPage')}
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
      </SettingCard>

    </>
  );
};
