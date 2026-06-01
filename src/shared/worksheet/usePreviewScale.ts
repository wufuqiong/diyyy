import { useRef, useState, useCallback, useLayoutEffect } from 'react';

/** CSS pixels per millimeter at 96 dpi (1in = 25.4mm = 96px). */
const MM_TO_PX = 96 / 25.4;

const PAPER_WIDTH_MM = 210;
const PAPER_WIDTH_PX = PAPER_WIDTH_MM * MM_TO_PX;

/** Paper content won't scale below this factor even on very narrow screens. */
const MIN_SCALE = 0.4;

function computeScale(el: HTMLDivElement): number {
  // offsetWidth includes scrollbar width, avoiding a feedback loop where
  // scale changes → content height changes → scrollbar toggles → clientWidth changes.
  const availableWidth = el.offsetWidth;
  if (availableWidth <= 0) return 1;
  const s = Math.max(MIN_SCALE, Math.min(1, availableWidth / PAPER_WIDTH_PX));
  return Math.round(s * 1000) / 1000;
}

/**
 * Measures the available container width and returns a CSS `scale()` factor
 * so the A4 preview paper always fits horizontally without overflow.
 *
 * Uses both ResizeObserver and window resize events for reliable detection
 * across all browsers and layout scenarios.
 */
export function usePreviewScale() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const s = computeScale(el);
    setScale((prev) => (prev !== s ? s : prev));
  }, []);

  useLayoutEffect(() => {
    measure();

    const el = containerRef.current;
    const observer = new ResizeObserver(measure);

    if (el) {
      observer.observe(el);
      window.addEventListener('resize', measure);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  return { containerRef, scale };
}
