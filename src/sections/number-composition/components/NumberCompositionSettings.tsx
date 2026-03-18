import React from 'react';

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
  Stack,
  Switch,
  FormControlLabel,
} from '@mui/material';

interface Props {
  maxNumber: number;
  setMaxNumber: (n: number) => void;
  problemCount: number;
  setProblemCount: (c: number) => void;
  title: string;
  setTitle: (t: string) => void;
  theme: string;
  setTheme: (t: string) => void;
  showAnswers: boolean;
  setShowAnswers: (s: boolean) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  onPrint: () => void;
}

const NumberCompositionSettings: React.FC<Props> = ({
  maxNumber,
  setMaxNumber,
  problemCount,
  setProblemCount,
  title,
  setTitle,
  theme,
  setTheme,
  showAnswers,
  setShowAnswers,
  isGenerating,
  onGenerate,
  onPrint,
}) => {
  const handleMaxNumberChange = (event: SelectChangeEvent<string>) => {
    setMaxNumber(parseInt(event.target.value));
  };

  const handleProblemCountChange = (event: Event, newValue: number | number[]) => {
    setProblemCount(newValue as number);
  };

  const handleProblemCountInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(event.target.value);
    if (!isNaN(val)) {
      setProblemCount(Math.max(1, Math.min(12, val)));
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
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
          数的分合
        </Typography>
        <Typography variant="body2" color="text.secondary">
          创建数的分解与合成练习题。
        </Typography>
      </Box>

      <Stack spacing={3}>
        {/* Title Section */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
            标题
          </Typography>
          <TextField
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：10以内数的分与合"
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
        </Box>

        {/* Theme Section */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
            主题
          </Typography>
          <TextField
            fullWidth
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="例如：恐龙、水果、动物..."
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
            {['恐龙 🦕', '水果 🍎', '动物 🐾', '食物 🍔', '交通 🚗', '运动 ⚽'].map((preset) => (
              <Box
                key={preset}
                onClick={() => setTheme(preset.split(' ')[0])}
                sx={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: 1,
                  backgroundColor: 'grey.100',
                  color: 'grey.600',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    borderColor: 'primary.light',
                  },
                }}
              >
                {preset}
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Max Number Section */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
            最大数字
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={maxNumber.toString()}
              onChange={handleMaxNumberChange}
              displayEmpty
            >
              <MenuItem value="5">5以内</MenuItem>
              <MenuItem value="10">10以内</MenuItem>
              <MenuItem value="20">20以内</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            练习题中的最大总数
          </Typography>
        </Box>

        {/* Problem Count Section */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
            题目数量
          </Typography>
          <Stack spacing={2} direction="row" alignItems="center">
            <Slider
              value={problemCount}
              onChange={handleProblemCountChange}
              min={1}
              max={12}
              valueLabelDisplay="auto"
              sx={{ flex: 1 }}
            />
            <TextField
              value={problemCount}
              onChange={handleProblemCountInputChange}
              type="number"
              size="small"
              sx={{ width: 80 }}
              inputProps={{
                min: 1,
                max: 12,
              }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Min 1, Max 12 (每页4题)
          </Typography>
        </Box>

        {/* Show Answers Section */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
            显示选项
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
                  显示答案
                </Typography>
              </Box>
            }
            sx={{ ml: 0 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {showAnswers ? '显示所有答案' : '隐藏答案供学生填写'}
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
            {isGenerating ? '生成中...' : '生成练习题'}
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
            打印 / 保存PDF
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default NumberCompositionSettings;
