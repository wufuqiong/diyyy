import { v4 as uuidv4 } from 'uuid';

import { lcg, seededShuffle } from './utils';

import type { ShapeCell, Difficulty, CrossPuzzle, HundredChartSheet, HundredChartConfig } from './types';

// ---- grid helpers ----

function toRow(n: number): number { return Math.floor((n - 1) / 10); }
function toCol(n: number): number { return (n - 1) % 10; }
function fromRC(r: number, c: number): number { return r * 10 + c + 1; }
function key(r: number, c: number): string { return `${r},${c}`; }
function parseKey(k: string): [number, number] { const [r, c] = k.split(',').map(Number); return [r, c]; }

const DIRS = [
  { dr: -1, dc: 0 }, // up
  { dr: 0, dc: 1 },  // right
  { dr: 1, dc: 0 },  // down
  { dr: 0, dc: -1 }, // left
];

// ---- difficulty parameters ----

function resolveCellCount(d: Difficulty, config: HundredChartConfig, puzSeed: number): number {
  const rng = lcg(puzSeed);
  switch (d) {
    case 'easy': return 5;
    case 'medium': {
      switch (config.mediumCellCount) {
        case 'fixed5': return 5;
        case 'fixed6': return 6;
        case 'random5-6': return 5 + Math.floor(rng() * 2);
        default: return 5;
      }
    }
    case 'hard': {
      switch (config.hardCellCount) {
        case 'fixed5': return 5;
        case 'fixed7': return 7;
        case 'fixed9': return 9;
        case 'random5-9': return 5 + Math.floor(rng() * 5);
        default: return 7;
      }
    }
    default: return 5;
  }
}

function resolveHintCount(d: Difficulty, config: HundredChartConfig, cellCount: number, puzSeed: number): number {
  const rng = lcg(puzSeed);
  switch (d) {
    case 'easy': return config.easyHintCount;
    case 'medium': {
      switch (config.mediumHintCount) {
        case 'fixed2': return 2;
        case 'fixed3': return Math.min(3, cellCount - 1);
        case 'random2-3': return 2 + Math.floor(rng() * Math.min(2, cellCount - 2));
        default: return 2;
      }
    }
    case 'hard': return 1;
    default: return 2;
  }
}

// ---- shape generation ----

function generateShape(
  anchor: number,
  targetCount: number,
  shapeType: 'cross' | 'random',
  seed: number,
): Set<string> {
  const ar = toRow(anchor);
  const ac = toCol(anchor);
  const shape = new Set<string>();
  shape.add(key(ar, ac));

  if (shapeType === 'cross') {
    // Fixed 5-cell cross centered on anchor
    for (const { dr, dc } of DIRS) {
      const nr = ar + dr; const nc = ac + dc;
      if (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 9) {
        shape.add(key(nr, nc));
      }
    }
    return shape;
  }

  // Random BFS expansion
  const rng = lcg(seed);
  const frontier: [number, number][] = [[ar, ac]];
  while (shape.size < targetCount && frontier.length > 0) {
    const fi = Math.floor(rng() * frontier.length);
    const [fr, fc] = frontier.splice(fi, 1)[0];

    const shuffled = seededShuffle([...DIRS], Math.floor(rng() * 10000));
    for (const { dr, dc } of shuffled) {
      const nr = fr + dr; const nc = fc + dc;
      if (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 9 && !shape.has(key(nr, nc))) {
        shape.add(key(nr, nc));
        frontier.push([nr, nc]);
        if (shape.size >= targetCount) break;
      }
    }
  }

  return shape;
}

// ---- unique solution validation ----

function validateUniqueSolution(shape: Set<string>, hintKeys: Set<string>): boolean {
  // BFS constraint propagation
  // Each cell has a value = fromRC(r, c). A "resolved" cell knows its value.
  // An unresolved neighbor of a resolved cell can be uniquely determined
  // if there's exactly one possible value offset (±1, ±10).

  const resolved = new Set<string>(hintKeys);
  const queue: string[] = [...hintKeys];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const [cr, cc] = parseKey(current);
    // Check each neighbor
    for (const { dr, dc } of DIRS) {
      const nr = cr + dr; const nc = cc + dc;
      const nk = key(nr, nc);
      if (!shape.has(nk) || resolved.has(nk)) continue;

      // Check if this neighbor can be uniquely determined
      // The neighbor's value = currentValue +/- correct offset
      // But we need to verify NO OTHER resolved neighbor could determine it differently
      // Since 100-chart has unique coordinates, any single resolved neighbor uniquely determines it
      // (neighbor value = current ± 1 or ± 10, which resolves to one unique value)
      resolved.add(nk);
      queue.push(nk);
    }
  }

  return resolved.size === shape.size;
}

// ---- weighted hint selection ----

function selectHints(shape: Set<string>, hintCount: number, seed: number): string[] {
  const cellList: string[] = [...shape];
  if (cellList.length <= hintCount) return cellList;

  // Compute degree (neighbor count within shape) for each cell
  const degrees: number[] = cellList.map((k) => {
    const [r, c] = parseKey(k);
    let deg = 0;
    for (const { dr, dc } of DIRS) {
      if (shape.has(key(r + dr, c + dc))) deg++;
    }
    return deg;
  });

  const rng = lcg(seed);

  // Weighted sampling without replacement: higher degree = more likely
  const result: string[] = [];
  const remaining = cellList.map((k, i) => ({ k, i }));
  const remainingDeg = [...degrees];

  for (let pick = 0; pick < hintCount; pick++) {
    // Compute total weight with random perturbation
    const weights = remaining.map(({ i }) => remainingDeg[i] + rng() * 2);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let r = rng() * totalWeight;
    let selected = 0;
    for (let j = 0; j < remaining.length; j++) {
      r -= weights[j];
      if (r <= 0) { selected = j; break; }
    }
    result.push(remaining[selected].k);
    remaining.splice(selected, 1);
  }

  return result;
}

// ---- puzzle construction ----

function buildPuzzle(shape: Set<string>, hintSet: Set<string>): CrossPuzzle {
  let minR = 9; let maxR = 0; let minC = 9; let maxC = 0;
  for (const k of shape) {
    const [r, c] = parseKey(k);
    minR = Math.min(minR, r); maxR = Math.max(maxR, r);
    minC = Math.min(minC, c); maxC = Math.max(maxC, c);
  }

  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;
  const grid: (ShapeCell | null)[][] = Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));

  for (const k of shape) {
    const [r, c] = parseKey(k);
    const gr = r - minR; const gc = c - minC;
    grid[gr][gc] = { number: fromRC(r, c), isBlank: !hintSet.has(k), row: gr, col: gc };
  }

  return { id: uuidv4(), grid, rows, cols, questionNumber: 0 };
}

// ---- main generator ----

const MAX_RETRIES = 50;

function generateOnePuzzle(
  anchor: number,
  targetCount: number,
  hintCount: number,
  shapeType: 'cross' | 'random',
  seed: number,
): CrossPuzzle {
  for (let i = 0; i < MAX_RETRIES; i++) {
    const s = seed + i;
    const shape = generateShape(anchor, targetCount, shapeType, s);
    if (shape.size < targetCount) continue;

    const hintKeys = selectHints(shape, hintCount, s + 1000);
    const hintSet = new Set(hintKeys);

    if (validateUniqueSolution(shape, hintSet)) {
      return buildPuzzle(shape, hintSet);
    }
  }
  // Fallback: return puzzle even without unique solution (should rarely happen)
  const shape = generateShape(anchor, targetCount, shapeType, seed);
  const hintKeys = selectHints(shape, hintCount, seed + 1000);
  return buildPuzzle(shape, new Set(hintKeys));
}

// ---- sheet generator ----

export function generateCrossSheets(config: HundredChartConfig, runSeed: number): HundredChartSheet[] {
  const sheets: HundredChartSheet[] = [];

  // Pick anchors
  const anchors: number[][] = [];
  for (let v = 0; v < config.versionCount; v++) {
    const range = config.maxCenter - config.minCenter + 1;
    const indices = Array.from({ length: range }, (_, i) => config.minCenter + i);
    anchors.push(seededShuffle(indices, runSeed + v * 1000).slice(0, config.questionsPerPage));
  }

  for (let v = 0; v < config.versionCount; v++) {
    const versionSeed = runSeed + v * 1000;

    const puzzles: CrossPuzzle[] = anchors[v].map((anchor, i) => {
      const puzSeed = versionSeed + i * 10;
      const targetCount = resolveCellCount(config.difficulty, config, puzSeed);
      const hintCount = resolveHintCount(config.difficulty, config, targetCount, puzSeed + 100);
      const shapeType = config.difficulty === 'easy' ? 'cross' : 'random';
      const p = generateOnePuzzle(anchor, targetCount, hintCount, shapeType, puzSeed);
      p.questionNumber = i + 1;
      return p;
    });

    // Example puzzle
    const examplePuzzle = config.showExample
      ? (() => { const s = generateShape(anchors[v][0], 5, 'cross', versionSeed + 9999); return buildPuzzle(s, new Set([...s])); })()
      : undefined;

    sheets.push({
      id: uuidv4(),
      mode: 'cross',
      pageTitle: config.pageTitle,
      pageInfo: config.pageInfo,
      isAnswerKey: false,
      puzzles,
      showFormula: config.showFormula,
      showExample: config.showExample,
      showNumbering: config.showNumbering,
      columnsPerRow: config.columnsPerRow,
      examplePuzzle,
    });

    if (config.includeAnswerKey) {
      const answerPuzzles: CrossPuzzle[] = anchors[v].map((anchor, i) => {
        const s = generateShape(anchor, 5, config.difficulty === 'easy' ? 'cross' : 'random', versionSeed + i * 10);
        const p = buildPuzzle(s, new Set([...s]));
        p.questionNumber = i + 1;
        return p;
      });

      sheets.push({
        id: uuidv4(),
        mode: 'cross',
        pageTitle: `${config.pageTitle} - Answer Key`,
        pageInfo: '',
        isAnswerKey: true,
        puzzles: answerPuzzles,
        showFormula: false,
        showExample: false,
        showNumbering: config.showNumbering,
        columnsPerRow: config.columnsPerRow,
      });
    }
  }

  return sheets;
}
