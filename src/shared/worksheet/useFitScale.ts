import { useRef, useState, useCallback, useLayoutEffect } from 'react';

/** CSS pixels per millimeter at 96 dpi (1in = 25.4mm = 96px). */
const MM_TO_PX = 96 / 25.4;

/** A4 paper dimensions in CSS px at 96 dpi. */
export const A4_WIDTH_PX = 210 * MM_TO_PX; // ~793.7
export const A4_HEIGHT_PX = 297 * MM_TO_PX; // ~1122.5

interface FitScaleOptions {
  /**
   * Vertical space (px) already consumed inside the measured container by
   * elements other than the paper itself (nav bar, footer hint, paddings).
   */
  reservedHeight?: number;
}

/**
 * Measures the available area of a container and returns a `scale()` factor so
 * a full A4 page fits within it on BOTH axes. Capped at 1 (never upscales).
 *
 * Attach `containerRef` to the bounded scroll area; pass `reservedHeight` for
 * any chrome stacked above/below the paper so the whole sheet stays visible.
 */
export function useFitScale({ reservedHeight = 0 }: FitScaleOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const availWidth = el.clientWidth - padX;
    const availHeight = el.clientHeight - padY - reservedHeight;
    if (availWidth <= 0 || availHeight <= 0) return;
    const next = Math.min(1, availWidth / A4_WIDTH_PX, availHeight / A4_HEIGHT_PX);
    setScale((prev) => (Math.abs(prev - next) > 0.001 ? next : prev));
  }, [reservedHeight]);

  useLayoutEffect(() => {
    measure();
    const el = containerRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  return { containerRef, scale };
}
