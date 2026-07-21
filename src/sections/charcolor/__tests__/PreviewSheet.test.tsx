import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { PageContent } from '../components/PreviewSheet';

describe('Char Color preview modes', () => {
  it('shows enclosing shapes and removes circles from the character pool', () => {
    render(
      <PageContent
        page={{
          chars: ['山', '水', '木'],
          colors: ['#f00', '#0f0', '#00f'],
          mode: 'enclosing-shape',
        }}
        index={0}
      />,
    );

    expect(screen.getByText('找一找 画形状')).toBeInTheDocument();
    expect(screen.getByTestId('enclosing-shape-square')).toBeInTheDocument();
    expect(screen.getByTestId('enclosing-shape-triangle')).toBeInTheDocument();
    expect(screen.getByTestId('enclosing-shape-circle')).toBeInTheDocument();
    screen.getAllByTestId('char-pool-cell').forEach((cell) => {
      expect(getComputedStyle(cell).borderStyle).toBe('none');
    });
  });

  it('shows all four below-character marks on a four-character page', () => {
    render(
      <PageContent
        page={{
          chars: ['山', '水', '木', '火'],
          colors: ['#f00', '#0f0', '#00f', '#ff0'],
          mode: 'underline-mark',
        }}
        index={0}
      />,
    );

    expect(screen.getByText('找一找 做记号')).toBeInTheDocument();
    expect(screen.getByTestId('underline-mark-triangle')).toBeInTheDocument();
    expect(screen.getByTestId('underline-mark-circle')).toBeInTheDocument();
    expect(screen.getByTestId('underline-mark-wave')).toBeInTheDocument();
    expect(screen.getByTestId('underline-mark-line')).toBeInTheDocument();
  });
});
