# diyyy 工程级优化方案

> 版本：2026-05-19
> 范围：基于当前代码库（Vite + React 19 + MUI 7 + react-router 7 的纯前端 SPA）的工程评审与可执行优化计划。
> 注意：本计划**不包含 AI 相关内容**。diyyy 是 100% 客户端、无后端、无登录、无持久化的练习单生成与打印工具，AI 不在产品规划内。

---

## 0. 项目现状速览

- **入口**：`src/main.tsx` → `src/app.tsx` → `src/routes/sections.tsx`
- **核心功能**（4 个 worksheet 工具，均 lazy-loaded）：
  - `charcolor`（识字涂色）— `src/sections/charcolor/view/charcolor-view.tsx`
  - `charmaze`（识字迷宫）— `src/sections/charmaze/view/charmaze-view.tsx`
  - `chartrace`（描红写字）— `src/sections/chartrace/view/`
  - `math-genie`（算术）— `src/sections/math-genie/`
- **导出方式**：仅 `window.print()`，无 PDF 库。
- **数据**：本地 JSON（`src/data/miemie-details.json`、`lessons.json`）+ 算法生成。
- **无**：后端、API 调用（已交叉验证：无 `fetch(`、无 `localStorage`、无 LLM SDK）、单元测试、e2e、Sentry、analytics、i18n、auth。
- **模板残留**：`@minimal/material-kit-react` 模板未清理，下文 Phase 1 会处理。

---

## 1. 评分

| 维度 | 分数 (0–10) | 主要原因 |
|---|---|---|
| Architecture | 4 | feature 目录存在但无 worksheet 类型抽象，god component 普遍 |
| UI / UX | 6 | MUI 默认 + `SettingsPanel` 抽象可用；移动端不可用、无 a11y |
| Code Quality | 4 | `any` 滥用、巨型文件、重复逻辑、`eslint-disable` 多处 |
| Scalability | 3 | 新增 worksheet 需复制 ~600 行 view |
| Production Readiness | 3 | 无监控、无 SEO、无持久化、`console.error` 被 monkey-patch |

---

## 2. 最危险的 10 个问题（按严重程度排序）

| # | 严重度 | 问题 | 位置 |
|---|---|---|---|
| 1 | P0 | 配置零持久化，刷新即丢 | 全部 4 个 view 的 `useState` |
| 2 | P0 | `math-genie-view.tsx` 1515 行 god component | `src/sections/math-genie/view/math-genie-view.tsx` |
| 3 | P0 | `generateRandomProblem` 无界递归，窄区间下栈溢出 | `src/sections/math-genie/view/math-genie-view.tsx:1099-1154` |
| 4 | P0 | 0 自动化测试，核心数学约束无回归保护 | — |
| 5 | P0 | 模板死代码 ship 到生产（含 apexcharts 等依赖） | `src/_mock/`、`src/sections/{blog,product,user,overview,auth}/`、未用的 `layouts/components/*`、`src/pages/{blog,sign-in,user,products}.tsx` |
| 6 | P1 | 无 `WorksheetTool` 抽象，4 个 tool 高度同构却各写一遍 | 4 个 feature 目录 |
| 7 | P1 | `getMiemieDataFromDetails` 等数据加载逻辑重复 3 份 | charcolor / charmaze / chartrace |
| 8 | P1 | `any` 泄漏 + 类型谎言 | `src/sections/math-genie/view/math-genie-view.tsx:1257-1266` 等 |
| 9 | P1 | 移动端基本不可用（固定 300px 侧栏 + 100vh） | 4 个 view 顶层布局 |
| 10 | P2 | 无监控；`console.error` 被全局吞 | `src/main.tsx:12-25` |

---

## 3. 最值得优先做的 10 个优化（按 ROI）

1. 删模板死代码（半天，bundle 立刻瘦身）
2. `usePersistedConfig` hook（解决最大 UX 痛点）
3. 拆 `math-genie-view`（13 个生成器搬到 `generators/`）
4. 修 `generateRandomProblem` 栈溢出（1 行）
5. 建 `WorksheetTool<Config, Problem>` 抽象
6. 抽 `useMiemieLessons` hook（删除 3 份重复）
7. Vitest + 核心 generator 单测
8. 移动端断点 + 抽屉式侧栏
9. SEO meta + sitemap + robots
10. Sentry + 取消 `console.error` monkey-patch

---

## 4. 三阶段路线图

### Phase 1（1–2 周）：清污 + 止血

每个 task 都给出 **文件 / 动作 / 验收**。可按顺序串行交付。

#### 1.1 删除模板死代码 ⏱️ 0.5d ✅ 已完成（2026-05-19）

**已删除**：
- `src/_mock/`
- `src/sections/blog/`、`src/sections/product/`、`src/sections/user/`、`src/sections/overview/`、`src/sections/auth/`
- `src/pages/blog.tsx`、`src/pages/sign-in.tsx`、`src/pages/user.tsx`、`src/pages/products.tsx`
- `src/layouts/components/notifications-popover.tsx`、`account-popover.tsx`、`workspaces-popover.tsx`、`searchbar.tsx`、`nav-upgrade.tsx`、`language-popover.tsx`
- `src/layouts/auth/`
- `src/layouts/nav-config-account.tsx`（仅用于声明 `_account`，无实际渲染）
- `src/components/chart/`（仅被 `overview` 引用，原计划未列出但属于同批死代码）

**保留（与原计划差异）**：
- `src/layouts/components/menu-button.tsx`：`dashboard/layout.tsx` 移动端菜单按钮在用，保留
- `simplebar-react`：被 `src/components/scrollbar` 使用，而 `Scrollbar` 仍在 `dashboard/nav.tsx` 中，保留
- `minimal-shared`：`varAlpha` / `mergeClasses` / `useBoolean` 在 4 个 view 与 layout 中广泛使用，保留

**已修改**：
- `src/layouts/dashboard/layout.tsx`：移除 `_mock`、`nav-config-account` 死 import
- `src/routes/sections.tsx`：移除未使用的 `AuthLayout` import
- `src/global.css`：移除 `./components/chart/styles.css` 引用
- `package.json`：`name` 由 `@minimal/material-kit-react` 改为 `diyyy`；卸载 `apexcharts`、`react-apexcharts`

**验收结果**：
- `yarn build` ✅ 通过（`tsc && vite build` 0 error）
- `yarn lint` ✅ 通过（0 errors，99 pre-existing warnings 与本次改动无关）
- 主 chunk（`index-*.js`）：534 kB / gzip 175 kB，已不含 apexcharts；瘦身基线无原始数据，但 `apexcharts`（~400 kB）+ overview/blog/product/user 业务代码已彻底移除
- 4 个 tool 路由（`/`, `/charcolor`, `/charmaze`, `/chartrace`, `/math-genie`）功能不变

#### 1.2 `usePersistedConfig` hook ⏱️ 0.5d ✅ 已完成（2026-05-19）

**已新增**：`src/hooks/use-persisted-config.ts`

签名为 `useState` 的 drop-in 替代：

```ts
export function usePersistedConfig<T>(
  key: string,
  defaultValue: T,
  version = 1
): [T, Dispatch<SetStateAction<T>>]
```

实现要点：
- localStorage key 统一前缀 `diyyy:<key>`，payload 形如 `{ v: <version>, d: <data> }`
- 初始化用 lazy initializer：读取并按 `version` 校验，命中则返回，未命中或解析失败回退 `defaultValue`
- `useEffect` 在每次 `value` 变化后写回 storage
- SSR / 隐私模式 / quota 超限 / JSON 解析错误：`try/catch` 全部静默回退到内存态

**已应用到**：
- `src/sections/chartrace/view/chartrace-view.tsx`：`config` (`SheetConfig`) → `chartrace.config`
- `src/sections/charcolor/view/charcolor-view.tsx`：`userInput` / `wordsPerPage` / `selectedPreset` / `selectedLevel` / `fullSelectedValue` / `selectedBook`（`pages` 为派生态，未持久化）
- `src/sections/charmaze/view/charmaze-view.tsx`：`userInput` / `selectedMode` / `wordsPerPage` / `selectedTableSize` / `selectedLevel` / `fullSelectedValue` / `selectedBook`（`pages`、`isGenerating` 为派生/瞬时态，未持久化）
- `src/sections/math-genie/view/math-genie-view.tsx`：`config` (`WorksheetConfig`)、`customDifficulty`、`difficultyRatios`、`useMixMode`、`multiOperationConfig`、`excludeZeroProblems`、`autoPreview`（`problems`、`isGenerating`、`generateProgress`、`error` 为运行时态，未持久化）

**验收结果**：
- `yarn build` ✅ 通过
- `yarn lint` ✅ 0 errors
- 刷新页面后所有受持久化的控件值保留；将调用处的 `version` 改为新数字即丢弃旧数据回退默认值
- 现存运行时态（`pages` / `problems` / `isGenerating` 等）按预期不持久化

#### 1.3 修复 `generateRandomProblem` 递归 ⏱️ 0.5h ✅ 已完成（2026-05-20）

**位置**：`src/sections/math-genie/view/math-genie-view.tsx:1099-1167`

**已修改**：
- 将递归调用改为 `while (attempts < 50)` 循环
- 每次尝试生成问题，如果不包含零则立即返回
- 50 次尝试后返回最后一个候选问题作为兜底

**验收结果**：
- 窄区间（如 `customDifficulty={min:0,max:0}` + `excludeZeroProblems=true`）不会栈溢出
- 最多尝试 50 次后返回，避免无限循环
- 保持原有逻辑，仅将递归改为迭代

#### 1.4 移除 `console.error` monkey-patch ⏱️ 0.5h ✅ 已完成（2026-05-20）

**位置**：`src/main.tsx:12-25`（已删除）

**已删除**：
- 完全移除 `console.error` monkey-patch 代码（14 行）
- React DevTools 端口错误不应导致应用错误被吞没

**验收结果**：
- 浏览器 console 可见所有真实错误
- 应用错误不再被静默抑制

#### 1.5 Vitest + 核心生成器单测 ⏱️ 2d ✅ 已完成（2026-05-20）

**已新增**：
- `vitest.config.ts`：配置 Vitest + jsdom 环境 + 路径别名
- `package.json`：添加 `"test": "vitest"`、`"test:ui": "vitest --ui"`、`"test:run": "vitest run"`
- `src/sections/math-genie/__tests__/generators.test.ts`：11 个测试用例
- 依赖：`vitest`、`@vitest/ui`、`jsdom`

**已覆盖 8 条约束**：
1. ✅ `MIXED` 模式 +/- 数量差 ≤ 1（测试 count=10 和 count=11）
2. ✅ `CHAIN_SUBTRACTION` 任何中间结果不为负（验证每个中间步骤 ≥ 0）
3. ✅ `CHAIN_ADDITION` 所有数字落在 `[min, max]`（自定义范围 5-15）
4. ✅ `FACT_FAMILY` 输出 4 题成组（验证 a+b、b+a、c-a、c-b 关系）
5. ✅ `FILL_BLANK` + `EMOJI` 模式不出现 `blankPosition='result'`（仅允许 first/second）
6. ✅ `excludeZeroProblems=true` 时无任何 0 出现且不死循环（包含窄区间测试）
7. ✅ `CUSTOM` difficulty 范围严格生效（加法和减法分别验证）
8. ✅ `generateRandomProblem` 在窄区间下返回（测试 {0,0}、{1,1}、{5,5} 不栈溢出）

**验收结果**：
- `npm run test:run` ✅ 11 个测试全部通过（5.97s）
- 覆盖核心生成器约束，确保数学逻辑正确性
- 导出 `generateMathProblems` 供测试使用

#### 1.6 SEO 基础 ⏱️ 0.5d ✅ 已完成（2026-05-20）

**已修改**：
- `index.html`：
  - 更新 `lang="zh-CN"`
  - 添加完整的 `<title>`、`<meta description>`、`<meta keywords>`
  - 添加 Open Graph tags（og:type、og:url、og:title、og:description、og:image）
  - 添加 Twitter Card tags
  - 添加 canonical link
- 每个页面组件添加动态 `<title>` 和 `<meta description>`（React 19 原生支持）：
  - `dashboard.tsx`：已有 title
  - `charcolor-view.tsx`：识字涂色 - DIYYY
  - `charmaze-view.tsx`：识字迷宫 - DIYYY
  - `chartrace-view.tsx`：汉字描红 - DIYYY
  - `math-genie-view.tsx`：数学练习 - DIYYY

**已新增**：
- `public/robots.txt`：允许所有爬虫，指向 sitemap
- `public/sitemap.xml`：包含 5 个页面（首页 + 4 个工具页）

**验收结果**：
- `npm run build` ✅ 通过（0 errors）
- 所有页面都有独立的 title 和 description
- SEO meta 标签完整（description、keywords、OG tags、Twitter cards）
- robots.txt 和 sitemap.xml 已创建
- 建议：部署后使用 Lighthouse 验证 SEO 分数 ≥ 90

#### 1.7 移动端断点 ⏱️ 1d ✅ 已完成（2026-05-20）

**已新增**：
- `src/sections/_shared/ResponsiveWorkbench.tsx`：统一的响应式布局组件
  - 桌面端（≥ lg）：固定侧栏布局
  - 移动端（< lg）：抽屉式侧栏 + FAB 按钮
  - 自动处理 `height: 100vh` 在移动端的问题

**已改造**：
- `charcolor-view.tsx`：使用 ResponsiveWorkbench 替换固定布局
- `charmaze-view.tsx`：使用 ResponsiveWorkbench 替换固定布局
- `chartrace-view.tsx`：使用 ResponsiveWorkbench 替换固定布局
- `math-genie-view.tsx`：调整响应式断点（`height: { xs: 'auto', lg: '100vh' }`）

**验收结果**：
- `npm run build` ✅ 通过（0 errors）
- 所有 4 个工具页面支持移动端响应式布局
- 移动端使用抽屉式侧栏，避免 iOS toolbar 计算错误
- 建议：部署后在 iPhone SE 视口下测试操作和打印功能

#### 1.8 Sentry（可选，但强烈推荐）⏱️ 0.5d ✅ 已完成（2026-05-20）

**已新增**：
- 依赖：`@sentry/react` (已安装到 devDependencies)
- `src/main.tsx`：Sentry 初始化逻辑
  - 仅在 `VITE_SENTRY_DSN` 环境变量存在时初始化
  - 集成 Browser Tracing 和 Session Replay
  - `tracesSampleRate: 1.0`（生产环境建议调低）
  - `replaysSessionSampleRate: 0.1`
  - `replaysOnErrorSampleRate: 1.0`
- `.env.example`：环境变量示例文件

**验收结果**：
- `npm run build` ✅ 通过（0 errors）
- Sentry 已集成，通过环境变量控制
- 建议：
  1. 在 Sentry.io 创建项目获取 DSN
  2. 在 `.env` 中配置 `VITE_SENTRY_DSN`
  3. 部署后手动触发错误验证 Sentry 是否正常工作

**Phase 1 总工时**：约 5–7 个人日。

---

### Phase 2（1–2 月）：架构整形

#### 2.1 引入 `WorksheetTool` 协议 ⏱️ 2d ✅ 已完成（2026-05-20）

**已新增**：`src/shared/worksheet/`

```
shared/worksheet/
  types.ts              // WorksheetTool<Config, Problem> 接口
  Workbench.tsx         // 统一骨架：侧栏 + 预览 + 打印 + 进度 + 错误 + 持久化
  use-persisted-config.ts // 从 src/hooks/ 复制过来
  PrintFrame.tsx        // 统一打印容器（封 @media print）
  index.ts              // 统一导出
```

**接口实现**：

```ts
export interface WorksheetTool<Config, Problem> {
  id: string;
  defaultConfig: Config;
  generate: (config: Config) => Problem[] | Promise<Problem[]>;
  Preview: React.FC<{ config: Config; problems: Problem[] }>;
  Settings: React.FC<{ config: Config; onChange: (c: Config) => void }>;
  meta: { title: string; icon: React.ReactNode; route: string };
}
```

**Workbench 功能**：
- 自动集成 `usePersistedConfig`，配置持久化到 `localStorage`
- 自动集成 `ResponsiveWorkbench`，支持桌面/移动端响应式布局
- 自动集成 `SettingsPanel` + `SettingsHeader`
- 统一的生成进度条（`LinearProgress`）
- 统一的错误处理（`Alert`）
- 自动设置页面 `<title>` 和 `<meta description>`
- 支持同步/异步 generator

**PrintFrame 功能**：
- 支持 A4 / letter 纸张尺寸
- 桌面端：白色卡片 + 阴影，居中显示
- 移动端：全宽显示，无阴影
- 打印时：精确尺寸，自动分页（`pageBreakAfter: 'always'`）

**验收结果**：
- `npm run build` ✅ 通过（0 errors，11 pre-existing warnings）
- 所有核心组件已创建，接口清晰
- 下一步：2.2–2.3 将 4 个 tool 逐步迁移到 Workbench

#### 2.2 拆 math-genie ⏱️ 4d **[进行中 - 已完成 generators 提取]**

目标结构：

```
src/features/math-genie/
  generators/              ✅ 已完成
    index.ts               ✅ 主入口，导出 generateMathProblems
    standard.ts            ✅ 标准题型生成
    fill-blank.ts          ✅ 填空题生成
    multi-op.ts            ✅ 多重运算生成
    special-practice/
      zero-drill.ts        ✅ 零的练习
      fact-family.ts       ✅ 数的家族
    shared/
      mixed-balance.ts     ✅ 混合运算平衡逻辑
      problem-key.ts       ✅ 问题排序工具
      types.ts             ✅ 共享类型和工具函数
  components/              ⏳ 待迁移（当前在 sections/math-genie/components）
    Settings.tsx           // 需要重构为受控组件
    Preview.tsx            // 现在 WorksheetPreview.tsx
    ProblemVisualizer.tsx
  state.ts                 ⏳ 待实现（useReducer + action types）
  config.ts                ⏳ 待实现（WorksheetTool 实例）
  index.ts                 ⏳ 待实现（只导出 config）
```

**当前进度**：
- ✅ 提取所有问题生成逻辑到 `src/features/math-genie/generators/`
- ✅ `math-genie-view.tsx` 从 1529 行降到 385 行（减少 75%）
- ✅ 所有 Phase 1.5 单测通过（11/11）
- ✅ 构建成功，无类型错误
- ⏳ 组件迁移和 Workbench 集成待后续完成

**下一步**：
1. 将 WorksheetSettings 重构为受控组件（接受 config + onChange）
2. 创建 WorksheetTool config 实例
3. 迁移 math-genie-view 到使用 Workbench

**验收**：所有 Phase 1.5 单测仍通过 ✅；新增组件级 snapshot 测试（待完成）。

#### 2.3 拆 chartrace / charmaze / charcolor ⏱️ 各 1.5d

同样套路：generator/renderer/settings 分文件，view 文件接入 Workbench。

**验收**：4 个 tool 都通过 `Workbench` 渲染；UI 行为不变。

#### 2.4 共享 lesson 数据层 ⏱️ 0.5d

**新增**：`src/shared/data/lessons.ts`

```ts
export type LessonField = 'word' | 'phrase' | 'sentence';
export function useMiemieLessons(field: LessonField): MiemieData { /* ... */ }
```

**删除**：charcolor / charmaze / chartrace 三份重复的 `getMiemieDataFromDetails`。

**验收**：3 个 view 引用同一个 hook；行为不变。

#### 2.5 消灭 `any` ⏱️ 1d

聚焦点：`src/sections/math-genie/view/math-genie-view.tsx:1257-1266` 等所有 `(p as any).xxx`。
方法：扩展 `RawMathProblem` 为带 discriminator 的 union（`type: 'standard' | 'fill_blank' | 'multi_op' | 'fact_family'`）。

**验收**：`grep -r "as any" src/` 命中 ≤ 5；`tsc --noEmit` 0 error。

#### 2.6 Design Tokens 收敛 ⏱️ 1d

**新增**：`src/theme/tokens.ts`，导出：
- `colors`：primary、gridDefault (`#ff9c9c`)、traceDefault、ink、paper、accent
- `spacing`：4 / 8 / 16 / 24 / 32
- `fonts`：kaitiStack、pinyinStack（从 `PaperSheet.tsx:38-55` 提取）

替换 4 个 view 中散落的 hex。

**验收**：所有非 token hex 仅出现在 `tokens.ts`。

#### 2.7 i18n 起步 ⏱️ 2d

引入 `react-i18next`，先做 `zh-CN`、`en`，把所有 hardcoded 中文 string（"识字迷宫"、"经典组合"、"姓名: __________" 等）抽到 `src/i18n/locales/`。

顶部导航加语言切换。

**验收**：切换语言后 4 个 tool 文案正确切换；打印模板支持双语。

#### 2.8 a11y 基础 ⏱️ 1d

- 所有 `IconButton` 加 `aria-label`
- 颜色对比补到 WCAG AA（特别检查 `gridColor` 默认 `#ff9c9c` 在白底上的对比度）
- Slider、ToggleButtonGroup 键盘可达

**验收**：Lighthouse a11y ≥ 90；axe-core 0 critical。

#### 2.9 math-genie 新题型：数的分合（number bonds）⏱️ 2d

**背景**：一年级常见练习，给定一个整体数字，拆为两个部分，其中一部分为空，让孩子填。视觉形态为树状：

```
   10
  /  \
 1    ?
```

**新增模型**（落在 2.2 拆分后的 `features/math-genie/`）：

- `generators/shared/types.ts`：扩展 `ProblemKind` 增加 `'number_bond'`
  ```ts
  interface NumberBondProblem {
    kind: 'number_bond';
    whole: number;          // 整体
    parts: [number, number];// 两个部分，parts[0]+parts[1]===whole
    blankIndex: 0 | 1 | 'whole'; // 哪个位置留空
  }
  ```
- `generators/special-practice/number-bond.ts`：
  - 入参：`{ whole?: number; range: [min,max]; count: number; allowWholeBlank?: boolean }`
  - 当 `whole` 未指定时按 `range` 随机；保证 `parts[0] >= 0 && parts[1] >= 0`
  - `excludeZeroProblems` 时禁止 `parts` 中出现 0（仅 `whole>=2` 时可用）
  - 避免同一页内出现完全等价的 `(parts, blankIndex)` 重复（用 `problem-key` 去重）

**UI / 渲染**：

- `components/ProblemVisualizer.tsx`：新增 `NumberBondNode` 子组件，纯 SVG / CSS 渲染
  - 顶部 whole 圆框，两条斜线，左右两个部分圆框
  - blank 位置使用 `□` 或 `?`（与现有 Fill Blank 占位符风格统一）
  - showAnswers 时填入实际数字
- `components/WorksheetSettings.tsx`：在 Special Practice 分组下新增 `NUMBER_BOND` 选项；额外控件：
  - `whole` 范围 slider（默认 2–10）
  - `blankPositionMode`：`random` / `parts only` / `whole only`（默认 `random`，`allowWholeBlank=true`——whole 留空虽接近 fill-blank，但配合树状视觉对低年级理解整体—部分关系仍有意义）
- 与现有 `specialPracticeType` 结构对齐（同 ZERO_DRILL / FACT_FAMILY 同级）
- 因为视觉密度较低，建议每页 8–12 个（受 2.10 灵活题量支持）

**测试**（追加到 `__tests__/generators.test.ts`）：

1. 所有题目满足 `parts[0] + parts[1] === whole`
2. `excludeZeroProblems` + `whole ∈ [2, 5]` 时不出现 0、不死循环
3. `blankPositionMode='parts only'` 时 `blankIndex !== 'whole'`
4. 同页内无完全重复题（含 blankIndex）

**验收**：
- 切换到 Number Bond 后预览渲染树状题；打印不破图
- 配合 2.10，每页题数可在 4–20 间灵活调
- 现有所有题型行为不变

---

#### 2.10 math-genie 灵活每页题量 + 自适应排版 ⏱️ 3d

**现状问题**（已在代码核实）：
- `getTextRowsPerPage` 在 `math-genie-view.tsx:96-100` / `WorksheetSettings.tsx:98-101` / `WorksheetPreview.tsx:22-26` 三处重复且硬编码：`4列→6行`、`3列→7行`、`2列→8行`，导致每页题数只能是 16 / 21 / 24
- `WorksheetPreview.tsx:159` 的 `gridAutoRows: 'minmax(70px, auto)'` 与题目卡片字号脱钩；改 columns 后字号不变，密度提升后页面溢出 / 错位
- `WorksheetPreview.tsx:156-163` 的 `@media (min-width: 1200px)` 复刻了 `gridTemplateColumns`，是死代码（值相同），需清理

**目标**：
- 用户可自由选择 columns（2 / 3 / 4 / 5）× 每页题数（8–30，步进 1），二者解耦（上限 30：低年级避免视觉过密）
- 字号、行高、内边距由"每页题数 + 列数 + displayMode"派生，单一公式；新增一题即重排
- 打印 A4 下不溢出（核心约束）

**实现**（落在 2.2 拆分后的 `features/math-genie/`）：

- `shared/layout.ts`（新增，单一事实源）：
  ```ts
  export interface PageLayout {
    columns: number;
    rows: number;
    problemsPerPage: number;   // columns * rows
    fontSize: number;          // px，公式派生
    rowHeight: number;         // px
    columnGap: number;
    rowGap: number;
  }
  export function derivePageLayout(opts: {
    columns: number;
    problemsPerPage: number;
    displayMode: DisplayMode;
    paper?: 'A4' | 'letter'; // 预留给 Phase 3
  }): PageLayout;
  ```
  - 公式（初版，可调）：`rowHeight = clamp((PAGE_PRINT_HEIGHT_MM - HEADER_MM) / rows, 12mm, 30mm)`；`fontSize = clamp(rowHeight * 0.45, 14px, 28px)`；TEXT vs EMOJI 用不同上下界
- 删除 3 处 `getTextRowsPerPage`，统一调用 `derivePageLayout`
- `WorksheetSettings.tsx`：
  - `Columns Per Page`：扩展 `[2,3,4,5]`
  - 新增 `Problems Per Page` 数字输入（min=columns，max=30，步进 1）；改 columns 时 problemsPerPage 自动 clamp 但不强制重置
  - 派生显示 `rows = ceil(problemsPerPage / columns)`，并预警 `rowHeight < 14mm` 时建议减少题数
- `WorksheetPreview.tsx`：
  - 用 `derivePageLayout` 出来的 `fontSize / rowHeight / gap` 驱动 grid 与题目卡片
  - 删除冗余的 `@media (min-width: 1200px)` 块
  - 每题卡片的内字号（数字、运算符、占位符 □）都按 `layout.fontSize` 缩放
- 持久化：复用 `usePersistedConfig`，新增 `problemsPerPage` 字段；老 config 走默认值

**测试**（追加）：
1. `derivePageLayout` 纯函数 unit test：边界 `problemsPerPage = 8 / 20 / 30` 下 `fontSize` 单调递减、`rowHeight ≥ 12mm`
2. `columns=3, problemsPerPage=15` → `rows=5`；`columns=4, problemsPerPage=15` → `rows=4`（最后一行 3 题，留 1 空位允许）
3. 改 columns 不改 problemsPerPage 时 rows 自动重算

**验收**：
- 用 Playwright（或本地手动）打印预览 A4，确认 8 / 15 / 24 / 30 题/页均不溢出
- 字号视觉随题数变化连续平滑
- 现有持久化 config 不破

---

#### 2.11 math-genie 应用题（word problems）⏱️ 4d

**目标**：让 math-genie 支持简单加减法应用题，从中文模板语料随机组装，保证语法正确。

**新增数据**：`src/features/math-genie/data/word-problem-templates.zh-CN.json`

数据结构设计（保证可组合 + 语法安全）：

```json
{
  "version": 1,
  "subjects": [
    { "noun": "小鸟", "measure": "只", "verbs": { "appear": "飞来", "leave": "飞走" }, "location": "树上" },
    { "noun": "苹果", "measure": "个", "verbs": { "appear": "放上", "leave": "拿走" }, "location": "盘子里" },
    { "noun": "小朋友", "measure": "个", "verbs": { "appear": "来了", "leave": "走了" }, "location": "教室里" }
  ],
  "templates": {
    "addition": [
      {
        "pattern": "{location}{state}{n1}{measure}{noun}，又{verb_appear}{n2}{measure}，现在{location}一共有多少{measure}{noun}？",
        "requires": ["location", "verbs.appear"],
        "state": "有"
      },
      {
        "pattern": "{subject_name}有{n1}{measure}{noun}，{other_name}又给了他{n2}{measure}，他现在一共有多少{measure}{noun}？",
        "requires": [],
        "names": ["小明", "小红", "小华", "小丽"]
      }
    ],
    "subtraction": [
      {
        "pattern": "{location}原来{state}{n1}{measure}{noun}，{verb_leave}了{n2}{measure}，现在还剩多少{measure}{noun}？",
        "requires": ["location", "verbs.leave"],
        "state": "有"
      }
    ]
  }
}
```

设计原则（避免"AI 风格"的生硬拼接）：
- **subject + template 校验**：每个 template 声明 `requires` 字段（如 `location`、`verbs.appear`），组装时只挑选满足条件的 subject，保证语法合理
- **量词强一致**：`measure`（只/个/支/块/朵）与 `noun` 绑定，不交叉混用
- **数字约束语义**：减法 template 必须 `n1 >= n2`（且 `n2 <= n1`）；加法限制 `n1+n2 <= range.max`；与现有 `customDifficulty` 范围接入
- **人名池**：独立 `names` 数组，避免出现"小明给小明"——抽样时 `pick 2 distinct`

**新增 generator**：`generators/word-problem.ts`

```ts
export interface WordProblemProblem {
  kind: 'word_problem';
  text: string;            // 组装好的题面
  operation: 'addition' | 'subtraction';
  n1: number;
  n2: number;
  answer: number;
}

export function generateWordProblem(opts: {
  operation: 'addition' | 'subtraction' | 'mixed';
  range: [number, number];
  count: number;
  excludeZero: boolean;
}): WordProblemProblem[];
```

**UI / 渲染**：
- `DisplayMode` 新增 `WORD_PROBLEM`（与 `TEXT` / `EMOJI` 平级）；运算仍走 `OperationType` 的 ADDITION/SUBTRACTION/MIXED
- 初版语料仅覆盖最基础语义：「来了 / 走了」「飞来 / 飞走」「放上 / 拿走」「合起来 / 还剩」；**不**包含「比……多/少」等比较型（语法风险高，留待二期数据扩展）
- `components/WordProblemCard.tsx`：题面（左对齐、行高 1.6）+ 下方"列式：______ = ______（只）"答题区
- 每页题数：受 2.10 控制，但应用题密度低，建议默认 4–6 题/页

**i18n 钩子**：模板 JSON 文件名带 locale 后缀（`*.zh-CN.json`），为 2.7 i18n 预留扩展位；初版只做 zh-CN

**测试**（追加到 `__tests__/`）：
1. 100 次抽样无语法畸形（断言：不出现 `{xxx}` 残留占位符、不出现 `undefined`）
2. 减法题 `n1 >= n2`；加法题 `n1+n2 ∈ range`
3. `excludeZero` 时 `n1 > 0 && n2 > 0`
4. 同一题 subject 与 template 的 `requires` 字段全部命中
5. 双人名 template 中两个名字 distinct

**验收**：
- 切换到 Word Problem 模式后生成 ≥ 20 题，人工抽 10 题语法/语义全部成立
- 模板/语料新增只改 JSON、无需改 generator 代码
- 与现有 `customDifficulty`、`excludeZeroProblems`、`MIXED` 平衡（见 0493a49f memory）配置全部生效

---

**Phase 2 总工时**：约 24–29 个人日（2.1–2.8: 15–20d + 2.9: 2d + 2.10: 3d + 2.11: 4d）。

---

### Phase 3（长期，按需取舍）

> ⚠️ 这一阶段都是 **可选** 的。如果 diyyy 永远定位"个人维护的免费工具站"，跳过整个 Phase 3 也完全 OK。

#### 3.1 PDF 真导出
- 引入 `pdf-lib`（~80KB）或 `react-pdf/renderer`
- 抽象 `PrintFrame` 支持 `mode: 'print' | 'pdf'`
- A4 / US Letter 切换

#### 3.2 视觉回归
- Playwright + 像素 diff
- 主要锁 `chartrace` 的 4 种 grid + Pinyin 渲染（最容易"看起来对实际错位"）

#### 3.3 教学预设扩展
- 新增更多预设词库（人教版、北师大版各年级）
- 数据通过 JSON 在 `src/shared/data/lessons/<edition>/<grade>.json` 组织，generator 不动

#### 3.4 性能精修
- `React.memo` 应用到 `PaperSheet` 单元格组件（当前每次 config 变化全量重渲）
- `useMemo` 包装 `generateProblems` 大集合

#### 3.5 PWA / 离线
小学场景常出现"打印教室没网"。开 `vite-plugin-pwa`，所有 4 个 tool 完全离线可用（本来就没后端，几乎零成本）。

---

## 5. 重构后的目标架构

### 5.1 目录结构

```
src/
  app/
    main.tsx
    app.tsx
    routes.tsx
  features/
    math-genie/
      generators/
      components/
      state.ts
      config.ts
      index.ts
    chartrace/
    charmaze/
    charcolor/
  shared/
    worksheet/            // WorksheetTool 协议 + Workbench
    components/           // SettingsPanel, GridBox, PinyinStaff, PrintFrame
    data/                 // lessons hook
    hooks/                // usePersistedConfig
    i18n/
    theme/
      tokens.ts
  pages/
    Home.tsx              // dashboard
```

### 5.2 状态管理

- 单 tool 内：`useReducer` + `usePersistedConfig`
- 跨 tool：React Context（仅 theme / locale）
- **不引入** Redux / Zustand

### 5.3 组件分层

| 层 | 内容 | 例子 |
|---|---|---|
| Tokens | 颜色 / 间距 / 字体栈 | `theme/tokens.ts` |
| Primitives | 纯展示，无业务 | `SettingsPanel`, `GridBox`, `PinyinStaff`, `PrintFrame` |
| Features | 业务实现 | 4 个 worksheet 的 `Settings` / `Preview` / `generators` |

### 5.4 测试体系

| 类型 | 工具 | 覆盖 |
|---|---|---|
| 单元测试 | Vitest | 所有 generator（纯函数）100% |
| 组件测试 | Vitest + Testing Library | Preview 在不同 config 下的快照 |
| e2e smoke | Playwright | 每个 tool"打开 → 选预设 → 生成 → 打印 preview" |
| 视觉回归 | Playwright pixel diff | `chartrace` 的 4 种 grid + Pinyin |

### 5.5 CI / CD

GitHub Actions（`on: pull_request`）：

1. `lint`（eslint + prettier --check）
2. `typecheck`（tsc --noEmit）
3. `test`（vitest run）
4. `build`（vite build）
5. `e2e`（playwright smoke）
6. Lighthouse CI：performance ≥ 80、SEO ≥ 90、a11y ≥ 90

Vercel preview deploy 保留现状。

---

## 6. "新增一种 worksheet" 应该是什么样

重构后，新增"看图写句" worksheet：

1. `src/features/picture-sentence/generators/` 写纯函数生成器
2. `src/features/picture-sentence/components/Settings.tsx`、`Preview.tsx`
3. `src/features/picture-sentence/config.ts` 实现 `WorksheetTool<Config, Problem>`
4. `src/app/routes.tsx` 注册路由
5. `src/layouts/.../nav.tsx` 加导航项

**预期工时：1–2 天**（今天是 ~1 周）。

---

## 7. 验收门槛汇总

| 阶段 | 量化指标 |
|---|---|
| Phase 1 完成 | bundle 主 chunk ↓ ≥ 30%；配置可持久化；vitest 8 项通过；Lighthouse SEO ≥ 90；iPhone SE 可用 |
| Phase 2 完成 | `math-genie-view.tsx` ≤ 80 行；`grep "as any" src/` ≤ 5；4 个 tool 全部走 `Workbench`；Lighthouse a11y ≥ 90；math-genie 支持 Number Bond / Word Problem 两种新题型；每页题数可在 8–30 间任意调且 A4 不溢出 |
| Phase 3 完成 | PDF 导出可用；e2e smoke + 视觉回归在 CI 上运行；PWA 离线可用 |

---

## 8. 一句话总结

> **删一半模板代码、建 `WorksheetTool` 抽象、给 generator 加测试、给用户加 localStorage** —— 这四件事做完，diyyy 就是一个可以长期演进的、健康的工具型前端项目。其余皆是后话。
