import React from 'react';

import { Clear, Print, NavigateBefore, NavigateNext } from '@mui/icons-material';
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

// Define types for our data structures
interface ColorPreset {
  name: string;
  colors: string[];
}

interface PageData {
  chars: string[];
  colors: string[];
}

interface PreviewPage {
  characters: string[];
  colors: string[];
  pageNumber: number;
  totalPages: number;
}

interface PreviewSheetProps {
  pages: PreviewPage[];
}

interface CNColorState {
  userInput: string;
  wordsPerPage: number;
  selectedPreset: number;
  selectedLevel: string;
  pages: PageData[];
}

// Assuming miemie.json has this structure
interface MiemieData {
  [key: string]: string[];
}

// Type assertion for the imported data
const miemie = miemieData as MiemieData;

const MAX_INPUT_LENGTH = 300;
const SAMPLE_DICT = "人教版小学语文一年级上册";

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

// Random shuffle array with proper typing
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export class CNColorView extends React.Component<object, CNColorState> {
  constructor(props: object) {
    super(props);
    this.state = {
      userInput: '',
      wordsPerPage: 3,
      selectedPreset: 0,
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

  handleWordsPerPageChange = (e: SelectChangeEvent<number>): void => {
    this.setState({ wordsPerPage: e.target.value as number });
  };

  handleColorPresetChange = (e: SelectChangeEvent<number>): void => {
    const presetIndex = e.target.value as number;
    this.setState({ selectedPreset: presetIndex });
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
      selectedLevel: '',
      pages: [],
    });
  };

  filterChineseCharacters = (text: string): string => 
    text.replace(/[^\u4e00-\u9fff]/g, '');

  generateRandomColorsForPage = (pageChars: string[], presetIndex: number): string[] => {
    const presetColors = COLOR_PRESETS[presetIndex].colors;
    const numColors = Math.min(pageChars.length, 5);
    const shuffledColors = shuffleArray(presetColors).slice(0, numColors);
    return pageChars.map((char, index) => shuffledColors[index % shuffledColors.length]);
  };

  generatePages = (): void => {
    const { wordsPerPage, selectedPreset } = this.state;
    let { userInput } = this.state;
    
    userInput = this.filterChineseCharacters(userInput);
    
    if (!userInput.trim()) {
      alert('请输入要练习的文字');
      return;
    }

    if (wordsPerPage < 2 || wordsPerPage > 5) {
      alert('每页字数必须在2-5之间');
      return;
    }

    this.setState({ userInput }, () => {
      const inputChars = userInput.split('');
      const totalPages = Math.ceil(inputChars.length / wordsPerPage);
      
      const pages: PageData[] = [];
      for (let i = 0; i < totalPages; i++) {
        const startIndex = i * wordsPerPage;
        const endIndex = startIndex + wordsPerPage;
        const pageChars = inputChars.slice(startIndex, endIndex);
        
        if (pageChars.length < wordsPerPage) {
          const neededChars = wordsPerPage - pageChars.length;
          pageChars.push(...inputChars.slice(0, neededChars));
        }
        
        const pageColors = this.generateRandomColorsForPage(pageChars, selectedPreset);
        
        pages.push({
          chars: pageChars,
          colors: pageColors
        });
      }

      this.setState({ pages });
    });
  };

  render() {
    const { userInput, wordsPerPage, selectedPreset, selectedLevel, pages } = this.state;

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
                      <InputLabel>每页字数</InputLabel>
                      <Select
                        value={wordsPerPage}
                        onChange={this.handleWordsPerPageChange}
                        label="每页字数"
                      >
                        <MenuItem value={2}>2字/页</MenuItem>
                        <MenuItem value={3}>3字/页</MenuItem>
                        <MenuItem value={4}>4字/页</MenuItem>
                        <MenuItem value={5}>5字/页</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth>
                      <InputLabel>颜色色系</InputLabel>
                      <Select
                        value={selectedPreset}
                        onChange={this.handleColorPresetChange}
                        label="颜色色系"
                      >
                        {COLOR_PRESETS.map((preset, index) => (
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
                
                {/* Color palette preview - This is the section that's showing in print */}
                <Box sx={{ 
                  mb: 3,
                  '@media print': {
                    display: 'none'
                  }
                }}>
                  <Typography variant="subtitle1" gutterBottom>
                    当前色系
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    {COLOR_PRESETS[selectedPreset].colors.map((color, index) => (
                      <Box
                        key={index}
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 1,
                          border: '1px solid #ccc'
                        }}
                        title={color}
                      >
                        <Typography variant="caption" sx={{ color: 'white', textShadow: '1px 1px 2px black' }}>
                          {index + 1}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    每页将随机使用其中的 {wordsPerPage} 种颜色，确保颜色区分明显
                  </Typography>
                </Box>
                
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
                    colors: page.colors,
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
  }
}

const generatePatterns = (characters: string[]): string[][] => {
  if (characters.length === 0) return [];
  
  const chars = [...characters];
  let additionalChars: string[] = [];
  const result: string[][] = [];

  const similarChars = miemie[SAMPLE_DICT] || [];
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

  renderPage = (pageData: PreviewPage): React.ReactElement => {
    const { characters, colors } = pageData;
    const patterns = generatePatterns(characters);
    const totalCircles = 49;
    
    return (
      <Box sx={{ p: 2 }}>
        <Typography 
          variant="h1" 
          align="center" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold',
            my: 4,       // margin-top & margin-bottom: 32px
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
          {characters.map((char, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: '12mm',
                  height: '12mm',
                  backgroundColor: colors[index],
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