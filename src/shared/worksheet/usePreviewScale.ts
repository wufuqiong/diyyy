import { useRef, useState, useCallback, useLayoutEffect } from 'react';

// v2 — width-only scale, no height clamp, no min-scale
const A4_W_PX = (210 * 96) / 25.4;

export function usePreviewScale() {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(1);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const next = el.offsetWidth > 0 ? Math.min(1, el.offsetWidth / A4_W_PX) : 1;
    setS((prev) => (prev !== next ? next : prev));
  }, []);

  useLayoutEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  return { containerRef: ref, scale: s };
}
