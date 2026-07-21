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
