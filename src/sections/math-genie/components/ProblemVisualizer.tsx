import type { MathProblem} from 'src/types';

import React from 'react';

import { Box, Paper, Typography } from '@mui/material';

import { colors } from 'src/theme/tokens';
import { DisplayMode, ProblemType, ComparisonSubType } from 'src/types';

interface Props {
  problem: MathProblem;
  index: number;
  showAnswers: boolean;
  fillColumnNumbers?: boolean;
  displayMode: DisplayMode;
  pageFontSize?: string;
}

const ProblemVisualizer: React.FC<Props> = React.memo(({ problem, index, showAnswers, fillColumnNumbers = true, displayMode, pageFontSize }) => {
  const { operation, num1, num2, emoji1, emoji2, answer, problemType, blankPosition, isMultiOperation, numbers, operators, emojis, isNumberBond, numberBondWhole, numberBondParts, numberBondBlankIndex, isWordProblem, wordProblemText, wordProblemOperation, wordProblemMeasure, isComparison, comparisonData, isColumnArithmetic, columnTop, columnBottom, columnOp } = problem;

  // Compute max digit length across all relevant numbers
  const maxDigits = (vals: number[]) => Math.max(...vals.map((v) => String(v).length));
  const digitCount = numbers && numbers.length > 0 ? maxDigits(numbers.concat(showAnswers ? answer : [])) : maxDigits([num1, num2, showAnswers ? answer : 0]);

  // Font size — for multi-op, use uniform page-level size; for others, compute per problem
  const getFontSize = (): string => {
    if (isMultiOperation && pageFontSize) return pageFontSize;
    if (isMultiOperation && numbers) {
      const totalChars = digitCount * numbers.length + (numbers.length - 1) + 2;
      if (totalChars <= 6) return '1.5rem';
      if (totalChars <= 9) return '1.3rem';
      if (totalChars <= 12) return '1.1rem';
      if (totalChars <= 15) return '0.95rem';
      if (totalChars <= 18) return '0.8rem';
      if (totalChars <= 22) return '0.68rem';
      return '0.58rem';
    }
    const digitFactor = digitCount <= 1 ? 1 : digitCount === 2 ? 0.85 : 0.72;
    return `${(1.5 * digitFactor).toFixed(2)}rem`;
  };

  const fontSize = getFontSize();
  const fontSizeNum = parseFloat(fontSize);
  const blankSize = Math.max(32, Math.round(fontSizeNum * 30));
  const numMinW = Math.round(fontSizeNum * 20);
  const opMinW = Math.round(fontSizeNum * 12);

  const answerH = Math.round(fontSizeNum * 20);

  if (isNumberBond && numberBondWhole !== undefined && numberBondParts) {
    return <NumberBondNode whole={numberBondWhole} parts={numberBondParts} blankIndex={numberBondBlankIndex} showAnswers={showAnswers} />;
  }

  if (isWordProblem) {
    const wpText = wordProblemText || '';
    const wpOp = wordProblemOperation || (operation === '+' ? 'addition' : 'subtraction');
    const wpMeasure = wordProblemMeasure || '个';
    return (
      <WordProblemCard
        index={index}
        text={wpText}
        operation={wpOp}
        answer={answer}
        showAnswers={showAnswers}
        measure={wpMeasure}
      />
    );
  }

  if (isComparison && comparisonData) {
    return <ComparisonRenderer data={comparisonData} showAnswers={showAnswers} index={index} displayMode={displayMode} />;
  }

  if (isColumnArithmetic && columnTop !== undefined && columnBottom !== undefined && columnOp) {
    return <ColumnArithmeticRenderer top={columnTop} bottom={columnBottom} op={columnOp} answer={answer} showAnswers={showAnswers} fillNumbers={fillColumnNumbers} />;
  }

  const blankSquareSx = {
    width: blankSize,
    height: blankSize,
    border: `2px solid ${colors.inkSecondary}`,
    borderRadius: 0.5,
    boxSizing: 'border-box' as const,
    flexShrink: 0,
  };

  const zeroSlotSx = {
    minWidth: 28,
    minHeight: blankSize,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const unknownGroupSx = {
    minWidth: Math.round(blankSize * 2.1),
    minHeight: Math.round(blankSize * 1.6),
    px: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const renderZeroSlot = (emoji: string) => (
    <Box sx={zeroSlotSx}>
      <Box sx={{ fontSize: 24, opacity: 0, lineHeight: 1 }}>{emoji}</Box>
    </Box>
  );

  const renderGroup = (count: number, emoji: string, crossedOut: boolean = false) => {
    const safeCount = Math.max(0, count);

    if (safeCount === 0) {
      return renderZeroSlot(emoji);
    }

    const iconSize = safeCount > 15 ? 18 : safeCount > 10 ? 20 : 24;

    return (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          maxWidth: '100%',
          maxHeight: 120,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {Array.from({ length: safeCount }).map((_, i) => (
          <Box
            key={i}
            sx={{
              fontSize: iconSize,
              opacity: crossedOut ? 0.4 : 1,
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {emoji}
            {crossedOut && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: 2,
                  backgroundColor: 'red',
                  transform: 'rotate(-15deg)',
                }}
              />
            )}
          </Box>
        ))}
      </Box>
    );
  };

  const renderAdditionGroup = (count: number, emoji: string) => renderGroup(count, emoji);

  const renderSubtractionGroup = (total: number, crossedOutCount: number, emoji: string) => {
    const safeTotal = Math.max(0, total);
    const safeCrossedOut = Math.max(0, Math.min(crossedOutCount, safeTotal));
    const normalCount = safeTotal - safeCrossedOut;
    const iconSize = safeTotal > 15 ? 20 : safeTotal > 10 ? 24 : 28;

    if (safeTotal === 0) {
      return renderZeroSlot(emoji);
    }

    return (
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          maxWidth: '100%',
          maxHeight: 120,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {Array.from({ length: normalCount }).map((_, i) => (
          <Box key={`normal-${i}`} sx={{ fontSize: iconSize, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {emoji}
          </Box>
        ))}
        {Array.from({ length: safeCrossedOut }).map((_, i) => (
          <Box key={`crossed-${i}`} sx={{ fontSize: iconSize, position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
            {emoji}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: -2,
                right: -2,
                height: 2,
                backgroundColor: 'red',
                transform: 'rotate(-45deg)',
                borderRadius: 1,
              }}
            />
          </Box>
        ))}
      </Box>
    );
  };

  const renderUnknownGroup = () => (
    <Box sx={unknownGroupSx}>
      <Typography sx={{ fontSize: 64, lineHeight: 1, fontWeight: 700, color: colors.errorRed }}>
        ?
      </Typography>
    </Box>
  );

  const renderBraceLabel = (value: number | '?') => (
    <Typography
      sx={{
        fontWeight: 'bold',
        color: value === '?' ? colors.errorRed : colors.ink,
        fontSize: 24,
        mt: 0.5,
        display: 'flex',
        alignItems: 'baseline',
        gap: 0.5,
      }}
    >
      {value}
      <Typography component="span" sx={{ color: colors.ink, fontSize: 20, fontWeight: 'bold' }}>个</Typography>
    </Typography>
  );

  const renderAdditionVisual = (leftContent: React.ReactNode, rightContent: React.ReactNode, braceValue: number | '?') => (
    <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', mb: 2, width: 'fit-content', maxWidth: '100%' }}>
      <Box sx={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'flex-start', gap: 6, px: 2, minHeight: 40, width: 'fit-content', maxWidth: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', minWidth: 28 }}>{leftContent}</Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', minWidth: 28 }}>{rightContent}</Box>
      </Box>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg width="100%" height="24" viewBox="0 0 100 24" preserveAspectRatio="none" style={{ overflow: 'visible', display: 'block' }}>
          <path d="M 0 0 C 0 16, 50 16, 50 24 C 50 16, 100 16, 100 0" fill="none" stroke={colors.ink} strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {renderBraceLabel(braceValue)}
      </Box>
    </Box>
  );

  const renderEquationBoxes = (operatorSymbol: '+' | '-' | '×' | '÷') => {
    const digitW = (n: number) => Math.max(22, Math.round(String(n).length * fontSizeNum * 8 + 6));
    const n1w = digitW(num1);
    const n2w = digitW(num2);
    const aw = digitW(answer);
    const opW = Math.max(18, Math.round(n1w * 0.7));
    const eqW = Math.round(fontSizeNum * 10);
    const eqH = Math.max(3, Math.round(fontSizeNum * 3));
    const boxH = Math.round(fontSizeNum * 18);
    const bFont = Math.round(fontSizeNum * 13);
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
        <Box sx={{ width: n1w, height: boxH, border: `2px solid ${colors.fillBlankBox}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: bFont, fontWeight: 'bold', color: colors.inkSecondary, borderRadius: 0.5 }}>
          {showAnswers ? num1 : ''}
        </Box>
        <Box sx={{ width: opW, height: opW, border: `2px solid ${colors.emojiCircle}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: bFont, fontWeight: 'bold', color: colors.inkSecondary, flexShrink: 0 }}>
          {showAnswers ? operatorSymbol : ''}
        </Box>
        <Box sx={{ width: n2w, height: boxH, border: `2px solid ${colors.fillBlankBox}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: bFont, fontWeight: 'bold', color: colors.inkSecondary, borderRadius: 0.5 }}>
          {showAnswers ? num2 : ''}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', mx: 0.2 }}>
          <Box sx={{ width: eqW, height: eqH, backgroundColor: colors.factFamilyBar, border: `2px solid ${colors.ink}`, borderRadius: '3px' }} />
          <Box sx={{ width: eqW, height: eqH, backgroundColor: colors.factFamilyBar, border: `2px solid ${colors.ink}`, borderRadius: '3px' }} />
        </Box>
        <Box sx={{ width: aw, height: boxH, border: `2px solid ${colors.fillBlankBox}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: bFont, fontWeight: 'bold', color: colors.inkSecondary, borderRadius: 0.5 }}>
          {showAnswers ? answer : ''}
        </Box>
      </Box>
    );
  };

  // EMOJI mode display
  if (displayMode === DisplayMode.EMOJI) {
    const subtractionEmoji = emoji1 || emoji2 || '⭐';
    const firstOperandEmoji = operation === '-' ? subtractionEmoji : (emoji1 || '⭐');
    const secondOperandEmoji = operation === '-' ? subtractionEmoji : (emoji2 || emoji1 || '⭐');

    return (
      <Paper
        key={problem.id}
        elevation={0}
        sx={{
          p: 2,
          mb: 1,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: 2,
          backgroundColor: colors.paper,
          boxShadow: 'none',
          '@media print': {
            backgroundColor: 'white !important',
            boxShadow: 'none !important',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', flexWrap: 'nowrap' }}>
          {isMultiOperation && numbers && operators && emojis ? (
            <>
              {numbers.map((num, idx) => (
                <React.Fragment key={idx}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {renderAdditionGroup(Math.min(num, 8), emojis[idx])}
                  </Box>
                  {idx < operators.length && (
                    <Typography sx={{ fontSize: getFontSize(), fontWeight: 'bold', minWidth: 0, textAlign: 'center' }}>
                      {operators[idx]}
                    </Typography>
                  )}
                </React.Fragment>
              ))}
              <Typography sx={{ fontSize: getFontSize(), fontWeight: 'bold', minWidth: 0, textAlign: 'center' }}>
                =
              </Typography>
              {showAnswers ? (
                <Typography sx={{ fontSize: getFontSize(), fontWeight: 'bold', minWidth: 0, textAlign: 'center' }}>
                  {answer}
                </Typography>
              ) : (
                <Box sx={{ minWidth: 20, height: 16, borderBottom: `2px solid ${colors.inkSecondary}` }} />
              )}
            </>
          ) : problemType === ProblemType.FILL_BLANK ? (
            operation === '+' ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', pt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, minHeight: 56, alignItems: 'center' }}>
                  {renderAdditionVisual(
                    blankPosition === 'first' && !showAnswers ? renderUnknownGroup() : renderAdditionGroup(num1, firstOperandEmoji),
                    blankPosition === 'second' && !showAnswers ? renderUnknownGroup() : renderAdditionGroup(num2, secondOperandEmoji),
                    blankPosition === 'result' && !showAnswers ? '?' : answer
                  )}
                </Box>
                {renderEquationBoxes('+')}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', pt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, minHeight: 56, alignItems: 'center' }}>
                  {blankPosition === 'first' && !showAnswers
                    ? renderUnknownGroup()
                    : renderSubtractionGroup(num1, blankPosition === 'second' && !showAnswers ? 0 : num2, firstOperandEmoji)}
                </Box>
                {renderEquationBoxes('-')}
              </Box>
            )
          ) : operation === '+' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', pt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, minHeight: 56, alignItems: 'center' }}>
                {renderAdditionVisual(
                  renderAdditionGroup(num1, firstOperandEmoji),
                  renderAdditionGroup(num2, secondOperandEmoji),
                  showAnswers ? answer : '?'
                )}
              </Box>
              {renderEquationBoxes('+')}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', pt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, minHeight: 56, alignItems: 'center' }}>
                {renderSubtractionGroup(num1, num2, firstOperandEmoji)}
              </Box>
              {renderEquationBoxes('-')}
            </Box>
          )}
        </Box>
      </Paper>
    );
  }

  // Multi-op: ultra-compact bare rendering — no Paper, no padding, no wrapping
  if (isMultiOperation && numbers && operators) {
    const equationText = numbers.map((n, i) => i < operators.length ? `${n} ${operators[i]} ` : `${n}`).join('') + ' = ' + (showAnswers ? answer : '___');
    return (
      <Box
        sx={{
          width: '100%',
          py: 1,
          px: 0.5,
          textAlign: 'center',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        <Box component="span" sx={{ fontWeight: 'bold', color: 'grey.800', fontSize, lineHeight: 1 }}>
          {equationText}
        </Box>
      </Box>
    );
  }

  // TEXT mode display (standard + fill-in-the-blank)
  return (
    <Paper
      key={problem.id}
      elevation={0}
      sx={{
        p: 2,
        mb: 1,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: 2,
        backgroundColor: colors.paper,
        boxShadow: 'none',
        '@media print': {
          backgroundColor: 'white !important',
          boxShadow: 'none !important',
        },
      }}
    >
      {problemType === ProblemType.FILL_BLANK ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', flexWrap: 'nowrap' }}>
          {blankPosition === 'first' ? (
            <>
              {showAnswers ? (
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: numMinW, textAlign: 'center', fontSize }}>
                  {num1}
                </Typography>
              ) : (
                <Box sx={blankSquareSx} />
              )}
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: opMinW, textAlign: 'center', fontSize }}>
                {operation}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: numMinW, textAlign: 'center', fontSize }}>
                {num2}
              </Typography>
            </>
          ) : blankPosition === 'second' ? (
            <>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: numMinW, textAlign: 'center', fontSize }}>
                {num1}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: opMinW, textAlign: 'center', fontSize }}>
                {operation}
              </Typography>
              {showAnswers ? (
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: numMinW, textAlign: 'center', fontSize }}>
                  {num2}
                </Typography>
              ) : (
                <Box sx={blankSquareSx} />
              )}
            </>
          ) : (
            <>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: numMinW, textAlign: 'center', fontSize }}>
                {num1}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: opMinW, textAlign: 'center', fontSize }}>
                {operation}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: numMinW, textAlign: 'center', fontSize }}>
                {num2}
              </Typography>
            </>
          )}
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', fontFamily: '"Comic Neue", cursive', fontSize }}>
            =
          </Typography>
          {blankPosition === 'result' && !showAnswers ? (
            <Box sx={blankSquareSx} />
          ) : (
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: numMinW, textAlign: 'center', fontSize }}>
              {answer}
            </Typography>
          )}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: numMinW, textAlign: 'center', fontSize }}>
            {num1}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: opMinW, textAlign: 'center', fontSize }}>
            {operation}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: numMinW, textAlign: 'center', fontSize }}>
            {num2}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', fontFamily: '"Comic Neue", cursive', fontSize }}>
            =
          </Typography>
          {showAnswers ? (
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.800', minWidth: numMinW, textAlign: 'center', fontSize }}>
              {answer}
            </Typography>
          ) : (
            <Box sx={{ minWidth: numMinW, height: answerH, borderBottom: `2px solid ${colors.inkSecondary}` }} />
          )}
        </Box>
      )}
    </Paper>
  );
});

ProblemVisualizer.displayName = 'ProblemVisualizer';

// ---------- Word Problem Card ----------

const WordProblemCard: React.FC<{
  index: number;
  text: string;
  operation: string;
  answer: number;
  showAnswers: boolean;
  measure: string;
}> = ({ index, text, answer, showAnswers, measure }) => (

  <Box sx={{ width: '100%', px: 2, py: 1.5 }}>
    <Typography
      variant="body1"
      sx={{ lineHeight: 1.8, mb: 5, textAlign: 'left', fontWeight: 500 }}
    >
      {index + 1}. {text}
    </Typography>
    {showAnswers && (
      <Box sx={{ ml: 1 }}>
        <Typography variant="body2" fontWeight="bold" color={colors.errorRed}>
          {answer}（{measure}）
        </Typography>
      </Box>
    )}
  </Box>
);

// ---------- Number Bond Node ----------

const NumberBondNode: React.FC<{
  whole: number;
  parts: [number, number];
  blankIndex?: 0 | 1 | 'whole';
  showAnswers: boolean;
}> = ({ whole, parts, blankIndex, showAnswers }) => {
  const wholeIsBlank = blankIndex === 'whole' && !showAnswers;
  const part0IsBlank = blankIndex === 0 && !showAnswers;
  const part1IsBlank = blankIndex === 1 && !showAnswers;

  const wholeValue = showAnswers || !wholeIsBlank ? String(whole) : '';
  const partValues = [
    showAnswers || !part0IsBlank ? String(parts[0]) : '',
    showAnswers || !part1IsBlank ? String(parts[1]) : '',
  ];

  const CIRCLE_R = 24;
  const STROKE_W = 3;
  // Geometry: whole at (64,24), parts at (24,112) and (104,112)
  // Lines: (64,48)→(24,88) and (64,48)→(104,88) — dx=±40, dy=40 → 45°

  const circleProps = (isBlank: boolean) => ({
    cx: 0,
    cy: 0,
    r: CIRCLE_R,
    fill: 'white',
    stroke: colors.fillBlankBox,
    strokeWidth: STROKE_W,
    strokeDasharray: isBlank ? '6 4' : undefined,
  });

  const textProps = (isBlank: boolean) => ({
    textAnchor: 'middle' as const,
    dominantBaseline: 'central' as const,
    fontSize: 24,
    fontWeight: 'bold',
    fill: isBlank ? colors.errorRed : colors.inkSecondary,
  });

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
      <svg width="128" height="140" viewBox="0 0 128 140" style={{ overflow: 'visible' }}>
        {/* Connecting lines at 45° */}
        <line x1="64" y1="48" x2="24" y2="88" stroke={colors.inkSecondary} strokeWidth="1.5" />
        <line x1="64" y1="48" x2="104" y2="88" stroke={colors.inkSecondary} strokeWidth="1.5" />

        {/* Whole circle */}
        <g transform="translate(64, 24)">
          <circle {...circleProps(wholeIsBlank)} />
          <text {...textProps(wholeIsBlank)}>{wholeValue}</text>
        </g>

        {/* Left parts circle */}
        <g transform="translate(24, 112)">
          <circle {...circleProps(part0IsBlank)} />
          <text {...textProps(part0IsBlank)}>{partValues[0]}</text>
        </g>

        {/* Right parts circle */}
        <g transform="translate(104, 112)">
          <circle {...circleProps(part1IsBlank)} />
          <text {...textProps(part1IsBlank)}>{partValues[1]}</text>
        </g>
      </svg>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Comparison problem renderer
// ---------------------------------------------------------------------------

const CMP_SYMBOL_FONT = { fontSize: 26, fontWeight: 800, fontFamily: '"Baloo 2","Noto Sans SC",sans-serif', color: '#333' };
const CMP_LABEL_FONT = { fontSize: 18, fontWeight: 600, fontFamily: '"Quicksand","Noto Sans SC",sans-serif', color: '#333' };
const CMP_EMOJI_FONT = { fontSize: 26, lineHeight: 1.2 };

interface ComparisonRendererProps {
  data: import('src/types').ComparisonData;
  showAnswers: boolean;
  index: number;
}

const ComparisonRenderer: React.FC<ComparisonRendererProps & { displayMode: DisplayMode }> = ({ data, showAnswers, index, displayMode }) => {
  const isEmoji = displayMode === DisplayMode.EMOJI;

  switch (data.subtype) {
    case ComparisonSubType.MAGNITUDE:
      return <MagnitudeComparison data={data} showAnswers={showAnswers} isEmoji={isEmoji} />;
    case ComparisonSubType.DIFFERENCE:
      return <DifferenceComparison data={data} showAnswers={showAnswers} isEmoji={isEmoji} isWordProblem={displayMode === DisplayMode.WORD_PROBLEM} />;
    default:
      return null;
  }
};

/** Renders emoji repeated `count` times */
const EmojiRow: React.FC<{ emoji: string; count: number }> = React.memo(({ emoji, count }) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', lineHeight: 1.2 }}>
    {Array.from({ length: count }, (_, i) => (
      <Box key={i} component="span" sx={CMP_EMOJI_FONT}>{emoji}</Box>
    ))}
  </Box>
));

/** Circle with optional symbol inside */
const SymbolCircle: React.FC<{ symbol?: string; showAnswers: boolean; size?: number }> = ({ symbol, showAnswers, size = 38 }) => (
  <Box
    sx={{
      width: size, height: size, borderRadius: '50%',
      border: '2.5px solid #555', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    {showAnswers ? (
      <Typography sx={{ ...CMP_SYMBOL_FONT, fontSize: Math.round(size * 0.55) }}>{symbol}</Typography>
    ) : null}
  </Box>
);

// Shared Paper wrapper matching EMOJI arithmetic style
const ComparisonCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      mb: 1,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: 2,
      backgroundColor: colors.paper,
      boxShadow: 'none',
      '@media print': { backgroundColor: 'white !important', boxShadow: 'none !important' },
    }}
  >
    {children}
  </Paper>
);

// ---- Type 1: 比大小 (fill >, <, =) ----

const MagnitudeComparison: React.FC<{ data: import('src/types').ComparisonData; showAnswers: boolean; isEmoji: boolean }> = ({ data, showAnswers, isEmoji }) => (
  <ComparisonCard>
    {isEmoji ? (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <Paper elevation={0} sx={{ border: '2px solid #ddd', borderRadius: 2, p: 1.5, minWidth: 70, textAlign: 'center' }}>
          <EmojiRow emoji={data.groupA.emoji} count={data.groupA.count} />
        </Paper>
        <SymbolCircle symbol={data.relation} showAnswers={showAnswers} />
        <Paper elevation={0} sx={{ border: '2px solid #ddd', borderRadius: 2, p: 1.5, minWidth: 70, textAlign: 'center' }}>
          <EmojiRow emoji={data.groupB.emoji} count={data.groupB.count} />
        </Paper>
      </Box>
    ) : (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <Typography sx={CMP_SYMBOL_FONT}>{data.groupA.count}</Typography>
        <SymbolCircle symbol={data.relation} showAnswers={showAnswers} />
        <Typography sx={CMP_SYMBOL_FONT}>{data.groupB.count}</Typography>
      </Box>
    )}
  </ComparisonCard>
);

// ---- Type 2: 比多少 (fill difference) ----

const DifferenceComparison: React.FC<{ data: import('src/types').ComparisonData; showAnswers: boolean; isEmoji: boolean; isWordProblem?: boolean }> = ({ data, showAnswers, isEmoji, isWordProblem }) => {
  const dirText = data.relation === '>' ? '多' : '少';

  if (isWordProblem && data.wordProblemText) {
    return (
      <ComparisonCard>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 500, color: '#333', lineHeight: 1.6 }}>
            {data.wordProblemText}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, alignSelf: 'center' }}>
            <Box sx={{
              width: 42, height: 34, border: '2.5px solid #555', borderRadius: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {showAnswers ? <Typography sx={CMP_SYMBOL_FONT}>{data.difference}</Typography> : null}
            </Box>
            <Typography sx={CMP_LABEL_FONT}>个</Typography>
          </Box>
        </Box>
      </ComparisonCard>
    );
  }

  const labelA = isEmoji ? data.groupA.emoji : String(data.groupA.count);
  const labelB = isEmoji ? data.groupB.emoji : String(data.groupB.count);

  return (
    <ComparisonCard>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
        {isEmoji && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5, width: '100%' }}>
            <EmojiRow emoji={data.groupA.emoji} count={data.groupA.count} />
            <EmojiRow emoji={data.groupB.emoji} count={data.groupB.count} />
          </Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={CMP_LABEL_FONT}>
            {labelA} 比 {labelB} {dirText}
          </Typography>
          <Box sx={{
            width: 42, height: 34, border: '2.5px solid #555', borderRadius: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {showAnswers ? <Typography sx={CMP_SYMBOL_FONT}>{data.difference}</Typography> : null}
          </Box>
          <Typography sx={CMP_LABEL_FONT}>个</Typography>
        </Box>
      </Box>
    </ComparisonCard>
  );
};

const COLUMN_FONT_SIZE = 24;
const COLUMN_LINE_H = 36;
const COLUMN_DIGIT_W = 36;
const COLUMN_GAP = 6;

const DigitBox: React.FC<{ ch: string; color?: string }> = ({ ch, color = '#333' }) => (
  <Box sx={{ width: COLUMN_DIGIT_W, height: COLUMN_LINE_H, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Typography sx={{ fontSize: COLUMN_FONT_SIZE, fontWeight: 600, color, lineHeight: 1 }}>{ch}</Typography>
  </Box>
);

const DigitRow: React.FC<{ digits: string; padLeft?: number; color?: string }> = ({ digits, padLeft = 0, color }) => (
  <Box sx={{ display: 'flex', gap: `${COLUMN_GAP}px`, justifyContent: 'flex-end' }}>
    {padLeft > 0 && <Box sx={{ width: COLUMN_DIGIT_W * padLeft + COLUMN_GAP * padLeft }} />}
    {digits.split('').map((ch, i) => (
      <DigitBox key={i} ch={ch} color={color} />
    ))}
  </Box>
);

const ColumnArithmeticRenderer: React.FC<{
  top: number;
  bottom: number;
  op: string;
  answer: number;
  showAnswers: boolean;
  fillNumbers: boolean;
}> = ({ top, bottom, op, answer, showAnswers, fillNumbers }) => {
  const topStr = String(top);
  const botStr = String(bottom);
  const ansStr = String(answer);
  const isDiv = op === '÷';
  const horizontalEquation = (
    <Typography
      sx={{ mb: 1, color: colors.ink, fontSize: COLUMN_FONT_SIZE, fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap' }}
    >
      {top} {op} {bottom} = {showAnswers ? answer : '____'}
    </Typography>
  );

  if (isDiv) {
    // Long division:  4 ) 24  with overline above dividend
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {horizontalEquation}

        {/* Answer row: quotient above overline, aligned over dividend */}
        <Box sx={{ display: 'flex', gap: `${COLUMN_GAP}px`, pl: `${COLUMN_DIGIT_W * botStr.length + COLUMN_GAP * botStr.length + 16}px` }}>
          {showAnswers ? (
            ansStr.split('').map((ch, i) => <DigitBox key={i} ch={ch} color={colors.inkSecondary} />)
          ) : (
            Array.from({ length: ansStr.length }).map((_, i) => (
              <Box
                key={i}
                data-testid="column-answer-slot"
                sx={{
                  width: COLUMN_DIGIT_W,
                  height: COLUMN_LINE_H,
                  border: fillNumbers ? '1.5px solid #ccc' : 'none',
                  borderRadius: 0.5,
                }}
              />
            ))
          )}
        </Box>

        {/* Division bracket row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
          {/* Divisor */}
          <Box sx={{ display: 'flex', gap: `${COLUMN_GAP}px`, mb: '3px' }}>
            {botStr.split('').map((ch, i) => (
              <DigitBox key={i} ch={fillNumbers ? ch : ''} />
            ))}
          </Box>

          {/* Bracket symbol: large ) */}
          <Typography sx={{ fontSize: 40, fontWeight: 700, color: '#333', lineHeight: 1, mx: '2px' }}>
            )
          </Typography>

          {/* Dividend with overline on top */}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {/* Overline */}
            <Box sx={{
              height: 2, bgcolor: '#333',
              width: COLUMN_DIGIT_W * topStr.length + COLUMN_GAP * (topStr.length - 1),
            }} />
            {/* Dividend digits */}
            <Box sx={{ display: 'flex', gap: `${COLUMN_GAP}px`, mt: 0.5 }}>
              {topStr.split('').map((ch, i) => (
                <DigitBox key={i} ch={fillNumbers ? ch : ''} />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // + / - / × layout: numbers stacked vertically, operator on the left
  // Alignment: pad shorter numbers so all operands are right-aligned
  const colDigits = Math.max(topStr.length, botStr.length);
  const topPad = colDigits - topStr.length;
  const botPad = colDigits - botStr.length;
  const ruleWidth = COLUMN_DIGIT_W * (colDigits + 1) + COLUMN_GAP * colDigits; // +1 for operator column

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {horizontalEquation}

      {/* Operator + numbers */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        {/* Operator column */}
        <Typography sx={{ fontSize: COLUMN_FONT_SIZE, fontWeight: 700, color: '#555', width: COLUMN_DIGIT_W, textAlign: 'center', lineHeight: 1, mr: `${COLUMN_GAP}px` }}>
          {op}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          {/* Top number */}
          <DigitRow digits={fillNumbers ? topStr : ' '.repeat(topStr.length)} padLeft={topPad} />

          {/* Bottom number */}
          <DigitRow digits={fillNumbers ? botStr : ' '.repeat(botStr.length)} padLeft={botPad} />
        </Box>
      </Box>

      {/* Horizontal rule: spans operator + digit area */}
      <Box sx={{ width: ruleWidth, height: 2, bgcolor: '#333', my: 0.5 }} />

      {/* Answer row: individual boxes per digit */}
      <Box sx={{ display: 'flex', gap: `${COLUMN_GAP}px`, justifyContent: 'flex-end', width: ruleWidth }}>
        {showAnswers ? (
          ansStr.split('').map((ch, i) => (
            <DigitBox key={i} ch={ch} color={colors.inkSecondary} />
          ))
        ) : (
          Array.from({ length: ansStr.length }).map((_, i) => (
            <Box
              key={i}
              data-testid="column-answer-slot"
              sx={{
                width: COLUMN_DIGIT_W,
                height: COLUMN_LINE_H,
                border: fillNumbers ? '1.5px solid #ccc' : 'none',
                borderRadius: 0.5,
              }}
            />
          ))
        )}
      </Box>
    </Box>
  );
};

export default ProblemVisualizer;
