// src/sections/math-genie/components/WorksheetSettings.tsx
import React from 'react';

import {
  Print as PrintIcon,
  AutoAwesome as SparklesIcon,
  AutoFixHigh as WandIcon,
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
} from '@mui/material';

import { DifficultyLevel, OperationType } from 'src/types';

interface Props {
  theme: string;
  setTheme: (t: string) => void;
  difficulty: DifficultyLevel;
  setDifficulty: (d: DifficultyLevel) => void;
  operation: OperationType;
  setOperation: (o: OperationType) => void;
  count: number;
  setCount: (c: number) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  onPrint: () => void;
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
  isGenerating,
  onGenerate,
  onPrint,
}) => {
  const handleCountChange = (event: Event, newValue: number | number[]) => {
    setCount(newValue as number);
  };

  const handleCountInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(event.target.value);
    if (!isNaN(val)) {
      setCount(Math.max(1, Math.min(60, val)));
    }
  };

  const handleOperationChange = (event: SelectChangeEvent) => {
    setOperation(event.target.value as OperationType);
  };

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
        {/* Theme Section */}
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
              startAdornment: (
                <InputAdornment position="start">
                  <SparklesIcon fontSize="small" color="primary" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                  borderWidth: 2,
                },
              },
            }}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
            {presets.map((preset) => (
              <Chip
                key={preset}
                label={preset}
                onClick={() => setTheme(preset.split(' ')[0])}
                size="small"
                sx={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: 1,
                  backgroundColor: 'grey.100',
                  color: 'grey.600',
                  border: '1px solid transparent',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    borderColor: 'primary.light',
                  },
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Difficulty Section */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
            Difficulty
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Button
              onClick={() => setDifficulty(DifficultyLevel.EASY)}
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
              onClick={() => setDifficulty(DifficultyLevel.MEDIUM)}
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
              onClick={() => setDifficulty(DifficultyLevel.HARD)}
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
          </Stack>
        </Box>

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
              min={1}
              max={60}
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
                min: 1,
                max: 60,
              }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Min 1, Max 60 (approx 6 per page)
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
              background: 'linear-gradient(135deg, primary.main, primary.dark)',
              '&:hover': {
                background: 'linear-gradient(135deg, primary.dark, primary.dark)',
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