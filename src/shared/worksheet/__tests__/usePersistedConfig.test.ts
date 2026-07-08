import React from 'react';
import { act, render, screen } from '@testing-library/react';

import { usePersistedConfig } from '../use-persisted-config';

const STORAGE_KEY = 'diyyy:test-key';

/** Helper: render a tiny component that uses the hook and returns the value. */
function renderHook<T>(
  key: string,
  defaultValue: T,
  version = 1,
  options?: { onRestore?: () => void; forceInitial?: boolean },
) {
  let result: T;
  function TestComp() {
    const [value] = usePersistedConfig(key, defaultValue, version, options);
    result = value;
    return React.createElement('span', { 'data-testid': 'val' }, JSON.stringify(value));
  }
  render(React.createElement(TestComp));
  // Read back from the DOM since we can't easily capture the state ref
  const el = screen.getByTestId('val');
  return JSON.parse(el.textContent || 'null') as T;
}

beforeEach(() => {
  localStorage.removeItem(STORAGE_KEY);
});

describe('usePersistedConfig', () => {
  describe('basic behavior', () => {
    it('returns defaultValue when localStorage is empty', () => {
      const val = renderHook('test-key', { a: 1 });
      expect(val).toEqual({ a: 1 });
    });

    it('restores from localStorage when available', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, d: { a: 99 } }));
      const val = renderHook('test-key', { a: 1 });
      expect(val).toEqual({ a: 99 });
    });

    it('discards stored value when version mismatch', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 999, d: { a: 99 } }));
      const val = renderHook('test-key', { a: 1 }, 1);
      expect(val).toEqual({ a: 1 });
    });
  });

  describe('forceInitial', () => {
    it('overrides localStorage when forceInitial is true', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, d: { a: 99 } }));
      const val = renderHook('test-key', { a: 42 }, 1, { forceInitial: true });
      expect(val).toEqual({ a: 42 });
    });

    it('writes the initial value to localStorage when forceInitial is true', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, d: { a: 99 } }));
      renderHook('test-key', { a: 42 }, 1, { forceInitial: true });

      // Read back from localStorage
      const raw = localStorage.getItem(STORAGE_KEY);
      expect(raw).toBeTruthy();
      const stored = JSON.parse(raw!);
      expect(stored.d).toEqual({ a: 42 });
    });

    it('does NOT override localStorage when forceInitial is false', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, d: { a: 99 } }));
      const val = renderHook('test-key', { a: 42 }, 1, { forceInitial: false });
      expect(val).toEqual({ a: 99 });
    });
  });
});
