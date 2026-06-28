import type { ComparisonData } from 'src/types';

const NAMES = ['小明', '小红', '小刚', '小丽', '小华', '小美'];
const NAMES2 = ['小军', '小芳', '小强', '小娟', '小伟', '小玲'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate a word-problem text from comparison data.
 * Only for DIFFERENCE subtype (比多少).
 *
 * Example output:
 *   "小明有5个🍎，小红有3个🍌，小明比小红多几个？"
 */
export function generateComparisonWordProblem(data: ComparisonData): { text: string; answer: number } {
  const name = pick(NAMES);
  let name2 = pick(NAMES2);
  while (name2 === name) name2 = pick(NAMES2);

  const direction = data.relation === '>' ? '多' : '少';
  const emojiA = data.groupA.emoji || '○';
  const emojiB = data.groupB.emoji || '○';
  const countA = data.groupA.count;
  const countB = data.groupB.count;

  const text = `${name}有${countA}个${emojiA}，${name2}有${countB}个${emojiB}，${name}比${name2}${direction}几个？`;

  return { text, answer: data.difference };
}
