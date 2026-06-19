---
tool_id: math-genie
title_zh: 数学练习生成器
title_en: Math Worksheet Generator
route: /math-genie
last_reviewed: 2026-06-19
related_components:
  - WorksheetSettings
  - WorksheetPreview
---

# 数学练习生成器 / Math Worksheet Generator

## 🚀 快速上手 / Quick Start
<!-- anchor: quick-start -->

#### 场景一：快速生成一份加法练习题
<!-- anchor: quick-start-basic-addition -->

**中文**
1. 打开页面，右侧预览区已自动生成了一份加法练习（默认 1-5 以内）
2. 如需调整数量，拖动「页数」滑块 — 总题数实时显示在下方
3. 确认效果后，点击右上角「保存 PDF」按钮导出

**English**
1. Open the page — a set of addition problems (1–5 range) is already generated in the preview area
2. To adjust the amount, drag the **Pages** slider — the total problem count updates live
3. Click **Save PDF** in the top right to export

---

#### 场景二：练习"凑十法"（数形结合）
<!-- anchor: quick-start-number-bond -->

**中文**
1. 找到「专项练习」区域，选择「数的分合」（Number Bond）
2. 系统自动生成"整体 = 部分 + 部分"结构的拆分题
3. 建议难度选「简单」（1-5），搭配使用效果最佳

**English**
1. Find **Special Practice** and choose **Number Bond**
2. The generator creates "whole = part + part" decomposition problems
3. Pairs best with **Easy** difficulty (1–5 range)

---

#### 场景三：混合不同难度的题目
<!-- anchor: quick-start-mix-difficulty -->

**中文**
1. 找到「难度」区域，点击顶部的 **Mix** 标签（而非默认的 Single）
2. 拉动四个比例滑块（Easy / Medium / Hard / Custom），设定各难度的占比
3. 确认「Total: 100%」显示绿色后，右侧预览自动刷新

**English**
1. In the **Difficulty** section, click the **Mix** tab (not the default Single)
2. Adjust the four ratio sliders to set the percentage of each difficulty level
3. Once "Total: 100%" turns green, the preview updates automatically

---

## 🗺️ 功能地图 / Feature Map
<!-- anchor: feature-map -->

| 功能 | 在哪里找到 | 它能做什么 |
|---|---|---|
| 四种显示模式 | 设置面板 → OUTPUT → Display Mode 按钮 | Text 纯算式 / Emoji 图案算式 / Word Problem 应用题 |
| 8 套 Emoji 主题 | 仅在 Display Mode = Emoji 时出现 | Animals / Vehicles / Fruits / Sports / Food / Nature / Weather / Emotions，也可自由输入关键词 |
| ⭐ 四种专项练习 | 设置面板 → PROBLEM → Special Practice 按钮 | Zero Drill（含零运算）/ Fact Family（算式家族）/ Number Bond（数的分合）/ Comparison（比多少应用题） |
| ⭐ 难度混合模式 | 设置面板 → DIFFICULTY → 点 **Mix** 标签 | 按百分比混合 Easy/Medium/Hard/Custom 四种难度的题目 |
| 自定义数值范围 | 难度选 Custom → 出现范围滑块 | 限定算式数值在 min-max 区间内 |
| 多步运算 | Operation 选 Multi → 出现 Mode + Operands 设置 | Chain Addition（连加）/ Chain Subtraction（连减）/ Mixed（加减混合），支持 3-6 个数字 |
| 填空模式 | 设置面板 → PROBLEM → `7 + _ = 10` | 将答案位变为填空，适合随堂测验 |
| 排除零题目 | 设置面板 → RULES → Exclude all zeros | 防止出现 `5+0=5` 这类低练习价值题目 |
| Auto Preview 开关 | 设置面板 → PREVIEW | 关闭后需手动点击 Generate 按钮 |
| 打印 / 保存 PDF | Settings 面板顶部工具栏 | 一键打印或导出为 PDF 文件 |

| Feature | Where to find it | What it does |
|---|---|---|
| Four display modes | Settings → OUTPUT → Display Mode buttons | Text / Emoji / Word Problem |
| 8 Emoji themes | Visible only when Display Mode = Emoji | Animals / Vehicles / Fruits / Sports / Food / Nature / Weather / Emotions — or type your own keyword |
| ⭐ Four special practice modes | Settings → PROBLEM → Special Practice buttons | Zero Drill / Fact Family / Number Bond / Comparison word problems |
| ⭐ Mix difficulty | Settings → DIFFICULTY → click the **Mix** tab | Blend Easy/Medium/Hard/Custom problems by percentage |
| Custom number range | Difficulty = Custom → range slider appears | Constrain operands to a min–max interval |
| Multi-step operations | Operation = Multi → Mode + Operands panel | Chain Addition / Chain Subtraction / Mixed, 3–6 numbers |
| Fill Blank mode | Settings → PROBLEM → `7 + _ = 10` button | Hides the answer slot — great for quizzes |
| Exclude zero problems | Settings → RULES → toggle | Prevents `5+0=5` type problems |
| Auto Preview toggle | Settings → PREVIEW | Turn off to require manual Generate clicks |
| Print / Save PDF | Settings panel top toolbar | One-click print or PDF export |

---

## 📖 配置项参考 / Field Reference
<!-- anchor: field-reference -->

#### 显示模式 / Display Mode
<!-- anchor: field-display-mode -->

| | 中文 | English |
|---|---|---|
| **是什么** | 控制题目在练习题单上的呈现形式 | Controls how problems are rendered on the worksheet |
| **选项** | `📝 Text` — 纯算式；`🎨 Emoji` — 图案代替数字；`📖 Word Problem` — 文字应用题 | `📝 Text` — raw equations; `🎨 Emoji` — emojis replace numbers; `📖 Word Problem` — written story problems |
| **注意事项** | 切换到 Emoji 时出现 Theme 选项；切换到 Word Problem 时强制单栏布局 | Switching to Emoji reveals the Theme field; Word Problem forces single-column layout |

#### 主题 / Theme
<!-- anchor: field-theme -->

| | 中文 | English |
|---|---|---|
| **是什么** | 仅 Emoji 模式下生效，决定题目中使用的图案类型 | Only active in Emoji mode; determines which emoji set appears in problems |
| **选项** | Autocomplete freeSolo — 8 个预设（Animals / Vehicles 等），也可自由输入英文关键词 | 8 presets (Animals, Vehicles, etc.) or type your own English keyword |
| **示例** | 输入 `animals` 或从下拉选 "Animals 🐶" → 题目中出现 🐶🐱🐭🐹🐰 等动物 emoji | Type `animals` or pick "Animals 🐶" from the dropdown → problems use 🐶🐱🐭🐹🐰 etc. |
| **注意事项** | 输入的中文关键词只影响标题语言，不影响 emoji 匹配；未识别的关键词会 fallback 到默认星星图案 | Chinese keywords only affect the title language; unrecognized keywords fall back to a default star emoji set |

#### 页数 / Number of Pages
<!-- anchor: field-pages -->

| | 中文 | English |
|---|---|---|
| **是什么** | 控制生成几页练习题单 | How many pages of problems to generate |
| **示例** | 设置为 3 页、每页 16 题 → 总题数 48。超过计算上限时显示警告 | Set to 3 pages, 16 per page → 48 total problems. A warning appears if the count exceeds the max unique combinations |

#### 运算类型 / Operation
<!-- anchor: field-operation -->

| | 中文 | English |
|---|---|---|
| **是什么** | 选择加法、减法、混合、或多步运算 | Choose Addition, Subtraction, Mixed, or Multi-step operations |
| **注意事项** | Multi 模式与 Emoji 模式、填空模式、专项练习部分互斥，系统会自动提示并调整 | Multi-step mode is incompatible with Emoji, Fill Blank, and some Special Practice modes — the system auto-adjusts with a notice |

#### 问题类型 / Problem Type
<!-- anchor: field-problem-type -->

| | 中文 | English |
|---|---|---|
| **是什么** | Standard 显示 `7+3=10`，Fill Blank 显示 `7+_=10` | Standard shows `7+3=10`; Fill Blank shows `7+_=10` |
| **注意事项** | Emoji 模式 + Fill Blank 需要配合专项练习使用 | Emoji mode + Fill Blank requires a Special Practice to be selected |

#### ⭐ 专项练习 / Special Practice
<!-- anchor: field-special-practice -->

| | 中文 | English |
|---|---|---|
| **是什么** | 四种针对性练习模式，超越常规加减法 | Four targeted practice modes beyond standard arithmetic |
| **选项** | **Zero Drill**：专门练习含 0 的运算。**Fact Family**：用同一组数字生成 4 道相关算式（如 3+5=8, 8-5=3）。**Number Bond**：整体=部分+部分的拆分图示。**Comparison**：比较多少的应用题，自动切换到应用题模式 | **Zero Drill**: practice operations involving zero. **Fact Family**: 4 related equations from one number set. **Number Bond**: "whole = part + part" diagrams. **Comparison**: "who has more/less" word problems — forces Word Problem mode |
| **示例** | Fact Family + 数字 3,5,8 → `3+5=8` `5+3=8` `8-3=5` `8-5=3` |

#### 多步运算 / Multi-Operation Config
<!-- anchor: field-multi-operation -->

| | 中文 | English |
|---|---|---|
| **是什么** | 仅在 Operation = Multi 时出现 | Only visible when Operation = Multi |
| **选项** | Mode：Chain Addition（连加）/ Chain Subtraction（连减）/ Mixed。Operands：3-6，更多数字 = 更难 | Mode: Chain Addition / Chain Subtraction / Mixed. Operands: 3–6 — more numbers = harder |

#### ⭐ 难度 / Difficulty（含 Mix 模式）
<!-- anchor: field-difficulty -->

| | 中文 | English |
|---|---|---|
| **是什么** | 控制题目中数字的范围和难度构成 | Controls the number range and difficulty composition |
| **Single 标签** | Easy（1-5）/ Medium（1-10）/ Hard（1-20）/ Custom（自定义范围 1-100） | Easy (1–5) / Medium (1–10) / Hard (1–20) / Custom (1–100) |
| **Mix 标签** | 按百分比混合四种难度。拉动 Easy/Medium/Hard/Custom 四个滑块，确保总计 = 100% | Blend difficulty levels by percentage. Adjust four sliders, ensure total = 100% |

#### 排除全零 / Exclude All Zeros
<!-- anchor: field-exclude-zeros -->

| | 中文 | English |
|---|---|---|
| **是什么** | 禁止任何操作数、中间结果或答案为 0 的题目 | Prevents problems where any operand, intermediate, or final value equals zero |
| **注意事项** | 与 Zero Drill 专项练习互斥——开启一个会自动关闭另一个 | Mutually exclusive with Zero Drill — enabling one auto-disables the other |

#### 排除比较题 / Exclude Comparison
<!-- anchor: field-exclude-comparison -->

| | 中文 | English |
|---|---|---|
| **是什么** | 仅在 Word Problem 模式下出现。禁止生成比较型应用题 | Only visible in Word Problem mode. Prevents comparison-type word problems |
| **注意事项** | 与 Comparison 专项练习互斥 | Mutually exclusive with Comparison special practice |

#### 自动预览 / Auto Preview
<!-- anchor: field-auto-preview -->

| | 中文 | English |
|---|---|---|
| **是什么** | 开启时改配置立即刷新预览；关闭后需手动点击 Generate | When on, preview refreshes immediately on config change; when off, click Generate manually |

---

## ❓ 常见问题 / FAQ
<!-- anchor: faq -->

**Q: 为什么我设置了 50 页题目，但只出了 30 页？**
**Q: I set 50 pages but only got 30?**

中文：你的数值范围决定了最多能生成多少道不重复的题目。比如 1-5 加法只有约 15 种不同组合。系统会在达到上限时显示"Max unique: N. Some will repeat."。扩大数值范围可以增加不重复题目数。

English: Your number range limits how many unique problems exist. For example, addition within 1–5 has only about 15 unique combinations. The system shows "Max unique: N. Some will repeat." when you exceed this. Widen the range for more unique problems.

---

**Q: 我选了 Emoji 模式但看不到可爱的小动物图案？**
**Q: I selected Emoji mode but don't see cute animal icons?**

中文：检查「主题」（Theme）输入框是否为空或输入了无效关键词。在 Emoji 模式下，Theme 输入框会出现在 OUTPUT 区域。从下拉选一个预设（如 "Animals 🐶"）即可。

English: Check that the **Theme** field (visible only in Emoji mode) is set to a valid preset — pick one from the dropdown (e.g. "Animals 🐶"). An empty or unrecognized keyword falls back to default star emojis.

---

**Q: 为什么 Multi 按钮是灰色的？**
**Q: Why is the Multi button disabled?**

中文：Multi 模式与 Emoji 模式、填空模式、专项练习互斥。鼠标悬停在灰掉的按钮上会显示具体原因。如要继续使用 Multi，请先关闭这些不兼容的选项。

English: Multi-step operations are incompatible with Emoji mode, Fill Blank, and Special Practice. Hover over the greyed-out button to see the specific reason. Disable the incompatible option to re-enable Multi.

---

## 📚 术语表 / Glossary
<!-- anchor: glossary -->

**算式家族 / Fact Family**
中文：用同一组数字（如 3、5、8）生成的一组相关加减法算式，帮助理解加减互逆关系。
English: A set of related equations from the same three numbers (e.g. 3, 5, 8 → `3+5=8`, `8-5=3`), demonstrating the inverse relationship.

**数的分合 / Number Bond**
中文：用图示表示"整体 = 部分 + 部分"的数学关系，常见于低年级数学启蒙。
English: A visual model showing "whole = part + part," commonly used in early math education.

**零的练习 / Zero Drill**
中文：专项练习含零的加减法运算（如 5+0、3-0），帮助理解零在加法中的特性和减法中"一个数减零等于它本身"。
English: Targeted practice with zero in addition and subtraction (e.g. 5+0, 3-0), building understanding of the additive identity.
