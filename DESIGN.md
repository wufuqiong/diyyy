# DIYYY Design Document

## Overview

DIYYY is a client-side worksheet generator for kids' education. It produces A4-printable worksheets across six tools: arithmetic practice, Chinese character coloring, character mazes, character tracing, hundred-chart puzzles, and English word search. All generation runs in the browser — no server.

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

Six tools implement this interface. Each lives at `src/features/{tool}/config.tsx`.

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
| `/word-search` | WordSearchPage | English word search |

Note: `Workbench.tsx` maps `tool.id` to its i18n nav key via a hardcoded ternary; `word-search` maps to `wordSearch` (`nav.wordSearch`).

---

## Layout System

`src/layouts/dashboard/` composes the app shell:

- **Header** — sticky AppBar with blur effect, mobile hamburger menu, `LanguageSwitcher`
- **Sidebar** — `NavDesktop` (fixed left, md+) or `NavMobile` (drawer), both rendering `NavContent` from `nav-config-dashboard.tsx`
- **Main** — `<Outlet />` for page content
- Built on primitives from `src/layouts/core/` (`LayoutSection`, `HeaderSection`, `MainSection`)

Navigation items (from `nav-config-dashboard.tsx`): Dashboard, CharColor, CharMaze, CharTrace, MathGenie, HundredChart, WordSearch.

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
| `ProblemVisualizer` | `sections/math-genie/components/` | Renders individual problems with adaptive font sizing based on digit count and operand count |

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
| `ControlPanel` | Multi-select lesson book loader, manual input, words/page, color scheme selector — uses `SettingCard` |
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
2. WORD mode: each Chinese character becomes its own maze page
3. PHRASE mode: words placed horizontally/vertically in the grid
4. SENTENCE mode: backtracking path through sentence characters
5. Fill remaining cells with random distractor characters
6. Pages capped at `MAX_PAGES = 50`; filler character pool precomputed once per generation

### UI Components

| Component | Purpose |
|-----------|---------|
| `CharMazeView` | Mounts Workbench |
| `ControlPanel` | Mode toggle buttons (word/phrase/sentence), level + multi-select lesson loader, manual input, grid size, words/page — uses `SettingCard` |
| `PreviewSheet` | Maze grid with start/end icons, page navigation |

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
| `ControlPanel` | Lesson content loader (level + multi-select lessons + load buttons), grid type/size/color, font, colors, layout, pinyin toggle, presets — uses `SettingCard` with green theme |
| `PaperSheet` | Renders A4 tracing worksheets with grids, trace copies, annotations |
| `GridBox` | Individual grid cell rendering |

### Grid Types
- **Tian (田字格)**: Traditional cross-divided square
- **Mi (米字格)**: Diagonal cross-divided square
- **Square**: Plain square grid
- **English Lines**: Four-line grid for English writing

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

## Tool 6: Word Search (`word-search`)

**ID:** `word-search`
**Route:** `/word-search`

English word-search worksheets: target words are hidden in a letter grid (horizontal / vertical / diagonal, forward and backward depending on difficulty), with a word list printed below. Users type words manually or load a preset theme. Decorative illustrations are intentionally **not** implemented.

### Config (`WordSearchConfig` in `features/word-search/types.ts`)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `words` | string[] | `[]` | Target words (manual input or theme) |
| `gridSize` | `GridSizePreset` | `MEDIUM` | small/medium/large |
| `difficulty` | `WordSearchDifficulty` | `MEDIUM` | easy/medium/hard (allowed directions) |
| `title` | string | `'Word Search'` | Sheet title (rendered as bubble letters) |
| `showAnswerKey` | boolean | false | Append a separate answer-key page |
| `listColumns` | 1 \| 2 \| 3 | 3 | Word-list column count |
| `letterCase` | `'upper' \| 'lower'` | `'lower'` | Grid + list letter case (kept consistent) |
| `selectedTheme` | string? | undefined | Active preset theme id |

### Key Enums / Maps

- `GridSizePreset`: SMALL (10×10), MEDIUM (14×14), LARGE (16×18) — see `GRID_DIMENSIONS`
- `WordSearchDifficulty`: EASY (H+V), MEDIUM (+ diagonal), HARD (+ reverse, 8 directions) — see `DIFFICULTY_DIRECTIONS`
- `Direction`: 8 values (`horizontal`, `vertical`, `diagonal-down`, `diagonal-up`, each with a `-reverse` variant)

### Generation

`generate()` in `config.tsx` returns `WordSearchSheet[]`: a question page plus, when `showAnswerKey` is on, an answer-key page that **shares the same grid and `placedWords`** (highlight is render-only). Seed comes from `generateSeed()` (`crypto.getRandomValues`, non-deterministic at runtime; tests pass a fixed seed).

Core algorithm — `generateWordSearchGrid(words, gridSize, difficulty, seed, letterCase)` in `generators/grid-generator.ts`:

1. Normalize: trim, dedupe, drop empties, sort by length descending
2. Init empty `rows × cols` grid; create seeded RNG via `lcg(seed)`
3. Place each word with `tryPlaceWord` (≤100 attempts); a **2s soft timeout** pushes the rest to `unplacedWords` instead of hanging
4. Fill empties + accidental-word check with up to **20 retries** (re-seeded each time); on exceeding, accept current grid with a `console.warn`
5. Return `{ grid, placedWords, unplacedWords }`

Placement rule: crossings sharing the **same** letter are allowed; differing letters are a conflict (attempt fails). `detectAccidentalWords` only matches **complete target words** (case-insensitive, all 8 directions) — it does not fight an English dictionary.

### Generator Files

| File | Purpose |
|------|---------|
| `generators/rng.ts` | `lcg(seed)` seeded PRNG + direction vectors |
| `generators/word-placement.ts` | `tryPlaceWord` — direction/position pick + conflict detection |
| `generators/filler.ts` | `fillEmpty` (random A–Z by case) + `detectAccidentalWords` |
| `generators/grid-generator.ts` | `generateWordSearchGrid` orchestrator + `generateSeed` |
| `data/word-themes.ts` | Preset themes (`WordTheme`: id, label_zh, label_en, words) |

### UI Components

| Component | File | Purpose |
|-----------|------|---------|
| `WordSearchView` | `sections/word-search/view/` | Mounts Workbench |
| `ControlPanel` | `sections/word-search/components/` | Word input, theme loader, grid/difficulty, display options |
| `PreviewSheet` | `sections/word-search/components/` | A4 preview: bubble title, grid card, instruction, word list, answer-key highlight |

**ControlPanel behavior**

- **Raw-text input:** the textarea is backed by a local `text` state so separators (space / comma / newline) are preserved while typing; `config.words` is derived via `parseWords` (`split(/[\s,]+/)`). A `useEffect` re-syncs the textarea only when `config.words` changes externally (theme load / reset).
- **Caps:** `MAX_WORDS = 30`, `MAX_WORD_LEN = 18` enforced in `parseWords` to bound worst-case layout.
- **Theme library:** selecting a theme replaces the word list (still editable); chips show parsed words; caption shows count + capacity hint.
- **Grid Size / Difficulty:** `ToggleButtonGroup` with `HelpTooltip` (anchors `field-grid-size`, `field-difficulty`); switching does not clear words.
- **Display options:** title, list columns (1/2/3), letter case, show-answer-key switch.

**PreviewSheet behavior**

- **Theme color:** all accents use the system **primary** palette (`theme.palette.primary.main`, list card uses `primary.lighter`).
- **Bubble-letter title** rendered per character in rounded primary-bordered badges.
- **Grid:** borderless letters inside a rounded primary-bordered card; cell/font size derived from grid columns.
- **Instruction** between grid and list: bold "Find below words" plus a dynamic direction hint built from `DIFFICULTY_DIRECTIONS` (e.g. easy → "horizontally and vertically"; hard appends "(including backwards)").
- **Word list:** rounded card, no bullets, distributed row-first; font size scales with grid size via `LIST_FONT_SIZE` (small 24 / medium 21 / large 18); long words wrap (`overflowWrap: 'anywhere'`).
- **Answer key page:** same grid with each placed word's cells highlighted as colored circles.
- **One-page auto-fit:** a `PageFit` wrapper fills exactly one A4 page (`height: 297mm`, `overflow: hidden`), measures content via `ResizeObserver`, and applies a uniform `transform: scale()` = `min(1, availW/naturalW, availH/naturalH)` so content always fits a single page — identical for on-screen preview and print (`scrollWidth/Height` are transform-independent, avoiding observer loops).
- **Unplaced warning:** MUI `Alert` (`wordSearch.unplacedWordsWarning`) on the question page when words could not be placed. **Empty state** prompts to enter words or pick a theme.

### Help Doc

`docs/word-search.md` (frontmatter `tool_id: word-search`) builds to `src/data/docs/word-search.json`; provides `field-reference` anchors used by `HelpTooltip` plus drawer content.

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

---

## Input Parsing Rules

_From UX Audit Round 2 — implicit syntax findings._

### chartrace `text` field

Content mode is auto-detected from text delimiters:

| Input | Detected Mode | Result |
|-------|--------------|--------|
| No delimiters | CHARACTERS | Each char traced individually |
| Contains `,` or `，` | PHRASES | Comma-separated segments as phrase rows |
| Contains `\n` | SENTENCES | One sentence per line, `traceCount` forced to 1 |

Load buttons (word/phrase/sentence) set the content mode and load corresponding data from selected lessons. English mode (gridType=ENGLISH_LINES): 3-tier fallback — `\n/,` split → space split → per-character split.

### charcolor `userInput` field

**Chinese characters only.** Every character is split individually — commas, spaces, and punctuation are ignored. Non-Chinese input triggers a red warning below the field. Shuffle and preset loading join without delimiters.

### charmaze `userInput` field

WORD/PHRASE modes split by `/[\s,;，；、]+/`. SENTENCE mode splits by `\n` only — commas ARE content in sentence mode but ARE separators in word/phrase mode. In WORD mode, each Chinese character becomes an individual token (split per character after initial delimiter split).

### math-genie `theme` field

Autocomplete freeSolo. Input is lowercased and matched against `THEME_EMOJIS` dictionary. Unmatched keys silently fall back to a default star emoji set. Preset labels (e.g. "Animals 🐶") are stripped to the key (`animals`) on input.

### word-search `words` field

Split by whitespace or comma (`/[\s,]+/`) — space, newline, tab, and comma are all separators. The textarea keeps the **raw typed text** in local state so separators are not stripped mid-typing; `config.words` is the parsed/trimmed/deduped result. Capped at `MAX_WORDS = 30` words and `MAX_WORD_LEN = 18` characters per word.

---

## Help System

_From Help UI Implementation Plan._

### Architecture

Three-layer help system, data-driven from `docs/{tool-id}.md` markdown files:

| Layer | Trigger | Component |
|-------|---------|-----------|
| Tooltip | User hovers `?` icon next to a field label | `HelpTooltip` — reads `docs/{tool-id}.md` → `field-reference` → specific anchor |
| Input preview | User types in a text field | Inline chip preview below charcolor input showing how text is split |
| Full help drawer | User clicks `?` in toolbar | `HelpDrawer` — right-side drawer with Field Reference, Feature Map, FAQ |

### Build Pipeline

```
docs/{tool-id}.md  →  scripts/build-docs.mjs  →  src/data/docs/{tool-id}.json
```

The build script (`node scripts/build-docs.mjs`) runs before `tsc && vite build`. It validates that every anchor has bilingual (zh/en) content and rejects the build on mismatch.

### Tooltip Usage

```tsx
<SettingsField
  label="预设字库"
  toolId="charcolor"
  helpAnchor="field-preset-word-lib"
>
```

The `SettingsField` component in `src/sections/_shared/SettingsPanel.tsx` accepts optional `toolId` + `helpAnchor` props and renders a `?` icon next to the label.

### Help Documents

`docs/{tool-id}.md` files follow a shared template (7 sections: Quick Start, Feature Map, Field Reference, Input Syntax, FAQ, Glossary). Each supports bilingual content and anchor-based deep linking for the Tooltip and Drawer layers.

### Key Help Docs

| File | Tool |
|------|------|
| `docs/math-genie.md` | Math worksheet generator |
| `docs/charcolor.md` | Character find & color |
| `docs/charmaze.md` | Character maze |
| `docs/chartrace.md` | Character tracing |
| `docs/hundred-chart.md` | Hundred chart puzzles |
| `docs/word-search.md` | English word search |

---

## SaaS Print Warning

When a Safari user triggers print (toolbar button or ⌘P), a `SafariPrintWarning` dialog appears suggesting Chrome or Save PDF as alternatives. The dialog can be permanently dismissed via a "don't show again" checkbox (stored in localStorage). Chrome users are unaffected.

Components: `SafariPrintWarning.tsx`, `is-safari.ts`, integration in `Workbench.tsx`.

---

## Comparison Feature (Math Genie)

`SpecialPracticeType.COMPARISON` with two subtypes (`ComparisonSubType`):

| Subtype | Pattern (EMOJI) | Text | Word Problem |
|---------|-----------------|------|-------------|
| 比大小 MAGNITUDE | Emoji groups + ○ for `><=` | `5 ○ 8` → fill `><=` | Disabled (N/A) |
| 比多少 DIFFERENCE | Emoji rows + "X比Y多/少___个" | `5比7少___个` | "小明有5个🍎，小红有3个..." |

- Reuses `displayMode` toggle (EMOJI/TEXT/WORD_PROBLEM) for presentation
- EMOJI mode capps to max 10 (confirmation prompt if exceed)
- Two-step settings: top-level "题型大类" selector → comparison-specific cards
- Generators: `comparison.ts` (core) + `comparison-word-problem.ts` (word problems)
- Rendering: `<ComparisonCard>` Paper wrapper matching arithmetic EMOJI style
- `deriveContentColumns`: COMPARISON+EMOJI→2, TEXT→config.textColumns

## UX Improvements Applied

_From UX Audit Round 1 & 2 task lists._

| ID | Area | Change |
|----|------|--------|
| DIYYY-001 | Charmaze | Mode switch confirmation dialog |
| DIYYY-002 | Hundred Chart | Cross mode Display Options default-expanded |
| DIYYY-003 | Charmaze | Sentence overflow error → visible Alert |
| DIYYY-004 | Math Genie | Special Practice button tooltips |
| DIYYY-005 | All tools | Reset button → icon + tooltip |
| DIYYY-006 | Charmaze | Empty state guidance text |
| DIYYY-007 | All tools | localStorage restore snackbar |
| R2-01 | Chartrace | Dynamic parsing hint below text input |
| R2-02 | Charcolor | Delimiter hint → single-char-only caption |
| R2-03 | Math Genie | Theme onChange/onInputChange race condition fix |
| R2-05 | Charmaze | WORD mode multi-char detection warning |
| R2-06 | Charmaze | PHRASE mode overflow → visible Error |
| R3-06 | Math Genie | Adaptive font scaling for multi-op and fill-in-the-blank |
| R3-07 | Sidebar | Icons synced with header |
| R4-01 | Math Genie | Comparison exercises: 比大小/比多少 with emoji/text/word-problem modes |
| R4-02 | Math Genie | Two-step exercise type selector (arithmetic / comparison) |
| R4-03 | Math Genie | WORD_PROBLEM_COMPARISON removed, merged into COMPARISON |
| R4-04 | Dashboard | Card sizing uniform, icons synced |
| R4-05 | Word Search | BubbleTitle auto-shrinks for long titles |
| R4-06 | All tools | Print Paper height fix (minHeight→height+overflow:hidden) |
| R4-07 | Math Genie | Compare magnitude worksheet instruction hint |

---

## Data

### Textbook Data

`src/data/miemie-details.json` contains 17 lesson sets. The primary dataset is:

**人教版语文-一年级上** (2024 edition, 280 characters total): 24 lessons organized as:

| # | Lesson | Character Count |
|---|--------|----------------|
| 1–4 | Introductory units (我是中国人, 我爱我们的祖国, 我是小学生, 我爱学语文) | 34 |
| 5–8 | 识字 1–4 (天地人, 金木水火土, 口耳目手足, 日月山川) | 28 |
| 9 | 语文园地一 | 5 |
| 10–13 | 阅读 1–4 (秋天, 江南, 雪地里的小画家, 四季) | 43 |
| 14–17 | 识字 5–8 (对韵歌, 日月明, 小书包, 升国旗) | 42 |
| 18 | 语文园地六 | 9 |
| 19–24 | 阅读 5–10 (小小的船, 影子, 两件宝, 比尾巴, 乌鸦喝水, 雨点儿) | 65 |

Full reference table: `docs/生字表-人教版语文-一年级上.md`
