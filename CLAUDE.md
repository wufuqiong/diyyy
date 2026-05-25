# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev              # Dev server at localhost:3039
yarn build            # tsc + vite build
yarn test             # vitest (watch mode)
yarn test:run         # vitest (single run)
npx vitest run path/to/file  # Run a single test file
yarn lint             # ESLint check
yarn lint:fix         # ESLint auto-fix
yarn fm:fix           # Prettier format
yarn fix:all          # Both lint:fix + fm:fix
```

Vitest uses `jsdom` environment with `globals: true` (no imports needed for `describe`/`it`/`expect`).

## Architecture

**DIYYY** is a client-side worksheet generator for kids with four tools: Math Genie (arithmetic), Char Trace (Chinese character tracing), Char Maze (character mazes), and Char Color (character coloring). Built on React 19, MUI v7, TypeScript, Vite 6, React Router 7, and i18next. No server — all generation runs in the browser.

Entry: `src/main.tsx` → `createBrowserRouter` → lazy-loaded pages wrapped in `DashboardLayout`.

Routes (from `src/routes/sections.tsx`): `/` (dashboard), `/charcolor`, `/charmaze`, `/chartrace`, `/math-genie`.

### Features vs. Sections split

Each tool follows a strict two-folder pattern:

- **`src/features/{tool}/`** — business logic only: types, generators, the `WorksheetTool` object (`config.tsx`), and utils. No UI.
- **`src/sections/{tool}/`** — UI components only: the view, settings panels, previews, paper sheets.

A `WorksheetTool` (`src/shared/worksheet/types.ts`) is a single object with: `id`, `defaultConfig`, `generate(config) => Problem[]`, `Preview` component, `Settings` component, and `meta`.

View components are thin wrappers that render `<Workbench tool={tool} />`.

### Workbench / PrintFrame

`Workbench` (`src/shared/worksheet/Workbench.tsx`) is the shared controller for all tools:

1. Persists config to `localStorage` via `usePersistedConfig` (keyed `diyyy:{tool.id}.config`, versioned)
2. Calls `tool.generate(config)` on mount and on config change
3. Renders `ResponsiveWorkbench` (left panel: settings, right panel: preview)
4. Supports `debounceMs` and `autoGenerate` props for per-tool behavior

`PrintFrame` wraps preview content in a paper-like container with `@media print` rules that strip margins/backgrounds/shadows and force page breaks.

### Layout system

`DashboardLayout` (`src/layouts/dashboard/`) composes:
- **Header** — sticky AppBar with blur, hamburger menu (mobile), and `LanguageSwitcher`
- **Sidebar** — `NavDesktop` (fixed left) or `NavMobile` (drawer), both rendering `NavContent` from `nav-config-dashboard.tsx`
- **Main** — `<Outlet />` (page content)

Built on layout primitives from `minimal-shared` and `src/layouts/core/`.

### i18n

`src/i18n/config.ts` — i18next with `zh-CN` as fallback, detects from `localStorage` (key: `diyyy:lang`) then `navigator.language`. Imported at the top of `app.tsx` so it initializes before render. Translation files: `src/i18n/locales/en.json` and `zh-CN.json`.

### Theme

MUI v7 CSS-variables theme in `src/theme/`. `theme-config.ts` defines palette/fonts; `tokens.ts` has worksheet-specific design tokens (gradients, grid colors, font stacks for Chinese tracing). Applied by `ThemeProvider` in `app.tsx`.

### Path aliases

`src/...` maps to `/absolute/path/src/...` in both Vite and Vitest configs. All imports use this pattern — never relative paths for cross-directory imports.

### ESLint

Flat config (`eslint.config.mjs`) with `eslint-plugin-perfectionist` enforcing import sort order: styles → side-effects → types → built-in/external → MUI → router → hooks → utils → internal → components → sections → auth → types → parent/sibling/index → parent-types → objects → unknown. Also enforces `import/newline-after-import`.

## Behavioral Guidelines

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.
