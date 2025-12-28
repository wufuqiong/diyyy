// CharTraceView.tsx
import React, { useState, useRef, useEffect } from 'react';

import {
  Clear,
  Shuffle,
  Print,
  NavigateBefore,
  NavigateNext,
  Add,
  PictureAsPdf,
  Download
} from '@mui/icons-material';

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
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Card,
  CardContent,
  FormControlLabel,
  Switch
} from '@mui/material';

import { shuffleArray } from 'src/utils/array-tools';

import miemieData from 'src/data/miemie-words.json';
import miemieDetails from 'src/data/miemie-details.json';
import { MiemieData, MiemieDetails } from 'src/types';

// Define types for our data structures
interface WorksheetPage {
  words: string[];
  pageNumber: number;
  totalPages: number;
}

interface CharTraceState {
  userInput: string;
  wordsPerPage: number;
  selectedLanguage: string;
  selectedLevel: string;
  fullSelectedValue: string;
  selectedBook: string;
  pages: WorksheetPage[];
  fontSize: 'small' | 'medium' | 'large';
  showTracingLines: boolean;
  showGuidelines: boolean;
  lineSpacing: 'small' | 'medium' | 'large';
  printDialogOpen: boolean;
}

// Type assertion for the imported data
const miemie = miemieData as MiemieData;
const miemieDetailsTyped = miemieDetails as MiemieDetails;

const MAX_INPUT_LENGTH = 300;

const FONT_SIZE_MAP = {
  small: 40,
  medium: 60,
  large: 80
};

const LINE_SPACING_MAP = {
  small: 1.5,
  medium: 2,
  large: 2.5
};

export class CharTraceView extends React.Component<object, CharTraceState> {
  constructor(props: object) {
    super(props);
    this.state = {
      userInput: '猫,狗,太阳',
      wordsPerPage: 3,
      selectedLanguage: '',
      selectedLevel: '',
      fullSelectedValue: '',
      selectedBook: '',
      pages: [],
      fontSize: 'medium',
      showTracingLines: true,
      showGuidelines: true,
      lineSpacing: 'medium',
      printDialogOpen: false
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

  handleLevelChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    if (value.includes('|')) {
      const [language, level] = value.split('|');
      this.setState({ 
        selectedLanguage: language,
        selectedLevel: level,
        fullSelectedValue: value
      });
      const characters = miemie[language][level];
      this.setState({
        userInput: characters.join(',')
      });
    } else {
      this.setState({ 
        selectedLanguage: '',
        selectedLevel: '',
        fullSelectedValue: '',
        selectedBook: '',
      });
    }
  };

  handleSelectBookChange = (e: SelectChangeEvent<string>) => {
    const selectedBookTitle = e.target.value;
    this.setState({ selectedBook: selectedBookTitle });
    
    const levelKey = this.state.selectedLevel as keyof MiemieDetails;
    const lessons = miemieDetailsTyped[levelKey];
    
    const selectedLesson = lessons.find(lesson => lesson.title === selectedBookTitle);
    
    if (selectedLesson) {
      this.setState({
        userInput: selectedLesson.word.join(',')
      });
    } else {
      this.setState({
        userInput: ''
      });
    }
  };

  handleClearInput = (): void => {
    this.setState({ 
      userInput: '',
      selectedLanguage: '',
      selectedLevel: '',
      fullSelectedValue: '',
      selectedBook: '',
      pages: [],
    });
  };

  handleShuffleInput = (): void => {
    let words = this.userInputToWords(this.state.userInput);
    words = shuffleArray(words);
    this.setState({
      userInput: words.join(',')
    });
  };

  handleFontSizeChange = (e: SelectChangeEvent<string>): void => {
    this.setState({ fontSize: e.target.value as 'small' | 'medium' | 'large' });
  };

  handleLineSpacingChange = (e: SelectChangeEvent<string>): void => {
    this.setState({ lineSpacing: e.target.value as 'small' | 'medium' | 'large' });
  };

  handleTracingLinesChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ showTracingLines: e.target.checked });
  };

  handleGuidelinesChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ showGuidelines: e.target.checked });
  };

  userInputToWords = (userInput: string): string[] => {
    if (!userInput.trim()) return [];
    
    // Split by common delimiters
    const words = userInput.split(/[\s,;，；、]+/).filter(word => word.trim() !== '');
    
    // If no words found with delimiters, try splitting by characters
    if (words.length === 0 && userInput.trim() !== '') {
      return [userInput.trim()];
    }
    
    return words;
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

  generatePages = (): void => {
    const { wordsPerPage, userInput } = this.state;
    
    if (!userInput.trim()) {
      alert('请输入要练习的文字');
      return;
    }

    if (wordsPerPage < 1 || wordsPerPage > 5) {
      alert('每页字数必须在1-5之间');
      return;
    }

    const words: string[] = this.userInputToWords(userInput);
    const totalPages = Math.ceil(words.length / wordsPerPage);
    
    const pages: WorksheetPage[] = [];
    for (let i = 0; i < totalPages; i++) {
      const startIndex = i * wordsPerPage;
      const endIndex = startIndex + wordsPerPage;
      const pageWords = words.slice(startIndex, endIndex);
      
      pages.push({
        words: pageWords,
        pageNumber: i + 1,
        totalPages
      });
    }

    this.setState({ pages });
  };

  handleAddSampleWords = (): void => {
    const sampleWords = ['苹果', '香蕉', '橙子', '草莓', '葡萄', '西瓜', '桃子', '梨'];
    this.setState({
      userInput: sampleWords.join(',')
    });
  };

  handlePrint = (): void => {
    this.setState({ printDialogOpen: true });
  };

  handlePrintConfirm = (): void => {
    window.print();
    this.setState({ printDialogOpen: false });
  };

  handleDownloadPDF = (): void => {
    alert('PDF功能即将推出！');
  };

  renderWordSection = (word: string, index: number) => {
    const { fontSize, showTracingLines, showGuidelines, lineSpacing } = this.state;
    const currentFontSize = FONT_SIZE_MAP[fontSize];
    const spacing = LINE_SPACING_MAP[lineSpacing];

    return (
      <Box
        key={index}
        sx={{
          mb: 6,
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
          '@media print': {
            mb: 4
          }
        }}
      >
        {/* Spelling Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            拼写练习:
          </Typography>
          <Grid container spacing={1} sx={{ mb: 2 }}>
            {word.split('').map((char, idx) => (
              <Grid item key={idx}>
                <Paper
                  elevation={1}
                  sx={{
                    width: 50,
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed #ccc',
                    backgroundColor: '#fff',
                    '@media print': {
                      border: '2px dashed #000',
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  <Typography variant="h5" sx={{ fontSize: '1.5rem' }}>
                    {char}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            填写文字:
          </Typography>
          <Grid container spacing={1}>
            {word.split('').map((_, idx) => (
              <Grid item key={idx}>
                <Paper
                  sx={{
                    width: 50,
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #ddd',
                    backgroundColor: '#f9f9f9',
                    '@media print': {
                      border: '1px solid #000',
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  <Box sx={{ width: '100%', height: '100%' }} />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Tracing Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            描红练习:
          </Typography>
          <Box
            sx={{
              position: 'relative',
              height: currentFontSize * 1.5,
              display: 'flex',
              alignItems: 'center',
              mb: 1
            }}
          >
            {showGuidelines && (
              <>
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    borderTop: '2px solid #e0e0e0',
                    zIndex: 0,
                    '@media print': {
                      borderTop: '2px solid #000'
                    }
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '30%',
                    left: 0,
                    right: 0,
                    borderTop: '1px dashed #f0f0f0',
                    zIndex: 0,
                    '@media print': {
                      borderTop: '1px dashed #ccc'
                    }
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '70%',
                    left: 0,
                    right: 0,
                    borderTop: '1px dashed #f0f0f0',
                    zIndex: 0,
                    '@media print': {
                      borderTop: '1px dashed #ccc'
                    }
                  }}
                />
              </>
            )}
            
            <Box
              sx={{
                display: 'flex',
                position: 'relative',
                zIndex: 1,
                ml: 2
              }}
            >
              {word.split('').map((char, charIdx) => (
                <Box
                  key={charIdx}
                  sx={{
                    fontSize: `${currentFontSize}px`,
                    fontFamily: '"ZCOOL XiaoWei", "Ma Shan Zheng", cursive, "KaiTi", "STKaiti", serif',
                    color: 'text.primary',
                    mr: 2,
                    position: 'relative',
                    lineHeight: 1
                  }}
                >
                  {showTracingLines ? (
                    <Box
                      sx={{
                        position: 'relative',
                        display: 'inline-block',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3Cpattern id='dots' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23999'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23dots)' opacity='0.3'/%3E%3C/svg%3E")`,
                          pointerEvents: 'none',
                          '@media print': {
                            opacity: 0.5
                          }
                        }
                      }}
                    >
                      {char}
                    </Box>
                  ) : (
                    char
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Writing Practice Section */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            书写练习 ({spacing} 行):
          </Typography>
          {[...Array(3)].map((_, lineIndex) => (
            <Box
              key={lineIndex}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 1
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  mr: 2,
                  minWidth: 40,
                  fontWeight: 'bold'
                }}
              >
                {lineIndex + 1}.
              </Typography>
              <Box sx={{ flex: 1, position: 'relative' }}>
                {showGuidelines && (
                  <>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        right: 0,
                        borderTop: '2px solid #e0e0e0',
                        zIndex: 0,
                        '@media print': {
                          borderTop: '2px solid #000'
                        }
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '30%',
                        left: 0,
                        right: 0,
                        borderTop: '1px dashed #f0f0f0',
                        zIndex: 0,
                        '@media print': {
                          borderTop: '1px dashed #ccc'
                        }
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '70%',
                        left: 0,
                        right: 0,
                        borderTop: '1px dashed #f0f0f0',
                        zIndex: 0,
                        '@media print': {
                          borderTop: '1px dashed #ccc'
                        }
                      }}
                    />
                  </>
                )}
                <Box
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                    height: currentFontSize * 1.2,
                    display: 'flex',
                    alignItems: 'center',
                    ml: 1
                  }}
                >
                  {word.split('').map((_, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        width: currentFontSize * 0.8,
                        mr: 1,
                        borderBottom: '2px solid transparent'
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  render() {
    const { 
      userInput, 
      wordsPerPage, 
      fullSelectedValue, 
      selectedLevel, 
      selectedBook, 
      pages,
      fontSize,
      showTracingLines,
      showGuidelines,
      lineSpacing
    } = this.state;

    return (
      <Box className="app" sx={{ p: 2 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" gutterBottom align="center" sx={{ color: '#1976d2', mb: 4 }}>
            汉字描红书写练习册
          </Typography>
          
          <Grid container spacing={3}>
            {/* Input Section - Hidden when printing */}
            <Grid size={{ xs: 12, md: 4 }} sx={{ 
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
                        placeholder={`请输入要练习的文字，用逗号、空格或分号分隔（最多${MAX_INPUT_LENGTH}字）`}
                        inputProps={{ maxLength: MAX_INPUT_LENGTH }}
                        fullWidth
                        variant="outlined"
                      />
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 0.5
                      }}>
                        <IconButton 
                          onClick={this.handleClearInput}
                          disabled={!userInput}
                          color="error"
                        >
                          <Clear />
                        </IconButton>
                        <IconButton 
                          onClick={this.handleShuffleInput}
                          disabled={!userInput}
                          color="primary"
                        >
                          <Shuffle />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                      已输入 {userInput.length}/{MAX_INPUT_LENGTH} 字
                    </Typography>
                  </FormControl>
                </Box>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormControl fullWidth>
                      <InputLabel>每页字数</InputLabel>
                      <Select
                        value={wordsPerPage}
                        onChange={this.handleWordsPerPageChange}
                        label="每页字数"
                      >
                        <MenuItem value={1}>1字/页</MenuItem>
                        <MenuItem value={2}>2字/页</MenuItem>
                        <MenuItem value={3}>3字/页</MenuItem>
                        <MenuItem value={4}>4字/页</MenuItem>
                        <MenuItem value={5}>5字/页</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormControl fullWidth>
                      <InputLabel>字体大小</InputLabel>
                      <Select
                        value={fontSize}
                        onChange={this.handleFontSizeChange}
                        label="字体大小"
                      >
                        <MenuItem value="small">小号</MenuItem>
                        <MenuItem value="medium">中号</MenuItem>
                        <MenuItem value="large">大号</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormControl fullWidth>
                      <InputLabel>行间距</InputLabel>
                      <Select
                        value={lineSpacing}
                        onChange={this.handleLineSpacingChange}
                        label="行间距"
                      >
                        <MenuItem value="small">小间距</MenuItem>
                        <MenuItem value="medium">中间距</MenuItem>
                        <MenuItem value="large">大间距</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormControl fullWidth>
                      <InputLabel>预设字库</InputLabel>
                      <Select
                        value={fullSelectedValue}
                        onChange={this.handleLevelChange}
                        label="预设字库"
                      >
                        <MenuItem value="">请选择字库</MenuItem>
                        {Object.keys(miemie).map(language => (
                          Object.keys(miemie[language]).map(level => (
                            <MenuItem key={`${language}-${level}`} value={`${language}|${level}`}>
                              {language} - {level}
                            </MenuItem>
                          ))
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <FormControl fullWidth>
                      <InputLabel>预设书册</InputLabel>
                      <Select
                        value={selectedBook}
                        onChange={this.handleSelectBookChange}
                        label="预设书册"
                      >
                        <MenuItem value="">请选择书册</MenuItem>
                        {this.renderBookOptions()}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showTracingLines}
                          onChange={this.handleTracingLinesChange}
                        />
                      }
                      label="显示描红点"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showGuidelines}
                          onChange={this.handleGuidelinesChange}
                        />
                      }
                      label="显示辅助线"
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Button
                      variant="outlined"
                      onClick={this.handleAddSampleWords}
                      fullWidth
                      startIcon={<Add />}
                    >
                      添加示例
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={this.generatePages}
                      disabled={!userInput.trim()}
                    >
                      生成练习页
                    </Button>
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={this.handlePrint}
                      startIcon={<Print />}
                      fullWidth
                      disabled={pages.length === 0}
                    >
                      打印
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={this.handleDownloadPDF}
                      startIcon={<PictureAsPdf />}
                      fullWidth
                      disabled={pages.length === 0}
                    >
                      保存为PDF
                    </Button>
                  </Grid>
                </Grid>
              </Paper>

              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>提示:</strong> 每页包含三个练习部分：拼写练习、描红练习、书写练习。适合儿童汉字学习。
                </Typography>
              </Alert>
            </Grid>

            {/* Preview Section - Full width when printing */}
            <Grid size={{ xs: 12, md: 8 }} sx={{ 
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
                  minHeight: 'auto',
                  p: 0
                }
              }}>
                {pages.length > 0 ? (
                  <TraceWorksheet 
                    pages={pages}
                    fontSize={fontSize}
                    showTracingLines={showTracingLines}
                    showGuidelines={showGuidelines}
                    lineSpacing={lineSpacing}
                  />
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

        {/* Print Dialog */}
        <Dialog open={this.state.printDialogOpen} onClose={() => this.setState({ printDialogOpen: false })}>
          <DialogTitle>打印练习册</DialogTitle>
          <DialogContent>
            <Typography>
              请选择&quot;横向&quot;方向和&quot;适应页面大小&quot;以获取最佳打印效果。
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ printDialogOpen: false })}>取消</Button>
            <Button onClick={this.handlePrintConfirm} variant="contained" color="primary">
              立即打印
            </Button>
          </DialogActions>
        </Dialog>

        {/* Print Styles */}
        <style>
          {`
            @media print {
              .MuiContainer-root,
              .MuiGrid-item:first-child {
                display: none !important;
              }
              .MuiGrid-item:last-child {
                flex: 0 0 100% !important;
                max-width: 100% !important;
              }
              .MuiCard-root, .MuiPaper-root {
                box-shadow: none !important;
                border: none !important;
              }
              .MuiCardContent, .MuiPaper-root {
                padding: 0 !important;
              }
              .trace-worksheet {
                page-break-inside: avoid;
                break-inside: avoid;
              }
              .trace-word-section {
                page-break-inside: avoid;
                break-inside: avoid;
              }
            }
          `}
        </style>
      </Box>
    );
  }
}

interface TraceWorksheetProps {
  pages: WorksheetPage[];
  fontSize: 'small' | 'medium' | 'large';
  showTracingLines: boolean;
  showGuidelines: boolean;
  lineSpacing: 'small' | 'medium' | 'large';
}

interface TraceWorksheetState {
  currentPage: number;
}

class TraceWorksheet extends React.Component<TraceWorksheetProps, TraceWorksheetState> {
  constructor(props: TraceWorksheetProps) {
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

  renderPage = (pageData: WorksheetPage, renderWordSection: (word: string, index: number) => React.ReactNode): React.ReactElement => {
    const { words, pageNumber, totalPages } = pageData;
    
    return (
      <Box 
        sx={{ 
          p: 3,
          '@media print': {
            p: 2
          }
        }}
        className="trace-worksheet"
      >
        {/* Header for printable worksheet */}
        <Box
          sx={{
            mb: 4,
            pb: 2,
            borderBottom: '3px solid #1976d2',
            '@media print': {
              mb: 3,
              borderBottom: '2px solid #000'
            }
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              color: '#1976d2',
              fontWeight: 'bold',
              textAlign: 'center',
              '@media print': {
                fontSize: '2rem',
                color: '#000'
              }
            }}
          >
            汉字描红书写练习册
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" color="textSecondary">
              姓名: ___________________________ 日期: _________________
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              第 {pageNumber} 页 / 共 {totalPages} 页
            </Typography>
          </Box>
        </Box>

        {/* Words Sections */}
        {words.map((word, index) => (
          <React.Fragment key={index}>
            {renderWordSection(word, index)}
            {index < words.length - 1 && (
              <Box
                sx={{
                  my: 4,
                  borderBottom: '1px dashed #e0e0e0',
                  '@media print': {
                    my: 3,
                    borderBottom: '1px dashed #ccc'
                  }
                }}
              />
            )}
          </React.Fragment>
        ))}

        {/* Footer */}
        <Box
          sx={{
            mt: 8,
            pt: 2,
            borderTop: '1px solid #e0e0e0',
            textAlign: 'center',
            '@media print': {
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              mt: 0,
              borderTop: '1px solid #ccc'
            }
          }}
        >
          <Typography variant="body2" color="textSecondary">
            勤加练习，字会越写越好！
          </Typography>
        </Box>
      </Box>
    );
  };

  handlePrint = (): void => {
    window.print();
  };

  renderWordSection = (word: string, index: number) => {
    const { fontSize, showTracingLines, showGuidelines, lineSpacing } = this.props;
    const currentFontSize = FONT_SIZE_MAP[fontSize];
    const spacing = LINE_SPACING_MAP[lineSpacing];

    return (
      <Box
        key={index}
        sx={{
          mb: 6,
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
          '@media print': {
            mb: 4
          }
        }}
        className="trace-word-section"
      >
        {/* Spelling Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            拼写练习:
          </Typography>
          <Grid container spacing={1} sx={{ mb: 2 }}>
            {word.split('').map((char, charIdx) => (
              <Grid item key={charIdx}>
                <Paper
                  elevation={1}
                  sx={{
                    width: 50,
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed #ccc',
                    backgroundColor: '#fff',
                    '@media print': {
                      border: '2px dashed #000',
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  <Typography variant="h5" sx={{ fontSize: '1.5rem' }}>
                    {char}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            填写文字:
          </Typography>
          <Grid container spacing={1}>
            {word.split('').map((_, idx) => (
              <Grid item key={idx}>
                <Paper
                  sx={{
                    width: 50,
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #ddd',
                    backgroundColor: '#f9f9f9',
                    '@media print': {
                      border: '1px solid #000',
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  <Box sx={{ width: '100%', height: '100%' }} />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Tracing Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            描红练习:
          </Typography>
          <Box
            sx={{
              position: 'relative',
              height: currentFontSize * 1.5,
              display: 'flex',
              alignItems: 'center',
              mb: 1
            }}
          >
            {showGuidelines && (
              <>
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    borderTop: '2px solid #e0e0e0',
                    zIndex: 0,
                    '@media print': {
                      borderTop: '2px solid #000'
                    }
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '30%',
                    left: 0,
                    right: 0,
                    borderTop: '1px dashed #f0f0f0',
                    zIndex: 0,
                    '@media print': {
                      borderTop: '1px dashed #ccc'
                    }
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '70%',
                    left: 0,
                    right: 0,
                    borderTop: '1px dashed #f0f0f0',
                    zIndex: 0,
                    '@media print': {
                      borderTop: '1px dashed #ccc'
                    }
                  }}
                />
              </>
            )}
            
            <Box
              sx={{
                display: 'flex',
                position: 'relative',
                zIndex: 1,
                ml: 2
              }}
            >
              {word.split('').map((char, charIdx) => (
                <Box
                  key={charIdx}
                  sx={{
                    fontSize: `${currentFontSize}px`,
                    fontFamily: '"ZCOOL XiaoWei", "Ma Shan Zheng", cursive, "KaiTi", "STKaiti", serif',
                    color: 'text.primary',
                    mr: 2,
                    position: 'relative',
                    lineHeight: 1
                  }}
                >
                  {showTracingLines ? (
                    <Box
                      sx={{
                        position: 'relative',
                        display: 'inline-block',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3Cpattern id='dots' width='8' height='8' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23999'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23dots)' opacity='0.3'/%3E%3C/svg%3E")`,
                          pointerEvents: 'none',
                          '@media print': {
                            opacity: 0.5
                          }
                        }
                      }}
                    >
                      {char}
                    </Box>
                  ) : (
                    char
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Writing Practice Section */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            书写练习 ({spacing} 行):
          </Typography>
          {[...Array(3)].map((_, lineIndex) => (
            <Box
              key={lineIndex}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 1
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  mr: 2,
                  minWidth: 40,
                  fontWeight: 'bold'
                }}
              >
                {lineIndex + 1}.
              </Typography>
              <Box sx={{ flex: 1, position: 'relative' }}>
                {showGuidelines && (
                  <>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        right: 0,
                        borderTop: '2px solid #e0e0e0',
                        zIndex: 0,
                        '@media print': {
                          borderTop: '2px solid #000'
                        }
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '30%',
                        left: 0,
                        right: 0,
                        borderTop: '1px dashed #f0f0f0',
                        zIndex: 0,
                        '@media print': {
                          borderTop: '1px dashed #ccc'
                        }
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '70%',
                        left: 0,
                        right: 0,
                        borderTop: '1px dashed #f0f0f0',
                        zIndex: 0,
                        '@media print': {
                          borderTop: '1px dashed #ccc'
                        }
                      }}
                    />
                  </>
                )}
                <Box
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                    height: currentFontSize * 1.2,
                    display: 'flex',
                    alignItems: 'center',
                    ml: 1
                  }}
                >
                  {word.split('').map((_, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        width: currentFontSize * 0.8,
                        mr: 1,
                        borderBottom: '2px solid transparent'
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
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
            {this.renderPage(pages[currentPage], this.renderWordSection)}
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
              {this.renderPage(page, this.renderWordSection)}
            </Box>
          ))}
        </Box>
      </Box>
    );
  }
}