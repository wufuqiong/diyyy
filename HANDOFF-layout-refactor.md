# Handoff: 子页面排版对齐重构（向 `diyyy-charmaze-multipage-layout.html` 对齐）

本文记录已完成的"预览区统一重构"，以及剩余的"设置面板迁移"任务，供后续 agent 接手。

---

## 1. 目标

把 6 个工具子页面的排版对齐到原型 `diyyy-charmaze-multipage-layout.html` / `diyyy-layout-design-doc.md`：

- **预览区**：天蓝 `preview-area` → 居中 `preview-stage` → `page-nav-bar`（多页时）+ 糖果圆角白纸 `paper-sheet` + 可选 `sheet-footer-hint`。
- **设置区**：左侧 `SettingsPanel`，内部字段分组放入糖果卡片 `SettingCard`。

工具身份色映射见 `src/theme/tokens.ts` 的 `toolColors`：
`charcolor=red, charmaze=orange, chartrace=green, math-genie=blue, hundred-chart=purple, word-search=pink`。

**重要约束**：内容视觉规格（A4 mm 尺寸、网格、字体、打印保真、PDF 导出）**保持不变**（design doc §4.5）。本次只改"排版骨架/容器"，不改题目内容渲染。

---

## 2. 已完成：预览区统一重构（6/6 工具，已通过 `tsc` 与 ESLint，dev server 0 报错）

### 2.1 新增/修改的共享组件

| 文件 | 状态 | 说明 |
|---|---|---|
| `src/shared/worksheet/ToolColorContext.tsx` | 新增 | `ToolColorProvider` / `useToolColor()`，向预览链路注入每个工具的身份色，避免逐层透传。 |
| `src/shared/worksheet/WorksheetPaper.tsx` | 新增 | **核心**。统一预览"桌面"：`page-nav-bar`（`pageCount>1` 时用共享 `PageNavigator`）+ 糖果圆角白纸（缩放 A4）+ 可选 `footerHint` + 隐藏的整本打印容器（`pdfContainerRef`）。内部自带 `usePreviewScale` 与 `currentPage` 状态。 |
| `src/shared/worksheet/PreviewStage.tsx` | 改写 | 从"自带纸张+导航条"简化为纯天蓝 `preview-area` 外壳，承载单个 `WorksheetPaper`。 |
| `src/shared/worksheet/PageNavigator.tsx` | 修复 | 修了 `borderRadius/mb` 把已含 `px` 的 token 再次拼 `px`（`16pxpx`）的 bug。 |
| `src/shared/worksheet/Workbench.tsx` | 改写 | 计算 `toolColor = toolColors[tool.id]`，用 `<ToolColorProvider value={toolColor}>` 包裹整个返回；标题色改为 `toolColor`。 |
| `src/shared/worksheet/index.ts` | 改写 | 导出 `WorksheetPaper`、`useToolColor`。 |

### 2.2 `WorksheetPaper` 契约（后续工具都应走这个）

```tsx
interface WorksheetPaperProps {
  pageCount: number;                                   // 可打印总页数
  renderPage: (pageIndex: number) => React.ReactNode;  // 渲染单页 A4 内部内容（0-indexed）
  pdfContainerRef?: React.RefObject<HTMLDivElement | null>;
  footerHint?: React.ReactNode;                        // 纸张下方提示（可选）
  emptyState?: React.ReactNode;                        // pageCount===0 时显示
  paperPadding?: string;                               // A4 内边距，默认 '20mm'
}
```

- 屏幕态只渲染当前页（含导航条/纸张/footer），打印态渲染全部页（隐藏 off-screen 容器，`@media print` 显形）。
- `renderPage` 返回的是 **A4 纸张内部内容**（不要再自带 210mm 纸张/缩放/分页）。

### 2.3 各工具 Preview 迁移情况（全部完成）

| 工具 | 文件 | 做法 |
|---|---|---|
| hundred-chart | `src/sections/hundred-chart/components/ChartPageShell.tsx` | 改成 `WorksheetPaper` 薄适配器（`grid` 与 `cross` 两模式共用，无需改 `HundredChartPreview.tsx` / `CrossPuzzlePreview.tsx`）。 |
| charcolor | `src/sections/charcolor/components/PreviewSheet.tsx` | 抽出 `PageContent`，`pageCount=pages.length`，`paperPadding="15mm"`。 |
| charmaze | `src/sections/charmaze/view/preview-sheet.tsx` | 删除旧的自绘分页 class 组件，重写为函数式 `MazePageContent` + `ScaledPreviewSheet`（用 `useToolColor()` 给指示语/chip 上色）。 |
| math-genie | `src/sections/math-genie/components/WorksheetPreview.tsx` | 按 `problemsPerPage` 分页：`pageCount=ceil(len/ppp)`，`renderPage` 切片渲染。 |
| word-search | `src/sections/word-search/components/PreviewSheet.tsx` | 删除自绘 `useScale`/`A4Page`，`renderPage` 内部做垂直居中 + 页码，`paperPadding="12mm"`。 |
| chartrace | `src/sections/chartrace/view/components/PaperSheet.tsx` | 4 种模式（English/Sentence/Word/Standard）各自仍计算 `pages`，新增本地泛型 `renderSheet(pages, renderOne)` 包到 `WorksheetPaper`，各分支 `return` 改为 `return renderSheet(pages, (page, pageIndex) => (<>…</>))`，`paperPadding="15mm"`。删除了 `usePreviewScale`/`containerStyle`/`a4PageStyle`。 |

### 2.4 验证

- `npx tsc --noEmit` → 0 错误。
- `npm run dev`（vite + eslint/tsc checker）→ `Found 0 error and 0 warning`。
- 已修过 import 排序（`perfectionist/sort-imports`，用 `npx eslint --fix` 处理）。
- 既有遗留 warning：`chartrace/.../PaperSheet.tsx` 的 `colScale` 未使用 —— **改动前就有，非本次引入，未动**。

---

## 3. 已完成：所有工具设置面板已迁移到 `SettingCard`（6/6）

### 3.1 已迁移文件

| 工具 | 文件 | 状态 |
|---|---|---|
| math-genie | `src/sections/math-genie/components/WorksheetSettings.tsx` | ✅ 已用 `SettingCard` |
| hundred-chart | `src/sections/hundred-chart/components/HundredChartSettings.tsx` | ✅ 已用 `SettingCard` |
| hundred-chart | `src/sections/hundred-chart/components/CrossPuzzleSettings.tsx` | ✅ 已用 `SettingCard` |

### 3.2 额外完成的设置面板改进

- **chartrace ControlPanel** — 从 `SettingsSection` 迁移到 `SettingCard`，控件标签替换为 `InputLabel`，多步运算按钮组改为单行 4 按钮，去掉了"无"网格类型和"笔画数"选项。
- **charmaze ControlPanel** — 重构为 chartrace 风格的教材选择（级别下拉 + 课册多选 + 模式切换按钮），去掉了独立的模式选择器，新增页数上限 `MAX_PAGES = 50`。
- **charcolor ControlPanel** — 书册选择器改为多选，手动输入区合并到教材来源卡片。
- **全局 InputLabel 替换** — 所有 `Select` 和 `TextField` 控件统一使用 MUI `InputLabel` 或 `TextField label` 属性，替代 `SettingsField` 的黑色小标题。

---

## 4. 常用命令

```bash
npm run dev                 # vite + tsc/eslint 实时检查（端口 5173）
npx tsc --noEmit            # 仅类型检查
npx eslint --fix <files>    # 修 import 排序等可自动修复项
npm run build               # 完整构建（含 docs + tsc + vite build）
```

## 5. 关键参考文件清单

- 设计：`diyyy-layout-design-doc.md`、`diyyy-charmaze-multipage-layout.html`
- 共享预览：`src/shared/worksheet/{WorksheetPaper,PreviewStage,PageNavigator,ToolColorContext,Workbench}.tsx`
- 共享设置：`src/sections/_shared/{SettingCard,SettingsPanel}.tsx`
- 设置范例：`src/sections/charcolor/components/ControlPanel.tsx`
- 色板：`src/theme/tokens.ts`（`toolColors`、`candyColors`、`previewLayout`、`settingCardLayout`）
