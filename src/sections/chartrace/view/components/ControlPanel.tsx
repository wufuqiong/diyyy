import React, { useState } from 'react';

import {
  Print as PrintIcon,
  Description as DescriptionIcon,
  Dashboard as DashboardIcon,
  Palette as PaletteIcon,
  TextFields as TextFieldsIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon
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
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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

        if (isChinese) {
          if (prev.gridType === GridType.ENGLISH_LINES) {
            updates.gridType = GridType.TIAN;
          }
          if (prev.fontFamily?.startsWith('font-english') || prev.fontFamily === 'font-sans') {
            updates.fontFamily = 'font-kaiti';
          }
        } else if (!isChinese && isEnglish) {
          if (prev.gridType !== GridType.ENGLISH_LINES) {
            updates.gridType = GridType.ENGLISH_LINES;
            if (!prev.gridSize) updates.gridSize = 14;
          }
        }
      }

      if (key === 'gridType') {
        if (value === GridType.ENGLISH_LINES) {
          if (!prev.gridSize) updates.gridSize = 14;
        } else if (prev.fontFamily?.startsWith('font-english') || prev.fontFamily === 'font-sans') {
          updates.fontFamily = 'font-kaiti';
        }
      }

      if (key === 'gridColor') {
        updates.traceTextColor = value;
      }

      return { ...prev, ...updates };
    });
  };

  const handleBatchChange = (updates: Partial<SheetConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number | ''>('');

  const currentLessons = selectedLevel ? (miemieDetails as any)[selectedLevel] : null;
  const currentLesson = currentLessons && selectedLessonIndex !== '' ? currentLessons[selectedLessonIndex] : null;

  const hasWords = selectedLessonIndex !== '' 
    ? currentLesson && Array.isArray(currentLesson.word) && currentLesson.word.length > 0
    : currentLessons && currentLessons.some((l: any) => Array.isArray(l.word) && l.word.length > 0);

  const hasPhrases = selectedLessonIndex !== '' 
    ? currentLesson && Array.isArray(currentLesson.phrase) && currentLesson.phrase.length > 0
    : currentLessons && currentLessons.some((l: any) => Array.isArray(l.phrase) && l.phrase.length > 0);

  const hasSentences = selectedLessonIndex !== '' 
    ? currentLesson && Array.isArray(currentLesson.sentence) && currentLesson.sentence.length > 0
    : currentLessons && currentLessons.some((l: any) => Array.isArray(l.sentence) && l.sentence.length > 0);

  const handleLoadContent = (type: 'word' | 'phrase' | 'sentence', lessonData?: any) => {
    let targetLessons: any[] = [];
    if (lessonData) {
        targetLessons = Array.isArray(lessonData) ? lessonData : [lessonData];
    } else if (currentLesson) {
        targetLessons = [currentLesson];
    } else if (currentLessons && selectedLessonIndex === '') {
        targetLessons = currentLessons;
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
      text: content
    };

    // Auto-detect language to help with batch updates
    const isChinese = /[\u4e00-\u9fa5]/.test(content);
    const isEnglish = /[a-zA-Z]/.test(content);
    if (isChinese) {
        if (config.gridType === GridType.ENGLISH_LINES) updates.gridType = GridType.TIAN;
        if (config.fontFamily?.startsWith('font-english') || config.fontFamily === 'font-sans') updates.fontFamily = 'font-kaiti';
    } else if (!isChinese && isEnglish) {
        if (config.gridType !== GridType.ENGLISH_LINES) {
            updates.gridType = GridType.ENGLISH_LINES;
            updates.gridSize = config.gridSize || 14;
        }
        if (config.fontFamily === 'font-kaiti' || config.fontFamily === 'font-cursor' || config.fontFamily === 'font-brush') {
            updates.fontFamily = 'font-english-print';
        }
    }

    handleBatchChange(updates);
  };

  const handleLessonChange = (val: number | string) => {
    if (val === '') {
      setSelectedLessonIndex('');
      return;
    }
    const index = Number(val);
    setSelectedLessonIndex(index);
    const lesson = currentLessons[index];
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

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        
        {/* Content Section */}
        <Accordion defaultExpanded disableGutters elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: 'grey.50' }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ color: 'primary.main' }}>
              <DescriptionIcon fontSize="small" />
              <Typography variant="subtitle2" fontWeight="bold">Content & Load</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 2, pb: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Stack spacing={2}>
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
                  {Object.keys(miemieDetails).map((level) => {
                    const lessons = (miemieDetails as any)[level];
                    const isDisabled = !Array.isArray(lessons) || lessons.length === 0;
                    return <MenuItem key={level} value={level} disabled={isDisabled}>{level}</MenuItem>;
                  })}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small" disabled={!currentLessons || currentLessons.length === 0}>
                <InputLabel>Lesson</InputLabel>
                <Select
                  value={selectedLessonIndex}
                  label="Lesson"
                  displayEmpty
                  onChange={(e) => handleLessonChange(e.target.value)}
                >
                  <MenuItem value=""><em>All Lessons in Level</em></MenuItem>
                  {currentLessons?.map((lesson: any, index: number) => (
                    <MenuItem key={index} value={index}>{lesson.title}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Stack direction="row" spacing={1} justifyContent="center">
                <Button variant="outlined" size="small" onClick={() => handleLoadContent('word')} disabled={!selectedLevel || !hasWords}>Words</Button>
                <Button variant="outlined" size="small" onClick={() => handleLoadContent('phrase')} disabled={!selectedLevel || !hasPhrases}>Phrases</Button>
                <Button variant="outlined" size="small" onClick={() => handleLoadContent('sentence')} disabled={!selectedLevel || !hasSentences}>Sentences</Button>
              </Stack>
              
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary" align="center">Quick Presets</Typography>
              <Stack direction="row" spacing={1} justifyContent="center">
                <Button 
                  variant="outlined" 
                  size="small" 
                  color="secondary"
                  onClick={() => {
                    handleBatchChange({
                      text: 'a, o, e, i, u, ü, b, p, m, f, d, t, n, l, g, k, h, j, q, x, zh, ch, sh, r, z, c, s, y, w, ai, ei, ui, ao, ou, iu, ie, üe, er, an, en, in, un, ün, ang, eng, ing, ong',
                      gridType: GridType.ENGLISH_LINES,
                      gridSize: 14,
                      headerTitle: '汉语拼音描红',
                      fontFamily: 'font-english-print'
                    });
                  }}
                >
                  All Pinyin
                </Button>
                <Button 
                  variant="outlined" 
                  size="small" 
                  color="secondary"
                  onClick={() => {
                    handleBatchChange({
                      text: 'A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z',
                      gridType: GridType.ENGLISH_LINES,
                      gridSize: 14,
                      headerTitle: 'Alphabet Tracing',
                      fontFamily: 'font-english-print'
                    });
                  }}
                >
                  Alphabet
                </Button>
              </Stack>
            </Stack>

            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">Manual Input</Typography>
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
          </AccordionDetails>
        </Accordion>

        {/* Layout Section */}
        <Accordion defaultExpanded disableGutters elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: 'grey.50' }}>
             <Stack direction="row" alignItems="center" gap={1} sx={{ color: 'primary.main' }}>
                <DashboardIcon fontSize="small" />
                <Typography variant="subtitle2" fontWeight="bold">Grid & Layout</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 2, pb: 3 }}>
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
                    {config.gridType !== GridType.ENGLISH_LINES ? (
                        <TextField
                            label="Rows per Page"
                            type="number"
                            fullWidth
                            size="small"
                            inputProps={{ min: 1, max: 15 }}
                            value={config.rowsPerPage}
                            onChange={(e) => handleChange('rowsPerPage', parseInt(e.target.value))}
                        />
                    ) : (
                        <FormControl fullWidth size="small">
                            <InputLabel>Size (mm)</InputLabel>
                            <Select
                                value={config.gridSize || 14}
                                label="Size (mm)"
                                onChange={(e) => handleChange('gridSize', parseInt(e.target.value as unknown as string))}
                            >
                                <MenuItem value={14}>14mm</MenuItem>
                                <MenuItem value={17}>17mm</MenuItem>
                                <MenuItem value={20}>20mm</MenuItem>
                            </Select>
                        </FormControl>
                    )}
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
                            sx={{ color: 'primary.main' }}
                        />
                        <Box sx={{ minWidth: 30, textAlign: 'center', fontWeight: 'bold', border: 1, borderColor: 'divider', borderRadius: 1, p: 0.5 }}>
                            {config.traceCount}
                        </Box>
                     </Stack>
                </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Text Style Section */}
        <Accordion disableGutters elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: 'grey.50' }}>
             <Stack direction="row" alignItems="center" gap={1} sx={{ color: 'primary.main' }}>
                <PaletteIcon fontSize="small" />
                <Typography variant="subtitle2" fontWeight="bold">Text Style</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 2, pb: 3 }}>
            <Stack spacing={3}>
                <FormControl fullWidth size="small">
                    <InputLabel>Font Family</InputLabel>
                    <Select 
                        value={config.fontFamily}
                        label="Font Family"
                        onChange={(e) => handleChange('fontFamily', e.target.value)}
                    >
                        {config.gridType !== GridType.ENGLISH_LINES && [
                            <Box key="zh-title" component="li" sx={{ px: 2, py: 1, color: 'text.secondary', typography: 'caption' }}>Chinese</Box>,
                            <MenuItem key="zh-1" value="font-kaiti">KaiTi (Standard)</MenuItem>,
                            <MenuItem key="zh-2" value="font-cursor">Ma Shan Zheng (Cursive)</MenuItem>,
                            <MenuItem key="zh-3" value="font-brush">Zhi Mang Xing (Brush)</MenuItem>,
                            <MenuItem key="zh-4" value="font-serif">Serif</MenuItem>
                        ]}
                        {(config.gridType === GridType.ENGLISH_LINES || !hasChineseInText) && [
                            <Box key="en-title" component="li" sx={{ px: 2, py: 1, color: 'text.secondary', typography: 'caption' }}>English</Box>,
                            <MenuItem key="en-1" value="font-english-print">Fredoka (Rounded Print)</MenuItem>,
                            <MenuItem key="en-2" value="font-english-hand">Patrick Hand (Handwriting)</MenuItem>,
                            <MenuItem key="en-3" value="font-sans">Sans Serif (Standard)</MenuItem>
                        ]}
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
                        sx={{ color: 'primary.main' }}
                    />
                </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Page Setup Section */}
        <Accordion disableGutters elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: 'grey.50' }}>
             <Stack direction="row" alignItems="center" gap={1} sx={{ color: 'primary.main' }}>
                <SettingsIcon fontSize="small" />
                <Typography variant="subtitle2" fontWeight="bold">Page Setup</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 2, pb: 3 }}>
            <Stack spacing={3}>
                <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom display="block">Header Text</Typography>
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

                {config.gridType !== GridType.ENGLISH_LINES && (
                    <Box>
                        <Typography variant="caption" color="text.secondary" gutterBottom display="block">Advanced Options</Typography>
                        <Stack direction="row" spacing={2}>
                            <FormControlLabel
                                control={
                                    <Checkbox 
                                    checked={config.showPinyin}
                                    onChange={(e) => handleChange('showPinyin', e.target.checked)}
                                    color="primary"
                                    />
                                }
                                label={<Typography variant="body2">Show Pinyin</Typography>}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox 
                                    checked={config.showStrokeCount}
                                    onChange={(e) => handleChange('showStrokeCount', e.target.checked)}
                                    color="primary"
                                    />
                                }
                                label={<Typography variant="body2">Stroke Count</Typography>}
                            />
                        </Stack>
                    </Box>
                )}
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Box>  
      <Box sx={{ pt: 2, pb: 2, textAlign: 'center', bgcolor: 'grey.50', borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.disabled">Generated by Miemie Tools</Typography>
      </Box>
    </Paper>
  );
};