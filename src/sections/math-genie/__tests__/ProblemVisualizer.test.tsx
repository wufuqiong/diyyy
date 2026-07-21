import React from 'react';
import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { DisplayMode, ProblemType } from 'src/types';

import ProblemVisualizer from '../components/ProblemVisualizer';

const columnProblem = {
  id: 'column-addition',
  operation: '+' as const,
  num1: 35,
  num2: 24,
  emoji1: '',
  emoji2: '',
  answer: 59,
  problemType: ProblemType.STANDARD,
  isColumnArithmetic: true,
  columnTop: 35,
  columnBottom: 24,
  columnOp: '+',
};

describe('ProblemVisualizer column arithmetic', () => {
  it('shows a horizontal equation with a blank above the column calculation', () => {
    render(
      <ProblemVisualizer
        problem={columnProblem}
        index={0}
        showAnswers={false}
        displayMode={DisplayMode.TEXT}
      />,
    );

    expect(screen.getByText('35 + 24 = ____')).toBeInTheDocument();
  });

  it('fills the horizontal equation when answers are shown', () => {
    render(
      <ProblemVisualizer
        problem={columnProblem}
        index={0}
        showAnswers
        displayMode={DisplayMode.TEXT}
      />,
    );

    expect(screen.getByText('35 + 24 = 59')).toBeInTheDocument();
  });

  it('leaves the column operands empty when number filling is disabled', () => {
    render(
      <ProblemVisualizer
        problem={columnProblem}
        index={0}
        showAnswers={false}
        fillColumnNumbers={false}
        displayMode={DisplayMode.TEXT}
      />,
    );

    expect(screen.getByText('35 + 24 = ____')).toBeInTheDocument();
    expect(screen.queryByText('3')).not.toBeInTheDocument();
    expect(screen.queryByText('5')).not.toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
    expect(screen.queryByText('4')).not.toBeInTheDocument();
    screen.getAllByTestId('column-answer-slot').forEach((slot) => {
      expect(getComputedStyle(slot).borderStyle).toBe('none');
    });
  });
});

describe('ProblemVisualizer large text arithmetic', () => {
  const largeProblem = {
    id: 'large-addition',
    operation: '+' as const,
    num1: 4321,
    num2: 5678,
    emoji1: '',
    emoji2: '',
    answer: 9999,
    problemType: ProblemType.STANDARD,
  };

  it('reduces the equation font size in a three-column layout', () => {
    render(
      <ProblemVisualizer
        problem={largeProblem}
        index={0}
        showAnswers={false}
        displayMode={DisplayMode.TEXT}
        textColumns={3}
      />,
    );

    expect(parseFloat(getComputedStyle(screen.getByTestId('text-equation')).fontSize)).toBeLessThan(24);
  });

  it('sizes the answer line for every expected digit', () => {
    render(
      <ProblemVisualizer
        problem={largeProblem}
        index={0}
        showAnswers={false}
        displayMode={DisplayMode.TEXT}
        textColumns={3}
      />,
    );

    expect(getComputedStyle(screen.getByTestId('math-answer-line')).width).toBe('56px');
  });

  it('keeps a five-digit equation within the three-column width budget', () => {
    render(
      <ProblemVisualizer
        problem={{ ...largeProblem, num1: 99999, num2: 99999, answer: 99999 }}
        index={0}
        showAnswers={false}
        displayMode={DisplayMode.TEXT}
        textColumns={3}
      />,
    );

    const equation = screen.getByTestId('text-equation');
    const tokens = Array.from(equation.children);
    const tokenWidth = (token: Element) => {
      const style = getComputedStyle(token);
      return Math.max(parseFloat(style.minWidth) || 0, parseFloat(style.width) || 0);
    };
    const occupiedWidth = tokens.reduce((total, token) => total + tokenWidth(token), 0)
      + parseFloat(getComputedStyle(equation).fontSize)
      + 3 * (tokens.length - 1);

    expect(occupiedWidth).toBeLessThanOrEqual(170);
  });

  it.each([
    ['first', 1234],
    ['second', 5678],
    ['result', 6912],
  ] as const)('sizes a %s-position blank for its hidden value', (blankPosition, hiddenValue) => {
    render(
      <ProblemVisualizer
        problem={{
          ...largeProblem,
          id: `large-fill-${blankPosition}`,
          num1: 1234,
          num2: 5678,
          answer: 6912,
          problemType: ProblemType.FILL_BLANK,
          blankPosition,
        }}
        index={0}
        showAnswers={false}
        displayMode={DisplayMode.TEXT}
        textColumns={3}
      />,
    );

    expect(getComputedStyle(screen.getByTestId('math-blank-slot')).width)
      .toBe(`${String(hiddenValue).length * 12 + 8}px`);
  });
});
