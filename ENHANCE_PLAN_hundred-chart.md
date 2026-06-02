# Hundred-Chart 配置页 & 显示风格对齐 math-genie — Enhance Plan

> 目标：让 `hundred-chart`（百数表 grid + 十字谜 cross 两个子项目）的配置页用户体验与预览显示，与 `math-genie` 保持一致的风格与交互。
>
> 关键事实：两个工具都通过同一个 `Workbench` → `SettingsPanel` 外壳渲染。仓库已存在共享样式原语 `src/sections/_shared/SettingsPanel.tsx`（导出 `SettingsSection` / `SettingsField` / `MaybeTooltip`），`math-genie` 实质上就是这套风格。`hundred-chart` 未使用它，是不一致的根因。

## 相关文件

- 配置页：
  - `src/sections/hundred-chart/components/HundredChartSettings.tsx`
  - `src/sections/hundred-chart/components/CrossPuzzleSettings.tsx`
- 预览页：
  - `src/sections/hundred-chart/components/HundredChartPreview.tsx`
  - `src/sections/hundred-chart/components/CrossPuzzlePreview.tsx`
- 参考样式（不改）：
  - `src/sections/_shared/SettingsPanel.tsx`（共享原语）
  - `src/sections/math-genie/components/WorksheetSettings.tsx`（配置页参考）
  - `src/sections/math-genie/components/WorksheetPreview.tsx`（预览参考）
- i18n：`hundredChart.*` 翻译资源文件（需新增 key）

---

## 阶段 1 — 配置页对齐 math-genie 风格

### Step 1.1 — 改用共享章节/字段原语
- 在 `HundredChartSettings.tsx` 顶部 `import { SettingsSection, SettingsField } from 'src/sections/_shared/SettingsPanel'`。
- 删除组件自有的最外层 `<Box sx={{ display:'flex', flexDirection:'column', gap:3 }}>` 包装（`SettingsPanel` 已提供 `px:3 py:2.5` + `Stack spacing={3.5}`）。
- 直接返回一组 `<SettingsSection title=...>` 块。
- **验证**：面板章节间距与 math-genie 视觉一致；无双重 padding。

### Step 1.2 — 章节标题统一为 overline 风格
- 移除所有 `Typography variant="subtitle2"`（加粗 `text.secondary`）的手写章节标题。
- 由 `SettingsSection` 的 `title` 承担（内部已是 `overline` 风格）。
- **验证**：标题字体、字距、颜色与 math-genie 的 `SectionTitle` 一致。

### Step 1.3 — 字段统一用 SettingsField
- 把每个控件（TextField / Slider / ToggleButtonGroup / Switch）包进 `SettingsField`，提供粗体 `label` 与可选 `caption`。
- 移除零散的 `Typography body2 gutterBottom` 行内标签与 TextField `label`（改由 `SettingsField.label` 表达，必要时保留 TextField 占位）。
- **验证**：所有字段标签为统一的粗体 body2 + caption 灰字。

### Step 1.4 — 子项目切换提升为首个章节
- 把 grid/cross 的 `ToggleButtonGroup`（mode 切换）放入第一个 `SettingsSection`，标题如「图表类型 / Chart Type」。
- 作为两个子项目的清晰入口，而非顶部裸露的按钮组。
- **验证**：模式切换有明确章节归属，切换后下方字段相应变化。

### Step 1.5 — CrossPuzzleSettings 同步重构
- 对 `CrossPuzzleSettings.tsx` 重复 Step 1.1–1.3：移除自有 wrapper、改用 `SettingsSection`/`SettingsField`。
- **验证**：cross 模式面板与 grid 模式、与 math-genie 风格三者一致。

### Step 1.6 — 移除硬编码中文，改为 i18n
- 将 `CrossPuzzleSettings.tsx` 中写死的中文选项标签改为 `t(...)`：
  - `MEDIUM_CELL_OPTS`：`'5–6 格' / '5 格' / '6 格'`
  - `MEDIUM_HINT_OPTS`：`'2–3 个' / '2 个' / '3 个'`
  - `HARD_CELL_OPTS`：`'5–9 格' / '5 格' / '7 格' / '9 格'`
- 在 `hundredChart.cross.*` 下新增对应翻译 key（中/英两套）。
- **验证**：切换语言时这些选项正确本地化；无残留硬编码字符串。

---

## 阶段 2 — 预览/显示对齐 math-genie

### Step 2.1 — 统一页眉版式
- grid（`HundredChartPreview.tsx`）与 cross（`CrossPuzzlePreview.tsx`）页眉统一为 math-genie 版式：
  - 标题 `Typography variant="h4"`、`color: 'grey.800'`、粗体。
  - 容器 `borderBottom: '2px solid'`、`borderColor: 'grey.300'`、`pb: 2`、`mb: 3`。
  - 右侧显示「Page X of Y」（仅多页时）。
- 移除 grid 的绿色 serif 主题（`success.dark` / `success.main`）。
- 移除 cross 的居中 `h5` 与红色 `★ 答案 ★` 星标。
- **验证**：两种模式页眉与 math-genie 完全一致。

### Step 2.2 — 统一纸张容器
- 屏幕视图与打印视图的纸张由 `<Box>` 改为 `<Paper elevation={0}>`：
  - `padding: '20mm'`、`paddingBottom: '15mm'`、`boxShadow: 'none'`。
  - 预览外层背景 `bgcolor: 'grey.50'`（打印时 white）。
- **验证**：纸张阴影/内边距/外层背景与 math-genie 一致。

### Step 2.3 — 用 MUI Pagination 替换手写分页
- 删除 grid 与 cross 中各自手写的 `IconButton + generatePageIndicators()` 省略号逻辑。
- 改用 MUI `<Pagination count page onChange color="primary" size="large" />`。
- **验证**：分页交互与 math-genie 一致；删除重复代码后无回归。

### Step 2.4 — 统一答案徽章与空状态
- 答案页徽章改为与 math-genie 一致的中性样式（去掉红/绿主题色）。
- 空状态由 `noPreview` 标题改为与 math-genie 一致的「Generating preview...」灰块（`bgcolor: grey.100`，`color: grey.400`）。
- **验证**：空状态与答案徽章视觉统一。

---

## 阶段 3 — 体验增强（可选）

### Step 3.1 — 约束反馈（Tooltip + Snackbar）
- 引入 `MaybeTooltip`（来自 `_shared/SettingsPanel`）与 `Snackbar`。
- 在 grid/cross 模式切换、难度切换导致默认值变化时，给出 Snackbar 提示；对禁用项加 Tooltip 说明。
- **验证**：切换产生副作用时有明确提示，行为可预期。

### Step 3.2 — 抽出共用外壳组件
- 把 grid/cross 共用的「分页 + 纸张外壳 + 屏幕/打印双视图」抽成一个共享组件（如 `ChartPageShell`）。
- 两个 Preview 复用，消除重复。
- **验证**：两种模式行为不变，代码重复显著减少。

---

## 验证清单（每阶段后执行）

- [ ] `npm run lint` 通过，无新增 TS 报错。
- [ ] 浏览器并排对比 `hundred-chart` 与 `math-genie`：配置面板章节/字段/间距一致。
- [ ] grid 与 cross 两种模式预览页眉、纸张、分页一致。
- [ ] 切换语言验证 i18n（阶段 1）。
- [ ] 打印预览（`window.print()`）排版正常、无阴影残留。

## 范围说明

- 阶段 1+2 为「风格一致」主体，**不改生成逻辑**。
- 阶段 1 的 i18n 改动需新增翻译 key。
- 阶段 3 改变交互/结构，为可选增强。
