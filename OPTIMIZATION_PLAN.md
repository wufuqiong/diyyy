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

#### 1.1 删除模板死代码 ⏱️ 0.5d

**删除**：
- `src/_mock/`
- `src/sections/blog/`、`src/sections/product/`、`src/sections/user/`、`src/sections/overview/`、`src/sections/auth/`
- `src/pages/blog.tsx`、`src/pages/sign-in.tsx`、`src/pages/user.tsx`、`src/pages/products.tsx`
- `src/layouts/components/notifications-popover.tsx`、`account-popover.tsx`、`workspaces-popover.tsx`、`searchbar.tsx`、`nav-upgrade.tsx`、`language-popover.tsx`、`menu-button.tsx`（如未被实际使用，需先 grep 确认）
- `src/layouts/auth/`

**修改**：
- `src/layouts/dashboard/nav.tsx`、`src/layouts/dashboard/layout.tsx`：移除对上面文件的 import
- `package.json`：把 `name` 从 `@minimal/material-kit-react` 改为 `diyyy`
- 卸载依赖：`apexcharts`、`react-apexcharts`、`simplebar-react`（如确认无引用）、`minimal-shared`（如确认无引用）

**验收**：
- `yarn build` 通过
- `yarn lint` 通过
- 主 chunk 体积下降 ≥ 30%（`vite build` 输出对比）
- 4 个 tool 路由功能不变

#### 1.2 `usePersistedConfig` hook ⏱️ 0.5d

**新增**：`src/hooks/use-persisted-config.ts`

```ts
export function usePersistedConfig<T>(key: string, defaultValue: T, version = 1): [T, Dispatch<SetStateAction<T>>] {
  // 读 localStorage，校验 schema version，失败回退 default
  // 写时 JSON.stringify + try/catch（隐私模式可能抛错）
}
```

**应用到**：
- `src/sections/math-genie/view/math-genie-view.tsx` 顶层 `config` state
- `src/sections/chartrace/view/chartrace-view.tsx` 的 `config`
- `src/sections/charmaze/view/charmaze-view.tsx` 的配置 state
- `src/sections/charcolor/view/charcolor-view.tsx` 的配置 state

**验收**：刷新后所有控件值保留；改 `version` 后旧数据被丢弃回退到默认值。

#### 1.3 修复 `generateRandomProblem` 递归 ⏱️ 0.5h

**位置**：`src/sections/math-genie/view/math-genie-view.tsx:1099-1154`

**动作**：把"命中 zero → 递归调用自身"改成 `while (attempts++ < 50) { ... }` + 兜底返回最后一个候选。

**验收**：新增单测 `excludeZeroProblems=true` + `customDifficulty={min:0,max:0}` 不抛错、不超时。

#### 1.4 移除 `console.error` monkey-patch ⏱️ 0.5h

**位置**：`src/main.tsx:12-25`

**动作**：删掉。React DevTools 端口错误是 DevTools 自身问题，不应吞应用错误。

**验收**：浏览器 console 仍可见真实错误。

#### 1.5 Vitest + 核心生成器单测 ⏱️ 2d

**新增**：
- `vitest.config.ts`
- `package.json` 加 `"test": "vitest"`
- `src/sections/math-genie/__tests__/generators.test.ts`

**最少覆盖 8 条约束**：
1. `MIXED` 模式 +/- 数量差 ≤ 1
2. `CHAIN_SUBTRACTION` 任何中间结果不为负
3. `CHAIN_ADDITION` 所有数字落在 `[min, max]`
4. `FACT_FAMILY` 输出 4 题成组（a+b、b+a、c-a、c-b）
5. `FILL_BLANK` + `EMOJI` 模式不出现 `blankPosition='result'`
6. `excludeZeroProblems=true` 时无任何 0 出现且不死循环
7. `CUSTOM` difficulty 范围严格生效
8. `generateRandomProblem` 在窄区间下返回（不抛栈溢出）

**验收**：`yarn test` 全绿；CI 加上这一步。

#### 1.6 SEO 基础 ⏱️ 0.5d

**修改**：
- `index.html`：`<title>`、`<meta description>`、`<meta name="keywords">`、OG tags
- 每个 page 用 `<title>` 标签（React 19 原生支持）覆盖
- 新增 `public/robots.txt`、`public/sitemap.xml`

**验收**：Lighthouse SEO ≥ 90。

#### 1.7 移动端断点 ⏱️ 1d

**改造**：4 个 view 的顶层 `Box`。`< lg` 断点下：
- 侧栏改为顶部抽屉（MUI `Drawer` + `Fab`），主区铺满。
- 移除 `height: 100vh` 在小屏上的强制使用（导致 iOS 上 toolbar 计算错误）。

**验收**：iPhone SE 视口下 4 个 tool 均可操作并打印。

#### 1.8 Sentry（可选，但强烈推荐）⏱️ 0.5d

**新增**：`@sentry/react`，在 `src/main.tsx` 初始化，DSN 走 `import.meta.env.VITE_SENTRY_DSN`。

**验收**：手动 throw 一次能在 Sentry 看到。

**Phase 1 总工时**：约 5–7 个人日。

---

### Phase 2（1–2 月）：架构整形

#### 2.1 引入 `WorksheetTool` 协议 ⏱️ 2d

**新增**：`src/shared/worksheet/`

```
shared/worksheet/
  types.ts              // WorksheetTool<Config, Problem> 接口
  Workbench.tsx         // 统一骨架：侧栏 + 预览 + 打印 + 进度 + 错误 + 持久化
  usePersistedConfig.ts // 从 Phase 1 移过来
  PrintFrame.tsx        // 统一打印容器（封 @media print）
```

接口形态：

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

**验收**：`Workbench` 组件可独立 render，4 个 tool 逐步迁移。

#### 2.2 拆 math-genie ⏱️ 4d

目标结构：

```
src/features/math-genie/
  generators/
    standard.ts
    fill-blank.ts
    multi-op.ts
    special-practice/
      zero-drill.ts
      fact-family.ts
    shared/
      mixed-balance.ts
      problem-key.ts
      types.ts
  components/
    Settings.tsx          // 现在 WorksheetSettings.tsx 931 行 → 拆 4 个子组件
    Preview.tsx           // 现在 WorksheetPreview.tsx
    ProblemVisualizer.tsx
  state.ts                // useReducer + action types
  config.ts               // WorksheetTool 实例
  index.ts                // 只导出 config
```

**目标**：`math-genie-view.tsx` 从 1515 行降到 ≤ 80 行（仅 `<Workbench tool={mathGenieTool} />`）。

**验收**：所有 Phase 1.5 单测仍通过；新增组件级 snapshot 测试。

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

**Phase 2 总工时**：约 15–20 个人日。

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
| Phase 2 完成 | `math-genie-view.tsx` ≤ 80 行；`grep "as any" src/` ≤ 5；4 个 tool 全部走 `Workbench`；Lighthouse a11y ≥ 90 |
| Phase 3 完成 | PDF 导出可用；e2e smoke + 视觉回归在 CI 上运行；PWA 离线可用 |

---

## 8. 一句话总结

> **删一半模板代码、建 `WorksheetTool` 抽象、给 generator 加测试、给用户加 localStorage** —— 这四件事做完，diyyy 就是一个可以长期演进的、健康的工具型前端项目。其余皆是后话。
