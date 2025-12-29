// src/sections/math-genie/view/math-genie-view.tsx
import { v4 as uuidv4 } from 'uuid';
import React, { useState, useEffect, useRef } from 'react';

import { Box, Backdrop, Paper, Alert, Typography } from '@mui/material';

import { DifficultyLevel, OperationType, MathProblem, WorksheetConfig, GenerationResponse } from 'src/types';

import WorksheetPreview from '../components/WorksheetPreview';
import WorksheetSettings from '../components/WorksheetSettings';

// Update the interface to match what the function expects
interface RawMathProblem {
  op: '+' | '-';
  a: number;
  b: number;
  emoji1: string;
  emoji2?: string;
}

// Theme-emoji mapping
const THEME_EMOJIS: Record<string, string[]> = {
  'fruits': ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍑', '🍍', '🥭', '🫐'],
  'animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'],
  'vehicles': ['🚗', '🚌', '🚲', '🛴', '🚀', '✈️', '🚁', '🛳️', '🚂', '🚜'],
  'sports': ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏸', '🏏'],
  'food': ['🍕', '🍔', '🌭', '🍟', '🍦', '🍩', '🍪', '🎂', '🍫', '🍿'],
  'nature': ['🌲', '🌳', '🌴', '🌵', '🌺', '🌸', '🌼', '🌻', '🍁', '🍀'],
  'weather': ['☀️', '⛅', '☁️', '🌧️', '⛈️', '🌩️', '❄️', '☃️', '🌪️', '🌈'],
  'emotions': ['😀', '😁', '😂', '🥲', '😊', '😇', '🥰', '😍', '🤩', '😎']
};

// Title suggestions by theme
const THEME_TITLES: Record<string, { en: string; zh: string }> = {
  'fruits': { en: 'Fruit Fun Math!', zh: '水果数学乐趣！' },
  'animals': { en: 'Animal Math Adventure', zh: '动物数学冒险' },
  'vehicles': { en: 'Vehicle Math Journey', zh: '交通工具数学之旅' },
  'sports': { en: 'Sports Math Challenge', zh: '运动数学挑战' },
  'food': { en: 'Yummy Food Math', zh: '美味食物数学' },
  'nature': { en: 'Nature Math Explorers', zh: '自然数学探索者' },
  'weather': { en: 'Weather Math Fun', zh: '天气数学乐趣' },
  'emotions': { en: 'Feelings Math Party', zh: '情感数学派对' },
  'default': { en: 'Awesome Math Worksheet', zh: '超级数学工作表' }
};

function getRandomEmoji(emojis: string[]): string {
  return emojis[Math.floor(Math.random() * emojis.length)];
}

function getTwoDifferentEmojis(emojis: string[]): { emoji1: string; emoji2: string } {
  if (emojis.length < 2) {
    return { emoji1: '⭐', emoji2: '🌟' };
  }
  
  const index1 = Math.floor(Math.random() * emojis.length);
  let index2 = Math.floor(Math.random() * emojis.length);
  while (index2 === index1) {
    index2 = Math.floor(Math.random() * emojis.length);
  }
  
  return { emoji1: emojis[index1], emoji2: emojis[index2] };
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isChineseTheme(theme: string): boolean {
  return /[\u4e00-\u9fff]/.test(theme);
}

const generateMathProblems = async (
  theme: string,
  difficulty: DifficultyLevel,
  operation: OperationType,
  count: number
): Promise<{ problems: RawMathProblem[], titleSuggestion: string }> => {
  try {
    const maxNumber = difficulty;
    const problems: RawMathProblem[] = [];
    const seenProblems = new Set<string>(); // To ensure uniqueness
    
    // Get emojis for theme
    const themeKey = theme.toLowerCase();
    const emojis = THEME_EMOJIS[themeKey] || ['⭐', '🌟', '✨', '💫', '🪐', '🌠', '🔭', '🛸'];
    
    // Get title
    const titleInfo = THEME_TITLES[themeKey] || THEME_TITLES.default;
    const titleSuggestion = isChineseTheme(theme) ? titleInfo.zh : titleInfo.en;
    
    while (problems.length < count) {
      let problem: RawMathProblem;
      const op = (operation === OperationType.MIXED) 
        ? (Math.random() > 0.5 ? '+' : '-')
        : (operation === OperationType.ADDITION ? '+' : '-');
      
      if (op === '+') {
        const a = getRandomInt(1, maxNumber - 1);
        const b = getRandomInt(1, maxNumber - a);
        const { emoji1, emoji2 } = getTwoDifferentEmojis(emojis);
        problem = { op: '+', a, b, emoji1, emoji2 };
      } else {
        const a = getRandomInt(2, maxNumber);
        const b = getRandomInt(1, a - 1);
        const emoji1 = getRandomEmoji(emojis);
        problem = { op: '-', a, b, emoji1 };
      }
      
      // Create a unique key to avoid duplicate problems
      const problemKey = `${problem.op}_${problem.a}_${problem.b}`;
      
      if (!seenProblems.has(problemKey)) {
        seenProblems.add(problemKey);
        problems.push(problem);
      }
      
      // Safety check to prevent infinite loops
      if (seenProblems.size > maxNumber * maxNumber * 2) {
        break;
      }
    }
    
    return { problems, titleSuggestion };
    
  } catch (error) {
    console.error("Error generating math problems:", error);
    // Fallback problems
    return {
      problems: Array.from({ length: count }).map((_, i) => ({
        op: '+' as const,
        a: Math.floor(Math.random() * 5) + 1,
        b: Math.floor(Math.random() * 4) + 1,
        emoji1: '⭐',
        emoji2: '🌟'
      })),
      titleSuggestion: isChineseTheme(theme) ? "数学练习" : "Math Worksheet"
    };
  }
};

export const MathGenieView: React.FC = () => {
  const [config, setConfig] = useState<WorksheetConfig>({
    theme: 'Animals',
    difficulty: DifficultyLevel.EASY,
    operation: OperationType.ADDITION,
    count: 8,
    title: 'Fun Math Time!',
    showAnswers: false, // Add this - default to false
  });

  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await generateMathProblems(
        config.theme,
        config.difficulty,
        config.operation,
        config.count
      );
      
      const newProblems: MathProblem[] = response.problems.map(p => ({
        id: uuidv4(),
        operation: p.op,
        num1: p.a,
        num2: p.b,
        emoji1: p.emoji1,
        emoji2: p.emoji2 || p.emoji1, // Use emoji1 as fallback for emoji2
        answer: p.op === '+' ? p.a + p.b : p.a - p.b
      }));

      setProblems(newProblems);
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
          width: { xs: '100%', lg: 320 }, // Fixed width for sidebar
          boxShadow: 5,
          flexShrink: 0,
          zIndex: 10,
          '@media print': {
            display: 'none',
          },
        }}
      >
        <WorksheetSettings
          theme={config.theme}
          setTheme={(t) => setConfig({ ...config, theme: t })}
          difficulty={config.difficulty}
          setDifficulty={(d) => setConfig({ ...config, difficulty: d })}
          operation={config.operation}
          setOperation={(o) => setConfig({ ...config, operation: o })}
          count={config.count}
          setCount={(c) => setConfig({ ...config, count: c })}
          showAnswers={config.showAnswers || false}
          setShowAnswers={(s) => setConfig({ ...config, showAnswers: s })}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
          onPrint={handlePrint}
        />
      </Paper>

      {/* Main Preview Area */}
      <Box
        ref={previewRef}
        sx={{
          flex: 1,
          width: { xs: '100%', lg: 'calc(100% - 320px)' }, // Take remaining space
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
        
        <WorksheetPreview 
          problems={problems} 
          title={config.title}
          theme={config.theme}
          showAnswers={config.showAnswers || false}
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
                  Generating {config.theme} problems...
                </Typography>
              </Box>
            </Box>
          </Backdrop>
        )}
      </Box>
    </Box>
  );
};