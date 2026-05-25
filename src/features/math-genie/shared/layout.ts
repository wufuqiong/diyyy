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
const HEADER_MM = 50;
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
  const rowHeightMM = clamp(availableHeightMM / rows, 12, 30);
  const availableWidthMM = PAGE_WIDTH_MM - MARGIN_MM;
  const columnGapMM = clamp(availableWidthMM / (columns * 5), 2, 8);
  const rowGapMM = clamp(rowHeightMM * 0.15, 1, 6);
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
