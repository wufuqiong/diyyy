/**
 * Compute the optimal preview-stage max-width (in px) based on content
 * column count, so that the A4 paper area is neither too wide (wasted
 * whitespace) nor too narrow (cramped grid).
 *
 * Designed in `diyyy-render-fix-detail.md` §1.
 * Discovered missing during test-plan review round 2 (2026-06-25).
 */
export function calculateStageWidth(opts?: {
  contentColumns?: number;
  minCellWidth?: number;
  maxWidth?: number;
  minWidth?: number;
  horizontalPadding?: number;
}): number {
  const {
    contentColumns,
    minCellWidth = 90,
    maxWidth = 920,
    minWidth = 560,
    horizontalPadding = 88,
  } = opts ?? {};

  if (!contentColumns) return 760;

  const calculated = contentColumns * minCellWidth + horizontalPadding;
  return Math.min(maxWidth, Math.max(minWidth, calculated));
}
