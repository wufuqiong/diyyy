---
tool_id: word-search
title_zh: 单词搜索 / Word Search
title_en: Word Search
route: /word-search
---

## 功能概述
<!-- anchor: overview -->
单词搜索（Word Search）在字母网格中隐藏目标单词，支持横向、纵向、斜向以及正向/反向查找。用户可手动输入单词或从预设主题词库快速加载。

Word Search hides target words in a letter grid. Words can be placed horizontally, vertically, diagonally, and in forward or reverse directions. Users can manually enter words or load them from preset theme libraries.

## 配置项说明
<!-- anchor: field-reference -->

#### 网格大小 / Grid Size
<!-- anchor: field-grid-size -->
| | 中文 | English |
|---|---|---|
| **是什么** | 控制字母网格的行列尺寸 | Controls the dimensions of the letter grid |
| **选项** | 小 (10×10)、中 (14×14)、大 (16×18) | Small (10×10), Medium (14×14), Large (16×18) |
| **注意事项** | 越大的网格可容纳更多/更长的单词，但也更占页面空间 | Larger grids fit more/longer words but use more page space |

#### 难度 / Difficulty
<!-- anchor: field-difficulty -->
| | 中文 | English |
|---|---|---|
| **是什么** | 控制单词放置的方向种类 | Controls which directions words can be placed in |
| **选项** | 简单（横向+纵向）、中等（+斜向）、困难（+反向） | Easy (horizontal + vertical), Medium (+ diagonal), Hard (+ reverse) |
| **注意事项** | 简单模式下只有4个方向，困难模式有8个方向，更容易隐藏单词 | Easy mode has 4 directions, Hard mode has all 8 directions for better hiding |

## 功能地图
<!-- anchor: feature-map -->

| 功能 | 在哪里找到 | 它能做什么 |
|---|---|---|
| 主题词库 | 设置面板 → 单词 → 主题词库 | 从预设主题（季节/动物/食物等）快速加载单词列表 |
| 手动输入 | 设置面板 → 单词 → 单词输入 | 自由输入要隐藏的单词，换行或逗号分隔 |
| 网格大小 | 设置面板 → 网格设置 → 网格大小 | 切换10×10、14×14、16×18三种尺寸 |
| 难度选择 | 设置面板 → 网格设置 → 难度 | 控制单词方向数量（简单/中等/困难） |
| 答案页 | 设置面板 → 显示 → 包含答案页 | 额外生成一页高亮显示所有隐藏单词位置 |
| 字母大小写 | 设置面板 → 显示 → 字母大小写 | 切换网格和单词列表的大小写显示 |
| 列表列数 | 设置面板 → 显示 → 单词列表列数 | 调整下方单词列表的分栏数（1/2/3列） |

| Feature | Where to find it | What it does |
|---|---|---|
| Theme Library | Settings → Words → Theme Library | Quick-load word lists from preset themes (seasons, animals, food, etc.) |
| Manual Input | Settings → Words → Word Input | Free-form word entry, separated by newlines or commas |
| Grid Size | Settings → Grid → Grid Size | Switch between 10×10, 14×14, 16×18 grid sizes |
| Difficulty | Settings → Grid → Difficulty | Control word direction count (Easy/Medium/Hard) |
| Answer Key | Settings → Display → Include Answer Key | Generate an extra page with all hidden words highlighted |
| Letter Case | Settings → Display → Letter Case | Toggle uppercase/lowercase for grid and word list |
| List Columns | Settings → Display → Word List Columns | Adjust word list column count (1/2/3 columns) |

## 常见问题
<!-- anchor: faq -->

**Q: 我的单词放不下怎么办？**
**Q: What if my words don't fit in the grid?**
中文：未放入的单词会显示在页面顶部的黄色警告框中。解决方法：1) 增大网格尺寸；2) 减少单词数量；3) 选择更短的单词；4) 提高难度（更多方向可选）。

English: Unplaced words appear in a yellow warning box at the top of the page. Solutions: 1) Increase grid size; 2) Reduce the number of words; 3) Choose shorter words; 4) Increase difficulty (more directions available).

**Q: 支持中文单词吗？**
**Q: Does it support Chinese words?**
中文：当前版本仅支持英文字母（A–Z）。中文单词搜索需要完全不同的网格和字符系统，暂未支持。

English: The current version only supports English letters (A–Z). Chinese word search would require a completely different grid and character system, not yet supported.

**Q: 如何打印不带答案的练习页？**
**Q: How do I print just the puzzle (without the answer key)?**
中文：关闭设置面板中"显示"区域里的"包含答案页"开关，即可只生成练习题页面。

English: Turn off the "Include Answer Key" switch in the Display section of the settings panel.
