import React from 'react';
import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { SettingCard } from '../SettingCard';

describe('SettingCard', () => {
  it('renders the label as card title', () => {
    render(
      <SettingCard label="Test Title">
        <span>content</span>
      </SettingCard>,
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('applies toolColor to the section dot and title text', () => {
    render(
      <SettingCard label="Colored Title" toolColor="#ff0000">
        <span>content</span>
      </SettingCard>,
    );

    const titleEl = screen.getByText('Colored Title');
    expect(getComputedStyle(titleEl).color).toBe('rgb(255, 0, 0)');

    const dotEl = document.querySelector('.section-dot') as HTMLElement;
    expect(dotEl).not.toBeNull();
    expect(getComputedStyle(dotEl).backgroundColor).toBe('rgb(255, 0, 0)');
  });

  it('renders children in the content area', () => {
    render(
      <SettingCard label="Card Label">
        <span>content</span>
      </SettingCard>,
    );

    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('does not render the label section when label is not provided', () => {
    render(
      <SettingCard>
        <span>content only</span>
      </SettingCard>,
    );

    expect(screen.getByText('content only')).toBeInTheDocument();
    expect(document.querySelector('.section-head')).toBeNull();
  });
});
