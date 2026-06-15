
import templatesData from '../data/word-problem-templates.zh-CN.json';

interface Subject {
  noun: string;
  measure: string;
  verbs: { appear: string; leave: string };
  location: string;
  tags: string[];
}

interface Template {
  id: string;
  desc: string;
  pattern: string;
  requiresTags: string[];
}

interface ChainStepTemplate {
  intro: string;
  step: string;
  question: string;
}

interface MixedStepTemplate {
  intro: string;
  stepAdd: string;
  stepSub: string;
  question: string;
}

interface TemplatesData {
  subjects: Subject[];
  names: string[];
  phrases: { total: string[] };
  templates: {
    addition: Template[];
    subtraction: Template[];
  };
  multiStep: {
    connectors: string[];
    mixedConnectors: string[];
    chain_addition: ChainStepTemplate;
    chain_subtraction: ChainStepTemplate;
    mixed: MixedStepTemplate;
  };
}

interface WordProblem {
  text: string;
  operation: 'addition' | 'subtraction';
  n1: number;
  n2: number;
  answer: number;
  measure: string;
}

export interface MultiStepWordProblem {
  text: string;
  numbers: number[];
  operators: ('+' | '-')[];
  answer: number;
  measure: string;
}

export type MultiStepMode = 'chain_addition' | 'chain_subtraction' | 'mixed';

const data = templatesData as unknown as TemplatesData;

/** 比……多/少 比较类模板 ID */
const COMPARISON_TEMPLATE_IDS = new Set([
  'add_compare_more_find_bigger',
  'add_compare_less_find_bigger',
  'sub_compare_more_diff',
  'sub_compare_less_diff',
  'sub_compare_less_find_smaller',
  'sub_compare_more_find_smaller',
  'sub_difference',
]);

function filterComparisonTemplates(
  templates: Template[],
  exclude: boolean,
  only: boolean,
): Template[] {
  if (only) return templates.filter((t) => COMPARISON_TEMPLATE_IDS.has(t.id));
  if (exclude) return templates.filter((t) => !COMPARISON_TEMPLATE_IDS.has(t.id));
  return templates;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickDistinct<T>(arr: T[], count: number): T[] {
  const pool = [...arr];
  const result: T[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = randInt(0, pool.length - 1);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

function subjectMeetsTags(subject: Subject, requiresTags: string[]): boolean {
  return requiresTags.every((tag) => subject.tags.includes(tag));
}

function fillTemplate(pattern: string, vars: Record<string, string>): string {
  return pattern.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

export function generateWordProblems(opts: {
  operation: 'addition' | 'subtraction' | 'mixed';
  range: [number, number];
  count: number;
  excludeZero: boolean;
  excludeComparison?: boolean;
  comparisonOnly?: boolean;
}): WordProblem[] {
  const { operation, range, count, excludeZero, excludeComparison = false, comparisonOnly = false } = opts;
  const [min, max] = range;
  const problems: WordProblem[] = [];
  const usedTexts = new Set<string>();

  for (let i = 0; i < count; i++) {
    const isAddition = operation === 'mixed'
      ? Math.random() < 0.5
      : operation === 'addition';

    const rawTemplates = isAddition ? data.templates.addition : data.templates.subtraction;
    const templates = filterComparisonTemplates(rawTemplates, excludeComparison, comparisonOnly);
    if (templates.length === 0) continue;

    const suitableSubjects = data.subjects.filter((s) =>
      templates.some((t) => subjectMeetsTags(s, t.requiresTags))
    );

    const subject = pickRandom(suitableSubjects.length > 0 ? suitableSubjects : data.subjects);
    const validTemplates = templates.filter((t) =>
      subjectMeetsTags(subject, t.requiresTags)
    );
    const template = pickRandom(validTemplates.length > 0 ? validTemplates : templates);

    // Generate numbers
    let n1: number;
    let n2: number;
    let attempts = 0;

    do {
      attempts++;
      if (isAddition) {
        n1 = randInt(excludeZero ? Math.max(1, min) : min, max - 1);
        n2 = randInt(excludeZero ? Math.max(1, min) : min, Math.min(max, max - n1));
        // Ensure n1+n2 <= max
        if (n1 + n2 > max) {
          n2 = max - n1;
        }
      } else {
        n1 = randInt(Math.max(2, min), max);
        n2 = randInt(excludeZero ? Math.max(1, min) : min, n1);
        // Ensure n1 >= n2
        if (n2 > n1) [n1, n2] = [n2, n1];
      }
    } while (
      attempts < 20 &&
      ((excludeZero && (n1 === 0 || n2 === 0 || (!isAddition && n1 === n2))) ||
       (isAddition && n1 + n2 > max) ||
       (!isAddition && n1 < n2))
    );

    // Pick names if needed
    const names = template.pattern.includes('{name1}') || template.pattern.includes('name')
      ? pickDistinct(data.names, 2)
      : [];

    // Build variables
    const vars: Record<string, string> = {
      n1: String(n1),
      n2: String(n2),
      noun: subject.noun,
      measure: subject.measure,
    };

    if (subject.location && template.pattern.includes('{location}')) {
      vars.location = subject.location;
    }
    if (subject.verbs) {
      if (template.pattern.includes('{verb_appear}')) vars.verb_appear = subject.verbs.appear;
      if (template.pattern.includes('{verb_leave}')) vars.verb_leave = subject.verbs.leave;
    }
    if (names[0]) vars.name1 = names[0];
    if (names[1]) vars.name2 = names[1];
    if (template.pattern.includes('{total}')) vars.total = pickRandom(data.phrases.total);

    const text = fillTemplate(template.pattern, vars);

    // De-duplicate
    if (usedTexts.has(text)) continue;
    usedTexts.add(text);

    problems.push({
      text,
      operation: isAddition ? 'addition' : 'subtraction',
      n1,
      n2,
      answer: isAddition ? n1 + n2 : n1 - n2,
      measure: template.id === 'sub_change' ? '元' : subject.measure,
    });
  }

  return problems;
}

// ---------- Multi-step word problems ----------

// All numbers in a step sequence are >= 1 so each event reads naturally.
function genChainAdditionNumbers(max: number, k: number): number[] | null {
  const lo = 1;
  const nums: number[] = [];
  let sum = 0;
  for (let i = 0; i < k; i++) {
    const slotsAfter = k - 1 - i;
    const maxForThis = max - sum - slotsAfter * lo;
    if (maxForThis < lo) return null;
    const n = randInt(lo, maxForThis);
    nums.push(n);
    sum += n;
  }
  return nums;
}

function genChainSubtractionNumbers(max: number, k: number, finalMin: number): number[] | null {
  const lo = 1;
  const minN1 = (k - 1) * lo + finalMin;
  if (minN1 > max) return null;
  const n1 = randInt(minN1, max);
  const nums = [n1];
  let running = n1;
  for (let i = 1; i < k; i++) {
    const slotsAfter = k - 1 - i;
    const maxForThis = running - (slotsAfter * lo + finalMin);
    if (maxForThis < lo) return null;
    const n = randInt(lo, maxForThis);
    nums.push(n);
    running -= n;
  }
  return nums;
}

function genMixedNumbers(
  max: number,
  k: number,
  finalMin: number,
): { numbers: number[]; operators: ('+' | '-')[] } | null {
  const lo = 1;
  const numbers: number[] = [randInt(1, max)];
  const operators: ('+' | '-')[] = [];
  let running = numbers[0];
  for (let i = 1; i < k; i++) {
    const canAdd = running + lo <= max;
    const canSub = running - lo >= finalMin;
    if (!canAdd && !canSub) return null;
    const op: '+' | '-' = canAdd && canSub ? (Math.random() < 0.5 ? '+' : '-') : canAdd ? '+' : '-';
    let n: number;
    if (op === '+') {
      n = randInt(lo, max - running);
      running += n;
    } else {
      n = randInt(lo, running - finalMin);
      running -= n;
    }
    numbers.push(n);
    operators.push(op);
  }
  // "mixed" must contain at least one + and one - to be meaningful
  if (!operators.includes('+') || !operators.includes('-')) return null;
  return { numbers, operators };
}

export function generateMultiStepWordProblems(opts: {
  mode: MultiStepMode;
  numberCount: number;
  range: [number, number];
  count: number;
  excludeZero: boolean;
}): MultiStepWordProblem[] {
  const { mode, numberCount, range, count, excludeZero } = opts;
  const [, max] = range;
  const k = Math.max(3, numberCount);
  const finalMin = excludeZero ? 1 : 0;
  const ms = data.multiStep;

  const problems: MultiStepWordProblem[] = [];
  const usedTexts = new Set<string>();
  const maxAttempts = count * 60 + 200;
  let attempts = 0;

  while (problems.length < count && attempts < maxAttempts) {
    attempts++;

    let numbers: number[] | null;
    let operators: ('+' | '-')[];

    if (mode === 'chain_addition') {
      numbers = genChainAdditionNumbers(max, k);
      operators = numbers ? numbers.slice(1).map(() => '+' as const) : [];
    } else if (mode === 'chain_subtraction') {
      numbers = genChainSubtractionNumbers(max, k, finalMin);
      operators = numbers ? numbers.slice(1).map(() => '-' as const) : [];
    } else {
      const res = genMixedNumbers(max, k, finalMin);
      numbers = res ? res.numbers : null;
      operators = res ? res.operators : [];
    }

    if (!numbers) continue;
    if (excludeZero && numbers.some((n) => n === 0)) continue;

    let answer = numbers[0];
    for (let i = 0; i < operators.length; i++) {
      answer += operators[i] === '+' ? numbers[i + 1] : -numbers[i + 1];
    }
    if (answer < 0 || answer > max) continue;
    if (excludeZero && answer === 0) continue;

    const subject = pickRandom(data.subjects);
    const baseVars: Record<string, string> = {
      n1: String(numbers[0]),
      noun: subject.noun,
      measure: subject.measure,
      location: subject.location,
      verb_appear: subject.verbs.appear,
      verb_leave: subject.verbs.leave,
      total: pickRandom(data.phrases.total),
    };

    let text: string;
    if (mode === 'mixed') {
      const tpl = ms.mixed;
      let body = fillTemplate(tpl.intro, baseVars);
      for (let i = 1; i < numbers.length; i++) {
        const op = operators[i - 1];
        const stepPattern = op === '+' ? tpl.stepAdd : tpl.stepSub;
        body += fillTemplate(stepPattern, {
          ...baseVars,
          connector: ms.mixedConnectors[i - 1] ?? '',
          n: String(numbers[i]),
        });
      }
      text = body + fillTemplate(tpl.question, baseVars);
    } else {
      const tpl = mode === 'chain_addition' ? ms.chain_addition : ms.chain_subtraction;
      let body = fillTemplate(tpl.intro, baseVars);
      for (let i = 1; i < numbers.length; i++) {
        body += fillTemplate(tpl.step, {
          ...baseVars,
          connector: ms.connectors[i - 1] ?? '又',
          n: String(numbers[i]),
        });
      }
      text = body + fillTemplate(tpl.question, baseVars);
    }

    if (usedTexts.has(text)) continue;
    usedTexts.add(text);

    problems.push({ text, numbers, operators, answer, measure: subject.measure });
  }

  return problems;
}
