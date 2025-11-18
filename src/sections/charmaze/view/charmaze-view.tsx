import React, { Component, createRef } from 'react';

import { Print, Clear, NavigateBefore, NavigateNext, Flag, Star } from '@mui/icons-material';
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

import miemieWords from 'src/data/miemie-words.json';
import miemiePhrase from 'src/data/miemie-phrase.json';

import { useRandomIcon } from 'src/components/iconify/random-icon';


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

interface PreviewPage {
  refChars: string[];
  characters: string[][];
  rows: number;
  cols: number;
  mode: string;
  pageNumber: number;
  totalPages: number;
}

interface PreviewSheetProps {
  pages: PreviewPage[];
}

interface CharMazeState {
  userInput: string;
  selectedMode: number;
  selectedTableSize: number;
  selectedLevel: string;
  selectedLanguage: string;
  fullSelectedValue: string;
  pages: PageData[];
}

const TABLE_SIZE_PRESETS: TableSizePreset[] = [
  {
    name: '8 x 8',
    rows: 8,
    cols: 8,
  },
  {
    name: '9 x 9',
    rows: 9,
    cols: 9,
  },
  {
    name: '10 x 10',
    rows: 10,
    cols: 10,
  },
  {
    name: '12 x 12',
    rows: 12,
    cols: 12,
  },
]

interface LanguageLevels {
  [level: string]: string[];
}

interface miemieData {
  [language: string]: LanguageLevels;
}

// Type assertion for the imported data
const miemiewords = miemieWords as miemieData;
const miemiephrase = miemiePhrase as miemieData;

type Mode = 'WORD' | 'PHRASE' | 'SENTENCE';

const TITLE_PRESETS: Record<Mode, string> = {
  'WORD': '单字迷宫',
  'PHRASE': '请找到以下词语',
  'SENTENCE': '请找到以下句子',
};

const MODE_PRESETS: Record<Mode, string> = {
  'WORD': '单字练习',
  'PHRASE': '词语练习',
  'SENTENCE': '句子练习',
}

const SELECTER_TITLE_PRESETS: Record<Mode, string> = {
  'WORD': '预设字库',
  'PHRASE': '预设词库',
  'SENTENCE': '预设句库',
}

const MIEMIE_PRESETS: Record<Mode, miemieData> = {
  'WORD': miemiewords,
  'PHRASE': miemiephrase,
  'SENTENCE': miemiewords
}

const MAX_INPUT_LENGTH = 300;
const CHINESE_SAMPLE_DICT = "人教版小学语文一年级上册";
const ENGLISH_UPPER = "A-Z大写字母";
const ENGLISH_LOWWER = "a-z小写字母";

// Random shuffle array with proper typing
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const generateWordMazePath = (rows: number, cols: number): number[][]  => {

  const visited: number[][] = Array.from({ length: rows }, () => 
    Array.from({ length: cols }, () => 0)
  );
  const path: number[][] = [];

  const dfs = (x: number, y: number): boolean => {
    if (x == rows - 1 && y == cols - 1) {
      path.push([x, y]);
      return true;
    }

    visited[x][y] = 1;
    path.push([x, y]);

    let directions: number[][] = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    directions = shuffleArray(directions);
    for (let i = 0; i < directions.length; i++) {
      const nx = directions[i][0] + x;
      const ny = directions[i][1] + y;
      if (nx >= 0 && ny >= 0 && nx < rows && ny < cols && visited[nx][ny] == 0) {
        let sum = 0;
        for (let j = 0; j < directions.length; j++) {
          const nnx = directions[j][0] + nx;
          const nny = directions[j][1] + ny;
          if (nnx >= 0 && nny >=0 && nnx < rows && nny < cols) {
            sum += visited[nnx][nny];
          }
        }
        if (sum <= 1 && dfs(nx, ny)) {
          return true;
        }
      }
    }

    path.pop();
    visited[x][y] = 0;
    return false;
  }

  if (dfs(0, 0)) {
    return path;
  }
  return [];
}

interface WordPosition {
  word: string;
  positions: [number, number][];
};

const generatePhraseMazePath = (chars: string[], rows: number, cols: number): WordPosition[] => {
  const maze: string[][] = Array(rows).fill(null).map(() => Array(cols).fill(''));
  const wordPositions: WordPosition[] = [];
  
  const sortedChars = [...chars].sort((a, b) => b.length - a.length);
  
  const centerRow = Math.floor(rows / 2);
  const centerCol = Math.floor(cols / 2);
  
  for (const word of sortedChars) {
    let placed = false;
    
    for (let radius = 0; radius <= Math.max(rows, cols) && !placed; radius++) {
      for (let dr = -radius; dr <= radius && !placed; dr++) {
        for (let dc = -radius; dc <= radius && !placed; dc++) {
          if (Math.abs(dr) + Math.abs(dc) !== radius) continue;
          
          const row = centerRow + dr;
          const col = centerCol + dc;
          
          if (row >= 0 && row < rows && col >= 0 && col < cols) {
            const directions: ('horizontal' | 'vertical')[] = ['horizontal', 'vertical'];
            directions.sort(() => Math.random() - 0.5);
            
            for (const direction of directions) {
              if (canPlaceWord(maze, word, row, col, direction, rows, cols)) {
                const positions = placeWord(maze, word, row, col, direction);
                wordPositions.push({ word, positions });
                placed = true;
                break;
              }
            }
          }
        }
      }
    }
    
    if (!placed) {
      break;
    }
  }
  
  return wordPositions;
};

const canPlaceWord = (maze: string[][], word: string, row: number, col: number, 
                              direction: 'horizontal' | 'vertical', 
                              rows: number, cols: number): boolean => {
  if (direction === 'horizontal') {
    if (col + word.length > cols) return false;
    for (let i = 0; i < word.length; i++) {
      if (maze[row][col + i] !== '') return false;
    }
  } else {
    if (row + word.length > rows) return false;
    for (let i = 0; i < word.length; i++) {
      if (maze[row + i][col] !== '') return false;
    }
  }
  return true;
};

const placeWord = (maze: string[][], word: string, row: number, col: number,
                           direction: 'horizontal' | 'vertical'): [number, number][] => {
  const positions: [number, number][] = [];
  if (direction === 'horizontal') {
    for (let i = 0; i < word.length; i++) {
      maze[row][col + i] = word[i];
      positions.push([row, col + i]);
    }
  } else {
    for (let i = 0; i < word.length; i++) {
      maze[row + i][col] = word[i];
      positions.push([row + i, col]);
    }
  }
  return positions;
};

// Instead of functions, create React components
const StartIcon = ({ char }: { char: string }) => {
  const iconStart = useRandomIcon(`maze-page-start-icon-${char}`);
  return (
    <img
      src={iconStart}
      alt="start icon"
      style={{ 
        width: '2em', 
        height: '2em', 
        verticalAlign: 'middle',
      }} 
    />
  );
};

const EndIcon = ({ char }: { char: string }) => {
  const iconEnd = useRandomIcon(`maze-page-end-icon-${char}`);
  return (
    <img
      src={iconEnd}
      alt="end icon"
      style={{ 
        width: '2em', 
        height: '2em', 
        verticalAlign: 'middle',
      }} 
    />
  );
};

function hasChineseCharacters(characters: string[]): boolean {
  const chineseRegex = /[\u4e00-\u9fff]/; // Basic Chinese characters
  return characters.some(char => chineseRegex.test(char));
}

export class CharMazeView extends React.Component<object, CharMazeState> {
  constructor(props: object) {
    super(props);
    this.state = {
      userInput: '',
      selectedMode: 0,
      selectedTableSize: 0,
      selectedLevel: '',
      selectedLanguage: '',
      fullSelectedValue: '',
      pages: [],
    };
  };

  parseSelectedMode = (selectedMode: number): Mode => (
    Object.keys(MODE_PRESETS)[selectedMode] as Mode
  )

  handleUserInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const input = e.target.value;
    if (input.length <= MAX_INPUT_LENGTH) {
      this.setState({ userInput: input });
    }
  };

  handleModeChange = (e: SelectChangeEvent<number>): void => {
    this.setState({
      selectedMode: e.target.value as number
    });
  };

  handleTableSizeChange = (e: SelectChangeEvent<number>): void => {
    this.setState({
      selectedTableSize: e.target.value as number
    });
  };

  handleLevelChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    if (value.includes('|')) {
      const [language, level] = value.split('|');
      // Set both language and level in state
      this.setState({ 
        selectedLanguage: language,
        selectedLevel: level,
        fullSelectedValue: value
      });
      const mode = this.parseSelectedMode(this.state.selectedMode);
      const characters = MIEMIE_PRESETS[mode as Mode][language][level];
      this.setState({
        userInput: characters.join(',')
      })
    } else {
      this.setState({ 
        selectedLanguage: '',
        selectedLevel: '',
        fullSelectedValue: '',
      });
    }
  };

  handleClearInput = (): void => {
    this.setState({ 
      userInput: '',
      pages: [],
    });
  };

  filterChineseCharacters = (text: string): string => 
    text.replace(/[^\u4e00-\u9fff]/g, '');

  generateMaze = (chars: string[], rows: number, cols: number, mode: string): string[][] => {
    const maze: string[][] = [];
    let simpleChars: string[] = [];

    if (hasChineseCharacters(chars)) {
      simpleChars = miemiewords["Chinese"][CHINESE_SAMPLE_DICT] || [];
    } else {
      simpleChars = [...miemiewords["English"][ENGLISH_UPPER], ...miemiewords["English"][ENGLISH_LOWWER]];
      simpleChars = [...simpleChars, ...simpleChars, ...simpleChars];
    }

    simpleChars = shuffleArray(simpleChars);
    for (let i = 0; i < rows; i++) {
      const row: string[] = [];
      for (let j = 0; j < cols; j++) {
        row.push(simpleChars[i*rows + j]);
      }
      maze.push(row);
    }

    if (mode == 'WORD') {
      const char = chars[0]
      const path = generateWordMazePath(rows, cols);
      for (let i = 0; i < path.length; i++) {
        const randomChar = char[Math.floor(Math.random() * char.length)];
        maze[path[i][0]] [path[i][1]] = randomChar;
      }
    }
    
    if (mode == 'PHRASE') {
      const wordPositions = generatePhraseMazePath(chars, rows, cols);
      wordPositions.forEach(wordPos => {
        const {word, positions} = wordPos;
        for (let i = 0; i < word.length; i++) {
          maze[positions[i][0]][positions[i][1]] = word[i];
        }
      })
    }
    
    return maze;
  }
  
  generatePages = (): void => {
    const { selectedMode, selectedTableSize } = this.state;
    const { userInput } = this.state;
    
    //userInput = this.filterChineseCharacters(userInput);
    
    if (!userInput.trim()) {
      alert('请输入要练习的文字');
      return;
    }

    const rows = TABLE_SIZE_PRESETS[selectedTableSize].rows;
    const cols = TABLE_SIZE_PRESETS[selectedTableSize].cols;
    const mode = this.parseSelectedMode(selectedMode);
    const pages: PageData[] = [];

    this.setState({ userInput }, () => {
      if (mode == 'WORD') {
        let inputChars: string[] = [];

        // Method 1: Split by multiple delimiters using regex
        if (userInput.trim() !== '') {
          inputChars = userInput.split(/[\s,;，；、]+/).filter(char => char.trim() !== '');
        }

        // If the above doesn't capture any characters, try splitting by empty string
        if (inputChars.length === 0 && userInput.trim() !== '') {
          inputChars = userInput.split('').filter(char => char.trim() !== '');
        }
        
        const totalPages = inputChars.length;
        for (let i = 0; i < totalPages; i++) {
          const pageChars = this.generateMaze([inputChars[i]], rows, cols, mode);
          pages.push({
            refChars: [inputChars[i]],
            chars: pageChars,
            rows: rows,
            cols: cols,
            mode: mode,
          });
        }
      }
      
      if (mode == 'PHRASE') {
        let inputChars: string[] = [];
        const totalWords = 5;
        if (userInput.trim() !== '') {
            inputChars = userInput.split(/[\s,;，；、]+/).filter(char => char.trim() !== '');
        }
        
        const totalPages = Math.ceil(inputChars.length / totalWords); // Use ceil to handle partial pages
        
        for (let i = 0; i < totalPages; i++) {
            const startIndex = i * totalWords;
            const endIndex = startIndex + totalWords;
            const pageCharsSlice = inputChars.slice(startIndex, endIndex);
            
            const pageChars = this.generateMaze(pageCharsSlice, rows, cols, mode);
            
            pages.push({
                refChars: pageCharsSlice, // Use the slice for this page
                chars: pageChars,
                rows: rows,
                cols: cols,
                mode: mode,
            });
        }
      }

      this.setState({ pages });
    });
  };

  getWordLibSelecter = (mode: Mode): React.ReactElement => {
    const title = SELECTER_TITLE_PRESETS[mode as Mode];
    const miemiedata = MIEMIE_PRESETS[mode as Mode];

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
            // Group languages with their levels
            Object.keys(miemiedata[language]).map(level => (
              <MenuItem key={`${language}-${level}`} value={`${language}|${level}`}>
                {language} - {level}
              </MenuItem>
            ))
          ))}
        </Select>
      </FormControl>
    );
  };

  render() {
    const { userInput, selectedMode, selectedTableSize, pages} = this.state;
    return (
      <Box className="app" sx={{ p: 2 }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {/* Input Section - Hidden when printing */}
            <Grid size={{ xs: 12, md: 12 }} sx={{ 
              '@media print': {
                display: 'none'
              }
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
                  <Grid size={{ xs: 12, sm: 4 }}>
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
                  
                  <Grid size={{ xs: 12, sm: 4 }}>
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
                  
                  <Grid size={{ xs: 12, sm: 4 }}>
                    {this.getWordLibSelecter(this.parseSelectedMode(selectedMode))}
                  </Grid>
                </Grid>
                
                <Button
                  variant="contained"
                  fullWidth
                  onClick={this.generatePages}
                  disabled={!userInput.trim()}
                  size="large"
                  sx={{ 
                    '@media print': {
                      display: 'none'
                    }
                  }}
                >
                  生成练习页
                </Button>
              </Paper>
            </Grid>

            {/* Preview Section - Full width when printing */}
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
                    '@media print': {
                      display: 'none'
                    }
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
  };
}

interface PreviewSheetState {
  currentPage: number;
}

class PreviewSheet extends React.Component<PreviewSheetProps, PreviewSheetState> {
  constructor(props: PreviewSheetProps) {
    super(props);
    this.state = {
      currentPage: 0,
    };
  }

  goToPreviousPage = (): void => {
    this.setState(prevState => ({
      currentPage: Math.max(0, prevState.currentPage - 1)
    }));
  };

  goToNextPage = (): void => {
    const { pages } = this.props;
    this.setState(prevState => ({
      currentPage: Math.min(pages.length - 1, prevState.currentPage + 1)
    }));
  };

  goToPage = (pageIndex: number): void => {
    this.setState({
      currentPage: pageIndex
    });
  };

  generatePageIndicators = (): (number | 'ellipsis')[] => {
    const { pages } = this.props;
    const { currentPage } = this.state;
    const totalPages = pages.length;
    
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    
    const indicators: (number | 'ellipsis')[] = [];
    indicators.push(0);
    
    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) {
        indicators.push(i);
      }
      indicators.push('ellipsis');
      indicators.push(totalPages - 2);
      indicators.push(totalPages - 1);
    } else if (currentPage >= totalPages - 4) {
      indicators.push('ellipsis');
      for (let i = totalPages - 5; i < totalPages; i++) {
        if (i > 0) indicators.push(i);
      }
    } else {
      indicators.push('ellipsis');
      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        indicators.push(i);
      }
      indicators.push('ellipsis');
      indicators.push(totalPages - 1);
    }
    
    return indicators;
  };

  getWordModeInstruction = (char: string, start: React.ReactElement, end: React.ReactElement): React.ReactElement => 
  (
    <Box 
      sx={{ 
        textAlign: 'center',
        mb: 3,
        p: 2,
      }}
    >
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 'bold',
          color: 'primary.main',
        }}
      >
        请从{start}出发，
        沿着
        <Box 
          component="span" 
          sx={{ 
            display: 'inline-block',
            mx: 1,
            px: 2,
            py: 0.5,
            backgroundColor: 'primary.main',
            color: 'white',
            borderRadius: 1,
            fontWeight: 'bold',
            fontSize: '1.2em',
          }}
        >
          {char}
        </Box>
        字走，走到
        {end}处。
      </Typography>
    </Box>
  );

  getPhraseModeInstruction = (chars: string[]): React.ReactElement => 
  (
    <Box 
      sx={{ 
        textAlign: 'center',
        mb: 3,
        p: 2,
      }}
    >
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 'bold',
          color: 'primary.main',
        }}
      >
        {chars.map((index) => (
        <Box 
          component="span" 
          sx={{ 
            display: 'inline-block',
            mx: 1,
            px: 2,
            py: 0.5,
            backgroundColor: 'primary.main',
            color: 'white',
            borderRadius: 1,
            fontWeight: 'bold',
            fontSize: '1.2em',
          }}
        >
          {index}
        </Box>
        ))}
      </Typography>
    </Box>
  );

  getInstruction = (mode: string, refChars: string[]): React.ReactElement => {
    console.log(refChars);
    switch(mode) {
      case 'WORD':
        return this.getWordModeInstruction(refChars[0],
            <StartIcon char={refChars[0]} />,
            <EndIcon char={refChars[0]} />);
      case 'PHRASE':
        return this.getPhraseModeInstruction(refChars);
      case 'SENTENCE':
        return <></>;
      default:
        return <></>;
    }
  } 

  renderPage = (pageData: PreviewPage): React.ReactElement => {
    const { refChars, characters, rows, cols, mode } = pageData;
    const totalCircles = rows * cols;   

    return (
      <Box sx={{ p: 2 }}>
        <Typography 
          variant="h2" 
          align="center" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            my: 4,
          }}
        >
          {TITLE_PRESETS[mode as Mode]}
        </Typography>
        {this.getInstruction(mode, refChars)}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${cols}, 0fr)`, // Use actual cols
          margin: '0 auto',
          justifyContent: 'center', // Add this
          maxWidth: 'fit-content',
        }}>
          {Array.from({ length: totalCircles }).map((_, i) => {
            const row = Math.floor(i / cols);  // Divide by actual columns
            const col = i % cols;              // Modulo by actual columns
            const char = characters[row]?.[col] || '';
            // Check if this is the start position (0,0)
            const isStart = row === 0 && col === 0 && mode === 'WORD';
            // Check if this is the end position (rows-1, cols-1)
            const isEnd = row === rows - 1 && col === cols - 1 && mode === 'WORD';
            const width = 20 * 8 / rows;
            const height = 20 * 8 / cols;
            return (
              <Box
                key={i}
                sx={{
                  width: `${width}mm`,
                  height: `${height}mm`,
                  aspectRatio: '1',
                  border: '1pt solid #333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  position: 'relative',
                }}
              >
                {!isStart && !isEnd && <Typography variant="h3">{char}</Typography>}
                {isStart && <StartIcon char={refChars[0]} />}
                {isEnd && <EndIcon char={refChars[0]} />}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  handlePrint = (): void => {
    window.print();
  };

  render() {
    const { pages } = this.props;
    const { currentPage } = this.state;
    
    if (!pages || pages.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="textSecondary">
            没有可预览的页面
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        {/* Screen preview - hidden when printing */}
        <Box sx={{ 
          '@media print': {
            display: 'none'
          } 
        }}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <IconButton 
                onClick={this.goToPreviousPage}
                disabled={currentPage === 0}
              >
                <NavigateBefore />
              </IconButton>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {this.generatePageIndicators().map((pageIndex, index) => {
                  if (pageIndex === 'ellipsis') {
                    return (
                      <Typography key={`ellipsis-${index}`} sx={{ px: 1 }}>
                        ...
                      </Typography>
                    );
                  }
                  
                  return (
                    <IconButton
                      key={pageIndex}
                      onClick={() => this.goToPage(pageIndex)}
                      color={pageIndex === currentPage ? 'primary' : 'default'}
                      size="small"
                    >
                      {pageIndex + 1}
                    </IconButton>
                  );
                })}
              </Box>
              
              <IconButton 
                onClick={this.goToNextPage}
                disabled={currentPage === pages.length - 1}
              >
                <NavigateNext />
              </IconButton>
            </Box>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            {this.renderPage(pages[currentPage])}
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={this.handlePrint}
            >
              打印所有页面 ({pages.length}页)
            </Button>
          </Box>
        </Box>
        
        {/* Print view - only visible when printing */}
        <Box sx={{ 
          display: 'none',
          '@media print': {
            display: 'block'
          }
        }}>
          {pages.map((page, index) => (
            <Box 
              key={index} 
              sx={{ 
                breakAfter: 'page',
                pageBreakAfter: 'always',
                '&:last-child': {
                  breakAfter: 'auto',
                  pageBreakAfter: 'auto'
                }
              }}
            >
              {this.renderPage(page)}
            </Box>
          ))}
        </Box>
      </Box>
    );
  }
}