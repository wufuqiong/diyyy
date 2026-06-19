---
tool_id: charmaze
title_zh: 识字迷宫
title_en: Character Maze
route: /charmaze
last_reviewed: 2026-06-19
related_components:
  - ControlPanel
  - PreviewSheet
---

# 识字迷宫 / Character Maze

## 🚀 快速上手 / Quick Start
<!-- anchor: quick-start -->

#### 场景一：生成一个单字迷宫
<!-- anchor: quick-start-word-maze -->

**中文**
1. 确认「模式」选择为「单字练习」（默认）
2. 在手动输入框中输入要练习的字（如 `日,月,水,火`）
3. 预览区自动生成迷宫 — 每个字一个独立迷宫页，孩子沿着路径找到目标字

**English**
1. Make sure **Mode** is set to **Characters** (the default)
2. Type the characters in the manual input box (e.g. `日,月,水,火`)
3. Preview auto-generates — one maze page per character. Kids follow the path to find the target character

---

#### 场景二：生成一个词语迷宫
<!-- anchor: quick-start-phrase-maze -->

**中文**
1. 将「模式」切换为「词语练习」
2. 输入词语，用逗号分隔（如 `中国,北京,上海`）
3. 每个词语作为一条路径嵌入迷宫，孩子需要在网格中找到并连起来

**English**
1. Switch **Mode** to **Phrases**
2. Type phrases separated by commas (e.g. `中国,北京,上海`)
3. Each phrase is embedded as a path in the maze — kids find and connect them

---

## 🗺️ 功能地图 / Feature Map
<!-- anchor: feature-map -->

| 功能 | 在哪里找到 | 它能做什么 |
|---|---|---|
| ⭐ WORD 模式 | 加载 → Mode 下拉框 | 每个字独立生成一页迷宫 |
| ⭐ PHRASE 模式 | 加载 → Mode 下拉框 | 词语嵌入迷宫，横向或纵向排列 |
| ⭐ SENTENCE 模式 | 加载 → Mode 下拉框 | 整句作为连续的迷宫路径 |
| 预设字/词/句库 | 加载 → 预设库下拉框（标签随 Mode 变化） | 一键加载教材内容 |
| 预设书册 | 加载 → 预设书册 | 加载某一课内容 |
| 迷宫尺寸 | 选项 → 迷宫尺寸 | 4 种尺寸：8×8 / 9×9 / 10×10 / 12×12 |
| 每页字数 | 选项 → 每页字数（仅 PHRASE 模式） | 控制每页放置几个词语 |

| Feature | Where to find it | What it does |
|---|---|---|
| ⭐ WORD mode | Load → Mode dropdown | One page per character maze |
| ⭐ PHRASE mode | Load → Mode dropdown | Phrases placed as paths |
| ⭐ SENTENCE mode | Load → Mode dropdown | Full sentence as a single maze path |
| Preset word/phrase/sentence library | Load → Library dropdown (label changes with mode) | One-click textbook content load |
| Preset lesson book | Load → Lesson Book | Load one lesson's content |
| Maze size | Options → Maze Size | 4 sizes: 8×8 / 9×9 / 10×10 / 12×12 |
| Words per page | Options → Words Per Page (PHRASE only) | Phrases per maze page |

---

## 📖 配置项参考 / Field Reference
<!-- anchor: field-reference -->

#### 模式 / Mode
<!-- anchor: field-mode -->

| | 中文 | English |
|---|---|---|
| **是什么** | 决定输入内容被解析为什么类型 | Determines how input is parsed |
| **选项** | 单字练习 — 每个字独立迷宫；词语练习 — 逗号分隔的词语嵌入；句子练习 — 换行分隔的句子作为路径 | Characters — one maze per character; Phrases — comma-separated phrases; Sentences — newline-separated sentences as paths |
| **注意事项** | 切换模式会清空已输入内容（有确认提示） | Switching modes clears existing input (with confirmation dialog) |

#### ⭐ 预设字库 / Preset Library
<!-- anchor: field-preset-library -->

| | 中文 | English |
|---|---|---|
| **是什么** | 标签随 Mode 动态变化（"预设字库"/"预设词库"/"预设句库"），从内置教材加载对应类型的内容 | Label changes with Mode — loads textbook content of the matching type |

#### 迷宫尺寸 / Maze Size
<!-- anchor: field-maze-size -->

| | 中文 | English |
|---|---|---|
| **是什么** | 控制迷宫网格的行列数 | Controls maze grid dimensions |
| **注意事项** | 句子模式下，句子长度不能超过总格数（如 8×8=64 格），超长时系统会报错提示 | In Sentence mode, sentence length cannot exceed total cells (e.g. 8×8=64 cells) — the system shows an error if too long |

---

## ⌨️ 输入格式说明 / Input Syntax
<!-- anchor: input-syntax -->

> 同一段文字，在不同模式下会被不同地解析。
> The same text is parsed differently depending on the mode.

**单字模式（Characters）/ 词语模式（Phrases）**

| 输入 | 解析方式 | 输出结果 |
|---|---|---|
| `日月水火` | 按分隔符拆分（无分隔符 = 整体） | 1 个条目「日月水火」 |
| `日,月,水,火` | 按逗号拆分为 4 个条目 | 4 个独立条目 |
| `日 月` | 按空格拆分 | 2 个条目 |

**句子模式（Sentences）**

| 输入 | 解析方式 | 输出结果 |
|---|---|---|
| `你好世界` | 整体作为 1 个句子，逐字拆分 | 1 页迷宫，路径上依次为「你」「好」「世」「界」 |
| `你好\n世界` | 按换行拆分为 2 个句子 | 2 页迷宫，每页一个句子 |

> ⚠️ **关键差异**：句子模式下逗号**不是**分隔符，而是句子内容的一部分。
> 但在单字/词语模式下，逗号就是分隔符。

> ⚠️ **Key difference**: In Sentence mode, commas are NOT separators — they stay as content.
> In Character/Phrase mode, commas ARE separators.

---

## ❓ 常见问题 / FAQ
<!-- anchor: faq -->

**Q: 切换模式后我之前输入的内容不见了？**
**Q: My input disappeared after switching modes?**

中文：系统会弹出确认提示。不同模式对输入格式的要求不同（如单字模式用逗号分隔，句子模式用换行分隔），所以切换模式需要清空并重新输入。

English: A confirmation dialog appears. Each mode expects a different input format, so switching requires clearing and re-entering content.

**Q: 迷宫里的格子显示的不是我输入的字？**
**Q: The maze shows different characters than what I typed?**

中文：你输入的字只会出现在迷宫路径上（需要被找到的）。其他格子是系统自动填充的随机干扰字。干扰字来自内置词库，与你输入的语言相关（中文/英文）。

English: Your input characters only appear on the maze path (the ones to find). Other cells are filled with random distractor characters from the built-in vocabulary.

**Q: 为什么我的词语没有出现在迷宫里？**
**Q: Why isn't my word showing in the maze?**

中文：如果某个词语太长，超出了迷宫网格的容纳空间，系统会报错提示"以下词语无法放入迷宫"。增大迷宫尺寸（如从 8×8 改为 12×12）可以解决。

English: If a word is too long for the grid, the system shows an error listing the unplaced words. Increase the maze size (e.g. 8×8 → 12×12) to fix this.

---

## 📚 术语表 / Glossary
<!-- anchor: glossary -->

**干扰字 / Distractor Characters**
中文：迷宫中除路径上的目标字外，其他格子填充的随机字符。干扰字来自内置词库，与输入语言保持一致（中文输入→中文干扰字，英文→英文字母）。
English: Random characters filling the non-path cells of the maze, drawn from the built-in vocabulary matching your input language.
