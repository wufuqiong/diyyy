# UI Design Doc: DIYYY 视觉重设计（彩虹糖果风）

## 概述

将 DIYYY 当前的企业级 SaaS 视觉语言（灰白卡片、MUI 默认 Material 风格）
改造为儿童向的"彩虹糖果"风格，参考 Super Simple Songs 的视觉语言：
高饱和纯色块、圆润形状、卡通化细节，色彩本身是设计主角而非点缀。

**配套原型文件**：`diyyy-redesign-candy.html`（已交付，可在浏览器直接
打开预览，包含完整侧边栏 + 工作台首页效果）。本 doc 把原型里的设计
决策转译成可执行的 token 和改造范围，供 agent 实施。

**不在本次范围**：worksheet 本身的打印样式（A4 页面、`PrintFrame`）
保持不变，仅改造产品 UI 外壳（Dashboard、导航、卡片、按钮等屏幕呈现，
非打印输出）。

---

## 1. 设计原则（先于具体数值，供 agent 做后续延伸决策时参考）

1. **色彩是主角，不是点缀**——旧版是"白卡片 + 彩色小图标"，色彩被压缩
   成装饰细节；新版每个工具卡片本身就是一块高饱和纯色，色彩占据视觉
   主导地位。后续新增 UI 元素时遵循同一逻辑：能用纯色块表达的，不要
   退回到"白底+彩色强调"的旧模式。
2. **圆润、无锐角**——所有圆角不低于 14px，按钮和卡片优先用大圆角或
   纯圆形，不使用直角矩形。
3. **物理反馈感**——按钮、卡片要有"可以被按下/拿起"的视觉暗示（实体
   按键厚度阴影、hover 上浮），而不是扁平的纯色块。
4. **每个工具一个身份色，跨组件保持一致**——同一个工具在侧边栏、卡片、
   未来的 Settings 面板强调色中，必须使用同一个 token，不能在不同
   组件里对同一工具使用不同色值。
5. **克制使用渐变/彩虹效果**——整页不做满屏渐变；彩虹效果只用在品牌
   名称这种"一次性强调"的地方，避免变成视觉噪音。

---

## 2. Design Token

### 2.1 色彩

```typescript
// src/theme/tokens.ts 新增/替换部分

export const candyColors = {
  red:    '#FF6B6B',
  orange: '#FFA63D',
  yellow: '#FFD23F',
  green:  '#4ECB71',
  teal:   '#2EC4B6',
  blue:   '#4D9DE0',
  purple: '#9B72CF',
  pink:   '#FF7AAE',
};

export const surface = {
  sky: '#EAF6FF',         // 主背景（替代旧版 --paper / MUI 默认灰白）
  cloudWhite: '#FFFFFF',  // 卡片白底区域、侧边栏背景
};

export const ink = {
  primary: '#3A3550',     // 主文字色（替代纯黑，更柔和）
  soft: '#6E6A85',        // 次要文字/描述文字
};
```

### 2.2 工具身份色映射

每个工具对应**唯一**一个糖果色，全站统一使用，不再各组件自定义：

| 工具 ID | 身份色 token | Hex |
|---|---|---|
| `charcolor`（识字涂色） | `candyColors.red` | `#FF6B6B` |
| `charmaze`（识字迷宫） | `candyColors.orange` | `#FFA63D` |
| `chartrace`（描红写字） | `candyColors.green` | `#4ECB71` |
| `math-genie`（算术天地） | `candyColors.blue` | `#4D9DE0` |
| `hundred-chart`（百数板） | `candyColors.purple` | `#9B72CF` |
| `word-search`（单词搜索） | `candyColors.pink` | `#FF7AAE` |

> `teal` 和 `yellow` 暂未分配给现有工具，保留给未来新工具使用，
> 避免新工具上线时和已有工具撞色。

每个身份色需要派生一个**浅色版**（用于该工具在导航项 hover/active
状态的背景色），计算方式：原色 + 白色混合，透明度约 12%，或直接在
`tokens.ts` 里为每个身份色追加 `-soft` 变体（具体数值在原型 CSS
`--item-bg` 系列变量中已给出参考值，可直接复用）。

### 2.3 字体

```typescript
// src/theme/theme-config.ts

export const fontFamily = {
  display: "'Baloo 2', 'Noto Sans SC', sans-serif",  // 标题、品牌名、按钮文字
  body: "'Quicksand', 'Noto Sans SC', sans-serif",    // 正文、描述文字
};
```

**引入方式**：通过 Google Fonts 链接引入（`Baloo 2` 和 `Quicksand` 均
非中文字体，中文字符会自动 fallback 到 `Noto Sans SC`，需要同时引入
`Noto Sans SC` 的对应字重 400/500/700/900）。

**字重原则**：
- 标题（h1-h3）、按钮文字：`Baloo 2`，字重 700-800
- 正文、描述、caption：`Quicksand`，字重 500-600
- 不使用系统默认 Inter/Roboto 作为主要展示字体

### 2.4 圆角与阴影

```typescript
export const radius = {
  card: '28px',
  button: '16px',
  pill: '999px',
  iconCircle: '50%',
};

export const shadow = {
  // 实体按键厚度阴影，而非常规的模糊阴影
  buttonRest: '0 4px 0 0 rgba(0,0,0,0.12)',
  buttonPressed: '0 1px 0 0 rgba(0,0,0,0.12)', // 配合 translateY 模拟按下
  cardRest: '0 6px 0 0 rgba(0,0,0,0.08)',
};
```

---

## 3. 组件改造范围

### 3.1 全局背景

- 页面主背景：MUI 默认背景 → `surface.sky`（`#EAF6FF`）
- 涉及文件：`src/theme/core/palette.ts`（`background.default`）

### 3.2 侧边栏（`src/layouts/dashboard/`）

- 背景改为 `surface.cloudWhite`，右边缘加一条低透明度强调色竖线
  （原型中 `border-right: 4px solid rgba(74,157,224,0.15)`）
- 品牌区（Logo + "DIYYY"）：
  - Logo 容器：圆角矩形（16px），背景用 `candyColors.orange`，
    轻微旋转 `rotate(-4deg)` 制造手工贴纸感
  - 品牌名文字：`Baloo 2` 字重 700，颜色用 `candyColors.orange`
- 导航项（`NavContent` / `nav-config-dashboard.tsx`）：
  - 每个工具导航项需要关联其身份色（新增字段，如 `toolColorKey`，
    挂在 `nav-config-dashboard.tsx` 的配置项上）
  - 默认态：灰色文字 `ink.soft`
  - hover/active 态：背景用该工具身份色的浅色版，文字用身份色本身，
    边框用 2px 实色描边（同身份色），圆角 16px
  - 建议给每个导航项加一个 emoji 或图标前缀（原型用 emoji 占位，
    正式实现建议替换为统一风格的线性/手绘图标集，保持统一视觉调性，
    不要混用 emoji 和 SVG icon）

### 3.3 语言切换器（`LanguageSwitcher`）

- 胶囊形容器（`border-radius: 999px`），当前选中语言用
  `candyColors.blue` 实色填充 + 白色文字，未选中为透明背景 + 灰色文字
- 字体使用 `Baloo 2`

### 3.4 工作台首页（Dashboard 欢迎区 + 工具卡片网格）

**欢迎区**：
- 标题"欢迎使用 DIYYY"：`Baloo 2` 字重 800，"DIYYY" 五个字母可选择性
  应用彩虹渐变文字效果（每个字母单独 `<span>`，分别赋色，参考原型
  `.hero h1 .rainbow span:nth-child(n)`）——**此效果仅用于这一处品牌名**，
  不要在其他标题上复用，避免彩虹效果泛滥成视觉噪音
- 副标题：`Quicksand` 字重 500，颜色 `ink.soft`

**工具卡片**（核心改造点，替换现有 `DashboardPage` 的卡片组件）：

卡片结构从"单一白底容器"改为"上下两段式"：

```
┌─────────────────────────┐
│  [纯色背景：工具身份色]    │ ← .card-top
│   ◯ icon                │
│   工具名称（白字）         │
│                          │
│  ╭───────────────────╮   │ ← .card-bottom（白底，向上圆角叠加）
│  │ 描述文字（灰字）      │   │
│  │ [开始使用 按钮]       │   │
│  ╰───────────────────╯   │
└─────────────────────────┘
```

实现要点：
- `.card-top` padding-bottom 留足空间（约 70px）给下方白底区域
  叠加上去（`margin-top: -36px` + `border-radius: 24px 24px 0 0`）
- icon 容器：64px 圆形，白色半透明背景（`rgba(255,255,255,0.9)`），
  内部图标用工具身份色（与背景纯色形成对比）
- 卡片右上角加一个装饰性圆形色块（`.card-blob`，半透明白色圆形，
  局部超出卡片边界），纯装饰，无功能含义
- "开始使用"按钮：背景为该工具身份色（与卡片顶部同色，保持视觉统一），
  使用 §2.4 定义的"实体按键"阴影效果
- hover 状态：整卡 `translateY(-6px) scale(1.02)`；按钮单独的
  hover/active 状态参考 §2.4 的 `buttonRest`/`buttonPressed`

**背景装饰**（可选，视实现成本决定是否本次一并做）：
- 纯 CSS 云朵和太阳形状，固定定位在主内容区背景层，营造"天空场景"
- 实现参考原型中的 `.cloud` / `.sun` / `.bg-decor`，全部用纯色圆形
  拼接而成，不需要额外图片资源
- 若本次工期紧张，可作为 Phase 2 单独排期，不阻塞核心改造

---

## 4. 实现阶段划分

| Phase | 内容 | 说明 |
|---|---|---|
| 1 | Token 落地：色彩、字体、圆角、阴影变量写入 `theme-config.ts` / `tokens.ts` | 基础设施，其他阶段依赖此项 |
| 2 | 侧边栏 + 语言切换器改造 | 影响全局，建议先做，方便统一验证视觉效果 |
| 3 | Dashboard 欢迎区 + 工具卡片改造 | 视觉冲击最大的部分，建议做完后截图全员过一遍确认方向 |
| 4（可选） | 背景云朵/太阳装饰 | 纯装饰性，可单独排期，不影响核心可用性 |
| 5（后续迭代，本次不做） | 各工具内部 Settings 面板/Preview 区域同步糖果风改造 | 本次仅改造 Dashboard 入口层，工具内部页面暂不动 |

> Phase 5 特别说明：本次改造范围**仅限工作台首页和全局外壳**
> （侧边栏、导航、欢迎区、工具卡片），不包括五个工具各自的
> `ControlPanel` / `Preview` 内部界面。这些内部界面延续现有 MUI
> 主题即可，待 Dashboard 改造效果确认后再决定是否扩展统一视觉语言到
> 工具内部，避免一次性改动范围过大难以验证。

---

## 5. 验收标准

- [ ] 所有圆角 ≥14px，无直角矩形卡片/按钮
- [ ] 每个工具的身份色在侧边栏导航项、Dashboard 卡片中保持一致
      （同一 token，不是视觉上看起来相近的不同色值）
- [ ] 标题/按钮统一使用 `Baloo 2`，正文统一使用 `Quicksand`，
      中文字符正确 fallback 到 `Noto Sans SC` 且字重匹配
      （不出现中文字重明显偏细或偏粗的情况）
- [ ] 彩虹渐变文字效果仅出现在品牌名"DIYYY"一处，未在其他标题复用
- [ ] 卡片 hover、按钮 hover/active 的物理反馈效果（位移/阴影变化）
      在实际浏览器中验证流畅，无明显卡顿
- [ ] 深色模式（如果项目后续有该需求）暂不在本次范围内，但 token
      命名应预留语义化扩展空间（不强制本次实现）
- [ ] 移动端（NavMobile drawer）下，侧边栏导航项的糖果风样式同步生效，
      不能只改桌面端

---

## 6. 风险与待确认事项

- **可爱程度与目标用户年龄段的匹配度**：当前方案偏向低龄向（幼儿园
  -小学低年级），如果 DIYYY 实际用户群体覆盖到小学高年级，需要确认
  这个调性是否会显得"太幼稚"。建议改造完 Phase 3 后，找几位真实用户
  （家长/老师）看一下原型反馈，再决定是否继续推进背景装饰等细节。
- **Emoji 占位 icon 需替换**：原型中工具卡片和导航项的图标用 emoji
  占位，仅用于快速验证布局效果，正式实现需要设计一套统一风格的
  线性或手绘图标集替换，不应在生产环境直接使用 emoji 作为图标方案
  （不同操作系统/浏览器渲染 emoji 的样式不一致，无法保证视觉统一）。
- **打印输出不受影响**：再次确认本次改造不涉及 worksheet 本身的 A4
  打印样式，仅影响产品操作界面，避免后续有人误把糖果风样式带入
  `PrintFrame` 内的打印内容。
