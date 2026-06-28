import { DisplayMode, ComparisonSubType } from 'src/types';

import { getRandomInt, getTwoDifferentEmojis } from '../shared/types';
import { generateComparisonWordProblem } from './comparison-word-problem';

import type { RawMathProblem } from '../shared/types';

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export function generateComparisonProblems(params: {
  count: number;
  subType: ComparisonSubType;
  emojiPool: string[];
  countRange: { min: number; max: number };
  displayMode: DisplayMode;
}): RawMathProblem[] {
  const { count, subType, emojiPool, countRange, displayMode } = params;
  const isEmoji = displayMode === DisplayMode.EMOJI;
  const isWordProblem = displayMode === DisplayMode.WORD_PROBLEM;
  const effectiveSubType = isWordProblem ? ComparisonSubType.DIFFERENCE : subType;
  const allowEqual = effectiveSubType === ComparisonSubType.MAGNITUDE;

  const rangeSize = countRange.max - countRange.min + 1;
  const maxUnique = allowEqual ? rangeSize * rangeSize : rangeSize * (rangeSize - 1);
  const safeCount = Math.min(count, maxUnique);

  const problems: RawMathProblem[] = [];
  const usedKeys = new Set<string>();
  const MAX_RETRIES = 50;

  for (let i = 0; i < safeCount; i++) {
    let n1: number;
    let n2: number;
    let key: string;
    let found = false;

    for (let r = 0; r < MAX_RETRIES; r++) {
      n1 = getRandomInt(countRange.min, countRange.max);
      n2 = getRandomInt(countRange.min, countRange.max);
      if (!allowEqual) {
        let t = 0;
        while (n1 === n2 && t < 20) { n2 = getRandomInt(countRange.min, countRange.max); t++; }
      }
      key = `${n1}:${n2}`;
      if (!usedKeys.has(key)) {
        usedKeys.add(key);
        found = true;
        break;
      }
    }

    if (!found) break; // ran out of unique pairs

    const n1f = n1!; const n2f = n2!;
    const emojis = isEmoji ? getTwoDifferentEmojis(emojiPool) : { emoji1: '', emoji2: '' };
    const relation = n1f > n2f ? '>' as const : n1f < n2f ? '<' as const : '=' as const;
    const diff = Math.abs(n1f - n2f);

    const compData = {
      subtype: effectiveSubType,
      groupA: { emoji: emojis.emoji1, count: n1f },
      groupB: { emoji: emojis.emoji2, count: n2f },
      relation,
      difference: diff,
      wordProblemText: undefined as string | undefined,
    };
    if (isWordProblem && effectiveSubType === ComparisonSubType.DIFFERENCE) {
      const wp = generateComparisonWordProblem(compData);
      compData.wordProblemText = wp.text;
    }

    problems.push({
      op: '+',
      a: n1f,
      b: n2f,
      emoji1: emojis.emoji1,
      emoji2: emojis.emoji2,
      isComparison: true,
      comparisonData: compData,
    });
  }
  return problems;
}
