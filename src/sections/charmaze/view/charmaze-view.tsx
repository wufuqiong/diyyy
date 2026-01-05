import React, { useState, useEffect, useCallback } from 'react';

import { 
  Print as PrintIcon,
  Description as DescriptionIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Paper,
  IconButton,
  SelectChangeEvent,
  Stack,
  Tooltip,
  CssBaseline,
  Divider
} from '@mui/material';

import { filterMazeCharacters, shuffleArray } from 'src/utils/array-tools';
import { generateWordMazePath, generatePhraseMazePath, generateSentenceMazePath } from 'src/utils/maze-tools';

import miemieDetails from 'src/data/miemie-details.json';
import { MiemieData, MiemieDetails, MiemieLesson } from 'src/types';

import { PreviewSheet } from './preview-sheet';

interface TableSizePreset {
  name: string;
  rows: number;
  cols: number;
}

interface PageData {
  refChars: string[];
  chars: string[][];
  rows: number;
  cols: number;
  mode: string;
}

const TABLE_SIZE_PRESETS: TableSizePreset[] = [
  { name: '8 x 8', rows: 8, cols: 8 },
  { name: '9 x 9', rows: 9, cols: 9 },
  { name: '10 x 10', rows: 10, cols: 10 },
  { name: '12 x 12', rows: 12, cols: 12 },
];

// Type assertion for the imported data
const miemieDetailsTyped = miemieDetails as MiemieDetails;

type Mode = 'WORD' | 'PHRASE' | 'SENTENCE';

const MODE_PRESETS: Record<Mode, string> = {
  'WORD': '单字练习',
  'PHRASE': '词语练习',
  'SENTENCE': '句子练习',
};

const SELECTER_TITLE_PRESETS: Record<Mode, string> = {
  'WORD': '预设字库',
  'PHRASE': '预设词库',
  'SENTENCE': '预设句库',
};

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

const miemieWordData = getMiemieDataFromDetails('word');
const miemiePhraseData = getMiemieDataFromDetails('phrase');
const miemieSentenceData = getMiemieDataFromDetails('sentence');

const MIEMIE_PRESETS: Record<Mode, MiemieData> = {
  'WORD': miemieWordData,
  'PHRASE': miemiePhraseData,
  'SENTENCE': miemieSentenceData,
};

const MAX_INPUT_LENGTH = 300;


function hasChineseCharacters(characters: string[]): boolean {
  const chineseRegex = /[\u4e00-\u9fff]/;
  return characters.some(char => chineseRegex.test(char));
}

const parseSelectedMode = (selectedMode: number): Mode => 
  Object.keys(MODE_PRESETS)[selectedMode] as Mode;

const getSplitter = (mode: Mode) => 
  mode === 'SENTENCE' ? '\n' : ',';

interface ControlPanelProps {
  userInput: string;
  setUserInput: (val: string) => void;
  selectedMode: number;
  setSelectedMode: (val: number) => void;
  selectedTableSize: number;
  setSelectedTableSize: (val: number) => void;
  wordsPerPage: number;
  setWordsPerPage: (val: number) => void;
  selectedLevel: string;
  setSelectedLevel: (val: string) => void;
  fullSelectedValue: string;
  setFullSelectedValue: (val: string) => void;
  selectedBook: string;
  setSelectedBook: (val: string) => void;
  onGenerate: () => void;
  onPrint: () => void;
  isGenerating: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  userInput, setUserInput,
  selectedMode, setSelectedMode,
  selectedTableSize, setSelectedTableSize,
  wordsPerPage, setWordsPerPage,
  selectedLevel, setSelectedLevel,
  fullSelectedValue, setFullSelectedValue,
  selectedBook, setSelectedBook,
  onGenerate, onPrint,
  isGenerating
}) => {

  const handleModeChange = (e: SelectChangeEvent<number>): void => {
    const newMode = e.target.value as number;
    setSelectedMode(newMode);
    setSelectedLevel('');
    setFullSelectedValue('');
    setSelectedBook('');
    setUserInput('');
  };

  const getDataInMiemieDetails = (selectedLesson: MiemieLesson): string[] => {
    const mode = parseSelectedMode(selectedMode);
    
    switch (mode) {
      case "WORD":
        return selectedLesson.word || [];
      case "PHRASE":
        return selectedLesson.phrase || [];
      case "SENTENCE":
        return selectedLesson.sentence || [];
      default:
        return [];
    }
  };

  const updateInput = (level: string, book: string, fullValue: string) => {
    if (!level && !fullValue) return;

    const mode = parseSelectedMode(selectedMode);
    let characters: string[] = [];
    
    try {
      if (level) {
        const levelKey = level as keyof MiemieDetails;
        const lessons = miemieDetailsTyped[levelKey];
        
        if (lessons && lessons.length > 0) {
          if (book) {
            const selectedLesson = lessons.find(lesson => lesson.title === book);
            if (!selectedLesson) return;
            characters = getDataInMiemieDetails(selectedLesson);
          } else {
            lessons.forEach(lesson => {
              characters.push(...getDataInMiemieDetails(lesson));
            });
          }
        }
      } else if (fullValue) {
        const [language, lvl] = fullValue.split('|');
        characters = MIEMIE_PRESETS[mode][language]?.[lvl] || [];
      } 

      setUserInput(characters.join(getSplitter(mode)));
    } catch (error) {
      console.error('Error updating input:', error);
    }
  };

  const handleLevelChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    if (value.includes('|')) {
      const [language, level] = value.split('|');
      setFullSelectedValue(value);
      setSelectedLevel(level);
      setSelectedBook('');
      updateInput(level, '', value);
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
    updateInput(selectedLevel, selectedBookTitle, fullSelectedValue);
  };

  const handleClearInput = () => {
    setUserInput('');
    setFullSelectedValue('');
    setSelectedLevel('');
    setSelectedBook('');
  };

  const getWordLibSelecter = (mode: Mode): React.ReactElement => {
    const title = SELECTER_TITLE_PRESETS[mode];
    const miemiedata = MIEMIE_PRESETS[mode];

    return (
      <FormControl fullWidth size="small">
        <InputLabel>{title}</InputLabel>
        <Select
          value={fullSelectedValue}
          onChange={handleLevelChange}
          label={title}
        >
          <MenuItem value="">请选择</MenuItem>
          {Object.keys(miemiedata).map(language => (
            Object.keys(miemiedata[language] || {}).map(level => (
              <MenuItem key={`${language}-${level}`} value={`${language}|${level}`}>
                {language} - {level}
              </MenuItem>
            ))
          ))}
        </Select>
      </FormControl>
    );
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
    <Paper 
      elevation={4}
      sx={{ 
        width: { xs: '100%', lg: 320 }, 
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
            <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Char Maze
            </Typography>
            <Typography variant="caption" color="text.secondary">Maze Adventure</Typography>
        </Box>
        <Box>
          <Tooltip title="Regenerate">
            <IconButton 
              onClick={onGenerate}
              disabled={isGenerating}
              sx={{ color: 'primary.main', mr: 1 }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print Sheet">
            <IconButton 
              onClick={onPrint}
              sx={{ bgcolor: 'warning.main', color: 'white', '&:hover': { bgcolor: 'warning.dark' }, boxShadow: 2 }}
            >
              <PrintIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
        
        {/* Load Section */}
        <Box>
          <Stack direction="row" alignItems="center" gap={1} sx={{ color: 'warning.main', borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>
            <DescriptionIcon fontSize="small" />
            <Typography variant="subtitle2" fontWeight="bold">Load</Typography>
          </Stack>
          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>模式选择</InputLabel>
              <Select
                value={selectedMode}
                onChange={handleModeChange}
                label="模式选择"
              >
                {Object.keys(MODE_PRESETS).map((preset, index) => (
                  <MenuItem key={index} value={index}>
                    {MODE_PRESETS[preset as Mode]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {getWordLibSelecter(parseSelectedMode(selectedMode))}
            
            <FormControl fullWidth size="small">
              <InputLabel>预设书册</InputLabel>
              <Select
                value={selectedBook}
                onChange={handleSelectBookChange}
                label="预设书册"
                disabled={!selectedLevel}
              >
                <MenuItem value="">全部</MenuItem>
                {renderBookOptions()}
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {/* Input Section */}
        <Box>
          <Stack direction="row" alignItems="center" gap={1} sx={{ color: 'warning.main', borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>
              <DashboardIcon fontSize="small" />
              <Typography variant="subtitle2" fontWeight="bold">Input Content</Typography>
          </Stack>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <TextField
              multiline
              rows={4}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={`请输入最多${MAX_INPUT_LENGTH}个要练习的文字`}
              inputProps={{ maxLength: MAX_INPUT_LENGTH }}
              fullWidth
              variant="outlined"
            />
            <IconButton 
              onClick={handleClearInput}
              disabled={!userInput}
              color="error"
              size="small"
              sx={{ mt: 0.5 }}
            >
              <ClearIcon />
            </IconButton>
          </Box>
          <Typography variant="caption" display="block" textAlign="right" color="text.secondary" sx={{ mt: 0.5 }}>
              {userInput.length}/{MAX_INPUT_LENGTH} characters
          </Typography>
        </Box>

        {/* Options Section */}
        <Box>
          <Stack direction="row" alignItems="center" gap={1} sx={{ color: 'warning.main', borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>
            <SettingsIcon fontSize="small" />
            <Typography variant="subtitle2" fontWeight="bold">Options</Typography>
          </Stack>
          <Stack spacing={3}>
            <FormControl fullWidth size="small">
              <InputLabel>迷宫尺寸</InputLabel>
              <Select
                value={selectedTableSize}
                onChange={(e) => setSelectedTableSize(e.target.value as number)}
                label="迷宫尺寸"
              >
                {TABLE_SIZE_PRESETS.map((preset, index) => (
                  <MenuItem key={index} value={index}>
                    {preset.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>每页字数</InputLabel>
              <Select
                value={wordsPerPage}
                onChange={(e) => setWordsPerPage(e.target.value as number)}
                label="每页字数"
                disabled={parseSelectedMode(selectedMode) !== 'PHRASE'}
              >
                {[3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <MenuItem key={num} value={num}>
                    {num}字/页
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>

        <Box sx={{ pt: 4, pb: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.disabled">Generated by React & MUI</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export const CharMazeView: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [selectedMode, setSelectedMode] = useState(0);
  const [wordsPerPage, setWordsPerPage] = useState(5);
  const [selectedTableSize, setSelectedTableSize] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [fullSelectedValue, setFullSelectedValue] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [pages, setPages] = useState<PageData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const generateMaze = (chars: string[], rows: number, cols: number, mode: string): string[][] => {
    const maze: string[][] = [];
    let simpleChars: string[] = [];

    if (hasChineseCharacters(chars)) {
      simpleChars = Object.values(miemieWordData["Chinese"] || {}).flat();
      simpleChars = ['，', '。', '！', ...simpleChars]
    } else {
      simpleChars = miemieWordData["English"]?.["英语字母"] || [];
      // Duplicate to ensure enough characters
      simpleChars = [...simpleChars, ...simpleChars, ...simpleChars];
    }

    simpleChars = shuffleArray(simpleChars);
    
    // Initialize maze with random characters
    for (let i = 0; i < rows; i++) {
      const row: string[] = [];
      for (let j = 0; j < cols; j++) {
        row.push(simpleChars[(i * rows + j) % simpleChars.length]);
      }
      maze.push(row);
    }

    if (mode === 'WORD' && chars.length > 0) {
      const char = chars[0];
      const path = generateWordMazePath(rows, cols);
      for (let i = 0; i < path.length; i++) {
        const randomChar = char[Math.floor(Math.random() * char.length)];
        maze[path[i][0]][path[i][1]] = randomChar;
      }
    } else if (mode === 'PHRASE') {
      const wordPositions = generatePhraseMazePath(chars, rows, cols);
      wordPositions.forEach(wordPos => {
        const { word, positions } = wordPos;
        for (let i = 0; i < word.length; i++) {
          if (positions[i]) {
            maze[positions[i][0]][positions[i][1]] = word[i];
          }
        }
      });
    } else if (mode === 'SENTENCE') {
      if (chars.length > 0) {
        // Join the chars array to form the sentence
        const sentence = chars.join('');
        const path = generateSentenceMazePath(sentence, rows, cols);
        
        // Place the sentence characters along the path
        for (let i = 0; i < Math.min(sentence.length, path.length); i++) {
          maze[path[i][0]][path[i][1]] = sentence[i];
        }
      }
    }
    
    return maze;
  };

  const generatePages = useCallback(async () => {
    if (!userInput.trim()) {
      setPages([]);
      return;
    }

    setIsGenerating(true);

    try {
      const rows = TABLE_SIZE_PRESETS[selectedTableSize].rows;
      const cols = TABLE_SIZE_PRESETS[selectedTableSize].cols;
      const mode = parseSelectedMode(selectedMode);
      const newPages: PageData[] = [];

      // Split input based on mode
      let inputChars: string[] = [];
      if (userInput.trim() !== '') {
        const splitPattern = mode === 'SENTENCE' ? /[\n]+/ : /[\s,;，；、]+/;
        inputChars = userInput.split(splitPattern).filter(char => char.trim() !== '');
        //inputChars = inputChars.map(char => filterMazeCharacters(char));
      }

      if (inputChars.length === 0) {
        setIsGenerating(false);
        return;
      }

      if (mode === 'WORD') {
        // One page per character
        for (let i = 0; i < inputChars.length; i++) {
          const pageChars = generateMaze([inputChars[i]], rows, cols, mode);
          newPages.push({
            refChars: [inputChars[i]],
            chars: pageChars,
            rows,
            cols,
            mode,
          });
        }
      } else if (mode === 'PHRASE') {
        // Group phrases by wordsPerPage
        const totalPages = Math.ceil(inputChars.length / wordsPerPage);
        
        for (let i = 0; i < totalPages; i++) {
          const startIndex = i * wordsPerPage;
          const endIndex = startIndex + wordsPerPage;
          const pageCharsSlice = inputChars.slice(startIndex, endIndex);
          
          if (pageCharsSlice.length > 0) {
            const pageChars = generateMaze(pageCharsSlice, rows, cols, mode);
            newPages.push({
              refChars: pageCharsSlice,
              chars: pageChars,
              rows,
              cols,
              mode,
            });
          }
        }
      } else if (mode === 'SENTENCE') {
        // Handle sentences (one per page)
        for (let i = 0; i < inputChars.length; i++) {
          const sentence = inputChars[i];
          // Split sentence into characters for maze generation
          const chars = sentence.split('').filter(char => char.trim() !== '');
          if (chars.length > 0) {
            const pageChars = generateMaze(chars, rows, cols, mode);
            newPages.push({
              refChars: [sentence],
              chars: pageChars,
              rows,
              cols,
              mode,
            });
          }
        }
      }

      setPages(newPages);
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating pages:', error);
      setIsGenerating(false);
    }
  }, [userInput, selectedMode, selectedTableSize, wordsPerPage]);

  useEffect(() => {
    generatePages();
  }, [generatePages]);

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', '@media print': { height: 'auto', overflow: 'visible', display: 'block' } }}>
      <CssBaseline />
      {/* Left Config Panel */}
      <ControlPanel 
        userInput={userInput}
        setUserInput={setUserInput}
        selectedMode={selectedMode}
        setSelectedMode={setSelectedMode}
        selectedTableSize={selectedTableSize}
        setSelectedTableSize={setSelectedTableSize}
        wordsPerPage={wordsPerPage}
        setWordsPerPage={setWordsPerPage}
        selectedLevel={selectedLevel}
        setSelectedLevel={setSelectedLevel}
        fullSelectedValue={fullSelectedValue}
        setFullSelectedValue={setFullSelectedValue}
        selectedBook={selectedBook}
        setSelectedBook={setSelectedBook}
        onGenerate={generatePages}
        onPrint={handlePrint}
        isGenerating={isGenerating}
      />
      
      {/* Right Preview Area */}
      <Box component="main" sx={{ flex: 1, height: '100%', position: 'relative', zIndex: 10, '@media print': { height: 'auto', overflow: 'visible' } }}>
        <PreviewSheet pages={pages.map((page, index) => ({
          refChars: page.refChars,
          characters: page.chars,
          rows: page.rows,
          cols: page.cols,
          mode: page.mode,
          pageNumber: index + 1,
          totalPages: pages.length
        }))} />
      </Box>
    </Box>
  );
};