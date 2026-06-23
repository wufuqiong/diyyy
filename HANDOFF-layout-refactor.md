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

## 3. 剩余任务：迁移 math-genie 与 hundred-chart 设置面板到 `SettingCard`

其余 4 个工具（charcolor / charmaze / chartrace / word-search）的设置面板已用 `SettingCard`，这两个还没用，需对齐。

### 3.1 参考实现（务必照抄这套结构）

- 共享原语：`src/sections/_shared/SettingCard.tsx`、`src/sections/_shared/SettingsPanel.tsx`（导出 `SettingsField`、`SettingsSection`、`MaybeTooltip` 等）。
- 最佳范例：`src/sections/charcolor/components/ControlPanel.tsx`（见其 `return`：多个 `SettingCard` 包 `SettingsField`）。

标准用法：

```tsx
import { SettingCard } from 'src/sections/_shared/SettingCard';
import { SettingsField } from 'src/sections/_shared/SettingsPanel';
import { candyColors } from 'src/theme/tokens';

// 每组字段一张卡：
<SettingCard label={t('...')} toolColor={candyColors.blue /* 见下 */}>
  <SettingsField label={t('...')} caption={...} toolId="math-genie" helpAnchor="...">
    {/* 原有的 Select / Slider / TextField / 按钮组 等控件，保持不变 */}
  </SettingsField>
  {/* 多个 SettingsField ... */}
</SettingCard>
```

`toolColor` 取值：
- **math-genie** → `candyColors.blue`
- **hundred-chart** → `candyColors.purple`

### 3.2 待迁移文件

| 工具 | 文件 | 当前状态 |
|---|---|---|
| math-genie | `src/sections/math-genie/components/WorksheetSettings.tsx`（约 34KB，最大） | 用自定义布局/分节，未用 `SettingCard`。 |
| hundred-chart | `src/sections/hundred-chart/components/HundredChartSettings.tsx`（约 7.4KB） | 未用 `SettingCard`。 |
| hundred-chart | `src/sections/hundred-chart/components/CrossPuzzleSettings.tsx`（约 9.5KB） | 未用 `SettingCard`。 |

> 注意：hundred-chart 在 `grid` / `cross` 两种 mode 下分别渲染上面两个设置组件之一（见 `HundredChartSettings.tsx` 内部按 `config.mode` 分发，或 `features/hundred-chart/config.tsx`）。两个都要迁。

### 3.3 迁移步骤（每个文件）

1. 阅读现有 `return`，识别"逻辑分组"（如：数据来源 / 选项 / 内容 / 显示设置 …）。
2. 每个分组用一张 `<SettingCard label={分组标题} toolColor={...}>` 包裹。
3. 组内每个控件用 `<SettingsField label caption?>` 包裹；**控件本身（Select/Slider/Switch/TextField/按钮）原样保留**，不要改其逻辑、`onChange`、i18n key。
4. 顶层返回多张 `SettingCard` 的 `<>…</>`（`SettingsPanel` 已在 `Workbench` 里用 `<Stack>` 自动加卡片间距，**不要**自己再包 `Paper`/外层间距）。
5. 删除迁移后变为冗余的自绘分节标题/容器/间距代码（只删自己造成冗余的，别动无关代码）。
6. label/caption 文案优先复用现有 i18n key；如分组需要新标题且无 key，按现有命名风格在 i18n 资源中补（与现有 4 个工具一致）。

### 3.4 验收标准

- `npx tsc --noEmit` 0 错误；`npm run dev` checker 0 error/warning（新引入的）。
- 视觉上左侧设置区与 charcolor/charmaze 等一致：白色糖果卡 + 工具色分组标题 + 卡间距统一。
- 所有原有功能（生成/选项/开关/滑块/打印）行为不变。
- 不改预览区与题目内容渲染。
- import 顺序通过 `perfectionist/sort-imports`（必要时 `npx eslint --fix <file>`）。

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
