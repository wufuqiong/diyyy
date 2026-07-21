import type { SheetConfig } from 'src/types';

import { render, screen } from '@testing-library/react';

import { GridType, TraceContentMode } from 'src/types';

import { PaperSheet } from '../view/components/PaperSheet';

class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

const sentenceConfig: SheetConfig = {
  text: '我有好爸爸，好妈妈',
  contentMode: TraceContentMode.SENTENCES,
  gridType: GridType.TIAN,
  gridColor: '#ef7777',
  gridOpacity: 1,
  gridSize: 14,
  fontFamily: 'font-kaiti',
  mainTextColor: '#333333',
  traceTextColor: '#999999',
  traceOpacity: 0.4,
  rowsPerPage: 8,
  colsPerRow: 8,
  traceCount: 5,
  headerTitle: '四五快读-第一册',
  headerContent: '姓名: __________  日期: __________',
  showPinyin: true,
  englishLineTheme: 'rainbow',
  showLineNumbers: false,
  traceMode: 'blank',
};

describe('Char Trace sentence layout', () => {
  beforeAll(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('fills the remaining page with blank rows using the selected grid type', () => {
    render(<PaperSheet config={{ ...sentenceConfig, gridType: GridType.MI }} />);

    // The worksheet renders one screen copy and one print copy. This
    // nine-character sentence wraps to two rows in each of two passes.
    expect(screen.getAllByTestId('sentence-practice-row')).toHaveLength(8);

    const fillerRows = screen.getAllByTestId('sentence-filler-row');
    expect(fillerRows).toHaveLength(6);
    fillerRows.forEach((row) => {
      expect(row).toHaveAttribute('data-grid-type', GridType.MI);
    });
  });
});
