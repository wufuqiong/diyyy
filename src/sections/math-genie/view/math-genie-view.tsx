import type { MathProblem, WorksheetConfig, DifficultyRatios, MultiOperationConfig, CustomDifficultyRange } from 'src/types';

import { v4 as uuidv4 } from 'uuid';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, Paper, Alert, Tooltip, IconButton, LinearProgress } from '@mui/material';

import { generateMathProblems } from 'src/features/math-genie/generators';
import { getTextRowsPerPage, reorderProblemsByColumnPerPage } from 'src/features/math-genie/generators/shared/problem-key';
import { DisplayMode, ProblemType, OperationType, DifficultyLevel, MultiOperationMode, SpecialPracticeType } from 'src/types';

import WorksheetPreview from '../components/WorksheetPreview';
import WorksheetSettings from '../components/WorksheetSettings';

export const MathGenieView: React.FC = () => {
  const pageTitle = '数学练习 - DIYYY';
  const pageDescription = '免费的数学练习题生成器，支持加减法、填空题、连算等多种题型，帮助孩子提高数学计算能力。';

  const [config, setConfig] = useState<WorksheetConfig>({
    theme: 'Animals 🐶',
    difficulty: DifficultyLevel.EASY,
    operation: OperationType.ADDITION,
    count: 1,
    textColumns: 2,
    title: 'Fun Math Time!',
    showAnswers: false, 
    displayMode: DisplayMode.TEXT, 
    customDifficulty: {
      min: 1,
      max: 15,
    },
    difficultyRatios: {
      easy: 20,
      medium: 50,
      hard: 20,
      custom: 10,
    },
    problemType: ProblemType.STANDARD,
    specialPracticeType: SpecialPracticeType.NONE,
    multiOperationConfig: {
      mode: MultiOperationMode.CHAIN_ADDITION,
      numberCount: 3
    }
  });

  const [customDifficulty, setCustomDifficulty] = useState<CustomDifficultyRange>({
    min: 1,
    max: 15,
  });

  const [difficultyRatios, setDifficultyRatios] = useState<DifficultyRatios>({
    easy: 20,
    medium: 50,
    hard: 20,
    custom: 10,
  });

  const [useMixMode, setUseMixMode] = useState(false);

  const [multiOperationConfig, setMultiOperationConfig] = useState<MultiOperationConfig>({
    mode: MultiOperationMode.CHAIN_ADDITION,
    numberCount: 3
  });
  const [excludeZeroProblems, setExcludeZeroProblems] = useState(false);

  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [autoPreview, setAutoPreview] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const hasMounted = useRef(false);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setGenerateProgress(20);
    setError(null);
    try {
      const textColumns = config.textColumns || 2;
      const problemsPerTextPage = textColumns * getTextRowsPerPage(textColumns);
      const EMOJI_PROBLEMS_PER_PAGE = 6;
      const targetProblemCount =
        config.displayMode === DisplayMode.TEXT
          ? config.count * problemsPerTextPage
          : config.count * EMOJI_PROBLEMS_PER_PAGE;

      const response = await generateMathProblems(
        config.theme,
        config.difficulty,
        config.operation,
        targetProblemCount,
        customDifficulty,
        useMixMode ? difficultyRatios : undefined,
        config.problemType,
        config.specialPracticeType,
        config.operation === OperationType.MULTI_OPERATIONS ? multiOperationConfig : undefined,
        excludeZeroProblems,
        config.displayMode
      );

      const shouldUseVerticalFactFamilyOrder =
        config.displayMode === DisplayMode.TEXT &&
        config.specialPracticeType === SpecialPracticeType.FACT_FAMILY;

      const orderedRawProblems = shouldUseVerticalFactFamilyOrder
        ? reorderProblemsByColumnPerPage(response.problems, textColumns, getTextRowsPerPage(textColumns))
        : response.problems;
      
      const newProblems: MathProblem[] = orderedRawProblems.map(p => {
        const blankPosition = p.blankPosition;
        
        return {
          id: uuidv4(),
          operation: p.op,
          num1: p.a,
          num2: p.b,
          emoji1: p.emoji1,
          emoji2: (p as any).emoji2 || p.emoji1, // Use emoji1 as fallback for emoji2
          answer: p.op === '+' ? p.a + p.b : p.a - p.b,
          problemType: config.problemType,
          blankPosition,
          equationText: (p as any).equationText,
          // 多重运算相关字段
          isMultiOperation: (p as any).isMultiOperation || false,
          numbers: (p as any).numbers,
          operators: (p as any).operators,
          emojis: (p as any).emojis
        };
      });

      setGenerateProgress(80);
      setProblems(newProblems);
      if (response.titleSuggestion) {
        setConfig(prev => ({ ...prev, title: response.titleSuggestion }));
      }
      setGenerateProgress(100);
      setTimeout(() => { setGenerateProgress(0); }, 1500);
    } catch (err) {
      console.error("Failed to generate", err);
      setError('Failed to generate worksheet. Please try again.');
      setGenerateProgress(0);
    } finally {
      setIsGenerating(false);
    }
  }, [config.theme, config.difficulty, config.operation, config.count, config.displayMode, config.textColumns, config.problemType, config.specialPracticeType, customDifficulty, difficultyRatios, useMixMode, multiOperationConfig, excludeZeroProblems]);

  // Generate initial preview on component mount (once only)
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track previous display mode to avoid infinite loops
  const prevDisplayMode = useRef(config.displayMode);

  // Auto-generate preview when config changes (only if autoPreview enabled, skip initial mount)
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (hasMounted.current && autoPreview) {
      const isComplexConfig =
        config.operation === OperationType.MULTI_OPERATIONS ||
        config.difficulty === DifficultyLevel.CUSTOM ||
        config.count > 32;
      const debounceMs = isComplexConfig ? 500 : 200;
      timeoutId = setTimeout(() => {
        if (!isGenerating && config.count > 0) {
          handleGenerate();
        }
      }, debounceMs);
    }
    return () => clearTimeout(timeoutId);
  }, [handleGenerate, autoPreview]); // Use handleGenerate as dependency

  // Adjust count when display mode changes (both modes now use page count 1-10)
  useEffect(() => {
    if (prevDisplayMode.current !== config.displayMode) {
      const validCount = Math.max(1, Math.min(10, Math.round(config.count)));
      if (validCount !== config.count) {
        setConfig(prev => ({ ...prev, count: validCount }));
      }
      prevDisplayMode.current = config.displayMode;
    }
  }, [config.displayMode, config.count]);

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          height: { xs: 'auto', lg: '100vh' },
          minHeight: { xs: '100vh', lg: 'auto' },
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
            boxShadow: 'none',
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
          textColumns={config.textColumns || 2}
          setTextColumns={(c) => setConfig({ ...config, textColumns: c })}
          excludeZeroProblems={excludeZeroProblems}
          setExcludeZeroProblems={setExcludeZeroProblems}
          showAnswers={config.showAnswers ?? false}
          setShowAnswers={(s) => setConfig({ ...config, showAnswers: s })}
          displayMode={config.displayMode}
          setDisplayMode={(d) => setConfig({ ...config, displayMode: d })}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
          onPrint={handlePrint}
          customDifficulty={customDifficulty}
          setCustomDifficulty={setCustomDifficulty}
          difficultyRatios={difficultyRatios}
          setDifficultyRatios={setDifficultyRatios}
          useMixMode={useMixMode}
          setUseMixMode={setUseMixMode}
          problemType={config.problemType}
          setProblemType={(p) => setConfig({ ...config, problemType: p })}
          specialPracticeType={config.specialPracticeType || SpecialPracticeType.NONE}
          setSpecialPracticeType={(s) => setConfig({ ...config, specialPracticeType: s })}
          multiOperationConfig={multiOperationConfig}
          setMultiOperationConfig={setMultiOperationConfig}
          autoPreview={autoPreview}
          setAutoPreview={setAutoPreview}
          onResetConfig={() => {
            setConfig({
              theme: 'Animals 🐶',
              difficulty: DifficultyLevel.EASY,
              operation: OperationType.ADDITION,
              count: 1,
              textColumns: 2,
              title: 'Fun Math Time!',
              showAnswers: false,
              displayMode: DisplayMode.TEXT,
              customDifficulty: { min: 1, max: 15 },
              difficultyRatios: { easy: 20, medium: 50, hard: 20, custom: 10 },
              problemType: ProblemType.STANDARD,
              specialPracticeType: SpecialPracticeType.NONE,
              multiOperationConfig: { mode: MultiOperationMode.CHAIN_ADDITION, numberCount: 3 }
            });
            setCustomDifficulty({ min: 1, max: 15 });
            setDifficultyRatios({ easy: 20, medium: 50, hard: 20, custom: 10 });
            setUseMixMode(false);
            setMultiOperationConfig({ mode: MultiOperationMode.CHAIN_ADDITION, numberCount: 3 });
            setExcludeZeroProblems(false);
          }}
          />
        </Paper>

        {/* Main Preview Area */}
        <Box
          ref={previewRef}
          sx={{
            flex: 1,
            width: { xs: '100%', lg: 'calc(100% - 320px)' },
            height: { xs: 'auto', lg: '100%' },
            minHeight: { xs: '50vh', lg: 'auto' },
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
        {/* Progress bar */}
        {isGenerating && (
          <LinearProgress
            variant="determinate"
            value={generateProgress}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 20,
              height: 3,
              '@media print': { display: 'none' },
            }}
          />
        )}

        {/* Toolbar */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 1,
            px: 2,
            py: 1,
            bgcolor: 'rgba(249,250,251,0.9)',
            backdropFilter: 'blur(4px)',
            borderBottom: '1px solid',
            borderColor: 'grey.100',
            '@media print': { display: 'none' },
          }}
        >
          <Tooltip title={autoPreview ? 'Auto-preview on. Click to refresh.' : 'Click to generate'} arrow>
            <span>
              <IconButton
                onClick={handleGenerate}
                disabled={isGenerating}
                size="small"
                color="primary"
                sx={{
                  bgcolor: 'white',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  '&:hover': { bgcolor: 'primary.50', borderColor: 'primary.main' },
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

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
            displayMode={config.displayMode}
            textColumns={config.textColumns || 2}
          />
        </Box>
      </Box>
    </>
  );
};

export { generateMathProblems };