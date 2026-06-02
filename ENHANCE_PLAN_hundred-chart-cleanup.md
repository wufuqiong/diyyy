# Hundred-Chart 架构清理 Enhance Plan（保留单 tool）

> 背景：`hundred-chart` 已正确基于统一抽象 `WorksheetTool`（`src/shared/worksheet/types.ts`）实现，并由共享 `Workbench` 渲染，与 `math-genie` 同构。本计划**不拆分**为两个 tool，仅清理使其更干净、行为更一致的偏离点。
>
> 决策：保留「grid + cross 共用单 tool、以 `config.mode` 判别」的现状。

## 相关文件

- `src/features/hundred-chart/config.tsx`（tool 定义 + generate + deriveTitle + Preview/Settings 适配器）
- `src/features/hundred-chart/utils.ts`（grid 随机/seed 工具）
- `src/features/hundred-chart/cross-utils.ts`（cross 生成，使用 `config.seed`）
- `src/features/hundred-chart/types.ts`（`HundredChartConfig`，含 `seed` 字段）
- `src/sections/hundred-chart/components/HundredChartPreview.tsx`
- `src/sections/hundred-chart/components/CrossPuzzlePreview.tsx`

---

## 偏离点 1 — seed 行为不一致（最高优先级）

**现状**
- grid：`generateGridSheets` 每次调用 `generateSeed()` 取新随机种子（`config.tsx:60`），**忽略 `config.seed`** → 每次生成都重新随机。
- cross：`generateCrossSheets` 使用 `config.seed`（`cross-utils.ts:240`、`resolveCellCount`=`config.seed+999`、`resolveHintCount`=`config.seed+88`）。而 `config.seed` 仅在模块加载时 `defaultConfig.seed = generateSeed()` 设定一次，UI 无任何控件修改它 → **cross 输出被冻结**，每次「重新生成」结果都相同。
- 附带隐患：`resolveCellCount`/`resolveHintCount` 在每页题目循环里用同一 `config.seed` 调用 → 同页所有题目格子数/提示数恒等，未按预期随机。

**目标**：两种模式都像 `math-genie` 一样，每次生成都得到新内容；`config.seed` 不再作为持久配置字段。

### Step 1.1 — 统一为「运行时种子」
- 在 `generate(config)` 入口处生成一个 `runSeed = generateSeed()`，向下传递给 grid/cross 生成函数，替代对 `config.seed` 的读取。
- `generateCrossSheets(config, runSeed)`：把内部所有 `config.seed` 改为函数参数 `runSeed`。
- `resolveCellCount` / `resolveHintCount` 改为接收一个「每题唯一」的派生种子（如 `runSeed + puzzleIndex*K + 偏移`），消除同页恒等问题。
- **验证**：连续两次生成 cross，输出不同；同一页内不同题目的格子数/提示数有差异。

### Step 1.2 — 从配置中移除 `seed`
- 从 `HundredChartConfig`（`types.ts:72`）删除 `seed`。
- 从 `defaultConfig`（`config.tsx:48`）删除 `seed: generateSeed()`。
- 因 `defaultConfig` 结构变更，把 `Workbench` 的 `configVersion`（`hundred-chart-view.tsx`）+1，避免读到旧的持久化配置。
- **验证**：`npm run lint` 通过；旧 localStorage 配置不会引发缺字段错误。

> 说明：若未来想做「相同配置可复现」，应改为显式的「重新生成」按钮 + 内部 seed 状态，而非持久化在 config 里。本次按 math-genie 的「每次新随机」语义对齐。

---

## 偏离点 2 — 预览的纸张外壳 / 分页重复

**现状**：`HundredChartPreview` 与 `CrossPuzzlePreview` 各自实现了一套几乎相同的「外层灰底容器 + A4 `Paper` + 屏幕视图 + 离屏打印视图 + `usePreviewScale` + MUI `<Pagination>`」脚手架，仅页内渲染不同。

**目标**：抽出共享外壳，消除重复，统一行为。

### Step 2.1 — 抽出 `ChartPageShell` 组件
- 新建 `src/sections/hundred-chart/components/ChartPageShell.tsx`，封装：
  - 外层 `grey.50` 容器 + print 样式；
  - 屏幕视图（含 `usePreviewScale` 缩放 + MUI `<Pagination>`）；
  - 离屏打印视图（`pageBreakAfter` 逻辑）；
  - 空状态（统一为 math-genie 风格灰块）。
- 通过 props 接收 `sheets`、`pdfContainerRef`、`renderPage(sheet, idx) => ReactNode`。
- **验证**：grid 与 cross 视觉/分页/打印与改造前一致。

### Step 2.2 — 两个 Preview 改用 shell
- `HundredChartPreview`：只保留 grid 的 `renderPage`（10×10 表格 + 手动点选逻辑），其余交给 `ChartPageShell`。
- `CrossPuzzlePreview`：只保留 cross 的 `renderPage`（puzzle 网格 + 公式/示例），其余交给 `ChartPageShell`。
- 删除两份重复的分页/纸张/打印代码。
- **验证**：手动模式点选 grid 仍可切换空格；多页分页正常；打印多页正常。

---

## 偏离点 3 — mode 分支集中化

**现状**：`config.mode` 的分支散落在 `generate`、`deriveTitle`、`Settings`、`Preview` 四处。

**目标**：保留单 tool，但让分支只在「入口」发生一次，降低心智负担（不强制大改）。

### Step 3.1 — generate 入口单点分支
- `generate(config)` 内：先取 `runSeed`，再 `return config.mode === 'cross' ? generateCrossSheets(config, runSeed) : generateGridSheets(config, runSeed)`。保持单点 if。
- **验证**：两种模式生成结果与之前一致（除 seed 行为已按偏离点 1 调整）。

### Step 3.2 —（可选）Preview 适配器瘦身
- `config.tsx` 里的 `Preview` 适配器目前已做 `onManualBlanksChange` 注入；确认其只负责「布线」，不含展示逻辑。保持现状即可，无需改动。
- **验证**：无行为变化。

---

## 验证清单（每个偏离点完成后执行）

- [ ] `npm run lint` 通过，无新增 TS 报错。
- [ ] grid：连续生成内容变化；手动点选、pattern、answer-key 模式均正常。
- [ ] cross：连续生成内容变化；同页题目难度参数有差异；示例/公式/答案页正常。
- [ ] 多版本（versionCount>1）与答案页（includeAnswerKey）数量正确。
- [ ] 屏幕分页与 `window.print()` 打印分页均正常，无阴影/边距异常。
- [ ] 清空 localStorage 后首次加载默认配置正常（`configVersion` 已 +1）。

## 范围与风险

- **不改 UI 视觉**（视觉一致性已在上一轮 enhance plan 完成）。
- **行为变更**：cross 模式将从「冻结输出」变为「每次随机」——这是修正而非回归，但需确认符合预期。
- 偏离点 1 必做（修正实际 bug）；偏离点 2/3 为结构清理，可按优先级分批执行。
