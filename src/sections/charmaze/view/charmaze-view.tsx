import React, { Component } from 'react';

import { Clear } from '@mui/icons-material';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Paper,
  Container,
  Grid,
  IconButton,
  SelectChangeEvent
} from '@mui/material';

import { filterMazeCharacters, shuffleArray } from 'src/utils/array-tools';
import { generateWordMazePath, generatePhraseMazePath, generateSentenceMazePath } from 'src/utils/maze-tools';

import miemieWords from 'src/data/miemie-words.json';
import miemiePhrase from 'src/data/miemie-phrase.json';
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

interface CharMazeState {
  userInput: string;
  wordsPerPage: number;
  selectedMode: number;
  selectedTableSize: number;
  selectedLevel: string;
  selectedLanguage: string;
  fullSelectedValue: string;
  selectedBook: string;
  pages: PageData[];
  isGenerating: boolean;
}

const TABLE_SIZE_PRESETS: TableSizePreset[] = [
  { name: '8 x 8', rows: 8, cols: 8 },
  { name: '9 x 9', rows: 9, cols: 9 },
  { name: '10 x 10', rows: 10, cols: 10 },
  { name: '12 x 12', rows: 12, cols: 12 },
];

// Type assertion for the imported data
const miemiewords = miemieWords as MiemieData;
const miemiephrase = miemiePhrase as MiemieData;
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

const MIEMIE_PRESETS: Record<Mode, MiemieData> = {
  'WORD': miemiewords,
  'PHRASE': miemiephrase,
  'SENTENCE': miemiewords,
};

const MAX_INPUT_LENGTH = 300;
const CHINESE_SAMPLE_DICT = "人教版小学语文一年级上册";
const ENGLISH_UPPER = "A-Z大写字母";
const ENGLISH_LOWER = "a-z小写字母";


function hasChineseCharacters(characters: string[]): boolean {
  const chineseRegex = /[\u4e00-\u9fff]/;
  return characters.some(char => chineseRegex.test(char));
}

export class CharMazeView extends Component<object, CharMazeState> {
  constructor(props: object) {
    super(props);
    this.state = {
      userInput: '',
      selectedMode: 0,
      wordsPerPage: 5,
      selectedTableSize: 0,
      selectedLevel: '',
      selectedLanguage: '',
      fullSelectedValue: '',
      selectedBook: '',
      pages: [],
      isGenerating: false,
    };
  }

  parseSelectedMode = (selectedMode: number): Mode => 
    Object.keys(MODE_PRESETS)[selectedMode] as Mode;

  getSplitter = () => {
    const mode = this.parseSelectedMode(this.state.selectedMode);
    return mode === 'SENTENCE' ? '\n' : ',';
  };

  handleUserInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const input = e.target.value;
    if (input.length <= MAX_INPUT_LENGTH) {
      this.setState({ userInput: input });
    }
  };

  handleModeChange = (e: SelectChangeEvent<number>): void => {
    const selectedMode = e.target.value as number;
    this.setState({ 
      selectedMode,
      selectedLevel: '',
      selectedLanguage: '',
      fullSelectedValue: '',
      selectedBook: '',
    }, () => {
      this.setState({ userInput: '' });
    });
  };

  handleTableSizeChange = (e: SelectChangeEvent<number>): void => {
    this.setState({ selectedTableSize: e.target.value as number });
  };

  handleWordsPerPageChange = (e: SelectChangeEvent<number>): void => {
    this.setState({ wordsPerPage: e.target.value as number });
  };

  updateInput = async (): Promise<void> => {
    const { selectedMode, selectedLevel, selectedBook, fullSelectedValue } = this.state;
    
    if (!selectedLevel && !fullSelectedValue) {
      return;
    }

    const mode = this.parseSelectedMode(selectedMode);
    let characters: string[] = [];
    try {
      if (selectedLevel) {
        const levelKey = selectedLevel as keyof MiemieDetails;
        const lessons = miemieDetailsTyped[levelKey];
        
        if (lessons && lessons.length > 0) {
          if (selectedBook) {
            const selectedLesson = lessons.find(lesson => lesson.title === selectedBook);
            if (!selectedLesson) {
              console.error('No lesson found with title:', selectedBook);
              return;
            }
            characters = this.getDataInMiemieDetails(selectedLesson);
          } else {
            lessons.forEach(lesson => {
              characters.push(...this.getDataInMiemieDetails(lesson));
            });
          }
        } else if (fullSelectedValue) {
        const [language, level] = fullSelectedValue.split('|');
        characters = MIEMIE_PRESETS[mode][language]?.[level] || [];
        } 

        this.setState({
          userInput: characters.join(this.getSplitter())
        });
      }
    } catch (error) {
      console.error('Error updating input:', error);
    }
  };

  handleLevelChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    if (value.includes('|')) {
      const [language, level] = value.split('|');
      this.setState({ 
        selectedLanguage: language,
        selectedLevel: level,
        fullSelectedValue: value,
        selectedBook: '',
      }, () => {
        this.updateInput();
      });
    } else {
      this.setState({ 
        selectedLanguage: '',
        selectedLevel: '',
        fullSelectedValue: '',
        selectedBook: '',
        userInput: '',
      });
    }
  };

  getDataInMiemieDetails = (selectedLesson: MiemieLesson): string[] => {
    const { selectedMode } = this.state;
    const mode = this.parseSelectedMode(selectedMode);
    
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

  handleSelectBookChange = (e: SelectChangeEvent<string>) => {
    const selectedBookTitle = e.target.value;
    this.setState({ selectedBook: selectedBookTitle }, () => {
      this.updateInput();
    });
  };

  handleClearInput = (): void => {
    this.setState({ 
      userInput: '',
      selectedLanguage: '',
      selectedLevel: '',
      selectedBook: '',
      fullSelectedValue: '',
      pages: [],
    });
  };

  generateMaze = (chars: string[], rows: number, cols: number, mode: string): string[][] => {
    const maze: string[][] = [];
    let simpleChars: string[] = [];

    if (hasChineseCharacters(chars)) {
      simpleChars = miemiewords["Chinese"][CHINESE_SAMPLE_DICT] || [];
      simpleChars = ['，', '。', '！', ...simpleChars]
    } else {
      simpleChars = [
        ...(miemiewords["English"][ENGLISH_UPPER] || []),
        ...(miemiewords["English"][ENGLISH_LOWER] || [])
      ];
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
  
  generatePages = async (): Promise<void> => {
    const { userInput, selectedMode, selectedTableSize, wordsPerPage, isGenerating } = this.state;
    
    if (!userInput.trim()) {
      alert('请输入要练习的文字');
      return;
    }

    if (isGenerating) {
      return; // Prevent multiple concurrent generations
    }

    this.setState({ isGenerating: true });

    try {
      const rows = TABLE_SIZE_PRESETS[selectedTableSize].rows;
      const cols = TABLE_SIZE_PRESETS[selectedTableSize].cols;
      const mode = this.parseSelectedMode(selectedMode);
      const pages: PageData[] = [];

      // Split input based on mode
      let inputChars: string[] = [];
      if (userInput.trim() !== '') {
        const splitPattern = mode === 'SENTENCE' ? /[\n]+/ : /[\s,;，；、]+/;
        inputChars = userInput.split(splitPattern).filter(char => char.trim() !== '');
        //inputChars = inputChars.map(char => filterMazeCharacters(char));
      }

      if (inputChars.length === 0) {
        alert('没有有效的输入字符');
        this.setState({ isGenerating: false });
        return;
      }

      if (mode === 'WORD') {
        // One page per character
        for (let i = 0; i < inputChars.length; i++) {
          const pageChars = this.generateMaze([inputChars[i]], rows, cols, mode);
          pages.push({
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
            const pageChars = this.generateMaze(pageCharsSlice, rows, cols, mode);
            pages.push({
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
            const pageChars = this.generateMaze(chars, rows, cols, mode);
            pages.push({
              refChars: [sentence],
              chars: pageChars,
              rows,
              cols,
              mode,
            });
          }
        }
      }

      this.setState({ pages, isGenerating: false });
    } catch (error) {
      console.error('Error generating pages:', error);
      alert('生成迷宫时发生错误');
      this.setState({ isGenerating: false });
    }
  };

  getWordLibSelecter = (mode: Mode): React.ReactElement => {
    const title = SELECTER_TITLE_PRESETS[mode];
    const miemiedata = MIEMIE_PRESETS[mode];

    return (
      <FormControl fullWidth>
        <InputLabel>{title}</InputLabel>
        <Select
          value={this.state.fullSelectedValue}
          onChange={this.handleLevelChange}
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

  renderBookOptions = () => {
    const { selectedLevel } = this.state;
    
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

  render() {
    const { 
      userInput, 
      selectedMode, 
      wordsPerPage, 
      selectedTableSize, 
      pages,
      isGenerating,
      selectedBook 
    } = this.state;
    
    return (
      <Box className="app" sx={{ p: 2 }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {/* Input Section */}
            <Grid size={{ xs: 12, md: 12 }} sx={{ 
              '@media print': { display: 'none' }
            }}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <FormControl fullWidth>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      <TextField
                        multiline
                        rows={3}
                        value={userInput}
                        onChange={this.handleUserInputChange}
                        placeholder={`请输入最多${MAX_INPUT_LENGTH}个要练习的文字`}
                        inputProps={{ maxLength: MAX_INPUT_LENGTH }}
                        fullWidth
                        variant="outlined"
                      />
                      <IconButton 
                        onClick={this.handleClearInput}
                        disabled={!userInput}
                        color="error"
                        sx={{ mt: 0.5 }}
                      >
                        <Clear />
                      </IconButton>
                    </Box>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                      已输入 {userInput.length}/{MAX_INPUT_LENGTH} 字
                    </Typography>
                  </FormControl>
                </Box>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12, sm: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>模式选择</InputLabel>
                      <Select
                        value={selectedMode}
                        onChange={this.handleModeChange}
                        label="练习模式"
                      >
                        {Object.keys(MODE_PRESETS).map((preset, index) => (
                          <MenuItem key={index} value={index}>
                            {MODE_PRESETS[preset as Mode]}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>迷宫尺寸</InputLabel>
                      <Select
                        value={selectedTableSize}
                        onChange={this.handleTableSizeChange}
                        label="迷宫尺寸"
                      >
                        {TABLE_SIZE_PRESETS.map((preset, index) => (
                          <MenuItem key={index} value={index}>
                            {preset.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>每页字数</InputLabel>
                      <Select
                        value={wordsPerPage}
                        onChange={this.handleWordsPerPageChange}
                        label="每页字数"
                        disabled={this.parseSelectedMode(selectedMode) !== 'PHRASE'}
                      >
                        {[3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <MenuItem key={num} value={num}>
                            {num}字/页
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 3 }}>
                    {this.getWordLibSelecter(this.parseSelectedMode(selectedMode))}
                  </Grid>

                  <Grid size={{ xs: 12, sm: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel>预设书册</InputLabel>
                      <Select
                        value={selectedBook}
                        onChange={this.handleSelectBookChange}
                        disabled={!this.state.selectedLevel}
                      >
                        <MenuItem value="">全部</MenuItem>
                        {this.renderBookOptions()}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                
                <Button
                  variant="contained"
                  fullWidth
                  onClick={this.generatePages}
                  disabled={!userInput.trim() || isGenerating}
                  size="large"
                  sx={{ 
                    '@media print': { display: 'none' }
                  }}
                >
                  {isGenerating ? '生成中...' : '生成练习页'}
                </Button>
              </Paper>
            </Grid>

            {/* Preview Section */}
            <Grid size={{ xs: 12, md: 12 }} sx={{ 
              '@media print': {
                width: '100%',
                maxWidth: '100%',
                flexBasis: '100%'
              }
            }}>
              <Paper sx={{ 
                p: 3, 
                minHeight: 400,
                '@media print': {
                  boxShadow: 'none',
                  border: 'none',
                  minHeight: 'auto'
                }
              }}>
                {pages.length > 0 ? (
                  <PreviewSheet pages={pages.map((page, index) => ({
                    refChars: page.refChars,
                    characters: page.chars,
                    rows: page.rows,
                    cols: page.cols,
                    mode: page.mode,
                    pageNumber: index + 1,
                    totalPages: pages.length
                  }))} />
                ) : (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    '@media print': { display: 'none' }
                  }}>
                    <Typography variant="h6" color="textSecondary">
                      请输入文字并点击&quot;生成练习页&quot;来预览
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }
}