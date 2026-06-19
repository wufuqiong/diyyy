---
tool_id: hundred-chart
title_zh: 百数板
title_en: Hundred Chart
route: /hundred-chart
last_reviewed: 2026-06-19
related_components:
  - HundredChartSettings
  - CrossPuzzleSettings
  - HundredChartPreview
---

# 百数板 / Hundred Chart

## 🚀 快速上手 / Quick Start
<!-- anchor: quick-start -->

#### 场景一：生成一张随机填空百数表
<!-- anchor: quick-start-grid-random -->

**中文**
1. 确保「Chart Type」为 **Grid** 模式（默认）
2. 在「Blank Strategy」选择 **Random** — 默认挖 20 个空
3. 拖动 **Blank Count** 滑块调整填空数量（1-99）
4. 预览区实时显示填空结果，点击「保存 PDF」打印

**English**
1. Make sure **Chart Type** is **Grid** (default)
2. Under **Blank Strategy**, choose **Random** — defaults to 20 blanks
3. Drag the **Blank Count** slider to adjust (1–99 blanks)
4. Preview updates live — click **Save PDF** to print

---

#### 场景二：自定义填空位置（手动模式）
<!-- anchor: quick-start-grid-manual -->

**中文**
1. 在「Blank Strategy」选择 **Manual**
2. 直接在右侧预览区的 10×10 格子上**点击**要挖空的格子
3. 格子变白即为挖空，再点恢复。下方按钮可「全清」或「反选」
4. 点击「保存 PDF」导出自定义排版

**English**
1. Under **Blank Strategy**, choose **Manual**
2. **Click cells directly** in the 10×10 preview grid to toggle them blank/filled
3. Clicked cells turn white (blank), click again to restore. Use **Clear All** / **Invert** buttons
4. Click **Save PDF** to export your custom layout

---

#### 场景三：生成十字填空谜题
<!-- anchor: quick-start-cross -->

**中文**
1. 将「Chart Type」切换为 **Cross** 模式
2. 设置「Min Anchor」和「Max Anchor」控制中间数字范围（如 11-90）
3. 选择难度（Easy/Medium/Hard），调整每页题目数
4. 预览区显示十字填空 puzzle，每个 puzzle 有已知数和待填格

**English**
1. Switch **Chart Type** to **Cross**
2. Set **Min Anchor** and **Max Anchor** to control the center number range (e.g. 11–90)
3. Choose difficulty (Easy/Medium/Hard) and questions per page
4. Preview shows cross puzzles — each has known cells and blanks to fill

---

## 🗺️ 功能地图 / Feature Map
<!-- anchor: feature-map -->

| 功能 | 在哪里找到 | 它能做什么 |
|---|---|---|
| Grid 模式（百数填空） | Chart Type → Grid 按钮 | 在 10×10 百数表中挖空，训练数字认知 |
| ⭐ Cross 模式（十字填空） | Chart Type → Cross 按钮 | 生成十字形数学填空 puzzle，训练加减法推理 |
| 随机挖空 | Grid → Blank Strategy → Random | 随机挖掉 N 个格子 |
| 规律挖空 | Grid → Blank Strategy → Pattern | 按步长（step）和偏移（offset）规律挖空 |
| ⭐ 手动挖空 | Grid → Blank Strategy → Manual | **直接在预览区点击格子**来标记/取消挖空 |
| 答案页 | Grid → Blank Strategy → Answer Key | 所有格子填满，用作对答案 |
| ⭐ 多版本 | Multiple Versions → 滑块 | 生成 1-10 个不同排列的版本（防作弊） |
| 包含答案页 | Multiple Versions → Include Answer Key | 每个版本自动附带一张完整答案页 |
| 起始数字可调 | Number Range → Start Number | 如从 101 开始，生成 101-200 的百数表 |
| 十字谜题难度 | Cross → Difficulty Easy/Medium/Hard | 控制已知格数量和位置 |
| 显示公式/示例/题号 | Cross → Display Options（默认展开） | 控制十字谜题中是否显示公式框、示例、题号 |

| Feature | Where to find it | What it does |
|---|---|---|
| Grid mode | Chart Type → Grid | Blank out cells in a 10×10 hundred chart for number recognition |
| ⭐ Cross mode | Chart Type → Cross | Cross-shaped arithmetic fill puzzles for addition/subtraction reasoning |
| Random blanks | Grid → Blank Strategy → Random | Randomly blank N cells |
| Pattern blanks | Grid → Blank Strategy → Pattern | Blank cells at regular intervals (step + offset) |
| ⭐ Manual blanks | Grid → Blank Strategy → Manual | **Click cells in the preview** to toggle blank/filled |
| Answer key | Grid → Blank Strategy → Answer Key | All cells filled — for answer checking |
| ⭐ Multiple versions | Multiple Versions → slider | Generate 1–10 different versions (anti-cheating) |
| Include answer key | Multiple Versions → toggle | Auto-attach a filled answer page per version |
| Adjustable start number | Number Range → Start Number | e.g. start at 101 for a 101–200 chart |
| Cross puzzle difficulty | Cross → Difficulty Easy/Medium/Hard | Controls number of known cells and their positions |
| Show formula/example/numbering | Cross → Display Options (default expanded) | Show formula box, example, and question numbers in Cross mode |

---

## 📖 配置项参考 / Field Reference
<!-- anchor: field-reference -->

#### Chart Type（图表类型）
<!-- anchor: field-chart-type -->

| | 中文 | English |
|---|---|---|
| **是什么** | 切换百数表（Grid）和十字填空（Cross）两种完全不同的练习模式 | Toggle between Grid (hundred chart fill) and Cross (arithmetic puzzles) |
| **Grid** | 10×10 百数表挖空练习，训练数字顺序和位置感 | 10×10 hundred chart with blanks — practice number sequences |
| **Cross** | 十字形数学填空 puzzle，已知数值 + 空白格 → 推理中间数字 | Cross arithmetic puzzles with known values → deduce the center |

#### Blank Strategy（挖空策略）— Grid 模式
<!-- anchor: field-blank-strategy -->

| | 中文 | English |
|---|---|---|
| **Random** | 随机挖空，拖动滑块控制数量（1-99） | Randomly blank cells, slider controls count (1–99) |
| **Pattern** | 按步长规律挖空（如每 5 个挖一个），可设偏移量 | Blank at regular intervals (e.g. every 5th cell), with offset |
| ⭐ **Manual** | 点击预览区格子手动标记挖空位置 | Click cells in the preview to manually set blanks |
| **Answer Key** | 全部填满，用于对答案 | All cells filled — use as answer key |

#### Start Number（起始数字）— Grid 模式
<!-- anchor: field-start-number -->

| | 中文 | English |
|---|---|---|
| **是什么** | 百数表的起始数字，如设为 101 → 生成 101-200 | Starting number — e.g. 101 → generates 101–200 chart |

#### ⭐ Cross Mode — Difficulty Sub-options
<!-- anchor: field-cross-difficulty -->

| | Easy | Medium | Hard |
|---|---|---|---|
| **已知格数** | 2–3 | 5–6 | 5–9 |
| **已知格位置** | 可选择（随机/固定） | 可选择（随机/固定） | 固定 1 格 |
| **提示数** | 2–3 | 2–3 | 1（固定） |

#### ⭐ Display Options（显示选项）— Cross 模式
<!-- anchor: field-display-options -->

| | 中文 | English |
|---|---|---|
| **Show Formula Box** | 是否显示 `__ + __ = __` 公式框 | Whether to show a formula box |
| **Show Example** | 是否显示示例 | Whether to show an example |
| **Show Question Numbers** | 是否显示题号 | Whether to number each question |
| **注意事项** | 此区域默认展开，可在设置面板中折叠 | This section is expanded by default, collapsible in settings |

#### Multiple Versions（多版本）
<!-- anchor: field-multiple-versions -->

| | 中文 | English |
|---|---|---|
| **是什么** | 生成多个不同排列的版本，防止学生互相抄答案 | Generate multiple unique versions to prevent copying |
| **包含答案页** | 每个版本自动附带一张完整答案页 | Each version gets an accompanying filled answer page |

---

## ❓ 常见问题 / FAQ
<!-- anchor: faq -->

**Q: Manual 模式下怎么标记挖空？**
**Q: How do I mark blanks in Manual mode?**

中文：切换到 Manual 模式后，直接在右侧预览区的数字格子上**点击**即可。点一下变白（挖空），再点恢复。下方「Clear All」清空所有标记，「Invert」反转所有标记。

English: Switch to Manual mode, then **click cells directly** in the preview grid. Click once to blank (turn white), click again to restore. **Clear All** removes all blanks; **Invert** flips all cells.

**Q: Cross 模式和 Grid 模式有什么区别？**
**Q: What's the difference between Cross and Grid mode?**

中文：Grid 模式是传统百数表填空（训练数字认识）；Cross 模式是十字形数学填空题（训练加减法推理）。两者的配置项完全不同。切换到 Cross 模式后，所有 Grid 专属配置项（Blank Strategy 等）会隐藏。

English: Grid mode is a traditional hundred chart fill (number recognition). Cross mode generates arithmetic cross puzzles (addition/subtraction reasoning). The settings completely change when you switch modes.

**Q: 为什么我的数字输入变成了别的值？**
**Q: Why did my number change to something else?**

中文：某些数值输入有范围限制（如 Start Number 0-990，Step 2-10）。超出范围时系统会自动修正为最近的合法值。

English: Some numeric inputs have range limits (e.g. Start Number 0–990, Step 2–10). Values outside the range are silently clamped to the nearest valid value.
