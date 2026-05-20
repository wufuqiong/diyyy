import type {
  SelectChangeEvent} from '@mui/material';
import type { MiemieData, MiemieDetails } from 'src/types';

import React, { useState, useEffect, useCallback } from 'react';

import {
  Clear as ClearIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Shuffle as ShuffleIcon,
} from '@mui/icons-material';
import {
  Box,
  Stack,
  Button,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  CssBaseline,
  FormControl,
} from '@mui/material';

import { usePersistedConfig } from 'src/hooks/use-persisted-config';

import { shuffleArray } from 'src/utils/array-tools';

import miemieDetails from 'src/data/miemie-details.json';

import { ResponsiveWorkbench } from 'src/sections/_shared/ResponsiveWorkbench';
import {
  SettingsField,
  SettingsPanel,
  SettingsHeader,
  SettingsSection,
} from 'src/sections/_shared/SettingsPanel';

// Define types for our data structures
interface ColorPreset {
  name: string;
  colors: string[];
}

interface PageData {
  chars: string[];
  colors: string[];
}

// Type assertion for the imported data
const miemieDetailsTyped = miemieDetails as MiemieDetails;

const getMiemieDataFromDetails = (field: 'word' | 'phrase' | 'sentence'): MiemieData => {
  const result: MiemieData = {};
  
  Object.keys(miemieDetailsTyped).forEach((key) => {
    const lessons = miemieDetailsTyped[key as keyof MiemieDetails];
    if (!lessons) return;

    const items = lessons.reduce((acc: string[], lesson) => acc.concat(lesson[field] || []), []);
    if (items.length === 0) return;

    const isChinese = items.some(item => /[\u4e00-\u9fff]/.test(item));
    const language = isChinese ? 'Chinese' : 'English';

    if (!result[language]) {
      result[language] = {};
    }
    result[language][key] = items;
  });

  return result;
};

const miemie = getMiemieDataFromDetails('word');

const MAX_INPUT_LENGTH = 300;

// Modify color presets, ensuring 5 distinct colors in each palette
const COLOR_PRESETS: ColorPreset[] = [
  {
    name: '经典组合',
    colors: ['#FF6B6B', '#f5b63aff', '#45B7D1', '#51db8dff', '#F7DC6F']
  },
  {
    name: '柔和组合',
    colors: ['#FF9999', '#66CCCC', '#9999FF', '#FFCC99', '#CC99FF']
  },
  {
    name: '鲜艳组合',
    colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF']
  },
  {
    name: '自然组合',
    colors: ['#8B4513', '#228B22', '#1E90FF', '#FFD700', '#FF6347']
  }
];

const userInputToinputChars = (userInput: string): string[] => {
  let inputChars: string[] = [];

  // Method 1: Split by multiple delimiters using regex
  if (userInput.trim() !== '') {
    inputChars = userInput.split(/[\s,;，；、]+/).filter(char => char.trim() !== '');
  }

  // If the above doesn't capture any characters, try splitting by empty string
  if (inputChars.length === 0 && userInput.trim() !== '') {
    inputChars = userInput.split('').filter(char => char.trim() !== '');
  }

  return inputChars;
};

const generateRandomColorsForPage = (pageChars: string[], presetIndex: number): string[] => {
  const presetColors = COLOR_PRESETS[presetIndex].colors;
  const numColors = Math.min(pageChars.length, 5);
  const shuffledColors = shuffleArray(presetColors).slice(0, numColors);
  return pageChars.map((char, index) => shuffledColors[index % shuffledColors.length]);
};

interface ControlPanelProps {
  userInput: string;
  setUserInput: (val: string) => void;
  wordsPerPage: number;
  setWordsPerPage: (val: number) => void;
  selectedPreset: number;
  setSelectedPreset: (val: number) => void;
  selectedLevel: string;
  setSelectedLevel: (val: string) => void;
  fullSelectedValue: string;
  setFullSelectedValue: (val: string) => void;
  selectedBook: string;
  setSelectedBook: (val: string) => void;
  onGenerate: () => void;
  onPrint: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  userInput, setUserInput,
  wordsPerPage, setWordsPerPage,
  selectedPreset, setSelectedPreset,
  selectedLevel, setSelectedLevel,
  fullSelectedValue, setFullSelectedValue,
  selectedBook, setSelectedBook,
  onGenerate, onPrint
}) => {

  const handleLevelChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    if (value.includes('|')) {
      const [language, level] = value.split('|');
      setFullSelectedValue(value);
      setSelectedLevel(level);
      
      const characters = miemie[language][level];
      setUserInput(characters.join(','));
    } else {
      setFullSelectedValue('');
      setSelectedLevel('');
      setSelectedBook('');
      setUserInput('');
    }
  };

  const handleSelectBookChange = (e: SelectChangeEvent<string>) => {
    const selectedBookTitle = e.target.value;
    setSelectedBook(selectedBookTitle);
    
    const levelKey = selectedLevel as keyof MiemieDetails;
    const lessons = miemieDetailsTyped[levelKey];
    
    const selectedLesson = lessons.find(lesson => lesson.title === selectedBookTitle);
    
    if (selectedLesson) {
      setUserInput(selectedLesson.word.join(','));
    } else {
      setUserInput('');
    }
  };

  const handleClearInput = () => {
    setUserInput('');
    setFullSelectedValue('');
    setSelectedLevel('');
    setSelectedBook('');
  };

  const handleShuffleInput = () => {
    let inputChars = userInputToinputChars(userInput);
    inputChars = shuffleArray(inputChars);
    setUserInput(inputChars.join(','));
  };

  const renderBookOptions = () => {
    if (!selectedLevel) {
      return <MenuItem value="">请先选择级别</MenuItem>;
    }
    
    const levelKey = selectedLevel as keyof MiemieDetails;
    const lessons = miemieDetailsTyped[levelKey];

    if (!lessons || lessons.length === 0) {
      return <MenuItem value="">暂无书册</MenuItem>;
    }
    
    return lessons.map((lesson, index) => (
      <MenuItem key={index} value={lesson.title}>
        {lesson.title}
      </MenuItem>
    ));
  };

  return (
    <SettingsPanel
      width={320}
      header={<SettingsHeader title="Char Color" subtitle="Find and Color" />}
      footer={
        <Stack direction="row" spacing={1}>
          <Button
            onClick={onGenerate}
            variant="outlined"
            startIcon={<RefreshIcon />}
            fullWidth
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Regenerate
          </Button>
          <Button
            onClick={onPrint}
            variant="contained"
            startIcon={<PrintIcon />}
            fullWidth
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Print / PDF
          </Button>
        </Stack>
      }
    >
      {/* ============= LOAD ============= */}
      <SettingsSection title="Load">
        <SettingsField label="预设字库">
          <FormControl fullWidth size="small">
            <InputLabel>预设字库</InputLabel>
            <Select value={fullSelectedValue} onChange={handleLevelChange} label="预设字库">
              <MenuItem value="">请选择字库</MenuItem>
              {Object.keys(miemie).map((language) =>
                Object.keys(miemie[language]).map((level) => (
                  <MenuItem key={`${language}-${level}`} value={`${language}|${level}`}>
                    {language} - {level}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </SettingsField>
        <SettingsField label="预设书册">
          <FormControl fullWidth size="small">
            <InputLabel>预设书册</InputLabel>
            <Select value={selectedBook} onChange={handleSelectBookChange} label="预设书册">
              <MenuItem value="">请选择书册</MenuItem>
              {renderBookOptions()}
            </Select>
          </FormControl>
        </SettingsField>
      </SettingsSection>

      {/* ============= INPUT ============= */}
      <SettingsSection title="Content">
        <SettingsField
          label="Manual Input"
          caption={`${userInput.length}/${MAX_INPUT_LENGTH} characters`}
        >
          <Stack spacing={1}>
            <TextField
              multiline
              rows={4}
              size="small"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={`请输入最多${MAX_INPUT_LENGTH}个要练习的文字`}
              inputProps={{ maxLength: MAX_INPUT_LENGTH }}
              fullWidth
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleClearInput}
                disabled={!userInput}
                sx={{ textTransform: 'none' }}
              >
                Clear
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ShuffleIcon />}
                onClick={handleShuffleInput}
                disabled={userInputToinputChars(userInput).length < 2}
                sx={{ textTransform: 'none' }}
              >
                Shuffle
              </Button>
            </Box>
          </Stack>
        </SettingsField>
      </SettingsSection>

      {/* ============= OPTIONS ============= */}
      <SettingsSection title="Options">
        <SettingsField label="每页字数">
          <FormControl fullWidth size="small">
            <Select
              value={wordsPerPage}
              onChange={(e) => setWordsPerPage(e.target.value as number)}
            >
              <MenuItem value={2}>2 字/页</MenuItem>
              <MenuItem value={3}>3 字/页</MenuItem>
              <MenuItem value={4}>4 字/页</MenuItem>
              <MenuItem value={5}>5 字/页</MenuItem>
            </Select>
          </FormControl>
        </SettingsField>
        <SettingsField label="颜色色系">
          <FormControl fullWidth size="small">
            <Select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value as number)}
            >
              {COLOR_PRESETS.map((preset, index) => (
                <MenuItem key={index} value={index}>
                  {preset.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </SettingsField>
        <SettingsField label="当前色系预览">
          <Box sx={{ display: 'flex', gap: 1 }}>
            {COLOR_PRESETS[selectedPreset].colors.map((color, index) => (
              <Box
                key={index}
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: color,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.300',
                }}
                title={color}
              />
            ))}
          </Box>
        </SettingsField>
      </SettingsSection>
    </SettingsPanel>
  );
};

export const CharColorView: React.FC = () => {
  const [userInput, setUserInput] = usePersistedConfig('charcolor.userInput', '');
  const [wordsPerPage, setWordsPerPage] = usePersistedConfig('charcolor.wordsPerPage', 3);
  const [selectedPreset, setSelectedPreset] = usePersistedConfig('charcolor.selectedPreset', 0);
  const [selectedLevel, setSelectedLevel] = usePersistedConfig('charcolor.selectedLevel', '');
  const [fullSelectedValue, setFullSelectedValue] = usePersistedConfig('charcolor.fullSelectedValue', '');
  const [selectedBook, setSelectedBook] = usePersistedConfig('charcolor.selectedBook', '');
  const [pages, setPages] = useState<PageData[]>([]);

  const pageTitle = '识字涂色 - DIYYY';
  const pageDescription = '免费的识字涂色练习工具，帮助孩子通过涂色认识汉字，支持自定义内容和预设课程。';

  const handlePrint = () => {
    window.print();
  };

  const generatePages = useCallback(() => {
    
    if (!userInput.trim()) {
      setPages([]);
      return;
    }

    if (wordsPerPage < 2 || wordsPerPage > 5) {
      alert('每页字数必须在2-5之间');
      return;
    }

    const inputChars: string[] = userInputToinputChars(userInput);

    const totalPages = Math.ceil(inputChars.length / wordsPerPage);
    
    const newPages: PageData[] = [];
    for (let i = 0; i < totalPages; i++) {
      const startIndex = i * wordsPerPage;
      const endIndex = startIndex + wordsPerPage;
      const pageChars = inputChars.slice(startIndex, endIndex);
      
      if (pageChars.length < wordsPerPage) {
        const neededChars = wordsPerPage - pageChars.length;
        pageChars.push(...inputChars.slice(0, neededChars));
      }

      const pageColors = generateRandomColorsForPage(pageChars, selectedPreset);
      newPages.push({
        chars: pageChars,
        colors: pageColors
      });
    }

    setPages(newPages);
  }, [userInput, wordsPerPage, selectedPreset]);

  useEffect(() => {
    generatePages();
  }, [generatePages]);

  return (
    <>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <CssBaseline />
      <ResponsiveWorkbench
        sidebar={
          <ControlPanel 
            userInput={userInput}
            setUserInput={setUserInput}
            wordsPerPage={wordsPerPage}
            setWordsPerPage={setWordsPerPage}
            selectedPreset={selectedPreset}
            setSelectedPreset={setSelectedPreset}
            selectedLevel={selectedLevel}
            setSelectedLevel={setSelectedLevel}
            fullSelectedValue={fullSelectedValue}
            setFullSelectedValue={setFullSelectedValue}
            selectedBook={selectedBook}
            setSelectedBook={setSelectedBook}
            onGenerate={generatePages}
            onPrint={handlePrint}
          />
        }
      >
        <PreviewSheet pages={pages} />
      </ResponsiveWorkbench>
    </>
  );
};

function hasChineseCharacters(characters: string[]): boolean {
  const chineseRegex = /[\u4e00-\u9fff]/; // Basic Chinese characters
  return characters.some(char => chineseRegex.test(char));
}

const generatePatterns = (characters: string[]): string[][] => {
  if (characters.length === 0) return [];
  
  const chars = characters.flatMap(char => [...char]);;
  let additionalChars: string[] = [];
  const result: string[][] = [];
  let similarChars: string[] = [];

  if (hasChineseCharacters(characters)) {
    similarChars = Object.values(miemie["Chinese"] || {}).flat();
  } else {
    similarChars = miemie["English"]?.["英语字母"] || [];
  }
  additionalChars = additionalChars.concat(similarChars);
  additionalChars = shuffleArray(additionalChars);

  for (let i = 0; i < 7; i++) {
    additionalChars = shuffleArray(additionalChars);
    const randomAdditional = additionalChars.slice(0, 7 - chars.length);
    let line = [...chars, ...randomAdditional];
    line = shuffleArray(line);
    result.push(line);
  }
  
  return result;
};

const PreviewSheet: React.FC<{ pages: PageData[] }> = ({ pages }) => {
  // Shared styles for the outer scrolling container
  const containerStyle = {
    bgcolor: 'grey.200',
    height: '100%',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column', // Stack pages vertically
    alignItems: 'center',    // Center pages horizontally
    gap: 4,                  // Gap between pages
    p: 4,
    '@media print': { p: 0, gap: 0, display: 'block', bgcolor: 'white', overflow: 'visible', height: 'auto' }
  };

  // Shared styles for the A4 page
  const a4PageStyle = {
    bgcolor: 'white',
    boxShadow: 24,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '210mm',
    minHeight: '297mm',
    height: '297mm',
    padding: '15mm',
    boxSizing: 'border-box',
    '@media print': { boxShadow: 'none', minHeight: 'auto', height: '297mm' }
  };

  if (!pages || pages.length === 0) {
    return (
      <Box sx={{ ...containerStyle, justifyContent: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          请输入文字并点击&quot;生成练习页&quot;来预览
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={containerStyle}>
      {pages.map((page, index) => {
        const { chars: characters, colors } = page;
        const patterns = generatePatterns(characters);
        const totalCircles = 49;

        return (
          <Box key={index} sx={{ ...a4PageStyle, '@media print': { 
              ...a4PageStyle['@media print'], 
              breakAfter: index === pages.length - 1 ? 'auto' : 'page' 
          } }}>
            <Box sx={{ p: 2 }}>
              <Typography 
                variant="h1" 
                align="center" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold',
                  my: 4,
                }}
              >
                找一找 涂色
              </Typography>
              
              <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 3,
                    my: 5,
                    flexWrap: 'wrap' 
                  }}
              >
                {characters.map((char, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: '12mm',
                        height: '12mm',
                        backgroundColor: colors[idx],
                        borderRadius: '50%',
                        border: '2px solid #333',
                        aspectRatio: '1',
                      }}
                    />
                    <Typography
                      variant="h4"
                      sx={{
                        width: '12mm',
                        height: '12mm',
                        textAlign: 'center',
                      }}
                    >
                      {char}
                    </Typography>
                  </Box>
                ))}
              </Box>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '5mm',
                margin: '0 auto',
                maxWidth: '180mm',
              }}>
                {Array.from({ length: totalCircles }).map((_, i) => {
                  const row = Math.floor(i / 7);
                  const col = i % 7;
                  const char = patterns[row]?.[col] || '';
                  
                  return (
                    <Box
                      key={i}
                      sx={{
                        width: '20mm',
                        height: '20mm',
                        aspectRatio: '1',
                        border: '0.75pt solid #333',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'white'
                      }}
                    >
                      <Typography variant="h3">{char}</Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
            
            <Box component="footer" sx={{ mt: 'auto', borderTop: 1, borderColor: 'grey.100', pt: 1, textAlign: 'center', color: 'grey.400', fontSize: '0.75rem' }}>
                 Page {index + 1}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};