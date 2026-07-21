import { OperationType } from 'src/types';

export function calculateAddSubRangeUnique(
  min: number,
  max: number,
  operation: OperationType,
): number {
  const includesAddition = operation !== OperationType.SUBTRACTION;
  const includesSubtraction = operation !== OperationType.ADDITION;
  const diagonalCount = Math.max(0, max - 2 * min + 1);
  const additionCount = includesAddition
    ? diagonalCount * (diagonalCount + 1) / 2
    : 0;
  const firstMinuend = Math.max(min + 1, 2);
  const subtractionRows = Math.max(0, max - firstMinuend + 1);
  const subtractionCount = includesSubtraction
    ? subtractionRows * ((firstMinuend - min) + (max - min)) / 2
    : 0;

  return additionCount + subtractionCount;
}
