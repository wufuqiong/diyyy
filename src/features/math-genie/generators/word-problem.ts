
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

interface TemplatesData {
  subjects: Subject[];
  names: string[];
  templates: {
    addition: Template[];
    subtraction: Template[];
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

const data = templatesData as unknown as TemplatesData;

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
}): WordProblem[] {
  const { operation, range, count, excludeZero } = opts;
  const [min, max] = range;
  const problems: WordProblem[] = [];
  const usedTexts = new Set<string>();

  for (let i = 0; i < count; i++) {
    const isAddition = operation === 'mixed'
      ? Math.random() < 0.5
      : operation === 'addition';

    const templates = isAddition ? data.templates.addition : data.templates.subtraction;
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
      ((excludeZero && (n1 === 0 || n2 === 0)) ||
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
      measure: subject.measure,
    });
  }

  return problems;
}
