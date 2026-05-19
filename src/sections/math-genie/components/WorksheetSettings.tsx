// src/sections/math-genie/components/WorksheetSettings.tsx
import React, { useMemo, useState } from 'react';

import {
  AutoFixHigh as WandIcon,
  Balance as BalanceIcon,
  Print as PrintIcon,
  RestartAlt as ResetIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Snackbar,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';

import {
  CustomDifficultyRange,
  DifficultyLevel,
  DifficultyRatios,
  DisplayMode,
  MultiOperationConfig,
  MultiOperationMode,
  OperationType,
  ProblemType,
  SpecialPracticeType,
} from 'src/types';

interface Props {
  theme: string;
  setTheme: (t: string) => void;
  difficulty: DifficultyLevel;
  setDifficulty: (d: DifficultyLevel) => void;
  operation: OperationType;
  setOperation: (o: OperationType) => void;
  count: number;
  setCount: (c: number) => void;
  textColumns?: 2 | 3 | 4;
  setTextColumns?: (c: 2 | 3 | 4) => void;
  excludeZeroProblems: boolean;
  setExcludeZeroProblems: (v: boolean) => void;
  showAnswers: boolean;
  setShowAnswers: (s: boolean) => void;
  displayMode: DisplayMode;
  setDisplayMode: (d: DisplayMode) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  onPrint: () => void;
  customDifficulty?: CustomDifficultyRange;
  setCustomDifficulty?: (c: CustomDifficultyRange) => void;
  difficultyRatios?: DifficultyRatios;
  setDifficultyRatios?: (r: DifficultyRatios) => void;
  useMixMode: boolean;
  setUseMixMode: (m: boolean) => void;
  problemType?: ProblemType;
  setProblemType?: (p: ProblemType) => void;
  specialPracticeType: SpecialPracticeType;
  setSpecialPracticeType: (s: SpecialPracticeType) => void;
  multiOperationConfig?: MultiOperationConfig;
  setMultiOperationConfig?: (c: MultiOperationConfig) => void;
  autoPreview: boolean;
  setAutoPreview: (v: boolean) => void;
  onResetConfig: () => void;
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

const getTextRowsPerPage = (columns: 2 | 3 | 4): number => {
  if (columns === 4) return 6;
  if (columns === 3) return 7;
  return 8;
};

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

// Tooltip wrapper that works on disabled ToggleButton
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
  theme,
  setTheme,
  difficulty,
  setDifficulty,
  operation,
  setOperation,
  count,
  setCount,
  textColumns = 2,
  setTextColumns,
  excludeZeroProblems,
  setExcludeZeroProblems,
  showAnswers,
  setShowAnswers,
  displayMode,
  setDisplayMode,
  isGenerating,
  onGenerate,
  onPrint,
  customDifficulty,
  setCustomDifficulty,
  difficultyRatios,
  setDifficultyRatios,
  useMixMode,
  setUseMixMode,
  problemType,
  setProblemType,
  specialPracticeType,
  setSpecialPracticeType,
  multiOperationConfig,
  setMultiOperationConfig,
  autoPreview,
  setAutoPreview,
  onResetConfig,
}) => {
  const activeProblemType = problemType || ProblemType.STANDARD;
  const isSpecialSelected = specialPracticeType !== SpecialPracticeType.NONE;
  const isEmoji = displayMode === DisplayMode.EMOJI;
  const isMultiOp = operation === OperationType.MULTI_OPERATIONS;

  const textRowsPerPage = getTextRowsPerPage(textColumns);
  const textProblemsPerPage = textColumns * textRowsPerPage;

  const [snack, setSnack] = useState<{ open: boolean; msg: string }>({ open: false, msg: '' });
  const notify = (msg: string) => setSnack({ open: true, msg });

  // ---------- Derived ----------

  const EMOJI_PROBLEMS_PER_PAGE = 6;
  const perPage = displayMode === DisplayMode.TEXT ? textProblemsPerPage : EMOJI_PROBLEMS_PER_PAGE;
  const countSettings = useMemo(() => {
    if (displayMode === DisplayMode.TEXT) {
      return {
        min: 1,
        max: 10,
        step: 1,
        label: `Pages (up to ${textProblemsPerPage} problems / page at ${textColumns} columns)`,
      };
    }
    return {
      min: 1,
      max: 10,
      step: 1,
      label: `Pages (${EMOJI_PROBLEMS_PER_PAGE} problems / page)`,
    };
  }, [displayMode, textColumns, textProblemsPerPage]);

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

  const ratioTotal =
    (difficultyRatios?.easy ?? 0) +
    (difficultyRatios?.medium ?? 0) +
    (difficultyRatios?.hard ?? 0) +
    (difficultyRatios?.custom ?? 0);

  // ---------- Constraint reasons (for tooltips) ----------

  const multiOpUnavailableReason = (() => {
    const reasons: string[] = [];
    if (isEmoji) reasons.push('Emoji mode');
    if (activeProblemType === ProblemType.FILL_BLANK) reasons.push('Fill Blank');
    if (isSpecialSelected) reasons.push('Special Practice');
    return reasons.length ? `Disabled while using: ${reasons.join(', ')}` : '';
  })();

  const fillBlankInEmojiOnlyWithSpecial =
    isEmoji && activeProblemType === ProblemType.FILL_BLANK && !isSpecialSelected;

  // ---------- Handlers (auto-fix + notify) ----------

  const handleDisplayMode = (next: DisplayMode | null) => {
    if (!next || next === displayMode) return;
    setDisplayMode(next);
    if (next === DisplayMode.EMOJI && isMultiOp) {
      setOperation(OperationType.ADDITION);
      notify('Switched to Addition: Multi-Operations not available in Emoji mode.');
    }
  };

  const handleOperation = (next: OperationType | null) => {
    if (!next || next === operation) return;
    if (next === OperationType.MULTI_OPERATIONS) {
      const fixes: string[] = [];
      if (isEmoji) {
        setDisplayMode(DisplayMode.TEXT);
        fixes.push('Display = Text');
      }
      if (activeProblemType === ProblemType.FILL_BLANK && setProblemType) {
        setProblemType(ProblemType.STANDARD);
        fixes.push('Problem = Standard');
      }
      if (isSpecialSelected) {
        setSpecialPracticeType(SpecialPracticeType.NONE);
        fixes.push('Special = None');
      }
      if (fixes.length) notify(`Multi-Operations enabled: ${fixes.join(', ')}.`);
    }
    setOperation(next);
  };

  const handleProblemType = (next: ProblemType | null) => {
    if (!next || !setProblemType || next === activeProblemType) return;
    setProblemType(next);
    if (next === ProblemType.FILL_BLANK) {
      if (isMultiOp) {
        setOperation(OperationType.ADDITION);
        notify('Switched to Addition: Fill Blank not compatible with Multi-Operations.');
      }
    }
  };

  const handleSpecial = (next: SpecialPracticeType | null) => {
    if (!next || next === specialPracticeType) return;
    if (next === SpecialPracticeType.ZERO_DRILL && excludeZeroProblems) {
      notify('Zero Drill is disabled while "Exclude all zeros" is on.');
      return;
    }
    setSpecialPracticeType(next);
    if (next !== SpecialPracticeType.NONE) {
      if (isMultiOp) {
        setOperation(OperationType.ADDITION);
        notify('Switched to Addition: Special Practice not compatible with Multi-Operations.');
      }
    }
  };

  const handleDifficulty = (next: DifficultyLevel | null) => {
    if (next === null) return;
    setDifficulty(next);
    if (useMixMode) setUseMixMode(false);
  };

  const handleMixModeTab = (_: React.SyntheticEvent, newValue: 'single' | 'mix') => {
    if (newValue === 'mix') {
      setUseMixMode(true);
      if (setDifficultyRatios && (!difficultyRatios || ratioTotal === 0)) {
        setDifficultyRatios({ easy: 25, medium: 25, hard: 25, custom: 25 });
      }
    } else {
      setUseMixMode(false);
    }
  };

  const handleExcludeZero = (checked: boolean) => {
    setExcludeZeroProblems(checked);
    if (checked && specialPracticeType === SpecialPracticeType.ZERO_DRILL) {
      setSpecialPracticeType(SpecialPracticeType.NONE);
      notify('Zero Drill turned off because all-zero problems are excluded.');
    }
  };

  const handleCount = (val: number) => {
    const step = countSettings.step;
    const rounded = Math.round(val / step) * step;
    setCount(Math.max(countSettings.min, Math.min(countSettings.max, rounded)));
  };

  const handleCustomRange = (_: Event, val: number | number[]) => {
    if (!Array.isArray(val) || !setCustomDifficulty) return;
    const [min, max] = val;
    if (max <= min) return;
    setCustomDifficulty({ min, max });
  };

  const handleRatio = (k: keyof DifficultyRatios, v: number) => {
    if (!setDifficultyRatios || !difficultyRatios) return;
    setDifficultyRatios({ ...difficultyRatios, [k]: Math.max(0, Math.min(100, v)) });
  };

  const normalizeRatios = () => {
    if (!setDifficultyRatios || !difficultyRatios || ratioTotal === 0) return;
    const factor = 100 / ratioTotal;
    const easy = Math.round(difficultyRatios.easy * factor);
    const medium = Math.round(difficultyRatios.medium * factor);
    const hard = Math.round(difficultyRatios.hard * factor);
    const custom = 100 - easy - medium - hard;
    setDifficultyRatios({ easy, medium, hard, custom });
  };

  // ---------- Render ----------

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        borderRight: '1px solid',
        borderColor: 'grey.200',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ px: 3, pt: 3, pb: 2 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 0.5,
          }}
        >
          MathGenie
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Create custom math worksheets in seconds.
        </Typography>
      </Box>

      <Divider />

      {/* Scrollable body */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
        <Stack spacing={3.5}>
          {/* ============= OUTPUT ============= */}
          <Box>
            <SectionTitle>Output</SectionTitle>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Field label="Display Mode">
                <ToggleButtonGroup
                  value={displayMode}
                  exclusive
                  fullWidth
                  size="small"
                  onChange={(_, v) => handleDisplayMode(v)}
                >
                  <ToggleButton value={DisplayMode.TEXT}>📝 Text</ToggleButton>
                  <ToggleButton value={DisplayMode.EMOJI}>🎨 Emoji</ToggleButton>
                </ToggleButtonGroup>
              </Field>

              {isEmoji && (
                <Field
                  label="Theme"
                  caption="Tip: Chinese themes (中文) produce Chinese titles."
                >
                  <Autocomplete
                    freeSolo
                    size="small"
                    value={theme}
                    options={THEME_PRESETS}
                    onChange={(_, v) => setTheme(typeof v === 'string' ? v.split(' ')[0] : '')}
                    onInputChange={(_, v) => setTheme(v)}
                    renderInput={(params) => (
                      <TextField {...params} placeholder="e.g. Pokemon, Cars, Fairies..." />
                    )}
                  />
                </Field>
              )}

              <Field
                label="Number of Pages"
                caption={
                  <>
                    {countSettings.label}
                    <br />
                    Total: {requestedCount} problems ({count} page{count > 1 ? 's' : ''} × {perPage})
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
                <Field label="Columns Per Page">
                  <ToggleButtonGroup
                    value={textColumns}
                    exclusive
                    fullWidth
                    size="small"
                    onChange={(_, v) => v && setTextColumns?.(v as 2 | 3 | 4)}
                  >
                    <ToggleButton value={2}>2</ToggleButton>
                    <ToggleButton value={3}>3</ToggleButton>
                    <ToggleButton value={4}>4</ToggleButton>
                  </ToggleButtonGroup>
                </Field>
              )}

              <FormControlLabel
                sx={{ ml: 0 }}
                control={
                  <Switch
                    checked={showAnswers}
                    onChange={(e) => setShowAnswers(e.target.checked)}
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
                      Show Answers {showAnswers ? '' : '(blank boxes)'}
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </Box>

          {/* ============= PROBLEM ============= */}
          <Box>
            <SectionTitle>Problem</SectionTitle>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Field label="Operation">
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
                      Multi
                    </ToggleButton>
                  </MaybeTooltip>
                </ToggleButtonGroup>
              </Field>

              <Field
                label="Problem Type"
                caption={
                  fillBlankInEmojiOnlyWithSpecial
                    ? '⚠️ Fill Blank in Emoji mode requires a Special Practice.'
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

              <Field label="Special Practice">
                <ToggleButtonGroup
                  value={specialPracticeType}
                  exclusive
                  fullWidth
                  size="small"
                  onChange={(_, v) => handleSpecial(v)}
                >
                  <ToggleButton value={SpecialPracticeType.NONE}>None</ToggleButton>
                  <MaybeTooltip
                    title='Disabled while "Exclude all zeros" is on.'
                    show={excludeZeroProblems}
                  >
                    <ToggleButton
                      value={SpecialPracticeType.ZERO_DRILL}
                      disabled={excludeZeroProblems}
                    >
                      Zero
                    </ToggleButton>
                  </MaybeTooltip>
                  <ToggleButton value={SpecialPracticeType.FACT_FAMILY}>Fact Fam.</ToggleButton>
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
                    <Field label="Mode">
                      <FormControl fullWidth size="small">
                        <Select
                          value={multiOperationConfig.mode}
                          onChange={(e) =>
                            setMultiOperationConfig?.({
                              ...multiOperationConfig,
                              mode: e.target.value as MultiOperationMode,
                            })
                          }
                        >
                          <MenuItem value={MultiOperationMode.CHAIN_ADDITION}>
                            Chain Addition (2 + 3 + 4)
                          </MenuItem>
                          <MenuItem value={MultiOperationMode.CHAIN_SUBTRACTION}>
                            Chain Subtraction (10 − 3 − 2)
                          </MenuItem>
                          <MenuItem value={MultiOperationMode.MIXED_OPERATIONS}>
                            Mixed (5 + 3 − 2)
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Field>
                    <Field
                      label={`Operands: ${multiOperationConfig.numberCount}`}
                      caption="More numbers = harder."
                    >
                      <Slider
                        value={multiOperationConfig.numberCount}
                        onChange={(_, v) =>
                          setMultiOperationConfig?.({
                            ...multiOperationConfig,
                            numberCount: v as number,
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
            <SectionTitle>Difficulty</SectionTitle>
            <Tabs
              value={useMixMode ? 'mix' : 'single'}
              onChange={handleMixModeTab}
              variant="fullWidth"
              sx={{ mt: 0.5, minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0.5 } }}
            >
              <Tab value="single" label="Single" />
              <Tab value="mix" label="Mix" />
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
                  <ToggleButton value={DifficultyLevel.CUSTOM}>Custom</ToggleButton>
                </ToggleButtonGroup>
              )}

              {!useMixMode && difficulty === DifficultyLevel.CUSTOM && (
                <Field
                  label="Custom Range"
                  caption={`Range: ${customDifficulty?.min ?? 1} – ${customDifficulty?.max ?? 20}`}
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
                      Total: {ratioTotal}% {ratioTotal !== 100 && '⚠️'}
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<BalanceIcon />}
                      onClick={normalizeRatios}
                      disabled={ratioTotal === 100 || ratioTotal === 0}
                      sx={{ textTransform: 'none' }}
                    >
                      Normalize to 100%
                    </Button>
                  </Stack>
                  {difficultyRatios.custom > 0 && customDifficulty && (
                    <Field
                      label="Custom Range"
                      caption={`Range: ${customDifficulty.min} – ${customDifficulty.max}`}
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
            <SectionTitle>Rules</SectionTitle>
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
                label={<Typography variant="body2">Exclude all zeros</Typography>}
              />
              <Typography variant="caption" color="text.secondary">
                No operand / result / intermediate value can be 0 (e.g. x+0, x−x, x−a−b=0).
                Mutually exclusive with Zero Drill.
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid',
          borderColor: 'grey.200',
          bgcolor: 'grey.50',
        }}
      >
        <Stack spacing={1.5}>
          <FormControlLabel
            sx={{ ml: 0, mr: 0, justifyContent: 'space-between', width: '100%' }}
            labelPlacement="start"
            control={
              <Switch
                checked={autoPreview}
                onChange={(e) => setAutoPreview(e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  Auto Preview
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {autoPreview ? 'Updates as you change settings' : 'Manual generate only'}
                </Typography>
              </Box>
            }
          />

          <Stack direction="row" spacing={1}>
            {!autoPreview && (
              <Button
                onClick={onGenerate}
                disabled={isGenerating}
                variant="contained"
                startIcon={<WandIcon />}
                fullWidth
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {isGenerating ? 'Generating…' : 'Generate'}
              </Button>
            )}
            <Button
              onClick={onPrint}
              variant={autoPreview ? 'contained' : 'outlined'}
              startIcon={<PrintIcon />}
              fullWidth
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Print / PDF
            </Button>
          </Stack>

          <Tooltip title="Reset all settings to default values" arrow>
            <Button
              onClick={onResetConfig}
              variant="text"
              startIcon={<ResetIcon />}
              size="small"
              color="inherit"
              sx={{ textTransform: 'none', color: 'text.secondary', alignSelf: 'center' }}
            >
              Reset to defaults
            </Button>
          </Tooltip>
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
    </Paper>
  );
};

export default WorksheetSettings;
