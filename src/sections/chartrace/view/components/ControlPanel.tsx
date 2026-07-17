import type { SheetConfig, MiemieLesson } from 'src/types';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Clear as ClearIcon, Shuffle as ShuffleIcon } from '@mui/icons-material';
import {
  Box,
  Stack,
  Button,
  Select,
  Slider,
  Checkbox,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  ToggleButton,
  FormControlLabel,
  ToggleButtonGroup,
} from '@mui/material';

import { candyColors } from 'src/theme/tokens';
import { GridType, TraceContentMode } from 'src/types';
import miemieDetailsJson from 'src/data/miemie-details.json';

import { ColorPicker } from 'src/components/color-utils';

import { SettingCard } from 'src/sections/_shared/SettingCard';
import { SettingsField } from 'src/sections/_shared/SettingsPanel';

const THEME_COLOR_OPTIONS = Object.values(candyColors);

const miemieDetails: Record<string, MiemieLesson[]> = miemieDetailsJson;

interface ControlPanelProps {
  config: SheetConfig;
  setConfig: (c: SheetConfig) => void;
  onPrint: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ config, setConfig, onPrint }) => {
  const { t } = useTranslation();
  const hasChineseInText = /[\u4e00-\u9fa5]/.test(config.text);

  const getContentModeFromText = (text: string, fallback: TraceContentMode) => {
    if (text.includes('\n') || text.includes('。')) return TraceContentMode.SENTENCES;
    if (text.includes(',') || text.includes('，')) return TraceContentMode.PHRASES;
    if (text.trim() === '') return fallback;
    return fallback === TraceContentMode.SENTENCES ? TraceContentMode.SENTENCES : TraceContentMode.CHARACTERS;
  };

  const getShufflePayload = (text: string) => {
    if (text.includes('\n') || text.includes('。')) {
      const items = text
        .split('\n')
        .flatMap((line) => line.split('。'))
        .map((item) => item.trim())
        .filter(Boolean);
      return { items, joiner: '\n' };
    }

    if (text.includes(',') || text.includes('，')) {
      return {
        items: text
          .split(/[，,]/)
          .map((item) => item.trim())
          .filter(Boolean),
        joiner: text.includes('，') ? '，' : ', ',
      };
    }

    if (text.includes(' ')) {
      return {
        items: text
          .split(/\s+/)
          .map((item) => item.trim())
          .filter(Boolean),
        joiner: ' ',
      };
    }

    return {
      items: Array.from(text).filter((char) => char.trim() !== ''),
      joiner: '',
    };
  };

  const shuffleItems = <T,>(items: T[]) => {
    const nextItems = [...items];

    for (let i = nextItems.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [nextItems[i], nextItems[j]] = [nextItems[j], nextItems[i]];
    }

    return nextItems;
  };

  const handleChange = (key: keyof SheetConfig, value: any) => {
    const updates: Partial<SheetConfig> = { [key]: value };

    if (key === 'text') {
      const newText = value as string;
      const isChinese = /[\u4e00-\u9fa5]/.test(newText);
      const isEnglish = /[a-zA-Z]/.test(newText);
      const nextContentMode = getContentModeFromText(newText, config.contentMode);

      updates.contentMode = nextContentMode;

      if (nextContentMode === TraceContentMode.SENTENCES) {
        updates.traceCount = 1;
      }

      if (isChinese) {
        if (config.gridType === GridType.ENGLISH_LINES) updates.gridType = GridType.TIAN;
        if (config.fontFamily?.startsWith('font-english') || config.fontFamily === 'font-sans') {
          updates.fontFamily = 'font-kaiti';
        }
      } else if (!isChinese && isEnglish) {
        if (config.gridType !== GridType.ENGLISH_LINES) {
          updates.gridType = GridType.ENGLISH_LINES;
          if (!config.gridSize) updates.gridSize = 14;
        }
      }
    }

    if (key === 'gridType') {
      if (value === GridType.ENGLISH_LINES) {
        if (!config.gridSize) updates.gridSize = 14;
      } else if (config.fontFamily?.startsWith('font-english') || config.fontFamily === 'font-sans') {
        updates.fontFamily = 'font-kaiti';
      }
    }

    setConfig({ ...config, ...updates });
  };

  const handleBatchChange = (updates: Partial<SheetConfig>) => {
    setConfig({ ...config, ...updates });
  };

  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedLessonIndexes, setSelectedLessonIndexes] = useState<string[]>([]);

  const currentLessons = selectedLevel ? miemieDetails[selectedLevel] || [] : [];
  const selectedLessons =
    selectedLessonIndexes.length > 0
      ? selectedLessonIndexes.map((index) => currentLessons[Number(index)]).filter(Boolean)
      : currentLessons;

  const hasWords = selectedLessons.some((lesson: any) => Array.isArray(lesson.word) && lesson.word.length > 0);

  const hasPhrases = selectedLessons.some(
    (lesson: any) => Array.isArray(lesson.phrase) && lesson.phrase.length > 0
  );

  const hasSentences = selectedLessons.some(
    (lesson: any) => Array.isArray(lesson.sentence) && lesson.sentence.length > 0
  );

  const shufflePayload = getShufflePayload(config.text);

  const handleLoadContent = (type: 'word' | 'phrase' | 'sentence', lessonData?: any) => {
    let targetLessons: any[] = [];
    if (lessonData) {
      targetLessons = Array.isArray(lessonData) ? lessonData : [lessonData];
    } else {
      targetLessons = selectedLessons;
    }

    if (targetLessons.length === 0) return;

    let content = '';
    if (type === 'word') {
      content = targetLessons.map((l: any) => (l.word || []).join('')).join('');
    } else if (type === 'phrase') {
      content = targetLessons.flatMap((l: any) => l.phrase || []).filter(Boolean).join('，');
    } else if (type === 'sentence') {
      content = targetLessons.flatMap((l: any) => l.sentence || []).filter(Boolean).join('\n');
    }

    const title = targetLessons.length === 1 ? targetLessons[0].title : selectedLevel;

    const updates: Partial<SheetConfig> = {
      headerTitle: title,
      text: content,
      contentMode:
        type === 'sentence'
          ? TraceContentMode.SENTENCES
          : type === 'phrase'
            ? TraceContentMode.PHRASES
            : TraceContentMode.CHARACTERS,
    };

    if (type === 'sentence') {
      updates.traceCount = 1;
    }

    const isChinese = /[\u4e00-\u9fa5]/.test(content);
    const isEnglish = /[a-zA-Z]/.test(content);
    if (isChinese) {
      if (config.gridType === GridType.ENGLISH_LINES) updates.gridType = GridType.TIAN;
      if (config.fontFamily?.startsWith('font-english') || config.fontFamily === 'font-sans') {
        updates.fontFamily = 'font-kaiti';
      }
    } else if (!isChinese && isEnglish) {
      if (config.gridType !== GridType.ENGLISH_LINES) {
        updates.gridType = GridType.ENGLISH_LINES;
        updates.gridSize = config.gridSize || 14;
      }
      if (
        config.fontFamily === 'font-kaiti' ||
        config.fontFamily === 'font-cursor' ||
        config.fontFamily === 'font-brush'
      ) {
        updates.fontFamily = 'font-english-print';
      }
    }

    handleBatchChange(updates);
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
        if (w) handleLoadContent('word', lesson);
        else if (p) handleLoadContent('phrase', lesson);
        else if (s) handleLoadContent('sentence', lesson);
      }
    }
  };

  const handleShuffleText = () => {
    if (shufflePayload.items.length < 2) return;
    handleChange('text', shuffleItems(shufflePayload.items).join(shufflePayload.joiner));
  };

  const handleClearText = () => {
    handleChange('text', '');
  };

  const isEnglishLines = config.gridType === GridType.ENGLISH_LINES;
  const isSentenceMode = !isEnglishLines && config.contentMode === TraceContentMode.SENTENCES;

  return (
    <>
      {/* ============= CONTENT ============= */}
      <SettingCard label={t('charTrace.settings.sectionMaterial')} toolColor={candyColors.green}>
        <SettingsField>
          <Stack spacing={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('charTrace.settings.level')}</InputLabel>
              <Select
                value={selectedLevel}
                label={t('charTrace.settings.level')}
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
              <InputLabel>{t('charTrace.settings.lesson')}</InputLabel>
              <Select
                multiple
                value={selectedLessonIndexes}
                label={t('charTrace.settings.lesson')}
                renderValue={(selected) => {
                  const values = selected as string[];

                  if (values.length === 0) {
                    return t('charTrace.settings.allLessons');
                  }

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
                  {t('charTrace.settings.allLessons')}
                </MenuItem>
                {currentLessons?.map((lesson: any, index: number) => (
                  <MenuItem key={index} value={String(index)}>
                    <Checkbox
                      size="small"
                      checked={selectedLessonIndexes.includes(String(index))}
                    />
                    {lesson.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => handleLoadContent('word')}
                disabled={!selectedLevel || !hasWords}
                sx={{ textTransform: 'none' }}
              >
                {t('charTrace.settings.words')}
              </Button>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => handleLoadContent('phrase')}
                disabled={!selectedLevel || !hasPhrases}
                sx={{ textTransform: 'none' }}
              >
                {t('charTrace.settings.phrases')}
              </Button>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => handleLoadContent('sentence')}
                disabled={!selectedLevel || !hasSentences}
                sx={{ textTransform: 'none' }}
              >
                {t('charTrace.settings.sentences')}
              </Button>
            </Stack>
          </Stack>
        </SettingsField>

        <SettingsField>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              color="secondary"
              sx={{ textTransform: 'none' }}
              onClick={() =>
                handleBatchChange({
                  text: 'a, o, e, i, u, ü, b, p, m, f, d, t, n, l, g, k, h, j, q, x, zh, ch, sh, r, z, c, s, y, w, ai, ei, ui, ao, ou, iu, ie, üe, er, an, en, in, un, ün, ang, eng, ing, ong',
                  gridType: GridType.ENGLISH_LINES,
                  gridSize: 14,
                  headerTitle: '汉语拼音描红',
                  fontFamily: 'font-english-print',
                })
              }
            >
              {t('charTrace.settings.allPinyin')}
            </Button>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              color="secondary"
              sx={{ textTransform: 'none' }}
              onClick={() =>
                handleBatchChange({
                  text: 'A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z',
                  gridType: GridType.ENGLISH_LINES,
                  gridSize: 14,
                  headerTitle: 'Alphabet Tracing',
                  fontFamily: 'font-english-print',
                })
              }
            >
              {t('charTrace.settings.alphabet')}
            </Button>
          </Stack>
        </SettingsField>

        <SettingsField
          caption={
            (() => {
              const countStr = t('charTrace.settings.manualInputCaption', { length: config.text.length });
              const text = config.text;
              if (text.includes('\n')) return `${countStr}  ·  ${t('charTrace.settings.parsingHintSentences')}`;
              if (text.includes(',') || text.includes('，')) return `${countStr}  ·  ${t('charTrace.settings.parsingHintPhrases')}`;
              if (config.gridType === 'english') return `${countStr}  ·  ${t('charTrace.settings.parsingHintEnglish')}`;
              return `${countStr}  ·  ${t('charTrace.settings.parsingHintChars')}`;
            })()
          }
        >
          <Stack spacing={1}>
            <TextField
              multiline
              rows={4}
              fullWidth
              size="small"
              value={config.text}
              onChange={(e) => handleChange('text', e.target.value)}
              placeholder="Enter text here..."
              inputProps={{
                style: {
                  fontFamily: 'KaiTi, STKaiti, "Kaiti SC", "SimKai", serif',
                  fontSize: '1.1rem',
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleClearText}
                disabled={!config.text}
                sx={{ textTransform: 'none' }}
              >
                {t('common.clear')}
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ShuffleIcon />}
                onClick={handleShuffleText}
                disabled={shufflePayload.items.length < 2}
                sx={{ textTransform: 'none' }}
              >
                {t('common.shuffle')}
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {isEnglishLines
                ? t('charTrace.settings.inputHintEnglish')
                : t('charTrace.settings.inputHintChinese')}
            </Typography>
          </Stack>
        </SettingsField>
      </SettingCard>

      {/* ============= GRID & TEXT ============= */}
      <SettingCard label={t('charTrace.settings.gridAndText')} toolColor={candyColors.green}>
        <SettingsField>
          <ToggleButtonGroup
            value={config.gridType}
            exclusive
            fullWidth
            size="small"
            onChange={(_, v) => v && handleChange('gridType', v)}
            sx={{ '& .MuiToggleButton-root': { flex: 1 } }}
          >
            <ToggleButton value={GridType.TIAN}>田</ToggleButton>
            <ToggleButton value={GridType.MI}>米</ToggleButton>
            <ToggleButton value={GridType.SQUARE}>口</ToggleButton>
            <ToggleButton value={GridType.ENGLISH_LINES} disabled={hasChineseInText}>
              四线
            </ToggleButton>
          </ToggleButtonGroup>
        </SettingsField>

        {!isEnglishLines && (
          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1 }}>
              <SettingsField>
                <TextField
                  type="number"
                  label={t('charTrace.settings.rowsPerPageLabel')}
                  fullWidth
                  size="small"
                  inputProps={{ min: 1, max: 15 }}
                  value={config.rowsPerPage}
                  onChange={(e) => handleChange('rowsPerPage', parseInt(e.target.value, 10))}
                />
              </SettingsField>
            </Box>
            <Box sx={{ flex: 1 }}>
              <SettingsField>
                <TextField
                  type="number"
                  label={t('charTrace.settings.colsPerRowLabel')}
                  fullWidth
                  size="small"
                  inputProps={{ min: 1, max: 12 }}
                  value={config.colsPerRow}
                  onChange={(e) => handleChange('colsPerRow', parseInt(e.target.value, 10))}
                />
              </SettingsField>
            </Box>
          </Stack>
        )}

        {isEnglishLines && (
          <SettingsField>
            <FormControl fullWidth size="small">
              <InputLabel>{t('charTrace.settings.sizeMm')}</InputLabel>
              <Select
                value={config.gridSize || 14}
                label={t('charTrace.settings.sizeMm')}
                onChange={(e) => handleChange('gridSize', Number(e.target.value))}
              >
                <MenuItem value={14}>14mm</MenuItem>
                <MenuItem value={17}>17mm</MenuItem>
                <MenuItem value={20}>20mm</MenuItem>
              </Select>
            </FormControl>
          </SettingsField>
        )}

        <SettingsField>
          <FormControl fullWidth size="small">
            <InputLabel>{t('charTrace.settings.fontFamily')}</InputLabel>
            <Select
              value={config.fontFamily}
              label={t('charTrace.settings.fontFamily')}
              onChange={(e) => handleChange('fontFamily', e.target.value)}
            >
              {!isEnglishLines && [
                <Box
                  key="zh-title"
                  component="li"
                  sx={{ px: 2, py: 1, color: 'text.secondary', typography: 'caption' }}
                >
                  Chinese
                </Box>,
                <MenuItem key="zh-1" value="font-kaiti">
                  KaiTi (Standard)
                </MenuItem>,
                <MenuItem key="zh-2" value="font-cursor">
                  Ma Shan Zheng (Cursive)
                </MenuItem>,
                <MenuItem key="zh-3" value="font-brush">
                  Zhi Mang Xing (Brush)
                </MenuItem>,
                <MenuItem key="zh-4" value="font-serif">
                  Serif
                </MenuItem>,
              ]}
              {(isEnglishLines || !hasChineseInText) && [
                <Box
                  key="en-title"
                  component="li"
                  sx={{ px: 2, py: 1, color: 'text.secondary', typography: 'caption' }}
                >
                  English
                </Box>,
                <MenuItem key="en-1" value="font-english-print">
                  Fredoka (Rounded Print)
                </MenuItem>,
                <MenuItem key="en-2" value="font-english-hand">
                  Patrick Hand (Handwriting)
                </MenuItem>,
                <MenuItem key="en-3" value="font-sans">
                  Sans Serif (Standard)
                </MenuItem>,
              ]}
            </Select>
          </FormControl>
        </SettingsField>

        <SettingsField
          label={
            isSentenceMode
              ? t('charTrace.settings.traceCopiesValue', { count: 1 })
              : isEnglishLines
                ? t('charTrace.settings.repeatCount', { count: config.traceCount })
                : t('charTrace.settings.traceCopiesValue', { count: config.traceCount })
          }
        >
          <Slider
            value={config.traceCount}
            min={0}
            max={10}
            step={1}
            marks
            onChange={(_, val) => handleChange('traceCount', val)}
            valueLabelDisplay="auto"
            disabled={isSentenceMode}
          />
        </SettingsField>

        <SettingsField label={t('charTrace.settings.traceOpacity', { value: config.traceOpacity })}>
          <Slider
            value={config.traceOpacity}
            min={0.1}
            max={1}
            step={0.1}
            onChange={(_, val) => handleChange('traceOpacity', val as number)}
          />
        </SettingsField>

        {isSentenceMode && (
          <SettingsField label={t('charTrace.settings.traceModeLabel')}>
            <FormControl fullWidth size="small">
              <Select
                value={config.traceMode || 'faded'}
                onChange={(e) => handleChange('traceMode', e.target.value)}
              >
                <MenuItem value="faded">{t('charTrace.settings.traceModeFaded')}</MenuItem>
                <MenuItem value="blank">{t('charTrace.settings.traceModeBlank')}</MenuItem>
              </Select>
            </FormControl>
          </SettingsField>
        )}
      </SettingCard>

      {/* ============= ENGLISH 4-LINE ============= */}
      {isEnglishLines && (
        <SettingCard label={t('charTrace.settings.englishSection')} toolColor={candyColors.green}>
          <SettingsField label={t('charTrace.settings.lineTheme')}>
            <FormControl fullWidth size="small">
              <Select
                value={config.englishLineTheme || 'rainbow'}
                onChange={(e) => handleChange('englishLineTheme', e.target.value)}
              >
                <MenuItem value="rainbow">{t('charTrace.settings.lineThemeRainbow')}</MenuItem>
                <MenuItem value="monochrome">{t('charTrace.settings.lineThemeMonochrome')}</MenuItem>
                <MenuItem value="same">{t('charTrace.settings.lineThemeSame')}</MenuItem>
              </Select>
            </FormControl>
          </SettingsField>

          <SettingsField>
            <FormControlLabel
              sx={{ ml: 0 }}
              control={
                <Checkbox
                  checked={config.showLineNumbers || false}
                  onChange={(e) => handleChange('showLineNumbers', e.target.checked)}
                  color="primary"
                  size="small"
                />
              }
              label={<Typography variant="body2">{t('charTrace.settings.showLineNumbers')}</Typography>}
            />
          </SettingsField>

          <SettingsField label={t('charTrace.settings.traceModeLabel')}>
            <FormControl fullWidth size="small">
              <Select
                value={config.traceMode || 'faded'}
                onChange={(e) => handleChange('traceMode', e.target.value)}
              >
                <MenuItem value="faded">{t('charTrace.settings.traceModeFaded')}</MenuItem>
                <MenuItem value="underline">{t('charTrace.settings.traceModeUnderline')}</MenuItem>
                <MenuItem value="blank">{t('charTrace.settings.traceModeBlank')}</MenuItem>
              </Select>
            </FormControl>
          </SettingsField>
        </SettingCard>
      )}

      {/* ============= PAGE SETUP ============= */}
      <SettingCard label={t('charTrace.settings.pageSetup')} toolColor={candyColors.green}>
        <SettingsField label={t('wordSearch.settings.themeColor')}>
          <ColorPicker
            options={THEME_COLOR_OPTIONS}
            value={config.gridColor}
            onChange={(v) =>
              setConfig({ ...config, gridColor: v as string, traceTextColor: v as string })
            }
            size={32}
          />
        </SettingsField>
        <SettingsField>
          <TextField
            label={t('charTrace.settings.pageTitle')}
            fullWidth
            size="small"
            value={config.headerTitle}
            onChange={(e) => handleChange('headerTitle', e.target.value)}
          />
        </SettingsField>
        <SettingsField>
          <TextField
            label={t('charTrace.settings.rightInfo')}
            fullWidth
            size="small"
            value={config.headerContent}
            onChange={(e) => handleChange('headerContent', e.target.value)}
          />
        </SettingsField>

        {!isEnglishLines && (
          <SettingsField>
            <FormControlLabel
              sx={{ ml: 0 }}
              control={
                <Checkbox
                  checked={config.showPinyin}
                  onChange={(e) => handleChange('showPinyin', e.target.checked)}
                  color="primary"
                  size="small"
                />
              }
              label={<Typography variant="body2">{t('charTrace.settings.pinyin')}</Typography>}
            />
          </SettingsField>
        )}
      </SettingCard>
    </>
  );
};
