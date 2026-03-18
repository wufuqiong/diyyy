import { v4 as uuidv4 } from 'uuid';
import React, { useState, useEffect } from 'react';

import { Box, Backdrop, Paper, Alert, Typography } from '@mui/material';

import NumberCompositionPreview from '../components/NumberCompositionPreview';
import NumberCompositionSettings from '../components/NumberCompositionSettings';

// 定义数的分合题目接口
interface NumberCompositionProblem {
  id: string;
  total: number;
  part1: number;
  part2: number;
  color: string;
  emoji: string;
}

// 定义配置接口
interface NumberCompositionConfig {
  maxNumber: number;
  problemCount: number;
  title: string;
  theme: string;
  showAnswers: boolean;
}

// 颜色和对应的emoji
const COLOR_EMOJI_MAP: Record<string, string> = {
  'blue': '🐋',
  'green': '🐸', 
  'purple': '🦜',
  'red': '🦞',
  'yellow': '🐥',
  'orange': '🦊',
};

// 可用的颜色
const COLORS = ['blue', 'green', 'purple', 'red', 'yellow', 'orange'];

// 生成数的分合题目
const generateNumberCompositionProblems = async (
  theme: string,
  maxNumber: number,
  count: number
): Promise<{ problems: NumberCompositionProblem[], titleSuggestion: string }> => {
  try {
    const problems: NumberCompositionProblem[] = [];
    const seenProblems = new Set<string>(); // 避免重复题目
    
    // 根据主题选择emoji
    const getThemeEmoji = (themeName: string): string => {
      const themeEmojis: Record<string, string> = {
        '恐龙': '🦕',
        '水果': '🍎',
        '动物': '🐾',
        '食物': '🍔',
        '交通': '🚗',
        '运动': '⚽',
      };
      return themeEmojis[themeName] || '🦕';
    };
    
    while (problems.length < count) {
      const total = Math.floor(Math.random() * (maxNumber - 1)) + 2; // 总数2-10
      const part1 = Math.floor(Math.random() * (total - 1)) + 1; // part1至少为1
      const part2 = total - part1;
      
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const emoji = getThemeEmoji(theme);
      
      // 创建唯一标识避免重复
      const problemKey = `${total}_${part1}_${part2}`;
      const reverseKey = `${total}_${part2}_${part1}`; // 避免正反重复
      
      if (!seenProblems.has(problemKey) && !seenProblems.has(reverseKey)) {
        seenProblems.add(problemKey);
        seenProblems.add(reverseKey);
        
        problems.push({
          id: uuidv4(),
          total,
          part1,
          part2,
          color,
          emoji,
        });
      }
      
      // 安全检查防止无限循环
      if (seenProblems.size > maxNumber * maxNumber * 4) {
        break;
      }
    }
    
    const titleSuggestion = `${maxNumber}以内数的分与合`;
    
    return { problems, titleSuggestion };
    
  } catch (error) {
    console.error("Error generating number composition problems:", error);
    // Fallback problems
    return {
      problems: Array.from({ length: Math.min(count, 4) }).map((_, i) => ({
        id: uuidv4(),
        total: 5,
        part1: 2,
        part2: 3,
        color: 'blue',
        emoji: '🦕',
      })),
      titleSuggestion: "数的分合练习"
    };
  }
};

export const NumberCompositionView: React.FC = () => {
  const [config, setConfig] = useState<NumberCompositionConfig>({
    maxNumber: 10,
    problemCount: 4,
    title: '10以内数的分与合',
    theme: '恐龙',
    showAnswers: false,
  });

  const [problems, setProblems] = useState<NumberCompositionProblem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await generateNumberCompositionProblems(
        config.theme,
        config.maxNumber,
        config.problemCount
      );
      
      setProblems(response.problems);
      if (response.titleSuggestion) {
        setConfig(prev => ({ ...prev, title: response.titleSuggestion }));
      }
    } catch (err) {
      console.error("Failed to generate", err);
      setError('Failed to generate worksheet. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Initial generation on mount
  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        height: '100vh',
        backgroundColor: 'grey.50',
        overflow: 'hidden',
        '@media print': {
          backgroundColor: 'white',
          overflow: 'visible',
          height: 'auto',
          display: 'block',
        },
      }}
    >
      {/* Sidebar - Hidden when printing */}
      <Paper
        sx={{
          display: { xs: 'block', lg: 'flex' },
          height: { xs: 'auto', lg: '100%' },
          width: { xs: '100%', lg: 300 },
          boxShadow: 5,
          flexShrink: 0,
          zIndex: 10,
          '@media print': {
            display: 'none',
          },
        }}
      >
        <NumberCompositionSettings
          maxNumber={config.maxNumber}
          setMaxNumber={(n: number) => setConfig({ ...config, maxNumber: n })}
          problemCount={config.problemCount}
          setProblemCount={(c: number) => setConfig({ ...config, problemCount: c })}
          title={config.title}
          setTitle={(t: string) => setConfig({ ...config, title: t })}
          theme={config.theme}
          setTheme={(t: string) => setConfig({ ...config, theme: t })}
          showAnswers={config.showAnswers}
          setShowAnswers={(s: boolean) => setConfig({ ...config, showAnswers: s })}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
          onPrint={handlePrint}
        />
      </Paper>

      {/* Main Preview Area */}
      <Box
        sx={{
          flex: 1,
          width: { xs: '100%', lg: 'calc(100% - 320px)' },
          height: '100%',
          overflow: 'auto',
          position: 'relative',
          '@media print': {
            height: 'auto',
            minHeight: 0,
            overflow: 'visible',
            width: '100%',
          },
        }}
      >
        {error && (
          <Alert 
            severity="error" 
            sx={{ m: 2, '@media print': { display: 'none' } }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        
        <NumberCompositionPreview 
          problems={problems} 
          title={config.title}
          theme={config.theme}
          showAnswers={config.showAnswers}
        />
        
        {/* Loading Overlay */}
        {isGenerating && (
          <Backdrop
            open
            sx={{
              position: 'absolute',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: (muiTheme) => muiTheme.zIndex.drawer + 1,
              '@media print': {
                display: 'none',
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
                padding: (muiTheme) => muiTheme.spacing(2, 4),
                borderRadius: '2rem',
                boxShadow: 5,
                border: (muiTheme) => `1px solid ${muiTheme.palette.primary.light}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={(muiTheme) => ({
                    position: 'relative',
                    width: muiTheme.spacing(1.5),
                    height: muiTheme.spacing(1.5),
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      backgroundColor: muiTheme.palette.primary.light,
                      animation: 'pulse 1.5s ease-in-out infinite',
                    },
                    '&::after': {
                      content: '""',
                      position: 'relative',
                      display: 'block',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      backgroundColor: muiTheme.palette.primary.main,
                    },
                    '@keyframes pulse': {
                      '0%': {
                        transform: 'scale(1)',
                        opacity: 0.75,
                      },
                      '100%': {
                        transform: 'scale(2)',
                        opacity: 0,
                      },
                    },
                  })}
                />
                <Typography variant="body1" color="primary" fontWeight={500}>
                  Generating composition problems...
                </Typography>
              </Box>
            </Box>
          </Backdrop>
        )}
      </Box>
    </Box>
  );
};
