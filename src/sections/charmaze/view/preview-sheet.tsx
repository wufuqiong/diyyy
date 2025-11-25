import React from 'react';

import { Print, NavigateBefore, NavigateNext, Flag, Star } from '@mui/icons-material';
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

import { useRandomIcon } from 'src/components/iconify/random-icon';

interface PreviewSheetState {
  currentPage: number;
}

interface PreviewSheetProps {
  pages: PreviewPage[];
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

type Mode = 'WORD' | 'PHRASE' | 'SENTENCE';

const TITLE_PRESETS: Record<Mode, string> = {
  'WORD': '单字迷宫',
  'PHRASE': '请找到以下词语',
  'SENTENCE': '请找到以下句子',
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

export class PreviewSheet extends React.Component<PreviewSheetProps, PreviewSheetState> {
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