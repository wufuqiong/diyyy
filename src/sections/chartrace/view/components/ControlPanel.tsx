import React, { useState } from 'react';

import {
  Print as PrintIcon,
  Description as DescriptionIcon,
  Dashboard as DashboardIcon,
  Palette as PaletteIcon,
  TextFields as TextFieldsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Select,
  MenuItem,
  Slider,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Stack,
  Paper,
  Tooltip,
  Divider,
  Button
} from '@mui/material';

import miemieDetails from 'src/data/miemie-details.json';
import { SheetConfig, GridType, MiemieData, MiemieDetails, MiemieLesson } from 'src/types';

interface ControlPanelProps {
  config: SheetConfig;
  setConfig: React.Dispatch<React.SetStateAction<SheetConfig>>;
  onPrint: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ config, setConfig, onPrint }) => {
  
  const hasChineseInText = /[\u4e00-\u9fa5]/.test(config.text);

  const handleChange = (key: keyof SheetConfig, value: any) => {
    setConfig(prev => {
      const updates: Partial<SheetConfig> = { [key]: value };

      if (key === 'text') {
        const newText = value as string;
        const isChinese = /[\u4e00-\u9fa5]/.test(newText);
        const isEnglish = /[a-zA-Z]/.test(newText);

        if (isChinese && prev.gridType === GridType.ENGLISH_LINES) {
          updates.gridType = GridType.TIAN;
        } else if (!isChinese && isEnglish && prev.gridType !== GridType.ENGLISH_LINES) {
          updates.gridType = GridType.ENGLISH_LINES;
        }
      }

      return { ...prev, ...updates };
    });
  };

  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number | ''>('');

  const handleLoadContent = (type: 'word' | 'phrase' | 'sentence') => {
    if (!selectedLevel || selectedLessonIndex === '') return;
    
    const lessons = (miemieDetails as any)[selectedLevel];
    if (!lessons) return;
    
    const lesson = lessons[selectedLessonIndex];
    if (!lesson) return;

    handleChange('headerTitle', lesson.title);

    let content = '';
    if (type === 'word') {
        content = lesson.word.join('');
    } else if (type === 'phrase') {
        content = lesson.phrase.join('，');
    } else if (type === 'sentence') {
        content = lesson.sentence.join('\n');
    }
    handleChange('text', content);
  };

  return (
    <Paper 
      elevation={4}
      sx={{ 
        width: { md: 400, xs: '100%' }, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        zIndex: 20,
        borderRadius: 0,
        '@media print': { display: 'none' }
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <Box>
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
                Zitie Master
            </Typography>
            <Typography variant="caption" color="text.secondary">Printable Calligraphy Generator</Typography>
        </Box>
        <Tooltip 
          title="Print Sheet"
          slotProps={{
            popper: {
              sx: { '@media print': { display: 'none' } }
            }
          }}
        >
          <IconButton 
            onClick={onPrint}
            sx={{ bgcolor: 'warning.main', color: 'white', '&:hover': { bgcolor: 'warning.dark' }, boxShadow: 2, '@media print': { display: 'none' } }}
          >
            <PrintIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
        
        {/* Content Section */}
        <Box>
          <Stack direction="row" alignItems="center" gap={1} sx={{ color: 'warning.main', borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>
            <DescriptionIcon fontSize="small" />
            <Typography variant="subtitle2" fontWeight="bold">Load</Typography>
          </Stack>
          <Stack spacing={2} sx={{ mb: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Level</InputLabel>
              <Select
                value={selectedLevel}
                label="Level"
                onChange={(e) => {
                  setSelectedLevel(e.target.value);
                  setSelectedLessonIndex('');
                }}
              >
                {Object.keys(miemieDetails).map((level) => (
                  <MenuItem key={level} value={level}>{level}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" disabled={!selectedLevel}>
              <InputLabel>Lesson</InputLabel>
              <Select
                value={selectedLessonIndex}
                label="Lesson"
                onChange={(e) => setSelectedLessonIndex(e.target.value as number)}
              >
                {selectedLevel && (miemieDetails as any)[selectedLevel]?.map((lesson: any, index: number) => (
                  <MenuItem key={index} value={index}>{lesson.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Button variant="outlined" size="small" onClick={() => handleLoadContent('word')} disabled={selectedLessonIndex === ''}>Words</Button>
              <Button variant="outlined" size="small" onClick={() => handleLoadContent('phrase')} disabled={selectedLessonIndex === ''}>Phrases</Button>
              <Button variant="outlined" size="small" onClick={() => handleLoadContent('sentence')} disabled={selectedLessonIndex === ''}>Sentences</Button>
            </Stack>
          </Stack>

            <Stack direction="row" alignItems="center" gap={1} sx={{ color: 'warning.main', borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>
                <DescriptionIcon fontSize="small" />
                <Typography variant="subtitle2" fontWeight="bold">Input Content</Typography>
            </Stack>
            <TextField
                multiline
                rows={4}
                fullWidth
                value={config.text}
                onChange={(e) => handleChange('text', e.target.value)}
                placeholder="Enter text here..."
                variant="outlined"
                inputProps={{ style: { fontFamily: 'KaiTi, STKaiti, "Kaiti SC", "SimKai", serif', fontSize: '1.1rem' } }}
            />
            <Typography variant="caption" display="block" textAlign="right" color="text.secondary" sx={{ mt: 0.5 }}>
                {config.text.length} characters
            </Typography>
        </Box>

        {/* Layout Section */}
        <Box>
             <Stack direction="row" alignItems="center" gap={1} sx={{ color: 'warning.main', borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>
                <DashboardIcon fontSize="small" />
                <Typography variant="subtitle2" fontWeight="bold">Grid & Layout</Typography>
            </Stack>
            
            <Stack spacing={3}>
                <FormControl fullWidth size="small">
                    <InputLabel>Grid Type</InputLabel>
                    <Select
                        value={config.gridType}
                        label="Grid Type"
                        onChange={(e) => handleChange('gridType', e.target.value)}
                    >
                        <MenuItem value={GridType.TIAN}>Tian (田 - Chinese)</MenuItem>
                        <MenuItem value={GridType.MI}>Mi (米 - Chinese)</MenuItem>
                        <MenuItem value={GridType.SQUARE}>Square (口 - Chinese)</MenuItem>
                        <MenuItem value={GridType.ENGLISH_LINES} disabled={hasChineseInText}>English 4-Lines (四线三格)</MenuItem>
                        <MenuItem value={GridType.NONE}>None</MenuItem>
                    </Select>
                </FormControl>

                {config.gridType !== GridType.ENGLISH_LINES && (
                    <Stack direction="row" spacing={2}>
                        <TextField
                            label="Grid Color"
                            type="color"
                            fullWidth
                            size="small"
                            value={config.gridColor}
                            onChange={(e) => handleChange('gridColor', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Opacity"
                            type="number"
                            fullWidth
                            size="small"
                            inputProps={{ min: 0, max: 1, step: 0.1 }}
                            value={config.gridOpacity}
                            onChange={(e) => handleChange('gridOpacity', parseFloat(e.target.value))}
                        />
                    </Stack>
                )}

                <Stack direction="row" spacing={2}>
                    <TextField
                        label="Rows per Page"
                        type="number"
                        fullWidth
                        size="small"
                        inputProps={{ min: 1, max: 15 }}
                        value={config.rowsPerPage}
                        onChange={(e) => handleChange('rowsPerPage', parseInt(e.target.value))}
                    />
                    {config.gridType !== GridType.ENGLISH_LINES && (
                        <TextField
                            label="Cols per Row"
                            type="number"
                            fullWidth
                            size="small"
                            inputProps={{ min: 1, max: 12 }}
                            value={config.colsPerRow}
                            onChange={(e) => handleChange('colsPerRow', parseInt(e.target.value))}
                        />
                    )}
                </Stack>

                <Box>
                     <Typography variant="caption" color="text.secondary" gutterBottom>
                        {config.gridType === GridType.ENGLISH_LINES ? 'Repeat Count' : 'Trace Copies'}
                     </Typography>
                     <Stack direction="row" spacing={2} alignItems="center">
                        <Slider
                            value={config.traceCount}
                            min={0}
                            max={10}
                            step={1}
                            onChange={(_, val) => handleChange('traceCount', val)}
                            valueLabelDisplay="auto"
                            sx={{ color: 'warning.main' }}
                        />
                        <Box sx={{ minWidth: 30, textAlign: 'center', fontWeight: 'bold', border: 1, borderColor: 'divider', borderRadius: 1, p: 0.5 }}>
                            {config.traceCount}
                        </Box>
                     </Stack>
                </Box>
            </Stack>
        </Box>

        {/* Text Style Section */}
        <Box>
             <Stack direction="row" alignItems="center" gap={1} sx={{ color: 'warning.main', borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>
                <PaletteIcon fontSize="small" />
                <Typography variant="subtitle2" fontWeight="bold">Text Style</Typography>
            </Stack>

            <Stack spacing={3}>
                <FormControl fullWidth size="small">
                    <InputLabel>Font Family</InputLabel>
                    <Select 
                        value={config.fontFamily}
                        label="Font Family"
                        onChange={(e) => handleChange('fontFamily', e.target.value)}
                    >
                        <Box component="li" sx={{ px: 2, py: 1, color: 'text.secondary', typography: 'caption' }}>Chinese</Box>
                        <MenuItem value="font-kaiti">KaiTi (Standard)</MenuItem>
                        <MenuItem value="font-cursor">Ma Shan Zheng (Cursive)</MenuItem>
                        <MenuItem value="font-brush">Zhi Mang Xing (Brush)</MenuItem>
                        <MenuItem value="font-serif">Serif</MenuItem>
                        <Divider />
                        <Box component="li" sx={{ px: 2, py: 1, color: 'text.secondary', typography: 'caption' }}>English</Box>
                        <MenuItem value="font-english-print">Fredoka (Rounded Print)</MenuItem>
                        <MenuItem value="font-english-hand">Patrick Hand (Handwriting)</MenuItem>
                        <MenuItem value="font-sans">Sans Serif (Standard)</MenuItem>
                    </Select>
                </FormControl>

                <Stack direction="row" spacing={2}>
                     <TextField
                        label="Main Color"
                        type="color"
                        fullWidth
                        size="small"
                        value={config.mainTextColor}
                        onChange={(e) => handleChange('mainTextColor', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                     <TextField
                        label="Trace Color"
                        type="color"
                        fullWidth
                        size="small"
                        value={config.traceTextColor}
                        onChange={(e) => handleChange('traceTextColor', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                </Stack>
                 <Box>
                    <Typography variant="caption" color="text.secondary">Trace Opacity: {config.traceOpacity}</Typography>
                    <Slider
                        value={config.traceOpacity}
                        min={0.1}
                        max={1}
                        step={0.1}
                        onChange={(_, val) => handleChange('traceOpacity', val as number)}
                        sx={{ color: 'warning.main' }}
                    />
                </Box>
            </Stack>
        </Box>

        {/* Header/Footer */}
        <Box>
             <Stack direction="row" alignItems="center" gap={1} sx={{ color: 'warning.main', borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>
                <TextFieldsIcon fontSize="small" />
                <Typography variant="subtitle2" fontWeight="bold">Page Header</Typography>
            </Stack>
            <Stack spacing={2}>
                <TextField
                    label="Page Title"
                    fullWidth
                    size="small"
                    value={config.headerTitle}
                    onChange={(e) => handleChange('headerTitle', e.target.value)}
                />
                 <TextField
                    label="Right aligned info"
                    fullWidth
                    size="small"
                    value={config.headerContent}
                    onChange={(e) => handleChange('headerContent', e.target.value)}
                />
            </Stack>
        </Box>

        {/* Advanced Options - Only show relevant */}
        {config.gridType !== GridType.ENGLISH_LINES && (
            <Box>
                <Stack direction="row" alignItems="center" gap={1} sx={{ color: 'warning.main', borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>
                    <SettingsIcon fontSize="small" />
                    <Typography variant="subtitle2" fontWeight="bold">Options</Typography>
                </Stack>
                <Stack>
                    <FormControlLabel
                        control={
                            <Checkbox 
                            checked={config.showPinyin}
                            onChange={(e) => handleChange('showPinyin', e.target.checked)}
                            color="warning"
                            />
                        }
                        label={<Typography variant="body2">Show Pinyin</Typography>}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox 
                            checked={config.showStrokeCount}
                            onChange={(e) => handleChange('showStrokeCount', e.target.checked)}
                            color="warning"
                            />
                        }
                        label={<Typography variant="body2">Show Stroke Count</Typography>}
                    />
                </Stack>
            </Box>
        )}
        
        <Box sx={{ pt: 4, pb: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.disabled">Generated by React & MUI</Typography>
        </Box>

      </Box>
    </Paper>
  );
};