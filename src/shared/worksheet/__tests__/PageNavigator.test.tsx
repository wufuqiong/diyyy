import React from 'react';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { PageNavigator } from '../PageNavigator';

const TOOL_COLOR = '#2196f3';

/** Returns all page-number buttons, excluding prev/next navigation buttons. */
function getPageButtons() {
  return screen.getAllByRole('button', { name: /\bpage \d+\b/ });
}

describe('PageNavigator', () => {
  describe('pages ≤ 7', () => {
    it('renders all page buttons when totalPages=5', () => {
      render(
        <PageNavigator
          currentPage={1}
          totalPages={5}
          onPageChange={vi.fn()}
          toolColor={TOOL_COLOR}
        />,
      );

      const buttons = getPageButtons();
      expect(buttons).toHaveLength(5);

      // No ellipsis should be present
      expect(screen.queryByText('…')).not.toBeInTheDocument();
    });
  });

  describe('pages > 7', () => {
    it('renders ellipsis and shows first, last, and current pages visible when totalPages=20, currentPage=10', () => {
      render(
        <PageNavigator
          currentPage={10}
          totalPages={20}
          onPageChange={vi.fn()}
          toolColor={TOOL_COLOR}
        />,
      );

      // Two ellipsis items should be present (start and end)
      const ellipses = screen.getAllByText('…');
      expect(ellipses).toHaveLength(2);

      // First page, current page (and siblings), and last page should be buttons
      const buttons = getPageButtons();
      const buttonLabels = buttons.map((b) => b.getAttribute('aria-label'));

      // First page is always shown
      expect(buttonLabels).toContain('Go to page 1');

      // Current page and its sibling (siblingCount=1)
      expect(buttonLabels).toContain('page 10');
      expect(buttonLabels).toContain('Go to page 9');
      expect(buttonLabels).toContain('Go to page 11');

      // Last page is always shown
      expect(buttonLabels).toContain('Go to page 20');
    });
  });

  describe('clicking a page', () => {
    it('triggers onPageChange with correct page number', async () => {
      const onPageChange = vi.fn();
      render(
        <PageNavigator
          currentPage={1}
          totalPages={5}
          onPageChange={onPageChange}
          toolColor={TOOL_COLOR}
        />,
      );

      const user = userEvent.setup();
      // Page 2 is not selected, so aria-label is "Go to page 2"
      await user.click(screen.getByRole('button', { name: 'Go to page 2' }));

      expect(onPageChange).toHaveBeenCalledTimes(1);
      expect(onPageChange).toHaveBeenCalledWith(2);
    });
  });

  describe('current page active state', () => {
    it('marks the current page button with aria-current when currentPage=3, totalPages=5', () => {
      render(
        <PageNavigator
          currentPage={3}
          totalPages={5}
          onPageChange={vi.fn()}
          toolColor={TOOL_COLOR}
        />,
      );

      // Selected page has aria-label="page 3" with aria-current="page"
      const activeButton = screen.getByRole('button', { name: 'page 3' });
      expect(activeButton).toHaveAttribute('aria-current', 'page');

      // A non-selected page should not have aria-current
      const otherButton = screen.getByRole('button', { name: 'Go to page 4' });
      expect(otherButton).not.toHaveAttribute('aria-current');
    });
  });

  describe('page indicator pill', () => {
    it('displays the correct page fraction text', () => {
      render(
        <PageNavigator
          currentPage={2}
          totalPages={7}
          onPageChange={vi.fn()}
          toolColor={TOOL_COLOR}
        />,
      );

      expect(screen.getByText('2 / 7')).toBeInTheDocument();
    });
  });
});
