import type { WorksheetConfig, DifficultyRatios } from 'src/types';

import { useTranslation } from 'react-i18next';
import React, { useMemo, useState, useEffect } from 'react';

import {
  Balance as BalanceIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import {
  Box,
  Tab,
  Tabs,
  Alert,
  Stack,
  Button,
  Select,
  Slider,
  Switch,
  Tooltip,
  MenuItem,
  Snackbar,
  TextField,
  Typography,
  FormControl,
  Autocomplete,
  ToggleButton,
  FormControlLabel,
  ToggleButtonGroup,
} from '@mui/material';

import { derivePageLayout, calculateOptimalProblemsPerPage } from 'src/features/math-genie/shared/layout';
import {
  DisplayMode,
  ProblemType,
  OperationType,
  DifficultyLevel,
  MultiOperationMode,
  SpecialPracticeType,
} from 'src/types';

interface Props {
  config: WorksheetConfig;
  onChange: (c: WorksheetConfig) => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
}

const DEFAULT_CONFIG: WorksheetConfig = {
  theme: 'Animals 🐶',
  difficulty: DifficultyLevel.EASY,
  operation: OperationType.ADDITION,
  count: 1,
  textColumns: 2,
  problemsPerPage: calculateOptimalProblemsPerPage({
    displayMode: DisplayMode.TEXT,
    columns: 2,
    problemType: ProblemType.STANDARD,
    specialPracticeType: SpecialPracticeType.NONE,
    operation: OperationType.ADDITION,
    difficulty: DifficultyLevel.EASY,
  }),
  title: 'Fun Math Time!',
  showAnswers: false,
  displayMode: DisplayMode.TEXT,
  customDifficulty: { min: 1, max: 15 },
  difficultyRatios: undefined,
  problemType: ProblemType.STANDARD,
  specialPracticeType: SpecialPracticeType.NONE,
  multiOperationConfig: { mode: MultiOperationMode.CHAIN_ADDITION, numberCount: 3 },
  excludeZeroProblems: false,
  autoPreview: true,
};

const THEME_PRESETS = [
  'Animals 🐶',
  'Vehicles 🚗',
  'Fruits 🍎',
  'Sports ⚽',
  'Food 🍔',
  'Nature 🌸',
  'Weather 🌧️',
  'Emotions 😀',
];

// ---------- Layout helpers ----------

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Typography
    variant="overline"
    sx={{
      display: 'block',
      color: 'text.secondary',
      fontWeight: 700,
      letterSpacing: 0.6,
      lineHeight: 1.4,
    }}
  >
    {children}
  </Typography>
);

const Field = ({
  label,
  caption,
  children,
}: {
  label?: string;
  caption?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Box>
    {label && (
      <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }}>
        {label}
      </Typography>
    )}
    {children}
    {caption && (
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        {caption}
      </Typography>
    )}
  </Box>
);

const MaybeTooltip = ({
  title,
  show,
  children,
}: {
  title: string;
  show: boolean;
  children: React.ReactElement;
}) =>
  show ? (
    <Tooltip title={title} arrow placement="top">
      <span style={{ display: 'inline-flex', flex: 1 }}>{children}</span>
    </Tooltip>
  ) : (
    children
  );

// ---------- Component ----------

const WorksheetSettings: React.FC<Props> = ({
  config,
  onChange,
  onGenerate,
  isGenerating = false,
}) => {
  const {
    theme,
    difficulty,
    operation,
    count,
    textColumns = 2,
    problemsPerPage: configProblemsPerPage = 16,
    excludeZeroProblems = false,
    showAnswers = false,
    displayMode,
    customDifficulty,
    difficultyRatios,
    problemType = ProblemType.STANDARD,
    specialPracticeType = SpecialPracticeType.NONE,
    multiOperationConfig,
    autoPreview = true,
    excludeComparisonProblems = false,
  } = config;

  const { t } = useTranslation();

  const activeProblemType = problemType;
  const isSpecialSelected = specialPracticeType !== SpecialPracticeType.NONE;
  const isEmoji = displayMode === DisplayMode.EMOJI;
  const isWordProblem = displayMode === DisplayMode.WORD_PROBLEM;
  const isMultiOp = operation === OperationType.MULTI_OPERATIONS;
  const useMixMode = !!difficultyRatios;

  const [snack, setSnack] = useState<{ open: boolean; msg: string }>({ open: false, msg: '' });
  const notify = (msg: string) => setSnack({ open: true, msg });

  // ---------- Derived ----------

  const layout = derivePageLayout({ columns: textColumns, problemsPerPage: configProblemsPerPage });
  const perPage = configProblemsPerPage;

  // Auto-update problemsPerPage when config changes affect layout.
  // Only primitive values in deps to avoid infinite loops (excludes config, onChange, configProblemsPerPage).
  useEffect(() => {
    const optimal = calculateOptimalProblemsPerPage({
      displayMode,
      columns: textColumns,
      problemType: activeProblemType,
      specialPracticeType,
      operation,
      difficulty,
      customDifficulty,
      multiOperationConfig,
    });

    if (configProblemsPerPage !== optimal) {
      onChange({ ...config, problemsPerPage: optimal });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    displayMode,
    textColumns,
    activeProblemType,
    specialPracticeType,
    operation,
    difficulty,
    customDifficulty?.min,
    customDifficulty?.max,
    multiOperationConfig?.mode,
    multiOperationConfig?.numberCount,
  ]);
  const countSettings = useMemo(() => {
    if (displayMode === DisplayMode.TEXT) {
      return {
        min: 1,
        max: 10,
        step: 1,
        label: t('mathGenie.pagesCaptionText', { problemsPerPage: layout.problemsPerPage, columns: textColumns }),
      };
    }
    return {
      min: 1,
      max: 10,
      step: 1,
      label: t('mathGenie.pagesCaptionEmoji', { ppp: perPage }),
    };
  }, [displayMode, textColumns, layout.problemsPerPage, perPage, t]);

  const maxPossibleProblems = useMemo(() => {
    let minNum = 1;
    let maxNum = difficulty as number;
    if (difficulty === DifficultyLevel.CUSTOM && customDifficulty) {
      minNum = customDifficulty.min;
      maxNum = customDifficulty.max;
    }

    if (operation === OperationType.MULTI_OPERATIONS) {
      if (multiOperationConfig) {
        const { numberCount, mode } = multiOperationConfig;
        if (mode === MultiOperationMode.CHAIN_ADDITION) {
          const maxSum = Math.min((maxNum * numberCount) / 2, maxNum);
          const minSum = numberCount * minNum;
          return Math.max(100, (maxSum - minSum + 1) * 10);
        }
        if (mode === MultiOperationMode.CHAIN_SUBTRACTION) {
          return Math.max(50, (maxNum - minNum - numberCount * minNum + 1) * 20);
        }
        return Math.max(200, (maxNum - minNum + 1) * 50);
      }
      return 100;
    }

    let add = 0;
    let sub = 0;
    if (operation !== OperationType.SUBTRACTION) {
      for (let a = minNum; a < maxNum; a++) {
        for (let b = minNum; b <= maxNum - a; b++) add++;
      }
    }
    if (operation !== OperationType.ADDITION) {
      for (let a = Math.max(minNum + 1, 2); a <= maxNum; a++) {
        for (let b = minNum; b < a; b++) sub++;
      }
    }
    return add + sub;
  }, [difficulty, operation, multiOperationConfig, customDifficulty]);

  const requestedCount = count * perPage;
  const isExceedingMax = requestedCount > maxPossibleProblems;

  const ratioTotal = difficultyRatios
    ? difficultyRatios.easy + difficultyRatios.medium + difficultyRatios.hard + difficultyRatios.custom
    : 0;

  // ---------- Constraint reasons ----------

  const multiOpUnavailableReason = (() => {
    const reasons: string[] = [];
    if (isEmoji) reasons.push(t('mathGenie.emojiMode'));
    if (activeProblemType === ProblemType.FILL_BLANK) reasons.push(t('mathGenie.fillBlank'));
    if (isSpecialSelected) reasons.push(t('mathGenie.specialPractice'));
    return reasons.length ? t('mathGenie.multiOpDisabled', { reasons: reasons.join(', ') }) : '';
  })();

  const fillBlankInEmojiOnlyWithSpecial =
    (isEmoji || isWordProblem) && activeProblemType === ProblemType.FILL_BLANK && !isSpecialSelected;

  // ---------- Handlers ----------

  const handleDisplayMode = (next: DisplayMode | null) => {
    if (!next || next === displayMode) return;
    const updates: Partial<WorksheetConfig> = { displayMode: next };
    if (next === DisplayMode.EMOJI && isMultiOp) {
      updates.operation = OperationType.ADDITION;
      notify(t('mathGenie.multiOpNotInEmoji'));
    }
    if (next === DisplayMode.WORD_PROBLEM) {
      if (activeProblemType === ProblemType.FILL_BLANK) updates.problemType = ProblemType.STANDARD;
      if (isSpecialSelected && specialPracticeType !== SpecialPracticeType.WORD_PROBLEM_COMPARISON) {
        updates.specialPracticeType = SpecialPracticeType.NONE;
      }
    }
    if (next !== DisplayMode.WORD_PROBLEM && specialPracticeType === SpecialPracticeType.WORD_PROBLEM_COMPARISON) {
      updates.specialPracticeType = SpecialPracticeType.NONE;
    }
    onChange({ ...config, ...updates });
  };

  const handleOperation = (next: OperationType | null) => {
    if (!next || next === operation) return;
    const updates: Partial<WorksheetConfig> = { operation: next };
    if (next === OperationType.MULTI_OPERATIONS) {
      const fixes: string[] = [];
      if (isEmoji) {
        updates.displayMode = DisplayMode.TEXT;
        fixes.push('Display = Text');
      }
      if (activeProblemType === ProblemType.FILL_BLANK) {
        updates.problemType = ProblemType.STANDARD;
        fixes.push('Problem = Standard');
      }
      if (isSpecialSelected) {
        updates.specialPracticeType = SpecialPracticeType.NONE;
        fixes.push('Special = None');
      }
      if (fixes.length) notify(t('mathGenie.multiOpEnabled', { fixes: fixes.join(', ') }));
    }
    onChange({ ...config, ...updates });
  };

  const handleProblemType = (next: ProblemType | null) => {
    if (!next || next === activeProblemType) return;
    const updates: Partial<WorksheetConfig> = { problemType: next };
    if (next === ProblemType.FILL_BLANK && isMultiOp) {
      updates.operation = OperationType.ADDITION;
      notify(t('mathGenie.fillBlankNotCompatible'));
    }
    onChange({ ...config, ...updates });
  };

  const handleSpecial = (next: SpecialPracticeType | null) => {
    if (!next || next === specialPracticeType) return;
    if (next === SpecialPracticeType.ZERO_DRILL && excludeZeroProblems) {
      notify(t('mathGenie.zeroDrillDisabled'));
      return;
    }
    const updates: Partial<WorksheetConfig> = { specialPracticeType: next };
    if (next === SpecialPracticeType.WORD_PROBLEM_COMPARISON) {
      updates.displayMode = DisplayMode.WORD_PROBLEM;
      if (isMultiOp) updates.operation = OperationType.MIXED;
    } else {
      if (specialPracticeType === SpecialPracticeType.WORD_PROBLEM_COMPARISON) {
        updates.displayMode = DisplayMode.TEXT;
      }
      if (next !== SpecialPracticeType.NONE && isMultiOp) {
        updates.operation = OperationType.ADDITION;
        notify(t('mathGenie.specialNotCompatible'));
      }
    }
    onChange({ ...config, ...updates });
  };

  const handleDifficulty = (next: DifficultyLevel | null) => {
    if (next === null) return;
    const updates: Partial<WorksheetConfig> = { difficulty: next };
    if (useMixMode) {
      updates.difficultyRatios = undefined;
    }
    onChange({ ...config, ...updates });
  };

  const handleMixModeTab = (_: React.SyntheticEvent, newValue: 'single' | 'mix') => {
    if (newValue === 'mix') {
      const ratios = difficultyRatios && ratioTotal > 0
        ? difficultyRatios
        : { easy: 25, medium: 25, hard: 25, custom: 25 };
      onChange({ ...config, difficultyRatios: ratios });
    } else {
      onChange({ ...config, difficultyRatios: undefined });
    }
  };

  const handleExcludeZero = (checked: boolean) => {
    const updates: Partial<WorksheetConfig> = { excludeZeroProblems: checked };
    if (checked && specialPracticeType === SpecialPracticeType.ZERO_DRILL) {
      updates.specialPracticeType = SpecialPracticeType.NONE;
      notify(t('mathGenie.zeroDrillTurnedOff'));
    }
    onChange({ ...config, ...updates });
  };

  const handleExcludeComparison = (checked: boolean) => {
    const updates: Partial<WorksheetConfig> = { excludeComparisonProblems: checked };
    if (checked && specialPracticeType === SpecialPracticeType.WORD_PROBLEM_COMPARISON) {
      updates.specialPracticeType = SpecialPracticeType.NONE;
    }
    onChange({ ...config, ...updates });
  };

  const handleCount = (val: number) => {
    const step = countSettings.step;
    const rounded = Math.round(val / step) * step;
    const newCount = Math.max(countSettings.min, Math.min(countSettings.max, rounded));
    onChange({ ...config, count: newCount });
  };

  const handleCustomRange = (_: Event, val: number | number[]) => {
    if (!Array.isArray(val)) return;
    const [min, max] = val;
    if (max <= min) return;
    onChange({ ...config, customDifficulty: { min, max } });
  };

  const handleRatio = (k: keyof DifficultyRatios, v: number) => {
    if (!difficultyRatios) return;
    onChange({
      ...config,
      difficultyRatios: { ...difficultyRatios, [k]: Math.max(0, Math.min(100, v)) },
    });
  };

  const normalizeRatios = () => {
    if (!difficultyRatios || ratioTotal === 0) return;
    const factor = 100 / ratioTotal;
    const easy = Math.round(difficultyRatios.easy * factor);
    const medium = Math.round(difficultyRatios.medium * factor);
    const hard = Math.round(difficultyRatios.hard * factor);
    const custom = 100 - easy - medium - hard;
    onChange({ ...config, difficultyRatios: { easy, medium, hard, custom } });
  };

  // ---------- Render ----------

  return (
    <>
      {/* Scrollable body */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
        <Stack spacing={3.5}>
          {/* ============= OUTPUT ============= */}
          <Box>
            <SectionTitle>{t('mathGenie.output')}</SectionTitle>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Field label={t('mathGenie.displayMode')}>
                <ToggleButtonGroup
                  value={displayMode}
                  exclusive
                  fullWidth
                  size="small"
                  onChange={(_, v) => handleDisplayMode(v)}
                >
                  <ToggleButton value={DisplayMode.TEXT}>📝 {t('mathGenie.textMode')}</ToggleButton>
                  <ToggleButton value={DisplayMode.EMOJI}>🎨 {t('mathGenie.emojiMode')}</ToggleButton>
                  <ToggleButton value={DisplayMode.WORD_PROBLEM}>📖 {t('mathGenie.wordProblem')}</ToggleButton>
                </ToggleButtonGroup>
              </Field>

              {isEmoji && (
                <Field
                  label={t('mathGenie.theme')}
                  caption={t('mathGenie.themeHint')}
                >
                  <Autocomplete
                    freeSolo
                    size="small"
                    value={theme}
                    options={THEME_PRESETS}
                    onInputChange={(_, v) => {
                      // Strip emoji suffix from preset labels, lowercase for dictionary lookup
                      onChange({ ...config, theme: v.split(' ')[0].toLowerCase() });
                    }}
                    renderInput={(params) => (
                      <TextField {...params} placeholder="e.g. Pokemon, Cars, Fairies..." />
                    )}
                  />
                </Field>
              )}

              <Field
                label={t('mathGenie.pages')}
                caption={
                  <>
                    {countSettings.label}
                    <br />
                    {t('mathGenie.totalProblems', { count: requestedCount, pages: count, perPage })}
                    {isExceedingMax && (
                      <Box component="span" sx={{ color: 'warning.main', display: 'block' }}>
                        ⚠️ Max unique: {maxPossibleProblems}. Some will repeat.
                      </Box>
                    )}
                  </>
                }
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Slider
                    value={count}
                    onChange={(_, v) => handleCount(v as number)}
                    min={countSettings.min}
                    max={countSettings.max}
                    step={countSettings.step}
                    marks
                    valueLabelDisplay="auto"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    value={count}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v)) handleCount(v);
                    }}
                    type="number"
                    size="small"
                    sx={{ width: 72 }}
                    inputProps={{
                      min: countSettings.min,
                      max: countSettings.max,
                      step: countSettings.step,
                    }}
                  />
                </Stack>
              </Field>

              {displayMode === DisplayMode.TEXT && (
                <>
                <Field label={t('mathGenie.columns')}>
                  <ToggleButtonGroup
                    value={textColumns}
                    exclusive
                    fullWidth
                    size="small"
                    onChange={(_, v) => {
                      if (!v || (v as 2 | 3) === textColumns) return;
                      onChange({ ...config, textColumns: v as 2 | 3 });
                    }}
                  >
                    <ToggleButton value={2}>2</ToggleButton>
                    <ToggleButton value={3}>3</ToggleButton>
                  </ToggleButtonGroup>
                </Field>

                <Field
                  label={t('mathGenie.problemsPerPage')}
                  caption={`${layout.rows} ${t('mathGenie.rowsPerPage')}${layout.rowHeight < 14 ? ' — ' + t('mathGenie.rowTooSmall') : ''}`}
                >
                  <Slider
                    value={configProblemsPerPage}
                    onChange={(_, v) => onChange({ ...config, problemsPerPage: v as number })}
                    min={textColumns}
                    max={30}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Field>
                </>
              )}

              <FormControlLabel
                sx={{ ml: 0 }}
                control={
                  <Switch
                    checked={showAnswers}
                    onChange={(e) => onChange({ ...config, showAnswers: e.target.checked })}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {showAnswers ? (
                      <VisibilityIcon fontSize="small" />
                    ) : (
                      <VisibilityOffIcon fontSize="small" />
                    )}
                    <Typography variant="body2">
                      {t('mathGenie.showAnswers')} {showAnswers ? '' : t('mathGenie.showAnswersOff')}
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </Box>

          {/* ============= PROBLEM ============= */}
          <Box>
            <SectionTitle>{t('mathGenie.problem')}</SectionTitle>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Field label={t('mathGenie.operation')}>
                <ToggleButtonGroup
                  value={operation}
                  exclusive
                  fullWidth
                  size="small"
                  onChange={(_, v) => handleOperation(v)}
                >
                  <ToggleButton value={OperationType.ADDITION}>+</ToggleButton>
                  <ToggleButton value={OperationType.SUBTRACTION}>−</ToggleButton>
                  <ToggleButton value={OperationType.MIXED}>±</ToggleButton>
                  <MaybeTooltip
                    title={multiOpUnavailableReason}
                    show={Boolean(multiOpUnavailableReason)}
                  >
                    <ToggleButton
                      value={OperationType.MULTI_OPERATIONS}
                      disabled={Boolean(multiOpUnavailableReason)}
                    >
                      {t('mathGenie.multi')}
                    </ToggleButton>
                  </MaybeTooltip>
                </ToggleButtonGroup>
              </Field>

              <Field
                label={t('mathGenie.problemType')}
                caption={
                  fillBlankInEmojiOnlyWithSpecial
                    ? t('mathGenie.fillBlankEmojiHint')
                    : undefined
                }
              >
                <ToggleButtonGroup
                  value={activeProblemType}
                  exclusive
                  fullWidth
                  size="small"
                  onChange={(_, v) => handleProblemType(v)}
                >
                  <ToggleButton value={ProblemType.STANDARD}>7 + 3 = 10</ToggleButton>
                  <ToggleButton value={ProblemType.FILL_BLANK}>7 + _ = 10</ToggleButton>
                </ToggleButtonGroup>
              </Field>

              <Field label={t('mathGenie.specialPractice')}>
                <ToggleButtonGroup
                  value={specialPracticeType}
                  exclusive
                  fullWidth
                  size="small"
                  onChange={(_, v) => handleSpecial(v)}
                >
                  <ToggleButton value={SpecialPracticeType.NONE}>{t('mathGenie.none')}</ToggleButton>
                  <MaybeTooltip
                    title={t('mathGenie.zeroDrillDisabled')}
                    show={excludeZeroProblems}
                  >
                    <Tooltip title={t('mathGenie.zeroDrillTooltip')} arrow placement="top">
                      <ToggleButton
                        value={SpecialPracticeType.ZERO_DRILL}
                        disabled={excludeZeroProblems}
                      >
                        {t('mathGenie.zero')}
                      </ToggleButton>
                    </Tooltip>
                  </MaybeTooltip>
                  <Tooltip title={t('mathGenie.factFamilyTooltip')} arrow placement="top">
                    <ToggleButton value={SpecialPracticeType.FACT_FAMILY}>{t('mathGenie.factFamily')}</ToggleButton>
                  </Tooltip>
                  <Tooltip title={t('mathGenie.numberBondTooltip')} arrow placement="top">
                    <ToggleButton value={SpecialPracticeType.NUMBER_BOND}>{t('mathGenie.numberBond')}</ToggleButton>
                  </Tooltip>
                  <MaybeTooltip
                    title={t('mathGenie.excludeComparisonDisabled')}
                    show={excludeComparisonProblems}
                  >
                    <Tooltip title={t('mathGenie.comparisonTooltip')} arrow placement="top">
                      <ToggleButton
                        value={SpecialPracticeType.WORD_PROBLEM_COMPARISON}
                      disabled={excludeComparisonProblems}
                    >
                      {t('mathGenie.comparison')}
                    </ToggleButton>
                    </Tooltip>
                  </MaybeTooltip>
                </ToggleButtonGroup>
              </Field>

              {isMultiOp && multiOperationConfig && (
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'grey.200',
                  }}
                >
                  <Stack spacing={2}>
                    <Field label={t('mathGenie.mode')}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={multiOperationConfig.mode}
                          onChange={(e) =>
                            onChange({
                              ...config,
                              multiOperationConfig: {
                                ...multiOperationConfig,
                                mode: e.target.value as MultiOperationMode,
                              },
                            })
                          }
                        >
                          <MenuItem value={MultiOperationMode.CHAIN_ADDITION}>
                            {t('mathGenie.chainAddition')}
                          </MenuItem>
                          <MenuItem value={MultiOperationMode.CHAIN_SUBTRACTION}>
                            {t('mathGenie.chainSubtraction')}
                          </MenuItem>
                          <MenuItem value={MultiOperationMode.MIXED_OPERATIONS}>
                            {t('mathGenie.mixedOperations')}
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Field>
                    <Field
                      label={`${t('mathGenie.operands')}: ${multiOperationConfig.numberCount}`}
                      caption={t('mathGenie.moreOperands')}
                    >
                      <Slider
                        value={multiOperationConfig.numberCount}
                        onChange={(_, v) =>
                          onChange({
                            ...config,
                            multiOperationConfig: {
                              ...multiOperationConfig,
                              numberCount: v as number,
                            },
                          })
                        }
                        min={3}
                        max={6}
                        step={1}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Field>
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>

          {/* ============= DIFFICULTY ============= */}
          <Box>
            <SectionTitle>{t('mathGenie.difficulty')}</SectionTitle>
            <Tabs
              value={useMixMode ? 'mix' : 'single'}
              onChange={handleMixModeTab}
              variant="fullWidth"
              sx={{ mt: 0.5, minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0.5 } }}
            >
              <Tab value="single" label={t('mathGenie.single')} />
              <Tab value="mix" label={t('mathGenie.mix')} />
            </Tabs>

            <Stack spacing={2} sx={{ mt: 2 }}>
              {!useMixMode && (
                <ToggleButtonGroup
                  value={difficulty}
                  exclusive
                  fullWidth
                  size="small"
                  onChange={(_, v) => handleDifficulty(v)}
                >
                  <ToggleButton value={DifficultyLevel.EASY}>1–5</ToggleButton>
                  <ToggleButton value={DifficultyLevel.MEDIUM}>1–10</ToggleButton>
                  <ToggleButton value={DifficultyLevel.HARD}>1–20</ToggleButton>
                  <ToggleButton value={DifficultyLevel.CUSTOM}>{t('mathGenie.custom')}</ToggleButton>
                </ToggleButtonGroup>
              )}

              {!useMixMode && difficulty === DifficultyLevel.CUSTOM && (
                <Field
                  label={t('mathGenie.customRange')}
                  caption={t('mathGenie.customRangeHint', { min: customDifficulty?.min ?? 1, max: customDifficulty?.max ?? 20 })}
                >
                  <Slider
                    value={[customDifficulty?.min ?? 1, customDifficulty?.max ?? 20]}
                    onChange={handleCustomRange}
                    min={1}
                    max={100}
                    step={1}
                    valueLabelDisplay="auto"
                    disableSwap
                  />
                </Field>
              )}

              {useMixMode && difficultyRatios && (
                <Box>
                  <Stack spacing={1.25}>
                    {(['easy', 'medium', 'hard', 'custom'] as const).map((k) => (
                      <Stack key={k} direction="row" spacing={1.5} alignItems="center">
                        <Typography variant="body2" sx={{ width: 60, textTransform: 'capitalize' }}>
                          {k}
                        </Typography>
                        <Slider
                          value={difficultyRatios[k]}
                          onChange={(_, v) => handleRatio(k, v as number)}
                          min={0}
                          max={100}
                          valueLabelDisplay="auto"
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          value={difficultyRatios[k]}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            if (!isNaN(v)) handleRatio(k, v);
                          }}
                          type="number"
                          size="small"
                          sx={{ width: 60 }}
                          inputProps={{ min: 0, max: 100 }}
                        />
                      </Stack>
                    ))}
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mt: 1 }}
                  >
                    <Typography variant="caption" color={ratioTotal === 100 ? 'text.secondary' : 'warning.main'}>
                      {t('mathGenie.totalPercent')}: {ratioTotal}% {ratioTotal !== 100 && '⚠️'}
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<BalanceIcon />}
                      onClick={normalizeRatios}
                      disabled={ratioTotal === 100 || ratioTotal === 0}
                      sx={{ textTransform: 'none' }}
                    >
                      {t('mathGenie.normalize')}
                    </Button>
                  </Stack>
                  {difficultyRatios.custom > 0 && customDifficulty && (
                    <Field
                      label={t('mathGenie.customRange')}
                      caption={t('mathGenie.customRangeHint', { min: customDifficulty.min, max: customDifficulty.max })}
                    >
                      <Slider
                        value={[customDifficulty.min, customDifficulty.max]}
                        onChange={handleCustomRange}
                        min={1}
                        max={100}
                        step={1}
                        valueLabelDisplay="auto"
                        disableSwap
                      />
                    </Field>
                  )}
                </Box>
              )}
            </Stack>
          </Box>

          {/* ============= RULES ============= */}
          <Box>
            <SectionTitle>{t('mathGenie.rules')}</SectionTitle>
            <Stack spacing={1} sx={{ mt: 1 }}>
              <FormControlLabel
                sx={{ ml: 0 }}
                control={
                  <Switch
                    checked={excludeZeroProblems}
                    onChange={(e) => handleExcludeZero(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label={<Typography variant="body2">{t('mathGenie.excludeZeros')}</Typography>}
              />
              <Typography variant="caption" color="text.secondary">
                {t('mathGenie.excludeZerosHint')}
              </Typography>

              {isWordProblem && (
                <FormControlLabel
                  sx={{ ml: 0 }}
                  control={
                    <Switch
                      checked={excludeComparisonProblems}
                      onChange={(e) => handleExcludeComparison(e.target.checked)}
                      color="primary"
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">{t('mathGenie.excludeComparison')}</Typography>}
                />
              )}
            </Stack>
          </Box>

          <Box>
            <SectionTitle>{t('mathGenie.preview')}</SectionTitle>
            <Stack spacing={1} sx={{ mt: 1 }}>
              <FormControlLabel
                sx={{ ml: 0, mr: 0 }}
                control={
                  <Switch
                    checked={autoPreview}
                    onChange={(e) => onChange({ ...config, autoPreview: e.target.checked })}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {t('mathGenie.autoPreview')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {autoPreview ? t('mathGenie.autoPreviewOn') : t('mathGenie.autoPreviewOff')}
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={() => setSnack({ ...snack, open: false })}
          sx={{ width: '100%' }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default WorksheetSettings;
