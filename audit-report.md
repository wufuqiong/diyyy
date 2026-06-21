# DIYYY 性能优化审计报告 (Performance Audit)

> 审计日期：2026-06-21
> 范围：客户端构建产物、加载性能、运行时性能
> 方法：源码审查 + 生产构建实测 (`vite build`)

---

## 1. 概览 (Executive Summary)

DIYYY 是一个纯客户端的 React 19 + MUI v7 + Vite 6 练习单生成器。路由已做懒加载，整体架构清晰。但生产构建实测发现 **首屏关键路径上有约 1.4 MB（gzip ~430 KB）的 JS 是非必要预加载的**，主要来自 PDF 导出库被静态引入到所有工具页共享的 `Workbench` chunk。

**最高优先级**：将 `jspdf` + `html2canvas` 改为动态导入，可立刻从每个工具页的初始加载中移除约 **743 KB（gzip 223 KB）**。

### 实测构建产物（最大的 JS chunk）

| Chunk | 原始大小 | Gzip | 内容 | 何时加载 |
|---|---:|---:|---|---|
| `Workbench-*.js` | **743 KB** | **223 KB** | `jspdf` + `html2canvas` | **每个工具页** |
| `index-*.js` (vendor) | 625 KB | 206 KB | React / MUI / router / Sentry | 每个页面 |
| `chartrace-*.js` | 330 KB | 147 KB | `pinyin-pro` 字典 | 仅 chartrace |
| `index.es-*.js` | 159 KB | 53 KB | jspdf 依赖 (canvg) | 随 Workbench 加载 |
| `math-genie-*.js` | 101 KB | 31 KB | 工具逻辑 | 仅 math-genie |
| JS 总计 | ~2.2 MB | — | — | — |

---

## 2. 关键问题与建议（按优先级）

### P0 — PDF 库被静态引入到共享 chunk（最大问题）

**现象**：`src/shared/worksheet/save-pdf.ts:1-2` 静态 `import { jsPDF } from 'jspdf'` 和 `import html2canvas from 'html2canvas'`。该文件被 `src/shared/worksheet/Workbench.tsx:8` 静态引入，而 `Workbench` 是**所有工具页**（math-genie / chartrace / charmaze / charcolor / hundred-chart / word-search）的公共控制器。

**后果**：`Workbench` chunk 实测 **743 KB / gzip 223 KB**，外加 jspdf 依赖 `index.es` 159 KB 和 `purify.es` 26 KB。这些代码只有用户**点击"保存 PDF"按钮时**才需要，却被强制加入每个工具页的首屏关键路径。

**建议**：把 `save-pdf` 改成在 `handleSavePdf` 内动态导入：

```ts
// Workbench.tsx — 移除顶部静态 import
const handleSavePdf = useCallback(async () => {
  if (!pdfContainerRef.current) return;
  setIsSavingPdf(true);
  try {
    const { saveWorksheetAsPdf } = await import('./save-pdf');
    await saveWorksheetAsPdf(pdfContainerRef.current, `${sanitized}.pdf`);
  } finally {
    setIsSavingPdf(false);
  }
}, [tool, config]);
```

同时检查 `src/shared/worksheet/index.ts:4` 的 `export { saveWorksheetAsPdf }` re-export 不会被其它入口静态拉回主图。

**预期收益**：每个工具页首屏 JS 减少 ~900 KB（gzip ~280 KB），PDF 代码改为按需加载。这是投入产出比最高的一项。

---

### P1 — 字体全量预加载（Andika 仅 chartrace 用）

**现象**：`src/global.css:4-16` 在全局 CSS 中 `@import` 了 5 个字重的 Barlow、DM Sans 可变字体，以及 Andika 的 latin + latin-ext（woff2 各 ~81 KB，还有 woff 回退各 ~75 KB）。

**后果**：Andika 体积最大，但根据 `PaperSheet.tsx:50` 注释它**只用于 chartrace 的拼音描红**。所有页面（包括 dashboard、math-genie）都会下载全部字体。

**建议**：
- 将 Andika 的 `@import` 从全局 `global.css` 移到 chartrace 相关组件/CSS 中按需加载。
- 移除未使用的 `latin-ext` 或 `woff` 回退（现代浏览器只需 woff2）。
- 确认 Barlow 5 个字重是否都被用到，删除未使用字重。

**预期收益**：非 chartrace 页面减少 ~300 KB 字体下载。

---

### P2 — 缺少手动分包 (manualChunks)，vendor 全打进一个 625 KB chunk

**现象**：`vite.config.ts` 未配置 `build.rollupOptions.output.manualChunks`。React、MUI、react-router、Sentry 全部打进单一 `index` chunk（625 KB / gzip 206 KB）。构建结束时 Vite 也给出了 `Some chunks are larger than 500 kB` 的警告。

**建议**：拆分稳定的 vendor 分包，提升长期缓存命中率：

```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        react: ['react', 'react-dom', 'react-router', 'react-router-dom'],
        mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
      },
    },
  },
},
```

**预期收益**：依赖更新时用户只需重新下载变化的分包；并行下载也更好。

---

### P3 — Sentry 无条件打入主包，且采样率偏高

**现象**：`src/main.tsx:2` 顶部静态 `import * as Sentry from '@sentry/react'`，SDK（含 `browserTracingIntegration` + `replayIntegration`）被打进主 vendor chunk，**即使未配置 `VITE_SENTRY_DSN` 也会被下载**。同时 `tracesSampleRate: 1.0`（100% 链路采样）对纯前端工具站偏高。

**建议**：
- 仅在存在 DSN 时动态导入 Sentry：
  ```ts
  if (import.meta.env.VITE_SENTRY_DSN) {
    import('@sentry/react').then((Sentry) => { Sentry.init({ ... }); });
  }
  ```
- 生产环境将 `tracesSampleRate` 降至 `0.1` 或更低；`replayIntegration` 体积较大，按需评估是否保留。

**预期收益**：未配置监控时主包显著减小；配置后也不阻塞首屏。

---

### P4 — `pinyin-pro` 字典较大（330 KB / gzip 147 KB）

**现象**：`src/sections/chartrace/view/utils/charData.ts:3` 引入 `pinyin-pro`，其字典数据构成 chartrace chunk 的主体。

**评估**：该 chunk **已随 chartrace 路由懒加载**，不影响其它页面，属于可接受范围。

**建议（可选）**：若希望进一步优化 chartrace 首屏，可考虑 `pinyin-pro/dict` 的按需/精简字典，或在真正需要拼音时再动态导入。优先级低。

---

## 3. 次要观察 (Minor)

- **MUI barrel 导入**：多处使用 `import { Box, Stack } from '@mui/material'`（如 `Workbench.tsx:4`）。生产环境 Rollup 可 tree-shake，影响有限，但会拖慢 dev 冷启动。非必须改。
- **`og:image` / `twitter:image` 指向 `favicon.ico`**：`index.html:22,29` 社交分享图用的是 favicon，非性能问题但影响分享展示。
- **`vite-plugin-checker`**：`vite.config.ts:14` 在 dev 跑 tsc + eslint，仅影响开发体验，不进生产包，无需改动。
- **图片资源**：`public/assets/images/diyyy.svg` 224 KB、`product-2.webp` 157 KB、`shape-square.svg` 145 KB 偏大，确认是否用于首屏；SVG 可考虑压缩 (svgo)。

---

## 4. 行动清单 (Prioritized Action Items)

| 优先级 | 改动 | 预计收益 (gzip) | 改动成本 |
|---|---|---:|---|
| **P0** | `save-pdf` 改动态 import | 每个工具页 ~280 KB | 低（~5 行） |
| **P1** | Andika/多余字体按需加载 | 非 chartrace 页 ~300 KB | 低 |
| **P2** | 配置 `manualChunks` | 缓存命中提升 | 低 |
| **P3** | Sentry 条件动态加载 + 降采样 | 主包减小 | 低 |
| P4 | pinyin-pro 精简字典 | chartrace ~50–100 KB | 中 |

**建议先做 P0 + P1 + P3**：三项均为低成本改动，合计可从首屏关键路径移除约 600 KB+（gzip）。

---

## 5. 复现方法

```bash
npx vite build          # 查看各 chunk 大小与 >500KB 警告
ls -la dist/assets/*.js | sort -k5 -rn   # 按原始大小排序
```

> 注：本报告基于一次完整生产构建实测，chunk 哈希名随每次构建变化。
