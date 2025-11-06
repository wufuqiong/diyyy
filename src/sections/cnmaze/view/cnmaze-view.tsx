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

import miemieData from 'src/data/miemie.json';

interface TableSizePreset {
  name: string;
  rows: number;
  cols: number;
}

interface ModePreset {
  name: string;
  id: string;
}

interface PageData {
  chars: string[][];
  rows: number;
  cols: number;
  mode: string;
}

interface PreviewPage {
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

interface CNMazeState {
  userInput: string;
  selectedMode: number;
  selectedTableSize: number;
  selectedLevel: string;
  pages: PageData[];
}

// Assuming miemie.json has this structure
interface MiemieData {
  [key: string]: string[];
}

// Type assertion for the imported data
const miemie = miemieData as MiemieData;

const TITLE = "汉字迷宫";

const TABLE_SIZE_PRESETS: TableSizePreset[] = [
  {
    name: '8 x 8',
    rows: 8,
    cols: 8,
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

const MODE_PRESETS: ModePreset[] = [
  {
    name: '单字练习',
    id: 'WORD',
  },
  {
    name: '词语（请用空格或回车分隔）',
    id: 'PHRASE',
  },
  {
    name: '句子练习',
    id: 'SENTENCE',
  },
]

const MAX_INPUT_LENGTH = 300;
const SAMPLE_DICT = "人教版小学语文一年级上册";

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


export class CNMazeView extends React.Component<object, CNMazeState> {
  constructor(props: object) {
    super(props);
    this.state = {
      userInput: '',
      selectedMode: 0,
      selectedTableSize: 0,
      selectedLevel: '',
      pages: [],
    };
  }

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

  handleLevelChange = (e: SelectChangeEvent<string>): void => {
    const level = e.target.value;
    this.setState({ selectedLevel: level });
    
    if (level && miemie[level]) {
      const chineseChars = miemie[level].join('');
      this.setState({ userInput: chineseChars });
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

  generateWordMaze = (char: string, rows: number, cols: number): string[][] => {
    const maze: string[][] = [];
    const simpleChars = shuffleArray([...miemie[SAMPLE_DICT], ...miemie[SAMPLE_DICT]]);
    

    for (let i = 0; i < rows; i++) {
      const row: string[] = [];
      for (let j = 0; j < cols; j++) {
        row.push(simpleChars[i*rows + j]);
      }
      maze.push(row);
    }

    const path = generateWordMazePath(rows, cols);
    for (let i = 0; i < path.length; i++) {
      maze[path[i][0]] [path[i][1]] = char;
    }
    
    return maze;
  }
  
  generatePages = (): void => {
    const { selectedMode, selectedTableSize } = this.state;
    let { userInput } = this.state;
    
    userInput = this.filterChineseCharacters(userInput);
    
    if (!userInput.trim()) {
      alert('请输入要练习的文字');
      return;
    }

    const rows = TABLE_SIZE_PRESETS[selectedTableSize].rows;
    const cols = TABLE_SIZE_PRESETS[selectedTableSize].cols;
    const mode = MODE_PRESETS[selectedMode].id;
    const pages: PageData[] = [];

    this.setState({ userInput }, () => {
      if (mode == 'WORD') {
        const inputChars = userInput.split('');
        const totalPages = inputChars.length;
        for (let i = 0; i < totalPages; i++) {
          const pageChars = this.generateWordMaze(inputChars[i], rows, cols);
          console.log('Generated maze:', pageChars);
          pages.push({
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

  render() {
    const { userInput, selectedMode, selectedTableSize, selectedLevel, pages} = this.state;
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
                        {MODE_PRESETS.map((preset, index) => (
                          <MenuItem key={index} value={index}>
                            {preset.name}
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
                    <FormControl fullWidth>
                      <InputLabel>预设字库</InputLabel>
                      <Select
                        value={selectedLevel}
                        onChange={this.handleLevelChange}
                        label="预设字库"
                      >
                        <MenuItem value="">请选择字库</MenuItem>
                        {Object.keys(miemie).map(level => (
                          <MenuItem key={level} value={level}>
                            {level}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
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

  getWordModeInstruction = (char: string): React.ReactElement => 
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
            请从 <Star sx={{ fontSize: '1.5em', verticalAlign: 'middle', color: 'gold' }} /> 出发，
            沿着
            <Box 
              component="span" 
              sx={{ 
                display: 'inline-block',
                mx: 1,
                px: 2,
                py: 0.5,
                backgroundColor: 'gold',
                color: 'black',
                borderRadius: 1,
                fontWeight: 'bold',
                fontSize: '1.2em',
                border: '2px solid orange',
              }}
            >
              {char}
            </Box>
            字走，走到
            <Flag sx={{ fontSize: '1.5em', verticalAlign: 'middle', color: 'red', ml: 1 }} /> 处。
          </Typography>
        </Box>
  );

  renderPage = (pageData: PreviewPage): React.ReactElement => {
    const { characters, rows, cols, mode } = pageData;
    const totalCircles = rows * cols;
    
    return (
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
          {TITLE}
        </Typography>
        {mode === 'WORD' && this.getWordModeInstruction(characters[0][0])}
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
            const isStart = row === 0 && col === 0;
            // Check if this is the end position (rows-1, cols-1)
            const isEnd = row === rows - 1 && col === cols - 1;
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
                <Typography variant="h3">{char}</Typography>
                {isStart && (
                  <Star 
                    sx={{ 
                      position: 'absolute',
                      top: 4,
                      left: 4,
                      fontSize: '1.5rem', // Larger icon
                      color: 'gold',
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      borderRadius: '50%',
                      p: 0.5,
                    }} 
                  />
                )}

                {isEnd && (
                  <Flag 
                    sx={{ 
                      position: 'absolute',
                      bottom: 4,
                      right: 4,
                      fontSize: '1.5rem', // Larger icon
                      color: 'red',
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      borderRadius: '50%',
                      p: 0.5,
                    }} 
                  />
                )}
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