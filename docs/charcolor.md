---
tool_id: charcolor
title_zh: 识字涂色
title_en: Character Find & Color
route: /charcolor
last_reviewed: 2026-06-19
related_components:
  - ControlPanel
  - PreviewSheet
---

# 识字涂色 / Character Find & Color

## 🚀 快速上手 / Quick Start
<!-- anchor: quick-start -->

#### 场景一：快速生成一份涂色练习页
<!-- anchor: quick-start-basic -->

**中文**
1. 在「手动输入」框中输入要练习的字（如 `日月水火`），无需分隔符
2. 预览区自动生成：每个字一个颜色，所有字混在圆圈中，让孩子找出对应的字并涂色
3. 点击「保存 PDF」导出打印

**English**
1. Type the characters to practice in the **Manual Input** box (e.g. `日月水火`) — no separators needed
2. The preview auto-generates: each character gets a color, all characters are mixed in circles — kids find and color them
3. Click **Save PDF** to export and print

---

#### 场景二：从教材一键加载生字
<!-- anchor: quick-start-preset -->

**中文**
1. 找到「加载」区域 → 点击「预设字库」下拉框
2. 选择「人教版语文-一年级上」
3. 再选择具体某一课（如「天地人」），系统自动填入该课生字
4. 预览区实时更新，可直接打印

**English**
1. Find the **Load** section → click the **Word Library** dropdown
2. Choose a textbook (e.g. "人教版语文-一年级上")
3. Pick a specific lesson (e.g. "天地人") — characters auto-fill
4. Preview updates live, ready to print

---

## 🗺️ 功能地图 / Feature Map
<!-- anchor: feature-map -->

| 功能 | 在哪里找到 | 它能做什么 |
|---|---|---|
| ⭐ 预设字库 | 加载 → 预设字库下拉框 | 一键加载人教版语文一上等完整教材生字，无需手动输入 |
| ⭐ 预设书册 | 加载 → 预设书册下拉框（需先选级别） | 快速加载某一课的生字 |
| 手动输入 | 内容 → 手动输入框 | 自由输入要练习的汉字（仅支持中文） |
| 随机排列 | 手动输入框下方的 Shuffle 按钮 | 打乱字符顺序，生成不同变体 |
| 每页字数 | 选项 → 每页字数 | 控制每页显示几个不同的字（2/3/4/5） |
| 四套配色 | 选项 → 颜色色系 | 经典 / 柔和 / 鲜艳 / 自然，下方有实时色块预览 |

| Feature | Where to find it | What it does |
|---|---|---|
| ⭐ Preset word library | Load → Word Library dropdown | One-click load from built-in textbooks (e.g. PEP Grade 1) |
| ⭐ Preset lesson book | Load → Lesson Book dropdown (needs level first) | Quickly load characters from a specific lesson |
| Manual input | Content → Manual Input box | Type Chinese characters to practice (Chinese only) |
| Shuffle | Button below Manual Input | Randomize character order for variety |
| Words per page | Options → Words Per Page | How many unique characters per page (2/3/4/5) |
| Color schemes | Options → Color Scheme | 4 presets: Classic / Soft / Vibrant / Natural, with live color preview |

---

## 📖 配置项参考 / Field Reference
<!-- anchor: field-reference -->

#### ⭐ 预设字库 / Word Library
<!-- anchor: field-preset-word-lib -->

| | 中文 | English |
|---|---|---|
| **是什么** | 从内置教材词库中选择级别，自动填入该级别的所有生字 | Select a textbook level to auto-fill all its characters |
| **示例** | 选择「人教版语文-一年级上」→ 输入框自动填入全部 24 课生字 | Picking "PEP Grade 1 Vol. 1" → all 24 lessons' characters auto-fill |

#### ⭐ 预设书册 / Lesson Book
<!-- anchor: field-preset-book -->

| | 中文 | English |
|---|---|---|
| **是什么** | 从已选级别中挑一课，只填入该课生字 | Pick a specific lesson to fill only that lesson's characters |
| **注意事项** | 需要先选预设字库（级别），否则下拉框显示"请先选择级别" | Must choose a word library first, otherwise dropdown shows "Select a level first" |

#### 手动输入 / Manual Input
<!-- anchor: field-manual-input -->

| | 中文 | English |
|---|---|---|
| **是什么** | 自由输入要练习的汉字。每个字独立成一个涂色目标 | Type Chinese characters to practice. Every character is treated individually |
| **示例** | 输入 `日月水火` → 每页生成 4 种颜色的圆圈网格，孩子找出目标字涂色 | Input `日月水火` → each page has a grid of circles with 4 colors, kids find and color each target character |
| **注意事项** | 仅支持中文字符。输入英文或数字时，输入框下方会显示红色警告 | Chinese characters only. A red warning appears below the input if non-Chinese characters are detected |

#### 每页字数 / Words Per Page
<!-- anchor: field-words-per-page -->

| | 中文 | English |
|---|---|---|
| **是什么** | 每页涂色表包含几个不同的字 | How many unique characters per page |
| **示例** | 设为 3 → 每页 3 个不同颜色对应 3 个不同的字 | Set to 3 → each page has 3 colors for 3 different characters |
| **注意事项** | 输入的字数不足时，系统会自动从已有字中循环补充 | When input has fewer characters than wordsPerPage, characters are repeated to fill the page |

---

## ⌨️ 输入规则 / Input Rules
<!-- anchor: input-syntax -->

> 每个输入的字都会被独立处理。逗号、空格等分隔符会被忽略。
> Every character you type is treated individually. Commas, spaces, and other separators are ignored.

| 输入 | 解析方式 | 输出结果 |
|---|---|---|
| `日月水火` | 逐字拆分 | 4 个独立字：日、月、水、火 |
| `日,月,水,火` | 逗号被忽略，逐字拆分 | 同上，4 个独立字 |
| `日 月 水 火` | 空格被忽略，逐字拆分 | 同上，4 个独立字 |
| `hello` | 逐字拆分，但触发非中文警告 | 5 个字母被视为 5 个涂色目标 + 红色警告 |

| Input | How it's parsed | Result |
|---|---|---|
| `日月水火` | Split per character | 4 individual characters |
| `日,月,水,火` | Commas ignored, split per character | Same — 4 individual characters |
| `日 月 水 火` | Spaces ignored, split per character | Same — 4 individual characters |
| `hello` | Split per character, but triggers warning | 5 letters as 5 targets + red warning |

> ⚠️ **仅支持中文字符**。输入框下方会实时检测非中文内容并以红色文字提示。
> ⚠️ **Chinese characters only.** A red warning appears in real time if non-Chinese characters are detected.

---

## ❓ 常见问题 / FAQ
<!-- anchor: faq -->

**Q: 预设字库怎么是空的？**
**Q: Why is the word library empty?**

中文：点击"预设字库"下拉框，里面已内置了人教版语文一上等教材。默认显示"请选择字库"，点开就能看到。

English: Click the **Word Library** dropdown — built-in textbooks are already loaded. The default shows "Select a library" — just click to reveal options.

**Q: 输入了英文/数字怎么办？**
**Q: What if I type English or numbers?**

中文：输入框下方会立即显示红色警告「检测到非中文字符。识字涂色仅支持中文字符。」请替换为中文字符。英文字母和数字不适合识字涂色场景。

English: A red warning appears immediately below the input: "Non-Chinese characters detected. Char Color only supports Chinese characters." Please replace with Chinese characters. English letters and numbers are not suitable for this tool.

**Q: 输入的字不够每页的字数怎么办？**
**Q: What if I don't have enough characters per page?**

中文：系统会自动从已有字中循环补充。例如只输入 `天地`，每页字数为 3，则每页显示 `天地天` 三个字。

English: Characters are automatically repeated from the input to fill each page. E.g. if you input `天地` with 3 words per page, each page shows `天地天`.

---

## 📚 术语表 / Glossary
<!-- anchor: glossary -->

**预设字库 / Word Library**
中文：DIYYY 内置的中文教材词库（如人教版语文一年级上），包含完整课程和生字列表。
English: Built-in Chinese textbook vocabulary database (e.g. PEP Grade 1), containing complete lessons and character lists.
