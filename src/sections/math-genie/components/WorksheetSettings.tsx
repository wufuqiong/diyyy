import type { WorksheetConfig, DifficultyRatios, MultiOperationConfig } from 'src/types';

import { useTranslation } from 'react-i18next';
import React, { useMemo, useState, useEffect } from 'react';

import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import {
  Box,
  Alert,
  Stack,
  Button,
  Slider,
  Switch,
  Tooltip,
  Snackbar,
  TextField,
  Typography,
  Autocomplete,
  ToggleButton,
  FormControlLabel,
  ToggleButtonGroup,
} from '@mui/material';

import { candyColors } from 'src/theme/tokens';
import { derivePageLayout, calculateOptimalProblemsPerPage } from 'src/features/math-genie/shared/layout';
import {
  DisplayMode,
  ProblemType,
  MulDivLevel,
  OperationType,
  DifficultyLevel,
  ComparisonSubType,
  MultiOperationMode,
  SpecialPracticeType,
} from 'src/types';

import { SettingCard } from 'src/sections/_shared/SettingCard';
import { SettingsField } from 'src/sections/_shared/SettingsPanel';

interface Props {
  config: WorksheetConfig;
  onChange: (c: WorksheetConfig) => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
}

const DEFAULT_CONFIG: WorksheetConfig = {
  theme: 'Animals 🐶',
  difficulty: DifficultyLevel.CUSTOM,
  operation: OperationType.ADDITION,
  count: 1,
  textColumns: 2,
  problemsPerPage: calculateOptimalProblemsPerPage({
    displayMode: DisplayMode.TEXT,
    columns: 2,
    problemType: ProblemType.STANDARD,
    specialPracticeType: SpecialPracticeType.NONE,
    operation: OperationType.ADDITION,
    difficulty: DifficultyLevel.CUSTOM,
    customDifficulty: { min: 1, max: 10 },
  }),
  title: 'Fun Math Time!',
  showAnswers: false,
  displayMode: DisplayMode.TEXT,
  customDifficulty: { min: 1, max: 10 },
  difficultyRatios: undefined,
  problemType: ProblemType.STANDARD,
  specialPracticeType: SpecialPracticeType.NONE,
  fillColumnNumbers: true,
  multiOperationConfig: { mode: MultiOperationMode.CHAIN_ADDITION, numberCount: 3 },
  excludeZeroProblems: false,
  autoPreview: true,
};

function calculateMaxUnique(
  maxNum: number,
  operation: OperationType,
  problemType: ProblemType,
  multiOpConfig?: MultiOperationConfig,
): number {
  const minNum = 1;
  if (problemType === ProblemType.MULTI_STEP && multiOpConfig) {
    return Math.max(200, (maxNum - minNum + 1) * multiOpConfig.numberCount * 4);
  }
  let total = 0;
  const isAdd = operation === OperationType.ADDITION || operation === OperationType.MIXED || operation === OperationType.ALL;
  const isSub = operation === OperationType.SUBTRACTION || operation === OperationType.MIXED || operation === OperationType.ALL;
  const isMul = operation === OperationType.MULTIPLICATION || operation === OperationType.MULT_DIV_MIXED || operation === OperationType.ALL;
  const isDiv = operation === OperationType.DIVISION || operation === OperationType.MULT_DIV_MIXED || operation === OperationType.ALL;
  if (isAdd) for (let a = minNum; a < maxNum; a++) for (let b = minNum; b <= maxNum - a; b++) total++;
  if (isSub) for (let a = 2; a <= maxNum; a++) for (let b = minNum; b < a; b++) total++;
  if (isMul) for (let a = 1; a <= maxNum; a++) for (let b = 1; a * b <= maxNum; b++) total++;
  if (isDiv) for (let b = 1; b <= maxNum; b++) for (let c = 0; c <= Math.floor(maxNum / b); c++) total++;
  return Math.max(1, total);
}

type RangeTier = '1-10' | '10-100' | '100-10000';

const RANGE_TIERS: Record<RangeTier, { label: string; min: number; max: number; step: number }> = {
  '1-10': { label: '1–10', min: 1, max: 10, step: 1 },
  '10-100': { label: '10–100', min: 10, max: 100, step: 5 },
  '100-10000': { label: '100–10000', min: 100, max: 10000, step: 100 },
};

function getTierFromRange(_min: number, max: number): RangeTier {
  if (max <= 10) return '1-10';
  if (max <= 100) return '10-100';
  return '100-10000';
}

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
    comparisonConfig,
    mulDivLevel = MulDivLevel.ONE_DIGIT,
  } = config;

  const { t } = useTranslation();

  const activeProblemType = problemType;
  const isSpecialSelected = specialPracticeType !== SpecialPracticeType.NONE;
  const isComparisonSelected = specialPracticeType === SpecialPracticeType.COMPARISON;
  const isNumberBond = specialPracticeType === SpecialPracticeType.NUMBER_BOND;
  const isColumnArithmetic = specialPracticeType === SpecialPracticeType.COLUMN_ARITHMETIC;
  const isMulDiv = operation === OperationType.MULTIPLICATION
    || operation === OperationType.DIVISION
    || operation === OperationType.MULT_DIV_MIXED;
  const hideArithmeticControls = isComparisonSelected || isNumberBond;
  const isEmoji = displayMode === DisplayMode.EMOJI;
  const isWordProblem = displayMode === DisplayMode.WORD_PROBLEM;
  const isMultiOp = activeProblemType === ProblemType.MULTI_STEP;
  const useMixMode = !!difficultyRatios;

  const [snack, setSnack] = useState<{ open: boolean; msg: string }>({ open: false, msg: '' });
  const [emojiLimitConfirm, setEmojiLimitConfirm] = useState<{ open: boolean; pendingDisplayMode?: DisplayMode }>({ open: false });
  const notify = (msg: string) => setSnack({ open: true, msg });

  const [rangeTier, setRangeTier] = useState<RangeTier>(() =>
    getTierFromRange(customDifficulty?.min ?? 1, customDifficulty?.max ?? 10));
  // Keep tier in sync when external changes modify customDifficulty
  useEffect(() => {
    setRangeTier(getTierFromRange(customDifficulty?.min ?? 1, customDifficulty?.max ?? 10));
  }, [customDifficulty?.min, customDifficulty?.max]);

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
    const minNum = customDifficulty?.min ?? 1;
    const maxNum = customDifficulty?.max ?? 10;

    if (activeProblemType === ProblemType.MULTI_STEP) {
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
  }, [operation, multiOperationConfig, customDifficulty]);

  const requestedCount = count * perPage;
  const isExceedingMax = requestedCount > maxPossibleProblems;

  // Suggest a viable maxNumber when the current range can't produce enough problems
  const suggestedMax = useMemo(() => {
    if (!isExceedingMax && maxPossibleProblems >= 4) return null;
    const minViable = Math.max(4, requestedCount);
    const start = Math.max((customDifficulty?.max ?? 10) + 1, 2);
    const upper = Math.min((customDifficulty?.max ?? 100) * 3, 2000);
    for (let m = start; m <= upper; m += m < 100 ? 1 : 10) {
      const countAtM = calculateMaxUnique(m, operation, activeProblemType, multiOperationConfig);
      if (countAtM >= minViable) return m;
    }
    return null;
  }, [isExceedingMax, maxPossibleProblems, requestedCount, customDifficulty, operation, activeProblemType, multiOperationConfig]);

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

  const getEffectiveMax = () => {
    if (difficulty === DifficultyLevel.CUSTOM) return customDifficulty?.max ?? 20;
    return difficulty as number;
  };

  const handleDisplayMode = (next: DisplayMode | null) => {
    if (!next || next === displayMode) return;
    if (next === DisplayMode.EMOJI && getEffectiveMax() > 10) {
      setEmojiLimitConfirm({ open: true, pendingDisplayMode: next });
      return;
    }
    const updates: Partial<WorksheetConfig> = { displayMode: next };
    if (next === DisplayMode.EMOJI && isMultiOp) {
      updates.operation = OperationType.ADDITION;
      notify(t('mathGenie.multiOpNotInEmoji'));
    }
    if (next !== DisplayMode.TEXT) {
      const mulDivOps: OperationType[] = [
        OperationType.MULTIPLICATION,
        OperationType.DIVISION,
        OperationType.MULT_DIV_MIXED,
      ];
      if (mulDivOps.includes(operation)) {
        updates.operation = OperationType.ADDITION;
        notify(t('mathGenie.mulDivNotInMode'));
      }
    }
    if (next === DisplayMode.WORD_PROBLEM) {
      if (activeProblemType === ProblemType.FILL_BLANK) updates.problemType = ProblemType.STANDARD;
      if (isSpecialSelected && !isComparisonSelected) {
        updates.specialPracticeType = SpecialPracticeType.NONE;
      }
      if (isComparisonSelected) {
        updates.comparisonConfig = { subType: ComparisonSubType.DIFFERENCE };
      }
    }
    onChange({ ...config, ...updates });
  };

  const deriveMultiMode = (op: OperationType): MultiOperationMode =>
    op === OperationType.ADDITION ? MultiOperationMode.CHAIN_ADDITION
    : op === OperationType.SUBTRACTION ? MultiOperationMode.CHAIN_SUBTRACTION
    : op === OperationType.MULTIPLICATION ? MultiOperationMode.CHAIN_MULTIPLICATION
    : op === OperationType.DIVISION ? MultiOperationMode.CHAIN_DIVISION
    : op === OperationType.MULT_DIV_MIXED ? MultiOperationMode.MULT_DIV_MIXED_CHAIN
    : op === OperationType.ALL ? MultiOperationMode.ALL_MIXED
    : MultiOperationMode.MIXED_OPERATIONS;

  const handleOperation = (next: OperationType | null) => {
    if (!next || next === operation) return;
    const updates: Partial<WorksheetConfig> = { operation: next };
    if (isMultiOp) {
      updates.multiOperationConfig = { ...config.multiOperationConfig!, mode: deriveMultiMode(next) };
    }
    onChange({ ...config, ...updates });
  };

  const handleProblemType = (next: ProblemType | null) => {
    if (!next || next === activeProblemType) return;
    const updates: Partial<WorksheetConfig> = { problemType: next };
    if (next === ProblemType.MULTI_STEP) {
      if (isEmoji) updates.displayMode = DisplayMode.TEXT;
      if (isSpecialSelected) updates.specialPracticeType = SpecialPracticeType.NONE;
      updates.multiOperationConfig = {
        mode: deriveMultiMode(config.operation),
        numberCount: config.multiOperationConfig?.numberCount ?? 3,
      };
    } else if (activeProblemType === ProblemType.MULTI_STEP) {
      updates.multiOperationConfig = undefined;
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
    if (next === SpecialPracticeType.COMPARISON) {
      updates.comparisonConfig = { subType: ComparisonSubType.MAGNITUDE };
      updates.displayMode = DisplayMode.TEXT;
      if (isMultiOp) updates.operation = OperationType.ADDITION;
    } else if (next === SpecialPracticeType.COLUMN_ARITHMETIC) {
      updates.displayMode = DisplayMode.TEXT;
      updates.textColumns = 3;
      if (isMultiOp) updates.problemType = ProblemType.STANDARD;
    } else if (next === SpecialPracticeType.NUMBER_BOND && displayMode !== DisplayMode.TEXT) {
      updates.displayMode = DisplayMode.TEXT;
    } else {
      if (specialPracticeType === SpecialPracticeType.COMPARISON) {
        updates.comparisonConfig = undefined;
      }
      if (next !== SpecialPracticeType.NONE && isMultiOp) {
        updates.operation = OperationType.ADDITION;
        notify(t('mathGenie.specialNotCompatible'));
      }
    }
    onChange({ ...config, ...updates });
  };

  const handleRangeTier = (tier: RangeTier) => {
    const tierCfg = RANGE_TIERS[tier];
    onChange({
      ...config,
      difficulty: DifficultyLevel.CUSTOM,
      customDifficulty: { min: tierCfg.min, max: tierCfg.max },
    });
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
    onChange({ ...config, difficulty: DifficultyLevel.CUSTOM, customDifficulty: { min, max } });
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
      <SettingCard label={t('mathGenie.exerciseType')} toolColor={candyColors.blue}>
        <SettingsField>
          <ToggleButtonGroup
            value={isComparisonSelected ? SpecialPracticeType.COMPARISON : SpecialPracticeType.NONE}
            exclusive fullWidth size="small"
            onChange={(_, v) => {
              if (!v) return;
              if (v === SpecialPracticeType.COMPARISON) {
                onChange({ ...config, specialPracticeType: SpecialPracticeType.COMPARISON, comparisonConfig: { subType: ComparisonSubType.MAGNITUDE }, displayMode: DisplayMode.TEXT });
              } else {
                onChange({ ...config, specialPracticeType: SpecialPracticeType.NONE, comparisonConfig: undefined, displayMode: DisplayMode.TEXT });
              }
            }}
          >
            <ToggleButton value={SpecialPracticeType.NONE}>{t('mathGenie.arithmetic')}</ToggleButton>
            <ToggleButton value={SpecialPracticeType.COMPARISON}>{t('mathGenie.comparisonPractice')}</ToggleButton>
          </ToggleButtonGroup>
        </SettingsField>
      </SettingCard>

      {isComparisonSelected && (
        <SettingCard label={t('mathGenie.comparisonSubType')} toolColor={candyColors.blue}>
          <SettingsField label={t('mathGenie.comparisonSubType')}>
            <ToggleButtonGroup
              value={comparisonConfig?.subType ?? ComparisonSubType.MAGNITUDE}
              exclusive fullWidth size="small"
              onChange={(_, v) => { if (!v) return; onChange({ ...config, comparisonConfig: { subType: v as ComparisonSubType } }); }}
            >
              <ToggleButton value={ComparisonSubType.MAGNITUDE} disabled={displayMode === DisplayMode.WORD_PROBLEM}>
                {t('mathGenie.comparisonMagnitude')}
              </ToggleButton>
              <ToggleButton value={ComparisonSubType.DIFFERENCE}>
                {t('mathGenie.comparisonDifference')}
              </ToggleButton>
            </ToggleButtonGroup>
          </SettingsField>
        </SettingCard>
      )}

      <SettingCard label={t('mathGenie.sectionDifficulty')} toolColor={candyColors.blue}>
        {isMulDiv ? (
          <SettingsField>
            <ToggleButtonGroup
              value={mulDivLevel} exclusive fullWidth size="small"
              onChange={(_, v) => v && onChange({ ...config, mulDivLevel: v })}
            >
              <ToggleButton value={MulDivLevel.ONE_DIGIT}>{t('mathGenie.oneDigit')}</ToggleButton>
              <ToggleButton value={MulDivLevel.ONE_BY_TWO}>{t('mathGenie.oneByTwo')}</ToggleButton>
              <ToggleButton value={MulDivLevel.TWO_DIGIT}>{t('mathGenie.twoDigit')}</ToggleButton>
              <ToggleButton value={MulDivLevel.THREE_DIGIT}>{t('mathGenie.threeDigit')}</ToggleButton>
            </ToggleButtonGroup>
          </SettingsField>
        ) : (
          <>
            <SettingsField>
              <ToggleButtonGroup
                value={rangeTier} exclusive fullWidth size="small"
                onChange={(_, v) => v && handleRangeTier(v)}
              >
                <ToggleButton value="1-10">1–10</ToggleButton>
                <ToggleButton value="10-100">10–100</ToggleButton>
                <ToggleButton value="100-10000">100–10000</ToggleButton>
              </ToggleButtonGroup>
            </SettingsField>
            <SettingsField caption={t('mathGenie.customRangeHint', { min: customDifficulty?.min ?? 1, max: customDifficulty?.max ?? 10 })}>
              <Slider
                value={[
                  Math.max(RANGE_TIERS[rangeTier].min, customDifficulty?.min ?? 1),
                  Math.min(RANGE_TIERS[rangeTier].max, customDifficulty?.max ?? 10),
                ]}
                onChange={handleCustomRange}
                min={RANGE_TIERS[rangeTier].min}
                max={RANGE_TIERS[rangeTier].max}
                step={RANGE_TIERS[rangeTier].step}
                valueLabelDisplay="auto" disableSwap
              />
            </SettingsField>
          </>
        )}
      </SettingCard>

      <SettingCard label={t('mathGenie.sectionOutput')} toolColor={candyColors.blue}>
              <SettingsField>
                <ToggleButtonGroup
                  value={displayMode}
                  exclusive
                  fullWidth
                  size="small"
                  onChange={(_, v) => handleDisplayMode(v)}
                >
                  <ToggleButton value={DisplayMode.TEXT}>📝 {t('mathGenie.textMode')}</ToggleButton>
                  <ToggleButton value={DisplayMode.EMOJI} disabled={isNumberBond || isColumnArithmetic}>🎨 {t('mathGenie.emojiMode')}</ToggleButton>
                  <ToggleButton value={DisplayMode.WORD_PROBLEM} disabled={isNumberBond || isColumnArithmetic}>📖 {t('mathGenie.wordProblem')}</ToggleButton>
                </ToggleButtonGroup>
              </SettingsField>

              {isEmoji && (
                <SettingsField caption={t('mathGenie.themeHint')}>
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
                      <TextField {...params} label={t('mathGenie.theme')} placeholder="e.g. Pokemon, Cars, Fairies..." />
                    )}
                  />
                </SettingsField>
              )}

              <SettingsField
                label={t('mathGenie.pages')}
                caption={
                  <>
                    {countSettings.label}
                    <br />
                    {t('mathGenie.totalProblems', { count: requestedCount, pages: count, perPage })}
                    {isExceedingMax && (
                      <Box component="span" sx={{ color: 'warning.main', display: 'block' }}>
                        {maxPossibleProblems <= 1
                          ? '⚠️ 当前范围无法生成题目。'
                          : `⚠️ 仅有 ${maxPossibleProblems} 道独立题，超出将重复。`}
                        {suggestedMax && (
                          <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                            {t('mathGenie.suggestRange', { max: suggestedMax })}
                            <Button size="small" sx={{ ml: 1, textTransform: 'none', minWidth: 'auto' }}
                              onClick={() => onChange({ ...config, difficulty: DifficultyLevel.CUSTOM, customDifficulty: { min: 1, max: suggestedMax } })}>
                              {t('mathGenie.switchTo')} 1–{suggestedMax}
                            </Button>
                          </Box>
                        )}
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
              </SettingsField>

              {displayMode === DisplayMode.TEXT && (
                <>
                <SettingsField label={t('mathGenie.columns')}>
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
                </SettingsField>

                <SettingsField
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
                </SettingsField>
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
          </SettingCard>

          {!isComparisonSelected && (
          <SettingCard label={t('mathGenie.sectionProblem')} toolColor={candyColors.blue}>
              {!hideArithmeticControls && (
                <SettingsField>
                  <ToggleButtonGroup
                    value={operation}
                    exclusive fullWidth size="small"
                    onChange={(_, v) => handleOperation(v)}
                  >
                    <ToggleButton value={OperationType.ADDITION}>+</ToggleButton>
                    <ToggleButton value={OperationType.SUBTRACTION}>−</ToggleButton>
                    <ToggleButton value={OperationType.MIXED}>±</ToggleButton>
                    {displayMode === DisplayMode.TEXT && (
                      <>
                        <ToggleButton value={OperationType.MULTIPLICATION}>×</ToggleButton>
                        <ToggleButton value={OperationType.DIVISION}>÷</ToggleButton>
                        <ToggleButton value={OperationType.MULT_DIV_MIXED}>×÷</ToggleButton>
                        <ToggleButton value={OperationType.ALL}>all</ToggleButton>
                      </>
                    )}
                  </ToggleButtonGroup>
                </SettingsField>
              )}

              {!hideArithmeticControls && (
                <SettingsField
                  label={t('mathGenie.problemType')}
                  caption={
                    fillBlankInEmojiOnlyWithSpecial
                      ? t('mathGenie.fillBlankEmojiHint')
                      : undefined
                  }
                >
                  <ToggleButtonGroup
                    value={activeProblemType}
                    exclusive fullWidth size="small"
                    onChange={(_, v) => handleProblemType(v)}
                  >
                    <ToggleButton value={ProblemType.STANDARD}>7 + 3 = 10</ToggleButton>
                    <ToggleButton value={ProblemType.FILL_BLANK} disabled={isColumnArithmetic}>7 + _ = 10</ToggleButton>
                    <ToggleButton value={ProblemType.MULTI_STEP} disabled={isColumnArithmetic || Boolean(multiOpUnavailableReason)}>
                      {t('mathGenie.multiStep')}
                    </ToggleButton>
                  </ToggleButtonGroup>
                </SettingsField>
              )}

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
                  <SettingsField
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
                      disabled={!isMultiOp}
                    />
                  </SettingsField>
                </Box>
              )}

              <SettingsField label={t('mathGenie.specialPractice')}>
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
                  {displayMode === DisplayMode.TEXT && (
                    <Tooltip title={t('mathGenie.columnArithmeticTooltip')} arrow placement="top">
                      <ToggleButton value={SpecialPracticeType.COLUMN_ARITHMETIC}>
                        {t('mathGenie.columnArithmetic')}
                      </ToggleButton>
                    </Tooltip>
                  )}
                </ToggleButtonGroup>
              </SettingsField>

          </SettingCard>
          )}

          <SettingCard label={t('mathGenie.sectionRules')} toolColor={candyColors.blue}>
            <Stack spacing={1}>
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

              {isColumnArithmetic && !isMulDiv && (
                <FormControlLabel
                  sx={{ ml: 0 }}
                  control={
                    <Switch
                      checked={config.excludeCarry || false}
                      onChange={(e) => onChange({ ...config, excludeCarry: e.target.checked })}
                      color="primary"
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">{t('mathGenie.excludeCarry')}</Typography>}
                />
              )}

              {isColumnArithmetic && (
                <FormControlLabel
                  sx={{ ml: 0 }}
                  control={
                    <Switch
                      checked={config.fillColumnNumbers !== false}
                      onChange={(e) => onChange({ ...config, fillColumnNumbers: e.target.checked })}
                      color="primary"
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">{t('mathGenie.fillColumnNumbers')}</Typography>}
                />
              )}
            </Stack>
          </SettingCard>

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

      <Snackbar
        open={emojiLimitConfirm.open}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => setEmojiLimitConfirm({ open: false })}
      >
        <Alert
          severity="warning"
          variant="filled"
          action={
            <Stack direction="row" spacing={1}>
              <Button size="small" color="inherit" onClick={() => {
                const pending = emojiLimitConfirm.pendingDisplayMode;
                setEmojiLimitConfirm({ open: false });
                const updates: Partial<WorksheetConfig> = {};
                if (pending !== undefined) updates.displayMode = pending;
                if (getEffectiveMax() > 10) {
                  updates.customDifficulty = { min: 1, max: 10 };
                  updates.difficulty = DifficultyLevel.CUSTOM;
                }
                if (isMultiOp) updates.operation = OperationType.ADDITION;
                onChange({ ...config, ...updates });
              }}>
                继续（改为10以内）
              </Button>
              <Button size="small" color="inherit" onClick={() => setEmojiLimitConfirm({ open: false })}>
                {t('common.cancel')}
              </Button>
            </Stack>
          }
          sx={{ width: '100%' }}
        >
          数字超过10在图案模式下会显示不全，建议将数字范围限制在10以内。
        </Alert>
      </Snackbar>
    </>
  );
};

export default WorksheetSettings;
