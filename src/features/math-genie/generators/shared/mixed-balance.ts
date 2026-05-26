import type { RawMathProblem } from './types';

export function getMixedTargetCounts(count: number) {
  const additionCount = Math.ceil(count / 2);
  const subtractionCount = count - additionCount;
  return { additionCount, subtractionCount };
}

export function getNextMixedOperator(
  remainingAdditions: number,
  remainingSubtractions: number
): '+' | '-' {
  if (remainingAdditions <= 0) return '-';
  if (remainingSubtractions <= 0) return '+';
  if (remainingAdditions === remainingSubtractions) {
    return Math.random() > 0.5 ? '+' : '-';
  }
  return remainingAdditions > remainingSubtractions ? '+' : '-';
}

export function selectBalancedMixedProblems(
  allProblems: RawMathProblem[],
  targetCount: number
): RawMathProblem[] {
  const additions = allProblems.filter((problem) => problem.op === '+').sort(() => Math.random() - 0.5);
  const subtractions = allProblems.filter((problem) => problem.op === '-').sort(() => Math.random() - 0.5);
  const { additionCount, subtractionCount } = getMixedTargetCounts(targetCount);

  const selected: RawMathProblem[] = [
    ...additions.slice(0, additionCount),
    ...subtractions.slice(0, subtractionCount),
  ];

  if (selected.length < targetCount) {
    const remaining = [
      ...additions.slice(additionCount),
      ...subtractions.slice(subtractionCount),
    ].sort(() => Math.random() - 0.5);

    selected.push(...remaining.slice(0, targetCount - selected.length));
  }

  return selected.sort(() => Math.random() - 0.5);
}
