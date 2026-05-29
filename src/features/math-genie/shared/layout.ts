export interface PageLayout {
  columns: number;
  rows: number;
  problemsPerPage: number;
  fontSize: number;
  rowHeight: number;
  columnGap: number;
  rowGap: number;
}

const PAGE_HEIGHT_MM = 297;
// Reserves vertical space consumed by paper padding (top 20mm + bottom 15mm = 35mm)
// plus the header block (title h4 + mb:3 + border + pb:2 ≈ 20mm) plus a small safety
// margin so the grid never overflows a single A4 page when printed.
const HEADER_MM = 60;
const PAGE_WIDTH_MM = 210;
const MARGIN_MM = 20 * 2; // left + right margins

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Derive page layout from columns, problemsPerPage, and display mode.
 * Single source of truth — replaces all getTextRowsPerPage copies.
 */
export function derivePageLayout(opts: {
  columns: number;
  problemsPerPage: number;
}): PageLayout {
  const { columns, problemsPerPage } = opts;

  const rows = Math.ceil(problemsPerPage / columns);
  const availableHeightMM = PAGE_HEIGHT_MM - HEADER_MM;
  const availableWidthMM = PAGE_WIDTH_MM - MARGIN_MM;

  // Row height must account for gaps between rows.
  // Relationship: rows * rowH + (rows-1) * rowGap = availableHeight
  // where rowGap ≈ rowH * 0.15 (before clamping).
  // Solve: rowH = availableHeight / (rows + 0.15 * (rows-1))
  const rawRowHeight = availableHeightMM / (rows + 0.15 * (rows - 1));
  const rowGapMM = clamp(rawRowHeight * 0.15, 1, 6);
  // Recompute with actual (possibly clamped) gap for consistency
  const rowHeightMM = clamp((availableHeightMM - (rows - 1) * rowGapMM) / rows, 12, 30);

  const columnGapMM = clamp(availableWidthMM / (columns * 5), 2, 8);
  const fontSize = clamp(rowHeightMM * 0.4, 14, 28);

  return {
    columns,
    rows,
    problemsPerPage,
    fontSize: Math.round(fontSize),
    rowHeight: Math.round(rowHeightMM),
    columnGap: Math.round(columnGapMM),
    rowGap: Math.round(rowGapMM),
  };
}
