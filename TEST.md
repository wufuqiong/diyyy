# DIYYY Test Plan

> **过程记录**：本测试计划的编写反向发现了一个开发遗漏——`calculateStageWidth` 函数在设计文档 `diyyy-render-fix-detail.md` §1 中定义但从未实现，导致预览区宽度在所有工具上使用固定值，造成识字涂色等工具的网格局促问题。已于 2026-06-25 补齐实现并接入 `PreviewStage` 组件。

## CI/CD

GitHub Actions workflow: `.github/workflows/test.yml`

```
jobs:
  unit-and-component-tests:   # Layer 1 + 2 (Vitest, fast)
    runs-on: ubuntu-latest
    steps: [checkout, node, yarn, yarn test:run]

  e2e-tests:                  # Layer 3 + 4 (Playwright, needs browser)
    needs: unit-and-component-tests
    steps: [checkout, node, yarn, playwright install --with-deps, playwright test]
    # TODO: visual regression baseline 尚未提交，visual job 标记为 allow-failure（临时）
```

本地复现 CI 环境：
```bash
yarn test:run                           # Layer 1 + 2
npx playwright install --with-deps      # 首次需要
npx playwright test                     # Layer 3 + 4
```

---

## Test Infrastructure

- **Framework:** Vitest with `jsdom` environment
- **Globals:** `true` (no imports needed for `describe`/`it`/`expect`)
- **E2E / Visual:** Playwright (Chromium)
- **Run:** `yarn test` (watch) / `yarn test:run` (single run) / `npx vitest run path/to/file`

---

# Layer 1: Generator Unit Tests

---

## Test Suite: Math Genie Generators

All tests dynamically import modules (`await import(...)`) to match the project's module system.

### 1. MIXED mode addition/subtraction balance

**Test:** `should generate balanced +/- counts with difference ≤ 1`

- Generates 10 problems with `OperationType.MIXED` at EASY difficulty
- Asserts: difference between addition and subtraction count ≤ 0
- Generates 11 problems, asserts difference ≤ 1
- Verifies total count equals requested count

**Test setup:** `generateMathProblems(MIXED, EASY, count=10, DisplayMode.TEXT)`

### 2. CHAIN_SUBTRACTION intermediate results

**Test:** `should ensure no intermediate result is negative`

- Generates 20 multi-operation problems with `CHAIN_SUBTRACTION`, 3 numbers, MEDIUM difficulty
- For each multi-op problem: iterates through numbers, applying operators
- Asserts: intermediate step result never goes negative

### 3. CHAIN_ADDITION number range

**Test:** `should ensure all numbers fall within [min, max]`

- Uses `DifficultyLevel.CUSTOM` with `{min: 5, max: 15}`
- Generates 20 multi-op chain addition problems (3 numbers)
- Asserts: every operand is within [5, 15]

### 4. FACT_FAMILY outputs 4 equations

**Test:** `should generate 4 related equations (a+b, b+a, c-a, c-b) per family`

- Generates 12 fact family problems
- Asserts: total count is divisible by 4
- For each group of 4:
  - p1: a + b = c (addition)
  - p2: b + a = c (commutative addition)
  - p3: c - a = b (subtraction)
  - p4: c - b = a (subtraction)

### 5. FILL_BLANK + EMOJI mode excludes result blank

**Test:** `should not have blankPosition="result" in EMOJI mode`

- Generates 30 fill-blank problems in EMOJI display mode
- Asserts: no problem has `blankPosition === 'result'`
- Only 'first' or 'second' positions allowed

### 6. excludeZeroProblems constraint

**Test A:** `should not contain any zero when excludeZeroProblems=true`

- Generates 30 MIXED problems at MEDIUM difficulty with `excludeZeroProblems: true`
- Asserts: neither operand is 0, and the result is never 0

**Test B:** `should not hang with narrow range and excludeZeroProblems=true`

- Uses CUSTOM difficulty `{min: 1, max: 2}` with exclusion enabled
- Generates 5 problems
- Asserts: duration < 5000ms (no infinite loop), at least some problems returned

### 7. CUSTOM difficulty range enforcement

**Test A:** `should strictly enforce custom difficulty range`

- Uses `{min: 10, max: 20}` with ADDITION
- Generates 30 problems
- Asserts: all results are within [10, 20]

**Test B:** `should enforce custom range for subtraction`

- Uses `{min: 15, max: 25}` with SUBTRACTION
- Asserts: all `a` values are within [15, 25]

### 8. generateRandomProblem narrow range handling

**Test A:** `should not throw stack overflow in narrow range`

- Tests three edge cases: `{0,0}`, `{1,1}`, `{5,5}` (min = max)
- Asserts: all resolve without throwing

**Test B:** `should return valid problems even in edge cases`

- Uses `{min: 2, max: 3}` with MIXED operations
- Generates 10 problems
- Asserts: all problems have defined `a`, `b`, and valid operator (+/-)

### NUMBER_BOND tests

**Test A:** `all problems satisfy parts[0] + parts[1] === whole`

- Generates 20 number bond problems at MEDIUM difficulty
- Asserts: every problem has `isNumberBond: true` and parts sum equals whole

**Test B:** `excludeZeroProblems prevents zeros in parts`

- Generates 20 number bond problems at EASY with `excludeZeroProblems: true`
- Asserts: no part is 0

**Test C:** `no duplicate problems within a batch`

- Generates 30 number bond problems
- Creates dedup keys from `whole:part0:part1:blankIndex`
- Asserts: all keys are unique

**Test D:** `produces various blankIndex values`

- Generates 50 number bond problems at MEDIUM
- Collects unique `blankIndex` values
- Asserts: at least 2 different blank positions appear (0, 1, or 'whole')

### derivePageLayout tests

**Test A:** `fontSize decreases monotonically as problemsPerPage increases`

- Compares layout for (3 cols, 8ppp) vs (3 cols, 20ppp) vs (3 cols, 30ppp)
- Asserts: fontSize is monotonically non-increasing

**Test B:** `rowHeight >= 12mm for all boundary values`

- Tests problemsPerPage values: 8, 15, 24, 30 with 3 columns
- Asserts: all row heights ≥ 12mm (the clamp minimum)

**Test C:** `rows = ceil(problemsPerPage / columns)`

- (3 cols, 15 ppp) → 5 rows
- (4 cols, 15 ppp) → 4 rows
- (2 cols, 10 ppp) → 5 rows

### WORD_PROBLEM tests

**Test A:** `generates word problems in WORD_PROBLEM display mode`

- Generates 10 MIXED word problems at MEDIUM difficulty
- Asserts: all have `isWordProblem: true`, non-empty text > 5 chars
- No template placeholders (`{...}`) or 'undefined' in text

**Test B:** `subtraction problems have n1 >= n2`

- Generates 20 SUBTRACTION word problems
- Asserts: `a >= b` for all subtraction problems

**Test C:** `excludeZeroProblems prevents zeros`

- Generates 20 word problems with `excludeZeroProblems: true`
- Asserts: no zero operands

### calculateOptimalProblemsPerPage tests

**Test A:** `TEXT: standard 2 columns returns 20`

- Standard ADDITION, EASY, 2 cols → 20 problems (10 rows × 2 cols)

**Test B:** `TEXT: number bond 2 columns returns 8`

- NUMBER_BOND special practice → 8 problems (SVG height ~47mm)

**Test C:** `TEXT: multi-op 5 operands 2 columns returns 22`

- MULTI_OPERATIONS with 5 operands → 22 problems

**Test D:** `TEXT: 3 columns clamps to max 30`

- 3 columns with standard text → clamped at 30

**Test E:** `EMOJI: small range max<=5 returns 12`

- EASY difficulty (max=5), emoji mode → 12 problems (2 cols × 6 rows)

**Test F:** `EMOJI: large range max>10 returns 6`

- HARD difficulty (max=20), emoji mode → 6 problems (2 cols × 3 rows)

**Test G:** `WORD_PROBLEM: returns 4`

- Word problem mode → 4 problems (1 col × 4 rows at 48mm)

**Test H:** `EMOJI: medium range 5<max<=10 returns 8`

- MEDIUM difficulty (max=10), emoji mode → 8 problems

---

## Test Suite: Word Search Generators

File: `src/features/word-search/generators/__tests__/grid-generator.test.ts`. All randomness is seeded (`lcg`) so cases are reproducible.

### rng.ts

- **deterministic output for a given seed** — `lcg(42)` twice yields identical 10-value sequences.
- **different output for different seeds** — `lcg(1)` vs `lcg(9999)` differ.

### word-placement.ts (`tryPlaceWord`)

- **places a horizontal word** — returns non-null with correct word, direction, and 3 cells for `CAT`.
- **placed cells match grid content** — writing the word along `cells` and reading back equals the word.
- **conflict detection** — across 50 seeded attempts, never overwrites a differing pre-filled character.
- **cross-sharing allowed** — when crossing an existing cell, the shared character always matches.
- **out of bounds returns null** — a 20-char word cannot fit a 5×5 grid.

### filler.ts

- **fillEmpty fills all empty cells** — no empty cells remain; uppercase output matches `/[A-Z]/`.
- **fillEmpty respects lowercase** — output matches `/[a-z]/` when `letterCase='lower'`.
- **detectAccidentalWords** — detects a target word forward, case-insensitively, and reversed; does not flag non-targets; returns false for an empty target list.

### grid-generator.ts (`generateWordSearchGrid`, integration)

- **fully filled grid** — SMALL grid is 10×10 with no empty cells and at least one placed word.
- **places all words with enough space** — `['cat','dog']` on MEDIUM places both, zero unplaced.
- **unplaceable words → `unplacedWords`** — a 20-char word in SMALL goes to unplaced without throwing.
- **no throw on extreme input** — 50 long words on SMALL/HARD does not throw (soft timeout).
- **reproducible with same seed** — identical `grid`, `placedWords`, `unplacedWords` for the same seed.
- **empty word list handled** — no placed/unplaced words; grid still initialized.
- **deduplicates words** — duplicate inputs yield unique placed words.
- **respects difficulty** — EASY only produces `horizontal`/`vertical` placements.

Run: `npx vitest run src/features/word-search/generators/__tests__/grid-generator.test.ts`

---

## Test Suite: Char Color Generators

**Status:** ✅ 已实现（29 tests）
**Target file:** `src/sections/charcolor/__tests__/utils.test.ts`
**Core function:** `generateCharColorPages()` in `src/features/charcolor/utils.ts`

### 代码行为确认

- **300 字符限制**: 仅存在于 UI 层（ControlPanel 中 TextField 的 `inputProps={{ maxLength: 300 }}`）。`generateCharColorPages()` 本身不对输入长度做任何限制或截断，直接处理传入的 `userInput` 字符串。测试应确认 generator 对大输入不会死循环或抛异常，但不需测试"截断"行为（generator 不截断）。

### 待覆盖测试

1. **正确性**
   - 给定 5 个汉字，验证每页目标字被分配了颜色（每个字符至少一个颜色值）
   - 验证每页 grid 尺寸为 7×7
   - 验证图例中包含所有目标字符

2. **边界条件**
   - 空输入 → 返回空数组，不抛异常
   - 超过色板颜色数量的字符（>5 色板色） → 循环使用颜色，不抛异常
   - 大量输入（如 500 字符） → 不抛异常、不死循环（generator 内部无长度限制）

3. **去重**
   - 输入包含重复字符时，验证每页图例中去重

---

## Test Suite: Char Maze Generators

**Status:** ✅ 已实现（41 tests）
**Target file:** `src/sections/charmaze/__tests__/utils.test.ts`
**Core function:** `generateMaze()` / `generateMazePages()` in `src/features/charmaze/utils.ts`

### 代码行为确认

- **超长句子（>grid 容量）**: `generateSentenceMazePath` 会 `throw new Error('句子太长...')`。调用链：`generateMaze` → `generateSentenceMazePath`，异常向上传播到 `Workbench` 的 try/catch，最终显示为页面 Alert 错误提示。测试应断言 throw，并说明这是预期的可检测错误行为。
- **无法放置的词语（PHRASE 模式）**: `generatePhraseMazePath` 对无法放入 grid 的词语仅 `console.warn` 并跳过，不抛异常，返回结果中无可检测的"未放置"标记。**已知问题：调用方无法感知词语被跳过**，建议后续补充返回状态（如 `unplacedWords` 数组）。当前测试只能验证"不抛异常"，标注为已知局限。

### 待覆盖测试

1. **正确性**
   - WORD 模式: 单个汉字生成迷宫，路径从 (0,0) 到 (rows-1, cols-1) 连通
   - PHRASE 模式: 词语水平/垂直放置在 grid 中，不重叠
   - SENTENCE 模式: 句子按顺序排列在路径上

2. **边界条件**
   - 空输入 → 返回空数组
   - 超长句子（>grid 容量） → 断言 `throw`（Workbench 捕获后显示 Alert）
   - 超过 `MAX_PAGES=50` 的输入 → 截断到 50 页
   - PHRASE 模式词语无法全部放置 → 不抛异常（已知局限：无可检测返回状态）

3. **WORD 模式独字拆分**
   - 连续中文字符串无分隔符 → 拆分为单字

---

## Test Suite: Hundred Chart Generators

**Status:** ✅ 已实现（34 tests）。cross-utils 暂无独立测试。
**Target file:** `src/sections/hundred-chart/__tests__/utils.test.ts`
**Core functions:** `lcg()`, `seededShuffle()`, `generateSeed()`, `computeBlanks()` in `src/features/hundred-chart/utils.ts`

### 待覆盖测试

1. **正确性**
   - Grid 模式 RANDOM: `blankCount=N` 时恰好有 N 个空白格
   - Grid 模式 PATTERN: 空白格按 step/offset 正确分布
   - Cross 模式: 生成的谜题 numbers 满足十字加法约束

2. **边界条件**
   - `startNumber=0` → 正确处理起始编号
   - `versionCount=1` 与 `versionCount=10` → 后者生成 10 个不同版本
   - Manual 模式空数组 → 无空白格

3. **可复现性**
   - 使用相同 seed 的 LCG → 相同 blank 位置

---

## Test Suite: Char Trace (Skipped)

**Status:** 跳过
**Reason:** `chartrace` 的 `generate()` 返回空数组，`SheetConfig` 直接驱动渲染。无可测试的纯生成函数。

---

# Layer 2: UI Component Tests (TODO)

**Framework:** Vitest + React Testing Library
**目标目录:** `src/sections/_shared/__tests__/`

---

## SettingCard

**Target file:** `__tests__/SettingCard.test.tsx`

1. `label` 正确渲染为卡片标题
2. `toolColor` 作为标题颜色被应用到 DOM 元素（断言 CSS 变量或 style 存在，不断言具体颜色值）
3. `children` 渲染在卡片内容区

---

## PreviewStage + calculateStageWidth

**Target file:** `__tests__/PreviewStage.test.tsx`

> **实现记录**：`calculateStageWidth` 是 `diyyy-render-fix-detail.md` §1 中设计的函数，在 2026-06-25 测试计划 review 第二轮中被发现从未实现（开发任务遗漏）。已补齐实现于 `src/shared/worksheet/calculateStageWidth.ts`，并接入 `PreviewStage` 组件。

### PreviewStage 渲染测试

1. 渲染天蓝背景壳体（`bgcolor: surface.sky`）
2. `children` 正确渲染在内部
3. `@media print` 时背景变白、maxWidth 重置

### calculateStageWidth 纯函数测试

1. 不同 `contentColumns` 值（7, 10, 12, 18）→ 验证计算结果符合 `contentColumns * 90 + 88`
2. 极端列数（`contentColumns=1`）→ 验证 `minWidth=560` 兜底生效
3. 极端列数（`contentColumns=20`）→ 验证 `maxWidth=920` 兜底生效
4. 未传入 `contentColumns` → 返回默认值 760
5. 传入自定义 `minCellWidth` → 覆盖参数生效

---

## PageNavigator

**Target file:** `__tests__/PageNavigator.test.tsx`

1. 页数 ≤7 → 完整渲染所有页码按钮
2. 页数 >7 → 省略号可见，首页/末页/当前页附近页码可见
3. 点击页码 → `onPageChange` 回调触发且参数正确
4. 当前页码带有 active 状态标识（`aria-current` 或选中 class）

---

## ToggleButtonGroup 身份色

**Target file:** `__tests__/ToggleButtonColor.test.tsx`

1. 渲染使用 `--tool-color` CSS 变量的 ToggleButtonGroup
2. 选中态元素的 computed style 读取了 `--tool-color`（而非硬编码颜色）
3. 切换选中按钮后，新选中态继承正确颜色

---

# Layer 3: Visual Regression Tests

**Framework:** Playwright (`toHaveScreenshot()`)
**测试文件:** `e2e/visual/regression.spec.ts`
**截图基线:** `e2e/visual/regression.spec.ts-snapshots/`（6 tools × default state）

---

## 截图场景

### 1. 默认状态（全页面）

对六个工具分别截图首次加载、未做任何配置时的完整页面（含侧边栏、页头、设置面板、预览区）：

| 工具 | 路由 | 截图命名 |
|------|------|---------|
| charcolor | `/charcolor` | `charcolor-default` |
| charmaze | `/charmaze` | `charmaze-default` |
| chartrace | `/chartrace` | `chartrace-default` |
| math-genie | `/math-genie` | `math-genie-default` |
| hundred-chart | `/hundred-chart` | `hundred-chart-default` |
| word-search | `/word-search` | `word-search-default` |

### 2. 填充状态（仅预览区）

使用固定示例配置填充后，**仅截预览区域**：

| 工具 | 示例输入 |
|------|---------|
| charcolor | 5 个汉字 "天地人日月" |
| charmaze | WORD 模式 "小学生天地人" |
| chartrace | 字符 "天地人" + 田字格 |
| math-genie | EASY + ADDITION + TEXT mode |
| hundred-chart | grid 模式 RANDOM blankCount=20 |
| word-search | `['cat','dog','bird']` + MEDIUM |

### 3. 关键组件局部截图（元素级）

- 分段按钮组选中态（验证身份色 CSS 变量）
- 设置面板卡片标题（验证断层样式 / 工具色是否正确）

---

## 配置要点

- 截图容差：`maxDiffPixelRatio: 0.02`（2% 像素差异容忍，避免字体渲染差异误报）
- CI 环境：使用 Playwright 官方 Docker 镜像 `mcr.microsoft.com/playwright:latest`
- 视口：1280×900（桌面）

---

# Layer 4: E2E Integration Tests

**Framework:** Playwright (Chromium, `playwright.config.ts`)
**测试文件:** `e2e/integration/tools.spec.ts`
**测试文件目录:** `e2e/integration/`

---

## 每个工具至少一条主路径

### charcolor
1. 打开 `/charcolor` → 输入 "天地人日月" → 断言预览区出现这 5 个字
2. 点击"保存 PDF" → 断言触发 download 事件

### charmaze
1. 打开 `/charmaze` → 输入 "小学生" → 断言预览区生成 3 页迷宫
2. 点击页码 2 → 断言预览区切换到第 2 页

### chartrace
1. 打开 `/chartrace` → 输入 "天地人" → 断言预览区渲染出描红格子

### math-genie
1. 打开 `/math-genie` → 选择 SUBTRACTION → 断言预览区题目符号变为 `-`
2. 点击"保存 PDF" → 断言触发 download 事件

### hundred-chart
1. 打开 `/hundred-chart` → 切换到 cross 模式 → 断言预览区出现十字谜题

### word-search
1. 打开 `/word-search` → 输入 "cat, dog, bird" → 断言预览区生成字母网格

---

## 明确排除

- PDF 文件内部内容像素验证
- `window.print()` 系统对话框验证（仅断言函数被调用）
- 移动端真机测试

---

# Test Coverage Summary

## Layer 1: Generator Unit Tests

| Category | Tests | Status |
|----------|-------|--------|
| Math Genie — Mixed ops balance | 2 | ✅ |
| Math Genie — Chain subtraction | 1 | ✅ |
| Math Genie — Chain addition range | 1 | ✅ |
| Math Genie — Fact family | 1 | ✅ |
| Math Genie — Fill-blank constraints | 1 | ✅ |
| Math Genie — Zero exclusion | 2 | ✅ |
| Math Genie — Custom difficulty | 2 | ✅ |
| Math Genie — Narrow range | 2 | ✅ |
| Math Genie — Number bond | 4 | ✅ |
| Math Genie — Page layout | 3 | ✅ |
| Math Genie — Word problem | 3 | ✅ |
| Math Genie — Optimal ppp | 8 | ✅ |
| Word Search — RNG | 2 | ✅ |
| Word Search — Placement | 5 | ✅ |
| Word Search — Filler | 7 | ✅ |
| Word Search — Grid generator | 8 | ✅ |
| Math Genie | 29 | ✅ |
| Word Search | 22 | ✅ |
| Char Color | 29 | ✅ |
| Char Maze | 41 | ✅ |
| Hundred Chart | 34 | ✅ |
| Char Trace | 0 | Skipped (no pure functions) |
| **Layer 1 total** | **155** | |

## Layer 2: UI Component Tests

| Component | Tests | Status |
|-----------|-------|--------|
| SettingCard | 4 | ✅ |
| PreviewStage + calculateStageWidth | 9 | ✅ |
| PageNavigator | 5 | ✅ |
| ToggleButtonGroup color | 3 | ✅ |
| **Layer 2 total** | **21** | |

## Layer 3: Visual Regression Tests

| Category | Screenshots | Status |
|----------|-------------|--------|
| Default state (6 tools) | 6 | ✅ |
| Filled state (6 tools) | - | TODO |
| Component close-ups | - | TODO |
| **Layer 3 total** | **6** | |

## Layer 4: E2E Integration Tests

| Tool | Test paths | Status |
|------|-----------|--------|
| charcolor | 2 | ✅ |
| charmaze | 1 | ✅ |
| chartrace | 1 | ✅ |
| math-genie | 2 | ✅ |
| hundred-chart | 1 | ✅ |
| word-search | 1 | ✅ |
| **Layer 4 total** | **8** | |

---

## Running Tests

```bash
# All Layer 1 + 2 tests
npx vitest run                    # single run (182 tests)

# Single test file
npx vitest run src/sections/charcolor/__tests__/utils.test.ts
npx vitest run src/sections/charmaze/__tests__/utils.test.ts
npx vitest run src/sections/hundred-chart/__tests__/utils.test.ts
npx vitest run src/shared/worksheet/__tests__/calculateStageWidth.test.ts
npx vitest run src/sections/math-genie/__tests__/generators.test.ts
npx vitest run src/features/word-search/generators/__tests__/grid-generator.test.ts

# Watch mode
npx vitest

# Layer 3 + 4: Visual + E2E
npx playwright test                    # all (requires dev server at localhost:3039)
npx playwright test e2e/visual/        # visual only
npx playwright test e2e/integration/   # E2E only
```
