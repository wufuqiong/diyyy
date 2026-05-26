export function getTextRowsPerPage(columns: 2 | 3 | 4): number {
  if (columns === 4) return 6;
  if (columns === 3) return 7;
  return 8;
}

export function reorderProblemsByColumnPerPage<T>(
  problems: T[],
  columns: number,
  rowsPerPage: number
): T[] {
  const pageSize = columns * rowsPerPage;
  const reordered: T[] = [];

  for (let pageStart = 0; pageStart < problems.length; pageStart += pageSize) {
    const pageProblems = problems.slice(pageStart, pageStart + pageSize);

    for (let row = 0; row < rowsPerPage; row++) {
      for (let col = 0; col < columns; col++) {
        const index = col * rowsPerPage + row;
        if (index < pageProblems.length) {
          reordered.push(pageProblems[index]);
        }
      }
    }
  }

  return reordered;
}
