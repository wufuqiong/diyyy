# Design Doc: Math Genie 比较题型扩展（图形化 + 符号化比较）

## 概述

在现有 `math-genie` 工具中新增一组"比较大小/多少"题型，覆盖图1、
图2 展示的四种具体形式。这组新题型在数学概念上属于"比较"，但
呈现形式（连线、圈选、填空、纯符号）彼此差异很大，因此设计上需要
一个两层结构：上层归入现有的 `SpecialPracticeType` 体系（与
`WORD_PROBLEM_COMPARISON` 同级，都属于"比较类"练习），下层再细分
四种具体子题型。

**不引入新的图标资源**：四种题型涉及的图案统一复用现有 EMOJI 模式
已有的表情符号集合，不新增图标库或 SVG 资源。

---

## 1. 四种题型的精确定义（基于参考图逐一拆解）

### 题型 A：配对连线题（图1左上四组）

**结构**：两个卡片各装一组 emoji（数量不同），中间一个圆圈，下方
一个方框。

**答题逻辑**（已确认）：
- 中间圆圈：填 `>`、`<` 或 `=` 符号（比较两组 emoji 的数量关系）
- 下方方框：填两组数量的差值（绝对值，如左组3个右组2个，填 `1`）

**示例**（参照图1左上第一组）：左卡片 3 辆车 emoji，右卡片 2 瓶颜料
emoji，中间圆圈应填 `>`（3>2），下方方框填 `1`（3-2=1）。

### 题型 B：圈多/少题（图1左下"数一数，比一比，圈出多或少"）

**结构**：上下两行 emoji（不同图案、不同数量），下方一行文字
"X 比 Y（多/少）"，"多"和"少"两个字都印出来，要求学生圈出正确的一个。

**答题逻辑**：纯二选一判断题，不需要填数字，只需要判断两组数量
谁多谁少（不会出现相等的情况——"圈多或少"这个表述本身排除了
相等选项，相等的情况应该只出现在题型 D）。

### 题型 C：填空差值题（图1右下"数一数，比一比"）

**结构**：与题型 B 几乎相同的上下两行 emoji 对比布局，但下方文字
固定写明方向（"X 比 Y 多___个" 或 "X 比 Y 少___个"，多/少哪个字
已经印定，不是选择题），要求填具体差值数字。

**与题型 B 的关键区别**：题型 B 是判断方向（多或少二选一，不填
数字）；题型 C 是方向已给定，只填数字。两者是同一组数据的不同
呈现方式，**生成逻辑可以共享同一个底层数据结构**（两组数量+对应的
emoji），只是渲染模板和交互方式不同。

### 题型 D：纯数字符号比较题（图2）

**结构**：两个数字，中间一个圆圈，要求填 `>`、`<` 或 `=`。

**答题逻辑**：纯数字比较，不涉及 emoji/图案。**这是四种题型中唯一
明确包含"相等"情况的**（参考图2示例中 `5○5`、`7○7`）。

---

## 2. 架构归类

### 2.1 上层归类：`SpecialPracticeType`

新增一个枚举值 `COMPARISON`，与现有 `WORD_PROBLEM_COMPARISON` 同级，
都属于"比较类"练习这一大类。

**为什么不归入 `DisplayMode`**：`DisplayMode`（EMOJI/TEXT/WORD_PROBLEM）
描述的是"加减法题目"的呈现方式，本质仍是"a 运算 b = c"的数学结构；
而比较题不是加减法题，是另一种数学概念（关系判断，不是数值运算），
混入 `DisplayMode` 会污染其语义。

**为什么沿用而不是复用 `WORD_PROBLEM_COMPARISON`**：现有
`WORD_PROBLEM_COMPARISON` 特指"应用题文字形式"的比较题（参照设计
文档中 `WORD_PROBLEM_COMPARISON` 与 `displayMode=WORD_PROBLEM` 配合
使用的描述）。本次新增的四种题型是图形化/符号化的比较，不是文字
应用题，因此新增一个独立的 `COMPARISON` 类型更准确，避免和现有
应用题比较逻辑混在一起难以区分。

### 2.2 下层细分：比较题子类型

```typescript
enum SpecialPracticeType {
  NONE = 'none',
  ZERO_DRILL = 'zero_drill',
  FACT_FAMILY = 'fact_family',
  NUMBER_BOND = 'number_bond',
  WORD_PROBLEM_COMPARISON = 'word_problem_comparison', // 现有
  COMPARISON = 'comparison',                            // 新增
}

// 仅当 specialPracticeType === COMPARISON 时生效的子配置
enum ComparisonSubType {
  MATCHING = 'matching',           // 题型A：配对连线（符号+差值）
  CIRCLE_MORE_LESS = 'circle_more_less', // 题型B：圈多/少
  FILL_DIFFERENCE = 'fill_difference',   // 题型C：填空差值
  NUMBER_SYMBOL = 'number_symbol',       // 题型D：纯数字符号比较
}

interface ComparisonConfig {
  subType: ComparisonSubType;
  allowEqual: boolean;        // 是否允许出现相等的情况
  // 题型 A/B/C 专用：emoji 数量比较的范围控制
  emojiCountRange?: { min: number; max: number };
  // 题型 D 专用：纯数字比较的数值范围（可复用现有 difficulty 系统）
}
```

**`allowEqual` 默认值说明**：题型 A、D 允许相等（参照图2示例含
`5○5`、`7○7`；题型A理论上也应支持，虽然参考图未展示相等案例，
但符号比较题在数学教学上通常需要覆盖等号情况）；题型 B、C
不允许相等（"圈多或少"和"多/少__个"的题目表述本身预设了两组
数量不同，如果生成时恰好相等会导致题目无法成立，需要在生成逻辑
里排除这种情况）。

---

## 3. Config 扩展

```typescript
// 在现有 WorksheetConfig 基础上扩展

interface WorksheetConfig {
  // ...现有字段保持不变...
  specialPracticeType: SpecialPracticeType; // 现有字段，新增 COMPARISON 选项
  comparisonConfig?: ComparisonConfig;       // 新增，仅 COMPARISON 时使用
}
```

**与现有字段的交互规则**（参照现有互斥逻辑的处理方式，如
`excludeZeroProblems` 与 `ZERO_DRILL` 的互斥提示）：

- `specialPracticeType = COMPARISON` 时，`operation`、`problemType`
  （Standard/Fill-blank）等现有字段应被禁用或忽略，因为比较题不是
  "a 运算 b = 空格"结构，沿用现有互斥提示的 Snackbar 模式，提示
  用户"比较题模式下运算类型设置不生效"
- `displayMode` 字段：题型 A/B/C 需要 emoji，逻辑上接近现有
  `DisplayMode.EMOJI`，但题型 D 是纯数字，不需要 emoji。建议
  `comparisonConfig.subType` 自动决定是否渲染 emoji，不依赖
  `displayMode` 字段（即选择 `COMPARISON` 类型后，`displayMode`
  选择器本身可以禁用或隐藏，避免用户混淆"这个模式下 displayMode
  是否还生效"）

---

## 4. 生成逻辑

新增生成器文件，与现有 `generators/special-practice/` 目录下的
`zero-drill.ts`、`fact-family.ts`、`number-bond.ts` 同级：

```
generators/special-practice/comparison/
├── index.ts              # 子类型分发
├── matching.ts            # 题型A生成逻辑
├── circle-more-less.ts    # 题型B生成逻辑
├── fill-difference.ts     # 题型C生成逻辑
└── number-symbol.ts       # 题型D生成逻辑
```

### 共享底层数据结构

题型 A、B、C 都基于"两组数量+对应表现形式"这个共同数据结构，
建议提取共享的基础生成函数：

```typescript
interface QuantityComparisonPair {
  groupA: { emoji: string; count: number };
  groupB: { emoji: string; count: number };
  relation: '>' | '<' | '=';
  difference: number; // |countA - countB|
}

function generateQuantityPair(config: {
  emojiPool: string[];        // 从现有 EMOJI 模式表情符集合中取用
  countRange: { min: number; max: number };
  allowEqual: boolean;
}): QuantityComparisonPair {
  // 随机选两个不同的 emoji（确保 groupA 和 groupB 的图案不同，
  // 参照参考图中每组对比都是两种不同图案，如"车 vs 颜料"）
  // 随机生成两个数量（受 allowEqual 控制是否允许相等）
  // 计算 relation 和 difference
}
```

题型 A/B/C 的生成器分别调用 `generateQuantityPair()`，再根据各自的
渲染需求决定保留哪些字段（题型A需要 relation+difference 都展示给
学生填；题型B只需要 relation 用于生成"多/少"判断题；题型C需要
difference 数字+预先确定好的 relation 文案）。

题型 D（纯数字）不需要 emoji，复用现有 `generateRandomProblem` 之类
的数值生成逻辑（参照现有 `CUSTOM` 难度的随机数生成方式），只是
不进行加减运算，直接比较两个随机数。

### Emoji 池来源

复用现有 `DisplayMode.EMOJI` 模式已经定义的表情符号集合（具体变量
名请在实现时查找现有 `generators/index.ts` 或相关文件中 EMOJI 模式
引用的表情符号常量数组，本 doc 不重复定义，直接复用同一份数据源，
避免出现两份不同步的 emoji 列表）。

---

## 5. UI 渲染

### Preview 组件扩展

`sections/math-genie/components/ProblemVisualizer.tsx`（参照设计
文档中现有职责"渲染个题目在文本/emoji/word-problem/number-bond
模式"）需要扩展支持渲染四种比较题型。建议每种子类型对应一个独立的
子组件，由 `ProblemVisualizer` 按 `comparisonConfig.subType` 分发：

- **题型 A（连线/符号+差值）**：两个卡片容器（emoji 组）+ 中间一个
  可填写的圆圈（`>`/`<`/`=`，建议用 Select 或可点击切换的小组件，
  而非自由文本输入，减少批改难度）+ 下方一个数字输入框
- **题型 B（圈多/少）**：两行 emoji 堆叠展示 + 下方文字，"多"和
  "少"两个字渲染为可点击的选项（如 Chip 或 Radio 样式），不是
  自由文本
- **题型 C（填空差值）**：与题型 B 相同的 emoji 对比布局，下方文字
  固定显示"多"或"少"（生成时已确定，不可选），后接一个数字输入框
- **题型 D（纯数字符号）**：两个数字 + 中间一个 `>`/`<`/`=` 选择
  组件，复用题型 A 的符号选择子组件

**`showAnswers` 开关的适配**：现有 `showAnswers` 字段控制是否显示
答案。比较题型需要确认：开启时，符号选择组件应直接显示正确符号
（而非留空），数字填空应显示正确数字——这部分渲染逻辑应该与现有
`showAnswers` 处理标准加减法题目的方式保持一致的视觉语言（参照
现有 FILL_BLANK 模式 `7+_=10` 在显示/隐藏答案时的处理方式）。

### 设置面板扩展

在 `WorksheetSettings` 组件中，`specialPracticeType` 选择器新增
"比较练习"选项后，需要级联展示 `comparisonConfig.subType` 的二级
选择（四个子类型）。参照前几轮 UI 改造文档中确立的设计原则：

- 子类型选择建议使用分段按钮组（ToggleButtonGroup），选中态跟随
  math-genie 工具身份色（参照 `diyyy-render-fix-detail.md` §3 已
  验证的方案）
- 每个子类型选项建议配 tooltip 简要说明题型样式（吸取此前 audit
  报告中 Special Practice 缺乏说明导致用户不理解题型差异的教训，
  参见 round 1 audit 的 A1/B1 发现）

---

## 6. 待确认的开放问题

以下问题需要在实现前进一步确认，本 doc 暂不擅自决定：

1. **emoji 池的实际取值范围**：现有 EMOJI 模式的表情符号集合是否
   已经包含参考图中出现的车、颜料、星星、蝴蝶、西瓜、樱桃、瓢虫、
   蚂蚱等图案？如果现有集合是更通用的表情符号（如水果、动物等
   常见 emoji），需要确认这些具体图案是否能在 Unicode emoji 范围
   内找到对应符号，还是需要从现有集合里选取"足够接近"的替代图案
   （例如用 🚗 替代图1中的卡通汽车）。建议实现时先列出现有 emoji
   池的完整清单，对照参考图确认覆盖度，而非假设两者完全匹配。

2. **题型 A 中间圆圈的交互方式**：参考图是纸面 worksheet，留空圆圈
   供手写；但 DIYYY 是先在屏幕配置后导出/打印，配置阶段是否需要
   在 Preview 里就显示"占位的空心圆圈"（即打印出来才是空的，配置
   预览时也是空的，只在 `showAnswers` 开启时显示符号）——这是
   产品交互决策，建议比照现有 FILL_BLANK 模式的"空格"处理方式
   保持一致，但请在实现前与产品侧确认。

3. **题型 B/C 是否需要支持 emoji 数量较大的场景**（参考图最多 6
   个 emoji 一组）：现有 `calculateOptimalProblemsPerPage` 的 A4
   排版计算逻辑（参照设计文档 EMOJI 模式排版规则）需要新增比较题型
   对应的每页题数计算规则，具体数值（多少组比较题能放进一页）
   需要实现时实际排版测试后确定，本 doc 不预设具体数字。

4. **每页题数与排版**：题型 A/B/C 这类需要双行 emoji 对比展示的
   题目，占用空间明显大于标准加减法题，需要在 `calculateOptimalProblemsPerPage`
   中新增对应分支，具体每页能放几题需要实际渲染测试后确定。
