# DIYYY Design Document

## Overview

DIYYY is a client-side worksheet generator for kids' education. It produces A4-printable worksheets across five tools: arithmetic practice, Chinese character coloring, character mazes, character tracing, and hundred-chart puzzles. All generation runs in the browser — no server.

**Tech stack:** React 19, MUI v7, TypeScript, Vite 6, React Router 7, i18next (zh-CN/en), jsPDF + html2canvas (PDF export).

**Entry point:** `src/main.tsx` → `createBrowserRouter` → lazy-loaded pages wrapped in `DashboardLayout` with `<App>` (theme + i18n init).

---

## Architecture

### Features vs. Sections Split

Each tool follows a strict two-folder pattern:

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Feature** | `src/features/{tool}/` | Business logic: types, generators, config, utils. No UI. |
| **Section** | `src/sections/{tool}/` | UI only: views, settings panels, previews, paper sheets. |

A **feature** exports a single `WorksheetTool` object. A **section** consumes it via `<Workbench tool={tool} />`.

### The WorksheetTool Interface

Defined in `src/shared/worksheet/types.ts`:

```typescript
interface WorksheetTool<Config, Problem> {
  id: string;
  defaultConfig: Config;
  generate: (config: Config) => Problem[] | Promise<Problem[]>;
  Preview: React.FC<{ config, problems, pdfContainerRef? }>;
  Settings: React.FC<{ config, onChange, onGenerate?, isGenerating? }>;
  meta: { title, icon, route };
}
```

Five tools implement this interface. Each lives at `src/features/{tool}/config.tsx`.

### Workbench

`src/shared/worksheet/Workbench.tsx` is the shared controller for all tools:

1. Persists config to `localStorage` via `usePersistedConfig` (keyed `diyyy:{tool.id}.config`, versioned)
2. Calls `tool.generate(config)` on mount and on config change (debounced per tool)
3. Renders `ResponsiveWorkbench`: sidebar (`SettingsPanel` + `WorksheetToolbar` + `tool.Settings`) and main area (`tool.Preview`)
4. Provides PDF export (`html2canvas` → `jsPDF`) and browser print

### Print Layout

- `PrintFrame` (`src/shared/worksheet/PrintFrame.tsx`) — A4 paper wrapper (210×297mm), invisible on screen, visible on print with `page-break-after`
- `usePreviewScale` — measures container width, computes CSS `scale()` to fit A4 in viewport
- `derivePageLayout` (`src/features/math-genie/shared/layout.ts`) — calculates row height, font size, gaps for A4 grid layout (available height = 237mm after header/padding)
- `calculateOptimalProblemsPerPage` — computes max problems fitting on one A4 page for current config

---

## Routes

Defined in `src/routes/sections.tsx`. All wrapped in `DashboardLayout` with lazy loading:

| Path | Page | Feature |
|------|------|---------|
| `/` | DashboardPage | Landing page with tool cards |
| `/charcolor` | CharColorPage | Character coloring |
| `/charmaze` | CharMazePage | Character mazes |
| `/chartrace` | CharTracePage | Character tracing |
| `/math-genie` | MathGeniePage | Arithmetic worksheets |
| `/hundred-chart` | HundredChartPage | Hundred-chart puzzles |

---

## Layout System

`src/layouts/dashboard/` composes the app shell:

- **Header** — sticky AppBar with blur effect, mobile hamburger menu, `LanguageSwitcher`
- **Sidebar** — `NavDesktop` (fixed left, md+) or `NavMobile` (drawer), both rendering `NavContent` from `nav-config-dashboard.tsx`
- **Main** — `<Outlet />` for page content
- Built on primitives from `src/layouts/core/` (`LayoutSection`, `HeaderSection`, `MainSection`)

Navigation items (from `nav-config-dashboard.tsx`): Dashboard, CharColor, CharMaze, CharTrace, MathGenie, HundredChart.

---

## Tool 1: Math Genie (`math-genie`)

**ID:** `math-genie`
**Route:** `/math-genie`

Generates arithmetic worksheets with configurable operations, difficulty, display modes, and special practice types.

### Config (`WorksheetConfig` in `src/types.ts`)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `theme` | string | `'Animals 🐶'` | Emoji theme for visual mode |
| `difficulty` | `DifficultyLevel` | `EASY` (1–5) | Number range preset |
| `operation` | `OperationType` | `ADDITION` | +, −, ±, multi |
| `count` | number | 1 | Number of pages |
| `textColumns` | 2 \| 3 | 2 | Text mode column count |
| `problemsPerPage` | number | auto | Auto-calculated per config |
| `title` | string | `'Fun Math Time!'` | Worksheet header |
| `showAnswers` | boolean | false | Show/hide answer key |
| `displayMode` | `DisplayMode` | `TEXT` | emoji / text / word-problem |
| `customDifficulty` | `{min, max}` | `{1, 15}` | Custom number range |
| `difficultyRatios` | object | undefined | Mix-mode percentages |
| `problemType` | `ProblemType` | `STANDARD` | standard / fill-blank |
| `specialPracticeType` | `SpecialPracticeType` | `NONE` | zero / fact-family / number-bond / comparison |
| `multiOperationConfig` | object | `{chain_add, 3}` | Multi-op mode + operand count |
| `excludeZeroProblems` | boolean | false | Filter out zero-involving problems |
| `excludeComparisonProblems` | boolean | false | Filter comparison word problems |
| `autoPreview` | boolean | true | Auto-generate on config change |

### Key Enums

- `DifficultyLevel`: EASY=5, MEDIUM=10, HARD=20, CUSTOM=-1
- `OperationType`: ADDITION, SUBTRACTION, MIXED, MULTI_OPERATIONS
- `DisplayMode`: EMOJI, TEXT, WORD_PROBLEM
- `ProblemType`: STANDARD (`7+3=10`), FILL_BLANK (`7+_=10`)
- `SpecialPracticeType`: NONE, ZERO_DRILL, FACT_FAMILY, NUMBER_BOND, WORD_PROBLEM_COMPARISON
- `MultiOperationMode`: CHAIN_ADDITION, CHAIN_SUBTRACTION, MIXED_OPERATIONS

### Problem Generation Flow

1. `config.tsx` `generate()` reads `config.problemsPerPage` and calls `generateMathProblems()` from `generators/index.ts`
2. The orchestrator dispatches to sub-generators based on `specialPracticeType` and `displayMode`:
   - **Standard/Fill-blank**: `generators/standard.ts` / `generators/fill-blank.ts`
   - **Multi-operation**: `generators/multi-op.ts`
   - **Word problems**: `generators/word-problem.ts`
   - **Zero drill**: `generators/special-practice/zero-drill.ts`
   - **Fact family**: `generators/special-practice/fact-family.ts`
   - **Number bond**: `generators/special-practice/number-bond.ts`
3. Results are de-duplicated and mapped to `MathProblem` objects
4. Fact family problems are reordered column-major via `reorderProblemsByColumnPerPage()`

### Generator Files

| File | Purpose |
|------|---------|
| `generators/index.ts` | Orchestrator: dispatch, dedup, fill |
| `generators/standard.ts` | Basic a ± b problems |
| `generators/fill-blank.ts` | Problems with one blank position |
| `generators/multi-op.ts` | Chain add/sub, mixed operations |
| `generators/word-problem.ts` | Contextual word problems from templates |
| `generators/special-practice/zero-drill.ts` | Zero-involving problems |
| `generators/special-practice/fact-family.ts` | Groups of 4 related equations |
| `generators/special-practice/number-bond.ts` | Whole/part number bond problems |
| `generators/shared/types.ts` | RawMathProblem type, helpers |
| `generators/shared/mixed-balance.ts` | Balanced +/- counts in mixed mode |
| `generators/shared/problem-key.ts` | Column-major reordering |

### UI Components

| Component | File | Purpose |
|-----------|------|---------|
| `MathGenieView` | `sections/math-genie/view/` | Mounts Workbench |
| `WorksheetSettings` | `sections/math-genie/components/` | Full settings panel (output, problem, difficulty, rules tabs) |
| `WorksheetPreview` | `sections/math-genie/components/` | A4 page grid with pagination |
| `ProblemVisualizer` | `sections/math-genie/components/` | Renders individual problems in text/emoji/word-problem/number-bond modes |

### Per-Page Calculation

`calculateOptimalProblemsPerPage()` in `shared/layout.ts` computes the max problems fitting on one A4 page based on:
- **Text mode** (standard/fill-blank/fact-family): min 20mm row height → 20 problems (2 cols) / 30 (3 cols, clamped)
- **Text mode** (multi-op 5-6): min 18mm → 22 problems (2 cols)
- **Text mode** (number bond): min 47mm (SVG content) → 8 problems (2 cols)
- **Emoji mode**: based on max number in range (35/45/55mm thresholds) → 6-12 problems
- **Word problem mode**: fixed 48mm rows → 4 problems

---

## Tool 2: Char Color (`charcolor`)

**ID:** `charcolor`
**Route:** `/charcolor`

Find-and-color character recognition worksheets. Users input characters, and the tool generates pages with a 7×7 grid of circles where children find and color target characters among distractors.

### Config (`CharColorConfig` in `features/charcolor/types.ts`)

- `userInput` — raw character input
- `wordsPerPage` — number of target words per page
- `selectedPreset`, `selectedLevel`, `fullSelectedValue`, `selectedBook` — lesson preset from Miemie data
- Color scheme selection

### Generation

`generateCharColorPages()` in `utils.ts`:
1. Parses input characters
2. Loads distractor characters from Miemie lesson data
3. Assigns random color to each target character from selected color preset
4. Generates 7×7 circle grid per page with mixed targets and distractors
5. Creates color legend for each page

### Color Presets (4 schemes)
Defined in `utils.ts` as `COLOR_PRESETS`.

### UI Components

| Component | Purpose |
|-----------|---------|
| `CharColorView` | Mounts Workbench with 300ms debounce |
| `ControlPanel` | Input field, lesson preset loader, words/page, color scheme selector |
| `PreviewSheet` | Renders A4 pages with legend + 7×7 grid |

---

## Tool 3: Char Maze (`charmaze`)

**ID:** `charmaze`
**Route:** `/charmaze`

Character maze worksheets where children find a path of target characters through a grid from start to end.

### Config (`CharMazeConfig` in `features/charmaze/types.ts`)

- `userInput` — target characters
- `selectedMode` — WORD (single char), PHRASE (horizontal/vertical), SENTENCE (full sentence path)
- `selectedTableSize` — grid dimensions (8×8 through 12×12)
- `wordsPerPage`
- Lesson preset support

### Generation

`generateMaze()` in `utils.ts`:
1. Uses DFS path-finding from `src/utils/maze-tools.ts`
2. WORD mode: single character along start-to-end path
3. PHRASE mode: words placed horizontally/vertically in the grid
4. SENTENCE mode: backtracking path through sentence characters
5. Fill remaining cells with random distractor characters

### UI Components

| Component | Purpose |
|-----------|---------|
| `CharMazeView` | Mounts Workbench |
| `ControlPanel` | Mode selector, input, preset loader, grid size, words/page |
| `PreviewSheet` | Class component with pagination, maze grid, start/end icons |

---

## Tool 4: Char Trace (`chartrace`)

**ID:** `chartrace`
**Route:** `/chartrace`

Chinese character tracing worksheets. Supports multiple grid types and custom styling.

### Config (`SheetConfig` in `src/types.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `text` | string | Characters/phrases/sentences to trace |
| `contentMode` | `TraceContentMode` | CHARACTERS, PHRASES, or SENTENCES |
| `gridType` | `GridType` | TIAN (田字格), MI (米字格), SQUARE, ENGLISH_LINES, NONE |
| `gridColor`, `gridOpacity`, `gridSize` | visual | Grid appearance |
| `fontFamily` | string | Font for characters |
| `mainTextColor`, `traceTextColor` | string | Colors |
| `traceOpacity` | number | Opacity of trace guides |
| `rowsPerPage`, `colsPerRow` | number | Layout |
| `traceCount` | number | Number of trace copies per character |
| `header` | string | Page header text |
| `showPinyin` | boolean | Display pinyin above characters |
| `showStrokeCount` | boolean | Display stroke count |
| `showStrokeOrder` | boolean | Show stroke order diagrams |

### Generation

The `generate` function returns an empty array — the `SheetConfig` drives rendering directly. The preview renders from config without intermediate problem objects.

### UI Components

| Component | Purpose |
|-----------|---------|
| `CharTraceView` | Mounts Workbench (autoGenerate disabled) |
| `ControlPanel` | Extensive settings: content mode, grid type/size/color, font, colors, layout, pinyin/stroke toggles, presets |
| `PaperSheet` | Renders A4 tracing worksheets with grids, trace copies, annotations |
| `GridBox` | Individual grid cell rendering |

### Grid Types
- **Tian (田字格)**: Traditional cross-divided square
- **Mi (米字格)**: Diagonal cross-divided square
- **Square**: Plain square grid
- **English Lines**: Four-line grid for English writing
- **None**: No grid lines

---

## Tool 5: Hundred Chart (`hundred-chart`)

**ID:** `hundred-chart`
**Route:** `/hundred-chart`

Hundred-chart worksheets with two modes: grid fill-in and cross puzzles.

### Modes

**Grid Mode** (`grid`): 10×10 hundred-chart with blank cells for children to fill in.
- Start number configurable (1-100 or any offset)
- Blank strategies: RANDOM, PATTERN, MANUAL (click to toggle), ANSWER_KEY
- Step, offset, multi-version support
- Optional answer key page

**Cross Puzzle Mode** (`cross`): Cross-shaped arithmetic puzzles.
- Number range (min/max center)
- Difficulty: easy/medium/hard with sub-options
- Questions per page, columns configurable
- Formula/example/numbering display toggles

### Config (`HundredChartConfig` in `features/hundred-chart/types.ts`)

Key fields: `mode`, `pageTitle`, `pageInfo`, `startNumber`, `versionCount`, `blankMode`, `blankCount`, `difficulty`, `minCenter`, `maxCenter`, `questionsPerPage`, `columns`, `includeAnswerKey`, `showExample`, `showFormula`, `showNumbering`.

### Generation

- **Grid**: `computeBlanks()` in `utils.ts` — seeded LCG random number generator for deterministically random blanks
- **Cross**: `generateCrossPuzzleWorkbook()` in `cross-utils.ts` — seeded random puzzles with difficulty-based validation

### UI Components

| Component | Purpose |
|-----------|---------|
| `HundredChartView` | Mounts Workbench |
| `HundredChartSettings` | Grid mode: title, start number, blank strategy, count, step, offset |
| `HundredChartPreview` | 10×10 grid with toggleable blanks |
| `CrossPuzzleSettings` | Cross mode: number range, difficulty, questions/page, display options |
| `CrossPuzzlePreview` | Cross-shaped puzzles with formula and example |
| `ChartPageShell` | Common page shell for both modes |

---

## i18n

`src/i18n/config.ts` — i18next with `zh-CN` as fallback, detection from `localStorage` (key: `diyyy:lang`) then `navigator.language`.

Translation files:
- `src/i18n/locales/zh-CN.json`
- `src/i18n/locales/en.json`

Both contain translations for nav items, all tool settings/operations/modes/difficulty labels, dashboard, and common actions.

## Theme

MUI v7 CSS-variables theme in `src/theme/`:

- `theme-config.ts` — palette (primary blue, secondary purple), font families (DM Sans Variable, Barlow)
- `tokens.ts` — worksheet-specific design tokens: grid/trace colors, ink, paper, emoji yellow, fact family purple, font stacks (KaiTi, Andika, English print/handwriting)
- `core/palette.ts` — light palette channels
- `core/typography.ts` — responsive font scale with Chinese-friendly fonts
- `core/components.tsx` — MUI component overrides

## Shared Infrastructure

### Worksheet Framework (`src/shared/worksheet/`)

| File | Purpose |
|------|---------|
| `types.ts` | `WorksheetTool` interface |
| `Workbench.tsx` | Config → generate → preview controller |
| `WorksheetToolbar.tsx` | Reset, Save PDF, Print buttons |
| `save-pdf.ts` | html2canvas → jsPDF A4 export |
| `PrintFrame.tsx` | A4/Letter paper wrapper |
| `usePreviewScale.ts` | Responsive scaling hook |
| `use-persisted-config.ts` | localStorage config persistence |

### Shared Sections (`src/sections/_shared/`)

| Component | Purpose |
|-----------|---------|
| `ResponsiveWorkbench.tsx` | Two-column layout (sidebar + main), responsive |
| `SettingsPanel.tsx` | Settings sidebar shell with header, body, footer |

### Utility Files

| File | Purpose |
|------|---------|
| `src/utils/array-tools.ts` | `filterChineseCharacters`, `shuffleArray`, `filterMazeCharacters` |
| `src/utils/maze-tools.ts` | DFS path generation for word/sentence mazes |
| `src/shared/data/lessons.ts` | `loadMiemieLessons()` from `miemie-details.json` |

### Data

- `src/data/miemie-details.json` — Miemie (小羊上山) Chinese reading curriculum: lessons by level (1-6) with words, phrases, sentences in Chinese and English

---

## Path Aliases

`src/...` maps to `/absolute/path/src/...` in both Vite and Vitest.

## Commands

```bash
yarn dev              # Dev server at localhost:3039
yarn build            # tsc + vite build
yarn test             # vitest (watch mode)
yarn test:run         # vitest (single run)
yarn lint             # ESLint check
yarn lint:fix         # ESLint auto-fix
yarn fm:fix           # Prettier format
```
