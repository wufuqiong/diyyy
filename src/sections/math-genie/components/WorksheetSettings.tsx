// src/sections/math-genie/components/WorksheetSettings.tsx
import React, { useMemo, useState } from 'react';

import {
  Print as PrintIcon,
  AutoAwesome as SparklesIcon,
  AutoFixHigh as WandIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  SelectChangeEvent,
  InputAdornment,
  Chip,
  Stack,
  Switch,
  FormControlLabel,
} from '@mui/material';

import { DifficultyLevel, OperationType, DisplayMode, CustomDifficultyRange, DifficultyRatios, ProblemType } from 'src/types';

interface Props {
  theme: string;
  setTheme: (t: string) => void;
  difficulty: DifficultyLevel;
  setDifficulty: (d: DifficultyLevel) => void;
  operation: OperationType;
  setOperation: (o: OperationType) => void;
  count: number;
  setCount: (c: number) => void;
  showAnswers: boolean; // Add this
  setShowAnswers: (s: boolean) => void; // Add this
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
}

const presets = ["Animals 🐶", "Vehicles 🚗", "Fruits 🍎", "Sports ⚽", "Food 🍔", "Nature 🌸", "Weather 🌧️", "Emotions 😀"];

const WorksheetSettings: React.FC<Props> = ({
  theme,
  setTheme,
  difficulty,
  setDifficulty,
  operation,
  setOperation,
  count,
  setCount,
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
}) => {
  // Get count settings based on display mode
  const getCountSettings = () => {
    if (displayMode === 'text') {
      return {
        min: 16,
        max: 48,
        step: 16,
        marks: true,
        label: 'Problems per page (16, 32, or 48)'
      };
    }
    return {
      min: 8,
      max: 24,
      step: 8,
      marks: true,
      label: 'Problems per page (8, 16, or 24)'
    };
  };

  const countSettings = getCountSettings();

  const handleCountChange = (event: Event, newValue: number | number[]) => {
    // Ensure the value is a multiple of the step
    const step = countSettings.step;
    const roundedValue = Math.round((newValue as number) / step) * step;
    setCount(Math.max(countSettings.min, Math.min(countSettings.max, roundedValue)));
  };

  const handleCountInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(event.target.value);
    if (!isNaN(val)) {
      // Round to the nearest step
      const step = countSettings.step;
      const roundedValue = Math.round(val / step) * step;
      setCount(Math.max(countSettings.min, Math.min(countSettings.max, roundedValue)));
    }
  };

  const handleOperationChange = (event: SelectChangeEvent) => {
    setOperation(event.target.value as OperationType);
  };

  const handleMixModeToggle = (enabled: boolean) => {
    if (setUseMixMode) {
      setUseMixMode(enabled);
    }
    if (enabled && setDifficultyRatios && setUseMixMode) {
      // When enabling mix mode, set default ratios
      setDifficultyRatios({
        easy: 25,
        medium: 25,
        hard: 25,
        custom: 25,
      });
      setUseMixMode(enabled);
    }
  };

  const handleDifficultyChange = (newDifficulty: DifficultyLevel) => {
    setDifficulty(newDifficulty);
    // When selecting a specific difficulty, disable mix mode
    if (useMixMode && setUseMixMode) {
      setUseMixMode(false);
    }
  };

  const handleCustomDifficultyMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(event.target.value);
    if (!isNaN(val) && setCustomDifficulty && customDifficulty) {
      const newMin = Math.max(1, Math.min(val, customDifficulty.max - 1));
      setCustomDifficulty({ ...customDifficulty, min: newMin });
    }
  };

  const handleCustomDifficultyMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(event.target.value);
    if (!isNaN(val) && setCustomDifficulty && customDifficulty) {
      const newMax = Math.max(val, customDifficulty.min + 1);
      setCustomDifficulty({ ...customDifficulty, max: newMax });
    }
  };

  const handleDifficultyRatioChange = (type: keyof DifficultyRatios, value: number) => {
    if (setDifficultyRatios && difficultyRatios) {
      const newRatios = { ...difficultyRatios, [type]: value };
      setDifficultyRatios(newRatios);
    }
  };

  // Calculate maximum possible unique problems for current settings
  const maxPossibleProblems = useMemo(() => {
    if (operation === OperationType.ADDITION) {
      let uniqueCount = 0;
      for (let a = 1; a < difficulty; a++) {
        for (let b = 1; b <= difficulty - a; b++) {
          uniqueCount++;
        }
      }
      return uniqueCount;
    } else if (operation === OperationType.SUBTRACTION) {
      let uniqueCount = 0;
      for (let a = 2; a <= difficulty; a++) {
        for (let b = 1; b < a; b++) {
          uniqueCount++;
        }
      }
      return uniqueCount;
    } else {
      // Mixed
      let additionCount = 0;
      for (let a = 1; a < difficulty; a++) {
        for (let b = 1; b <= difficulty - a; b++) {
          additionCount++;
        }
      }
      let subtractionCount = 0;
      for (let a = 2; a <= difficulty; a++) {
        for (let b = 1; b < a; b++) {
          subtractionCount++;
        }
      }
      return additionCount + subtractionCount;
    }
  }, [difficulty, operation]);

  const isExceedingMax = count > maxPossibleProblems;

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%', // Take full width of parent
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        backgroundColor: 'white',
        padding: 3,
        borderRight: '1px solid',
        borderColor: 'grey.200',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          MathGenie
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create custom visual math worksheets in seconds.
        </Typography>
      </Box>

      <Stack spacing={3}>
        {/* Theme Section - Only show in Emoji Mode */}
        {displayMode === DisplayMode.EMOJI && (
          <Box>
            <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
              Theme
            </Typography>
            <TextField
              fullWidth
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. Pokemon, Cars, Fairies..."
              size="small"
              InputProps={{
                startAdornment: <Box component="span" sx={{ mr: 1 }}>🎨</Box>,
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Choose a theme for emoji illustrations. Presets include animals, vehicles, fruits, sports, food, nature, weather, and emotions.
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              💡 Tip: Chinese themes (中文) will use Chinese titles!
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {presets.map((preset) => (
                <Chip
                  key={preset}
                  label={preset}
                  onClick={() => setTheme(preset.split(' ')[0])}
                  size="small"
                  sx={{
                    fontSize: '0.75rem',
                    height: 24,
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Difficulty Section */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
            Difficulty
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Button
              onClick={() => handleDifficultyChange(DifficultyLevel.EASY)}
              sx={(muiTheme) => ({
                padding: muiTheme.spacing(1),
                fontSize: '0.875rem',
                textTransform: 'none',
                borderRadius: muiTheme.shape.borderRadius,
                border: '1px solid',
                borderColor: difficulty === DifficultyLevel.EASY ? 'primary.main' : 'grey.200',
                backgroundColor: difficulty === DifficultyLevel.EASY ? 'primary.light' : 'white',
                color: difficulty === DifficultyLevel.EASY ? 'primary.dark' : 'grey.600',
                fontWeight: difficulty === DifficultyLevel.EASY ? 600 : 400,
                '&:hover': {
                  backgroundColor: difficulty === DifficultyLevel.EASY ? 'primary.light' : 'grey.50',
                  borderColor: difficulty === DifficultyLevel.EASY ? 'primary.main' : 'grey.300',
                },
                width: '100%',
              })}
            >
              Easy (1-5)
            </Button>
            <Button
              onClick={() => handleDifficultyChange(DifficultyLevel.MEDIUM)}
              sx={(muiTheme) => ({
                padding: muiTheme.spacing(1),
                fontSize: '0.875rem',
                textTransform: 'none',
                borderRadius: muiTheme.shape.borderRadius,
                border: '1px solid',
                borderColor: difficulty === DifficultyLevel.MEDIUM ? 'primary.main' : 'grey.200',
                backgroundColor: difficulty === DifficultyLevel.MEDIUM ? 'primary.light' : 'white',
                color: difficulty === DifficultyLevel.MEDIUM ? 'primary.dark' : 'grey.600',
                fontWeight: difficulty === DifficultyLevel.MEDIUM ? 600 : 400,
                '&:hover': {
                  backgroundColor: difficulty === DifficultyLevel.MEDIUM ? 'primary.light' : 'grey.50',
                  borderColor: difficulty === DifficultyLevel.MEDIUM ? 'primary.main' : 'grey.300',
                },
                width: '100%',
              })}
            >
              Medium (1-10)
            </Button>
            <Button
              onClick={() => handleDifficultyChange(DifficultyLevel.HARD)}
              sx={(muiTheme) => ({
                padding: muiTheme.spacing(1),
                fontSize: '0.875rem',
                textTransform: 'none',
                borderRadius: muiTheme.shape.borderRadius,
                border: '1px solid',
                borderColor: difficulty === DifficultyLevel.HARD ? 'primary.main' : 'grey.200',
                backgroundColor: difficulty === DifficultyLevel.HARD ? 'primary.light' : 'white',
                color: difficulty === DifficultyLevel.HARD ? 'primary.dark' : 'grey.600',
                fontWeight: difficulty === DifficultyLevel.HARD ? 600 : 400,
                '&:hover': {
                  backgroundColor: difficulty === DifficultyLevel.HARD ? 'primary.light' : 'grey.50',
                  borderColor: difficulty === DifficultyLevel.HARD ? 'primary.main' : 'grey.300',
                },
                width: '100%',
              })}
            >
              Hard (1-20)
            </Button>
            <Button
              onClick={() => handleDifficultyChange(DifficultyLevel.CUSTOM)}
              sx={(muiTheme) => ({
                padding: muiTheme.spacing(1),
                fontSize: '0.875rem',
                textTransform: 'none',
                borderRadius: muiTheme.shape.borderRadius,
                border: '1px solid',
                borderColor: difficulty === DifficultyLevel.CUSTOM ? 'primary.main' : 'grey.200',
                backgroundColor: difficulty === DifficultyLevel.CUSTOM ? 'primary.light' : 'white',
                color: difficulty === DifficultyLevel.CUSTOM ? 'primary.dark' : 'grey.600',
                fontWeight: difficulty === DifficultyLevel.CUSTOM ? 600 : 400,
                '&:hover': {
                  backgroundColor: difficulty === DifficultyLevel.CUSTOM ? 'primary.light' : 'grey.50',
                  borderColor: difficulty === DifficultyLevel.CUSTOM ? 'primary.main' : 'grey.300',
                },
                width: '100%',
              })}
            >
              Custom (自选)
            </Button>
          </Stack>
        </Box>

        {/* Mix Mode Section */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
            Difficulty Mix Mode
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={useMixMode}
                onChange={(e) => handleMixModeToggle(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">
                  Enable Mix Mode
                </Typography>
              </Box>
            }
            sx={{ ml: 0 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {useMixMode ? 'Mix mode enabled - set difficulty ratios below' : 'Mix mode disabled - using single difficulty'}
          </Typography>
        </Box>

        {/* Custom Difficulty Range Section */}
        {difficulty === DifficultyLevel.CUSTOM && (
          <Box>
            <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
              Custom Range
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="Min"
                type="number"
                size="small"
                value={customDifficulty?.min || 1}
                onChange={handleCustomDifficultyMinChange}
                inputProps={{
                  min: 1,
                  max: customDifficulty?.max ? customDifficulty.max - 1 : 99,
                }}
                sx={{ width: 100 }}
              />
              <Typography variant="body2" color="text.secondary">
                to
              </Typography>
              <TextField
                label="Max"
                type="number"
                size="small"
                value={customDifficulty?.max || 20}
                onChange={handleCustomDifficultyMaxChange}
                inputProps={{
                  min: customDifficulty?.min ? customDifficulty.min + 1 : 2,
                  max: 100,
                }}
                sx={{ width: 100 }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Range: {customDifficulty?.min || 1} - {customDifficulty?.max || 20}
            </Typography>
          </Box>
        )}

        {/* Operation Section */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
            Operation
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={operation}
              onChange={handleOperationChange}
              displayEmpty
            >
              <MenuItem value={OperationType.ADDITION}>Addition (+)</MenuItem>
              <MenuItem value={OperationType.SUBTRACTION}>Subtraction (-)</MenuItem>
              <MenuItem value={OperationType.MIXED}>Mixed (+ / -)</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Count Section */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
            Number of Problems
          </Typography>
          <Stack spacing={2} direction="row" alignItems="center">
            <Slider
              value={count}
              onChange={handleCountChange}
              min={countSettings.min}
              max={countSettings.max}
              step={countSettings.step}
              valueLabelDisplay="auto"
              sx={{ flex: 1 }}
            />
            <TextField
              value={count}
              onChange={handleCountInputChange}
              type="number"
              size="small"
              sx={{ width: 80 }}
              inputProps={{
                min: countSettings.min,
                max: countSettings.max,
                step: countSettings.step,
              }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {countSettings.label}
          </Typography>
          {isExceedingMax && (
            <Box
              sx={{
                mt: 1,
                p: 1,
                backgroundColor: 'warning.light',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'warning.main',
              }}
            >
              <Typography variant="caption" color="warning.dark">
                ⚠️ Maximum unique problems for this setting: {maxPossibleProblems}
              </Typography>
              <Typography variant="caption" color="warning.dark" sx={{ display: 'block' }}>
                Some problems will be repeated to reach {count}.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Difficulty Ratios Section */}
        {useMixMode && (
          <Box>
            <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
              Difficulty Mix (%)
            </Typography>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" sx={{ width: 60 }}>
                Easy:
              </Typography>
              <Slider
                value={difficultyRatios?.easy || 20}
                onChange={(_, value) => handleDifficultyRatioChange('easy', value as number)}
                min={0}
                max={100}
                valueLabelDisplay="auto"
                sx={{ flex: 1 }}
              />
              <TextField
                value={difficultyRatios?.easy || 20}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) {
                    handleDifficultyRatioChange('easy', Math.max(0, Math.min(100, val)));
                  }
                }}
                type="number"
                size="small"
                sx={{ width: 60 }}
                inputProps={{
                  min: 0,
                  max: 100,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                %
              </Typography>
            </Stack>
            
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" sx={{ width: 60 }}>
                Medium:
              </Typography>
              <Slider
                value={difficultyRatios?.medium || 50}
                onChange={(_, value) => handleDifficultyRatioChange('medium', value as number)}
                min={0}
                max={100}
                valueLabelDisplay="auto"
                sx={{ flex: 1 }}
              />
              <TextField
                value={difficultyRatios?.medium || 50}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) {
                    handleDifficultyRatioChange('medium', Math.max(0, Math.min(100, val)));
                  }
                }}
                type="number"
                size="small"
                sx={{ width: 60 }}
                inputProps={{
                  min: 0,
                  max: 100,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                %
              </Typography>
            </Stack>
            
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" sx={{ width: 60 }}>
                Hard:
              </Typography>
              <Slider
                value={difficultyRatios?.hard || 20}
                onChange={(_, value) => handleDifficultyRatioChange('hard', value as number)}
                min={0}
                max={100}
                valueLabelDisplay="auto"
                sx={{ flex: 1 }}
              />
              <TextField
                value={difficultyRatios?.hard || 20}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) {
                    handleDifficultyRatioChange('hard', Math.max(0, Math.min(100, val)));
                  }
                }}
                type="number"
                size="small"
                sx={{ width: 60 }}
                inputProps={{
                  min: 0,
                  max: 100,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                %
              </Typography>
            </Stack>
            
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" sx={{ width: 60 }}>
                Custom:
              </Typography>
              <Slider
                value={difficultyRatios?.custom || 10}
                onChange={(_, value) => handleDifficultyRatioChange('custom', value as number)}
                min={0}
                max={100}
                valueLabelDisplay="auto"
                sx={{ flex: 1 }}
              />
              <TextField
                value={difficultyRatios?.custom || 10}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) {
                    handleDifficultyRatioChange('custom', Math.max(0, Math.min(100, val)));
                  }
                }}
                type="number"
                size="small"
                sx={{ width: 60 }}
                inputProps={{
                  min: 0,
                  max: 100,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                %
              </Typography>
            </Stack>
          </Stack>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Total: {(difficultyRatios?.easy || 20) + (difficultyRatios?.medium || 50) + (difficultyRatios?.hard || 20) + (difficultyRatios?.custom || 10)}%
            {(difficultyRatios?.easy || 20) + (difficultyRatios?.medium || 50) + (difficultyRatios?.hard || 20) + (difficultyRatios?.custom || 10) !== 100 && (
              <Box component="span" sx={{ color: 'warning.main', ml: 1 }}>
                ⚠️ Should total 100%
              </Box>
            )}
          </Typography>
        </Box>
        )}

        {/* Show Answers Section - NEW */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
            Display Options
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={showAnswers}
                onChange={(e) => setShowAnswers(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {showAnswers ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                <Typography variant="body2">
                  Show Answers
                </Typography>
              </Box>
            }
            sx={{ ml: 0 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {showAnswers ? 'Answers are visible' : 'Answers are hidden (blank boxes)'}
          </Typography>
        </Box>

        {/* Display Mode Section - NEW */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
            Display Mode
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Button
              onClick={() => setDisplayMode(DisplayMode.EMOJI)}
              sx={(muiTheme) => ({
                padding: muiTheme.spacing(1),
                fontSize: '0.875rem',
                textTransform: 'none',
                borderRadius: muiTheme.shape.borderRadius,
                border: '1px solid',
                borderColor: displayMode === DisplayMode.EMOJI ? 'primary.main' : 'grey.200',
                backgroundColor: displayMode === DisplayMode.EMOJI ? 'primary.light' : 'white',
                color: displayMode === DisplayMode.EMOJI ? 'primary.dark' : 'grey.600',
                fontWeight: displayMode === DisplayMode.EMOJI ? 600 : 400,
                '&:hover': {
                  backgroundColor: displayMode === DisplayMode.EMOJI ? 'primary.light' : 'grey.50',
                  borderColor: displayMode === DisplayMode.EMOJI ? 'primary.main' : 'grey.300',
                },
                width: '100%',
              })}
            >
              🎨 Emoji Mode
            </Button>
            <Button
              onClick={() => setDisplayMode(DisplayMode.TEXT)}
              sx={(muiTheme) => ({
                padding: muiTheme.spacing(1),
                fontSize: '0.875rem',
                textTransform: 'none',
                borderRadius: muiTheme.shape.borderRadius,
                border: '1px solid',
                borderColor: displayMode === DisplayMode.TEXT ? 'primary.main' : 'grey.200',
                backgroundColor: displayMode === DisplayMode.TEXT ? 'primary.light' : 'white',
                color: displayMode === DisplayMode.TEXT ? 'primary.dark' : 'grey.600',
                fontWeight: displayMode === DisplayMode.TEXT ? 600 : 400,
                '&:hover': {
                  backgroundColor: displayMode === DisplayMode.TEXT ? 'primary.light' : 'grey.50',
                  borderColor: displayMode === DisplayMode.TEXT ? 'primary.main' : 'grey.300',
                },
                width: '100%',
              })}
            >
              📝 Text Mode (Printable)
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {displayMode === DisplayMode.EMOJI ? 'Visual problems with emojis' : 'Clean text problems for printing'}
          </Typography>
        </Box>

        {/* Problem Type Section - Only show in Text Mode */}
        {displayMode === DisplayMode.TEXT && (
          <Box>
            <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
              Problem Type
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Button
                onClick={() => setProblemType?.(ProblemType.STANDARD)}
                sx={(muiTheme) => ({
                  padding: muiTheme.spacing(1),
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  borderRadius: muiTheme.shape.borderRadius,
                  border: '1px solid',
                  borderColor: problemType === ProblemType.STANDARD ? 'primary.main' : 'grey.200',
                  backgroundColor: problemType === ProblemType.STANDARD ? 'primary.light' : 'white',
                  color: problemType === ProblemType.STANDARD ? 'primary.dark' : 'grey.600',
                  fontWeight: problemType === ProblemType.STANDARD ? 600 : 400,
                  '&:hover': {
                    backgroundColor: problemType === ProblemType.STANDARD ? 'primary.light' : 'grey.50',
                    borderColor: problemType === ProblemType.STANDARD ? 'primary.main' : 'grey.300',
                  },
                  width: '100%',
                })}
              >
                Standard (7 + 3 = 10)
              </Button>
              <Button
                onClick={() => setProblemType?.(ProblemType.FILL_BLANK)}
                sx={(muiTheme) => ({
                  padding: muiTheme.spacing(1),
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  borderRadius: muiTheme.shape.borderRadius,
                  border: '1px solid',
                  borderColor: problemType === ProblemType.FILL_BLANK ? 'primary.main' : 'grey.200',
                  backgroundColor: problemType === ProblemType.FILL_BLANK ? 'primary.light' : 'white',
                  color: problemType === ProblemType.FILL_BLANK ? 'primary.dark' : 'grey.600',
                  fontWeight: problemType === ProblemType.FILL_BLANK ? 600 : 400,
                  '&:hover': {
                    backgroundColor: problemType === ProblemType.FILL_BLANK ? 'primary.light' : 'grey.50',
                    borderColor: problemType === ProblemType.FILL_BLANK ? 'primary.main' : 'grey.300',
                  },
                  width: '100%',
                })}
              >
                Fill Blank (7 + _ = 10)
              </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {problemType === ProblemType.STANDARD 
                ? 'Traditional math problems with complete equations' 
                : 'Fill-in-the-blank problems for enhanced learning'}
            </Typography>
          </Box>
        )}
      </Stack>

      <Box sx={{ mt: 'auto', pt: 3, borderTop: 1, borderColor: 'grey.100' }}>
        <Stack spacing={2}>
          <Button
            onClick={onGenerate}
            disabled={isGenerating}
            variant="contained"
            startIcon={isGenerating ? null : <WandIcon />}
            sx={{
              borderRadius: 2,
              padding: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 1,
              background: 'linear-gradient(135deg, #1976d2, #0d47a1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0, #0d47a1)',
                boxShadow: 3,
              },
              width: '100%',
            }}
          >
            {isGenerating ? 'Designing...' : 'Generate Worksheet'}
          </Button>

          <Button
            onClick={onPrint}
            variant="outlined"
            startIcon={<PrintIcon />}
            sx={{
              borderRadius: 2,
              padding: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 1,
              borderWidth: 2,
              '&:hover': {
                borderColor: 'grey.300',
                boxShadow: 3,
              },
              width: '100%',
            }}
          >
            Print / Save PDF
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default WorksheetSettings;