// src/sections/math-genie/components/WorksheetSettings.tsx
import React, { useMemo, useState } from 'react';

import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Slider,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AutoAwesome as SparklesIcon,
  AutoFixHigh as WandIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Print as PrintIcon,
  RestartAlt as ResetIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';

import { DifficultyLevel, OperationType, DisplayMode, CustomDifficultyRange, DifficultyRatios, ProblemType, SpecialPracticeType, MultiOperationMode, MultiOperationConfig } from 'src/types';

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
  specialPracticeType: SpecialPracticeType;
  setSpecialPracticeType: (s: SpecialPracticeType) => void;
  multiOperationConfig?: MultiOperationConfig;
  setMultiOperationConfig?: (c: MultiOperationConfig) => void;
  autoPreview: boolean;
  setAutoPreview: (v: boolean) => void;
  onResetConfig: () => void;
}

const presets = ["Animals 🐶", "Vehicles 🚗", "Fruits 🍎", "Sports ⚽", "Food 🍔", "Nature 🌸", "Weather 🌧️", "Emotions 😀"];

const getTextRowsPerPage = (columns: 2 | 3 | 4): number => {
  if (columns === 4) return 6;
  if (columns === 3) return 7;
  return 8;
};

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
  const isSpecialPracticeSelected = specialPracticeType !== SpecialPracticeType.NONE;
  const canUseEmojiMode = !(activeProblemType === ProblemType.FILL_BLANK && !isSpecialPracticeSelected);
  const textRowsPerPage = getTextRowsPerPage(textColumns);
  const textProblemsPerPage = textColumns * textRowsPerPage;

  // Get count settings based on display mode
  const getCountSettings = () => {
    if (displayMode === 'text') {
      return {
        min: 1,
        max: 10,
        step: 1,
        marks: true,
        label: `Pages (each page up to ${textProblemsPerPage} problems at ${textColumns} columns)`
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

  const handleDisplayModeChange = (newDisplayMode: DisplayMode) => {
    if (newDisplayMode === DisplayMode.EMOJI && !canUseEmojiMode) {
      return;
    }

    setDisplayMode(newDisplayMode);
    
    // If switching to emoji mode, disable multi-operations
    if (newDisplayMode === DisplayMode.EMOJI && operation === OperationType.MULTI_OPERATIONS) {
      setOperation(OperationType.ADDITION);
      if (multiOperationConfig?.enabled && setMultiOperationConfig) {
        setMultiOperationConfig({
          ...multiOperationConfig,
          enabled: false
        });
      }
    }
  };

  const handleProblemTypeChange = (newProblemType: ProblemType) => {
    if (setProblemType) {
      setProblemType(newProblemType);
    }

    if (
      newProblemType === ProblemType.FILL_BLANK &&
      multiOperationConfig?.enabled &&
      setMultiOperationConfig
    ) {
      setMultiOperationConfig({
        ...multiOperationConfig,
        enabled: false
      });
    }

    if (newProblemType === ProblemType.FILL_BLANK && operation === OperationType.MULTI_OPERATIONS) {
      setOperation(OperationType.ADDITION);
    }
  };

  const handleSpecialPracticeTypeChange = (newSpecialPracticeType: SpecialPracticeType) => {
    if (excludeZeroProblems && newSpecialPracticeType === SpecialPracticeType.ZERO_DRILL) {
      return;
    }

    setSpecialPracticeType(newSpecialPracticeType);

    if (
      newSpecialPracticeType !== SpecialPracticeType.NONE &&
      multiOperationConfig?.enabled &&
      setMultiOperationConfig
    ) {
      setMultiOperationConfig({
        ...multiOperationConfig,
        enabled: false,
      });
    }

    if (
      newSpecialPracticeType !== SpecialPracticeType.NONE &&
      operation === OperationType.MULTI_OPERATIONS
    ) {
      setOperation(OperationType.ADDITION);
    }
  };

  const handleOperationChange = (event: SelectChangeEvent) => {
    const newOperation = event.target.value as OperationType;
    
    // Check if trying to select multi-operations in incompatible mode
    if (newOperation === OperationType.MULTI_OPERATIONS) {
      if (displayMode === DisplayMode.EMOJI) {
        // Don't allow multi-operations in emoji mode
        return;
      }
      if (
        activeProblemType === ProblemType.FILL_BLANK ||
        isSpecialPracticeSelected
      ) {
        // Don't allow multi-operations in fill blank/special practice modes
        return;
      }
    }
    
    // If switching to multi-operations, disable incompatible modes
    if (newOperation === OperationType.MULTI_OPERATIONS) {
      if (displayMode === DisplayMode.EMOJI) {
        setDisplayMode(DisplayMode.TEXT);
      }
      if (activeProblemType === ProblemType.FILL_BLANK && setProblemType) {
        setProblemType(ProblemType.STANDARD);
      }
      if (isSpecialPracticeSelected) {
        setSpecialPracticeType(SpecialPracticeType.NONE);
      }
    }
    
    setOperation(newOperation);
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
    if (operation === OperationType.MULTI_OPERATIONS) {
      // For multi-operations, estimate based on mode and number count
      if (multiOperationConfig?.enabled) {
        const numberCount = multiOperationConfig.numberCount;
        const mode = multiOperationConfig.mode;
        
        // Get the actual min/max values for custom difficulty
        let minNum = 1;
        let maxNum = difficulty;
        
        if (difficulty === DifficultyLevel.CUSTOM && customDifficulty) {
          minNum = customDifficulty.min;
          maxNum = customDifficulty.max;
        }
        
        if (mode === MultiOperationMode.CHAIN_ADDITION) {
          // Estimate for chain addition: combinations of numbers that sum to reasonable values
          const maxSum = Math.min(maxNum * numberCount / 2, maxNum);
          const minSum = numberCount * minNum;
          return Math.max(100, (maxSum - minSum + 1) * 10); // Rough estimate based on possible sums
        } else if (mode === MultiOperationMode.CHAIN_SUBTRACTION) {
          // Estimate for chain subtraction
          return Math.max(50, (maxNum - minNum - numberCount * minNum + 1) * 20); // Rough estimate
        } else {
          // Mixed operations: most combinations
          return Math.max(200, (maxNum - minNum + 1) * 50); // Rough estimate based on number range
        }
      }
      return 100; // Default for multi-operations
    } else if (operation === OperationType.ADDITION) {
      let uniqueCount = 0;
      let minNum = 1;
      let maxNum = difficulty;
      
      if (difficulty === DifficultyLevel.CUSTOM && customDifficulty) {
        minNum = customDifficulty.min;
        maxNum = customDifficulty.max;
      }
      
      for (let a = minNum; a < maxNum; a++) {
        for (let b = minNum; b <= maxNum - a; b++) {
          uniqueCount++;
        }
      }
      return uniqueCount;
    } else if (operation === OperationType.SUBTRACTION) {
      let uniqueCount = 0;
      let minNum = 1;
      let maxNum = difficulty;
      
      if (difficulty === DifficultyLevel.CUSTOM && customDifficulty) {
        minNum = customDifficulty.min;
        maxNum = customDifficulty.max;
      }
      
      for (let a = Math.max(minNum + 1, 2); a <= maxNum; a++) {
        for (let b = minNum; b < a; b++) {
          uniqueCount++;
        }
      }
      return uniqueCount;
    } else {
      // Mixed
      let additionCount = 0;
      let subtractionCount = 0;
      let minNum = 1;
      let maxNum = difficulty;
      
      if (difficulty === DifficultyLevel.CUSTOM && customDifficulty) {
        minNum = customDifficulty.min;
        maxNum = customDifficulty.max;
      }
      
      for (let a = minNum; a < maxNum; a++) {
        for (let b = minNum; b <= maxNum - a; b++) {
          additionCount++;
        }
      }
      for (let a = Math.max(minNum + 1, 2); a <= maxNum; a++) {
        for (let b = minNum; b < a; b++) {
          subtractionCount++;
        }
      }
      return additionCount + subtractionCount;
    }
  }, [difficulty, operation, multiOperationConfig, customDifficulty]);

  const requestedProblemCount = displayMode === DisplayMode.TEXT
    ? count * textProblemsPerPage
    : count;

  const isExceedingMax = requestedProblemCount > maxPossibleProblems;

  const [advancedOpen, setAdvancedOpen] = useState(false);

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

      <Divider />

      {/* Auto Preview Toggle */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1.5,
          bgcolor: autoPreview ? 'primary.50' : 'grey.50',
          borderRadius: 1,
          border: '1px solid',
          borderColor: autoPreview ? 'primary.200' : 'grey.200',
        }}
      >
        <Box>
          <Typography variant="body2" fontWeight={600}>
            🔄 实时预览
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {autoPreview ? '配置变化自动更新' : '手动点击生成更新'}
          </Typography>
        </Box>
        <Switch
          checked={autoPreview}
          onChange={(e) => setAutoPreview(e.target.checked)}
          color="primary"
          size="small"
        />
      </Box>

      <Divider />

      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
            Display Mode
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Button
              onClick={() => handleDisplayModeChange(DisplayMode.EMOJI)}
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
              onClick={() => handleDisplayModeChange(DisplayMode.TEXT)}
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

        {/* Advanced Settings collapsible section header */}
        <Box
          onClick={() => setAdvancedOpen(!advancedOpen)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            py: 0.5,
            borderBottom: '1px solid',
            borderColor: 'grey.200',
            userSelect: 'none',
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} color="text.primary">
            🎯 Advanced Settings
          </Typography>
          {advancedOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </Box>
        <Collapse in={advancedOpen}>
          <Stack spacing={3} sx={{ pt: 1 }}>

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
              <MenuItem 
                value={OperationType.MULTI_OPERATIONS}
                disabled={displayMode === DisplayMode.EMOJI || activeProblemType === ProblemType.FILL_BLANK || isSpecialPracticeSelected}
              >
                Multi-Operations {displayMode === DisplayMode.EMOJI || activeProblemType === ProblemType.FILL_BLANK || isSpecialPracticeSelected ? '(Unavailable)' : ''}
              </MenuItem>
            </Select>
          </FormControl>
          {(displayMode === DisplayMode.EMOJI || activeProblemType === ProblemType.FILL_BLANK || isSpecialPracticeSelected) && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              💡 Multi-Operations only available in Text Mode with Standard problems
            </Typography>
          )}
        </Box>

        <Box>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
            Zero Rules
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={excludeZeroProblems}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setExcludeZeroProblems(checked);
                  if (checked && specialPracticeType === SpecialPracticeType.ZERO_DRILL) {
                    setSpecialPracticeType(SpecialPracticeType.NONE);
                  }
                }}
                color="primary"
              />
            }
            label={<Typography variant="body2">Exclude all problems involving 0</Typography>}
            sx={{ ml: 0 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Enabled: no operand/result/intermediate value can be 0 (e.g. x+0, x-x, x-x+y, x-a-b=0).
          </Typography>
        </Box>

        {/* Multi-Operation Configuration Section */}
        {operation === OperationType.MULTI_OPERATIONS && (
          <Box>
            <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
              Multi-Operation Settings
            </Typography>
            
            {/* Enable Multi-Operation */}
            <FormControlLabel
              control={
                <Switch
                  checked={multiOperationConfig?.enabled || false}
                  onChange={(e) => {
                    if (setMultiOperationConfig) {
                      setMultiOperationConfig({
                        enabled: e.target.checked,
                        mode: MultiOperationMode.CHAIN_ADDITION,
                        numberCount: 3
                      });
                    }
                  }}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  Enable Multi-Operations
                </Typography>
              }
              sx={{ ml: 0, mb: 2 }}
            />

            {multiOperationConfig?.enabled && (
              <Stack spacing={3}>
                {/* Multi-Operation Mode */}
                <Box>
                  <Typography variant="body2" fontWeight={500} gutterBottom>
                    Operation Mode
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={multiOperationConfig?.mode || MultiOperationMode.CHAIN_ADDITION}
                      onChange={(e) => {
                        if (setMultiOperationConfig && multiOperationConfig) {
                          setMultiOperationConfig({
                            ...multiOperationConfig,
                            mode: e.target.value as MultiOperationMode
                          });
                        }
                      }}
                    >
                      <MenuItem value={MultiOperationMode.CHAIN_ADDITION}>Chain Addition (2 + 3 + 4)</MenuItem>
                      <MenuItem value={MultiOperationMode.CHAIN_SUBTRACTION}>Chain Subtraction (10 - 3 - 2)</MenuItem>
                      <MenuItem value={MultiOperationMode.MIXED_OPERATIONS}>Mixed Operations (5 + 3 - 2)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Number Count */}
                <Box>
                  <Typography variant="body2" fontWeight={500} gutterBottom>
                    Number of Operands: {multiOperationConfig?.numberCount || 3}
                  </Typography>
                  <Slider
                    value={multiOperationConfig?.numberCount || 3}
                    onChange={(_, value) => {
                      if (setMultiOperationConfig && multiOperationConfig) {
                        setMultiOperationConfig({
                          ...multiOperationConfig,
                          numberCount: value as number
                        });
                      }
                    }}
                    min={3}
                    max={6}
                    step={1}
                    valueLabelDisplay="auto"
                    marks={[
                      { value: 3, label: '3' },
                      { value: 4, label: '4' },
                      { value: 5, label: '5' },
                      { value: 6, label: '6' }
                    ]}
                  />
                  <Typography variant="caption" color="text.secondary">
                    More numbers = higher difficulty
                  </Typography>
                </Box>
              </Stack>
            )}
          </Box>
        )}

        {/* Count Section */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
            {displayMode === DisplayMode.TEXT ? 'Number of Pages' : 'Number of Problems'}
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
          {displayMode === DisplayMode.TEXT && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Total generated: {requestedProblemCount} problems ({count} page{count > 1 ? 's' : ''} × {textProblemsPerPage} per page)
            </Typography>
          )}
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
                Some problems will be repeated to reach {requestedProblemCount}.
              </Typography>
            </Box>
          )}
        </Box>

        {displayMode === DisplayMode.TEXT && (
          <Box>
            <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
              Columns Per Page
            </Typography>
            <Stack direction="row" spacing={1}>
              {[2, 3, 4].map((col) => (
                <Button
                  key={col}
                  onClick={() => setTextColumns?.(col as 2 | 3 | 4)}
                  sx={(muiTheme) => ({
                    padding: muiTheme.spacing(1),
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    borderRadius: muiTheme.shape.borderRadius,
                    border: '1px solid',
                    borderColor: textColumns === col ? 'primary.main' : 'grey.200',
                    backgroundColor: textColumns === col ? 'primary.light' : 'white',
                    color: textColumns === col ? 'primary.dark' : 'grey.600',
                    fontWeight: textColumns === col ? 600 : 400,
                    '&:hover': {
                      backgroundColor: textColumns === col ? 'primary.light' : 'grey.50',
                      borderColor: textColumns === col ? 'primary.main' : 'grey.300',
                    },
                    width: '100%',
                  })}
                >
                  {col} Columns
                </Button>
              ))}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Current layout max: {textProblemsPerPage} problems per page
            </Typography>
          </Box>
        )}

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

          </Stack>
        </Collapse>

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

        <Box>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
            Problem Type
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Button
              onClick={() => handleProblemTypeChange(ProblemType.STANDARD)}
              sx={(muiTheme) => ({
                padding: muiTheme.spacing(1),
                fontSize: '0.875rem',
                textTransform: 'none',
                borderRadius: muiTheme.shape.borderRadius,
                border: '1px solid',
                borderColor: activeProblemType === ProblemType.STANDARD ? 'primary.main' : 'grey.200',
                backgroundColor: activeProblemType === ProblemType.STANDARD ? 'primary.light' : 'white',
                color: activeProblemType === ProblemType.STANDARD ? 'primary.dark' : 'grey.600',
                fontWeight: activeProblemType === ProblemType.STANDARD ? 600 : 400,
                '&:hover': {
                  backgroundColor: activeProblemType === ProblemType.STANDARD ? 'primary.light' : 'grey.50',
                  borderColor: activeProblemType === ProblemType.STANDARD ? 'primary.main' : 'grey.300',
                },
                width: '100%',
              })}
            >
              Standard (7 + 3 = 10)
            </Button>
            <Button
              onClick={() => handleProblemTypeChange(ProblemType.FILL_BLANK)}
              sx={(muiTheme) => ({
                padding: muiTheme.spacing(1),
                fontSize: '0.875rem',
                textTransform: 'none',
                borderRadius: muiTheme.shape.borderRadius,
                border: '1px solid',
                borderColor: activeProblemType === ProblemType.FILL_BLANK ? 'primary.main' : 'grey.200',
                backgroundColor: activeProblemType === ProblemType.FILL_BLANK ? 'primary.light' : 'white',
                color: activeProblemType === ProblemType.FILL_BLANK ? 'primary.dark' : 'grey.600',
                fontWeight: activeProblemType === ProblemType.FILL_BLANK ? 600 : 400,
                '&:hover': {
                  backgroundColor: activeProblemType === ProblemType.FILL_BLANK ? 'primary.light' : 'grey.50',
                  borderColor: activeProblemType === ProblemType.FILL_BLANK ? 'primary.main' : 'grey.300',
                },
                width: '100%',
              })}
            >
              Fill Blank (7 + _ = 10)
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {activeProblemType === ProblemType.STANDARD && 'Traditional math problems with complete equations'}
            {activeProblemType === ProblemType.FILL_BLANK && 'Fill-in-the-blank problems for enhanced learning'}
            {activeProblemType === ProblemType.FILL_BLANK && operation === OperationType.MULTI_OPERATIONS && (
              <Box component="span" sx={{ color: 'info.main', ml: 1 }}>
                💡 Multi-operation mode is not compatible with Fill Blank mode
              </Box>
            )}
          </Typography>
        </Box>

        <Box>
            <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
              Special Practice (专项练习)
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Button
                onClick={() => handleSpecialPracticeTypeChange(SpecialPracticeType.NONE)}
                sx={(muiTheme) => ({
                  padding: muiTheme.spacing(1),
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  borderRadius: muiTheme.shape.borderRadius,
                  border: '1px solid',
                  borderColor: specialPracticeType === SpecialPracticeType.NONE ? 'primary.main' : 'grey.200',
                  backgroundColor: specialPracticeType === SpecialPracticeType.NONE ? 'primary.light' : 'white',
                  color: specialPracticeType === SpecialPracticeType.NONE ? 'primary.dark' : 'grey.600',
                  fontWeight: specialPracticeType === SpecialPracticeType.NONE ? 600 : 400,
                  '&:hover': {
                    backgroundColor: specialPracticeType === SpecialPracticeType.NONE ? 'primary.light' : 'grey.50',
                    borderColor: specialPracticeType === SpecialPracticeType.NONE ? 'primary.main' : 'grey.300',
                  },
                  width: '100%',
                })}
              >
                None
              </Button>
              <Button
                onClick={() => handleSpecialPracticeTypeChange(SpecialPracticeType.ZERO_DRILL)}
                disabled={excludeZeroProblems}
                sx={(muiTheme) => ({
                  padding: muiTheme.spacing(1),
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  borderRadius: muiTheme.shape.borderRadius,
                  border: '1px solid',
                  borderColor: specialPracticeType === SpecialPracticeType.ZERO_DRILL ? 'primary.main' : 'grey.200',
                  backgroundColor: specialPracticeType === SpecialPracticeType.ZERO_DRILL ? 'primary.light' : 'white',
                  color: specialPracticeType === SpecialPracticeType.ZERO_DRILL ? 'primary.dark' : 'grey.600',
                  fontWeight: specialPracticeType === SpecialPracticeType.ZERO_DRILL ? 600 : 400,
                  '&:hover': {
                    backgroundColor: specialPracticeType === SpecialPracticeType.ZERO_DRILL ? 'primary.light' : 'grey.50',
                    borderColor: specialPracticeType === SpecialPracticeType.ZERO_DRILL ? 'primary.main' : 'grey.300',
                  },
                  width: '100%',
                  opacity: excludeZeroProblems ? 0.5 : 1,
                })}
              >
                Zero Drill (0专项)
              </Button>
              <Button
                onClick={() => handleSpecialPracticeTypeChange(SpecialPracticeType.FACT_FAMILY)}
                sx={(muiTheme) => ({
                  padding: muiTheme.spacing(1),
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  borderRadius: muiTheme.shape.borderRadius,
                  border: '1px solid',
                  borderColor: specialPracticeType === SpecialPracticeType.FACT_FAMILY ? 'primary.main' : 'grey.200',
                  backgroundColor: specialPracticeType === SpecialPracticeType.FACT_FAMILY ? 'primary.light' : 'white',
                  color: specialPracticeType === SpecialPracticeType.FACT_FAMILY ? 'primary.dark' : 'grey.600',
                  fontWeight: specialPracticeType === SpecialPracticeType.FACT_FAMILY ? 600 : 400,
                  '&:hover': {
                    backgroundColor: specialPracticeType === SpecialPracticeType.FACT_FAMILY ? 'primary.light' : 'grey.50',
                    borderColor: specialPracticeType === SpecialPracticeType.FACT_FAMILY ? 'primary.main' : 'grey.300',
                  },
                  width: '100%',
                })}
              >
                Fact Family (组合规律)
              </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {specialPracticeType === SpecialPracticeType.NONE && 'Choose a special drill for focused practice'}
              {specialPracticeType === SpecialPracticeType.ZERO_DRILL && `含0专项：支持 ${activeProblemType === ProblemType.STANDARD ? 'Standard' : 'Fill Blank'} 模式`}
              {specialPracticeType === SpecialPracticeType.FACT_FAMILY && `组合规律专项：支持 ${activeProblemType === ProblemType.STANDARD ? 'Standard' : 'Fill Blank'} 模式`}
              {displayMode === DisplayMode.EMOJI && specialPracticeType !== SpecialPracticeType.NONE && (
                <Box component="span" sx={{ color: 'success.main', ml: 1 }}>
                  ✅ Special Practice supports Emoji mode
                </Box>
              )}
              {specialPracticeType !== SpecialPracticeType.NONE && operation === OperationType.MULTI_OPERATIONS && (
                <Box component="span" sx={{ color: 'info.main', ml: 1 }}>
                  💡 Multi-operation mode is not compatible with special practice
                </Box>
              )}
            </Typography>
          </Box>
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

          <Tooltip title="Reset all settings to default values" arrow>
            <Button
              onClick={onResetConfig}
              variant="text"
              startIcon={<ResetIcon />}
              color="inherit"
              sx={{
                borderRadius: 2,
                padding: 1,
                textTransform: 'none',
                fontWeight: 400,
                fontSize: '0.8rem',
                color: 'text.secondary',
                '&:hover': {
                  color: 'error.main',
                  bgcolor: 'error.50',
                },
                width: '100%',
              }}
            >
              重置为默认设置
            </Button>
          </Tooltip>
        </Stack>
      </Box>
    </Paper>
  );
};

export default WorksheetSettings;