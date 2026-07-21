---
tool_id: chartrace
title_zh: 描红写字
title_en: Character Tracing
route: /chartrace
last_reviewed: 2026-06-19
related_components:
  - ControlPanel
  - PaperSheet
---

# 描红写字 / Character Tracing

## 🚀 快速上手 / Quick Start
<!-- anchor: quick-start -->

#### 场景一：生成一张汉字描红练习页
<!-- anchor: quick-start-basic-tracing -->

**中文**
1. 在「手动输入」框中输入要练习的汉字（如 `你好世界`），每字独立描红
2. 预览区实时更新，A4 纸尺寸展示描红格
3. 调整「描红次数」控制每个字后面几个虚线描红格
4. 点击「保存 PDF」导出打印

**English**
1. Type the characters to trace (e.g. `你好世界`) — each character gets its own row
2. Preview updates live, showing A4-paper-sized tracing grids
3. Use **Trace Copies** slider to control how many dotted trace boxes follow each character
4. Click **Save PDF** to print

---

#### 场景二：快速生成拼音描红
<!-- anchor: quick-start-pinyin -->

**中文**
1. 在「快速预设」区点击 **All Pinyin** 按钮
2. 系统自动填入完整拼音表，切换为英文四线格 + 印刷字体
3. 即可直接打印

**English**
1. Under **Quick Presets**, click **All Pinyin**
2. The full pinyin table auto-fills with English 4-line grid + print font
3. Ready to print

---

#### 场景三：打印英文单词描红
<!-- anchor: quick-start-english -->

**中文**
1. 输入英文内容，用逗号或空格分隔（如 `hello,world`）
2. 系统自动检测英文，切换到四线格和英文字体
3. 调整格子大小（14/17/20mm）和描红次数

**English**
1. Type English content, separated by commas or spaces (e.g. `hello,world`)
2. The system auto-detects English and switches to 4-line staff + English font
3. Adjust grid size (14/17/20mm) and trace copies

---

## 🗺️ 功能地图 / Feature Map
<!-- anchor: feature-map -->

| 功能 | 在哪里找到 | 它能做什么 |
|---|---|---|
| 智能内容识别 | 手动输入 — 自动检测 | 换行→句子模式 / 逗号→词组模式 / 无分隔→单字模式 |
| ⭐ 五种格子类型 | Grid & Layout → Grid Type 按钮 | 田字格 / 米字格 / 方格 / 英文四线格 / 无格子 |
| ⭐ All Pinyin 预设 | 快速预设按钮 | 一键生成完整拼音描红表 |
| ⭐ Alphabet 预设 | 快速预设按钮 | 一键生成完整字母描红表 |
| 格子颜色/透明度 | Grid & Layout | 自定义格子线颜色和透明度 |
| 字体切换 | Text Style → Font Family | 楷体/马正萧/智芒行/衬线体；英文：Fredoka/Patrick Hand/Sans Serif |
| 描红颜色 | Text Style → Trace Color | 虚线描红字的颜色和透明度 |
| 拼音显示 | Page Setup → Pinyin 复选框 | 每个字上方显示拼音（四线格 + 声调） |
| 页标题/副标题 | Page Setup → Page Title / Right Info | 自定义打印页的标题 |

| Feature | Where to find it | What it does |
|---|---|---|
| Smart content detection | Manual Input — auto | Newlines→sentences / commas→phrases / else→characters |
| ⭐ Five grid types | Grid & Layout → Grid Type buttons | Tian / Mi / Square / English 4-line / None |
| ⭐ All Pinyin preset | Quick Presets button | One-click full pinyin table |
| ⭐ Alphabet preset | Quick Presets button | One-click full alphabet |
| Grid color/opacity | Grid & Layout | Custom grid line color and opacity |
| Font switch | Text Style → Font Family | KaiTi/Ma Shan Zheng/Zhi Mang Xing/Serif; English: Fredoka/Patrick Hand/Sans |
| Trace color | Text Style → Trace Color | Color and opacity for dotted trace characters |
| Pinyin display | Page Setup → Pinyin checkbox | Show pinyin above each character with tone marks |
| Page title/subtitle | Page Setup | Customize printed header text |

---

## 📖 配置项参考 / Field Reference
<!-- anchor: field-reference -->

#### ⭐ Quick Presets（快速预设）
<!-- anchor: field-quick-presets -->

| | 中文 | English |
|---|---|---|
| **是什么** | 两个一键直达按钮：All Pinyin 和 Alphabet | Two one-click shortcuts: All Pinyin and Alphabet |
| **All Pinyin** | 自动填入完整拼音音节表 + 切换到四线格 + 印刷英文字体 | Auto-fills full pinyin syllable table + switches to English 4-line grid + print font |
| **Alphabet** | 自动填入 26 个字母 + 切换到四线格 + 印刷英文字体 | Auto-fills alphabet + switches to 4-line grid + print font |

#### 手动输入 / Manual Input + 智能解析
<!-- anchor: field-manual-input -->

| | 中文 | English |
|---|---|---|
| **是什么** | 输入要描红的内容。系统自动检测格式并选择对应模式 | Type tracing content. The system auto-detects format and selects the matching mode |
| **检测规则** | 含换行 → 句子模式 / 含逗号 → 词组模式 / 无特殊符号 → 单字模式 | Newlines → Sentences / commas → Phrases / else → Characters |
| **提示** | 输入框下方 caption 实时显示当前检测到的模式和解析规则 | A caption below the input dynamically shows the detected mode and parsing rule |

#### ⭐ Grid Type（格子类型）
<!-- anchor: field-grid-type -->

| | 中文 | English |
|---|---|---|
| **是什么** | 选择描红练习的格子样式 | Choose the grid pattern for tracing |
| **田 (TIAN)** | 传统田字格，十字线分四等份 | Traditional Chinese grid with crosshair dividing into four quadrants |
| **米 (MI)** | 米字格，十字+对角线 | Rice grid with crosshair + diagonals |
| **口 (SQUARE)** | 纯方格 | Plain square grid |
| **四线 (ENGLISH)** | 英文四线格，含基准线（红色） | English 4-line staff with red baseline |
| **无 (NONE)** | 无格子 | No grid |

#### Trace Copies（描红次数）
<!-- anchor: field-trace-copies -->

| | 中文 | English |
|---|---|---|
| **是什么** | 每个示范字后面跟几个虚线描红格 | How many dotted trace boxes follow each model character |
| **注意事项** | 句子模式下强制为 1（长句子 + 多次描红会超出 A4 空间） | Forced to 1 in Sentence mode |

#### 字体 / Font Family
<!-- anchor: field-font-family -->

| | 中文 | English |
|---|---|---|
| **中文可选** | 楷体（标准）/ 马正萧（行书）/ 智芒行（毛笔）/ 衬线体 | KaiTi (standard) / Ma Shan Zheng (cursive) / Zhi Mang Xing (brush) / Serif |
| **英文可选** | Fredoka（圆体印刷）/ Patrick Hand（手写体）/ Sans Serif（标准） | Fredoka (rounded print) / Patrick Hand (handwriting) / Sans Serif (standard) |
| **注意事项** | 中/英文字体选项根据输入内容自动切换显示 | Font options auto-switch based on input content (Chinese vs English) |

---

## ⌨️ 输入格式说明 / Input Syntax
<!-- anchor: input-syntax -->

> 同一个输入框，格式不同 → 解析方式不同 → 输出结果不同。
> The same text box: different format → different parsing → different output.

#### 中文内容

| 输入 | 检测模式 | 输出结果 |
|---|---|---|
| `你好世界` | 单字 | 4 行：你 / 好 / 世 / 界，每行 + 描红副本 |
| `你好,世界` | 词组 | 2 组：你好（横向重复）、世界 |
| `你好\n世界` | 句子 | 2 句，每句逐字排列，traceCount=1 |

#### 英文内容（自动切换四线格）

| 输入 | 输出结果 |
|---|---|
| `abc` | 逐个字母：a / b / c，各占一行 |
| `hello,world` | 两个单词：hello / world，各占一行 |
| `hello world` | 同上（按空格拆分） |

> ⚠️ **控制字符**：换行符 `⏎` 和逗号 `,` `，` 是控制字符，决定解析模式。
> ⚠️ **Control characters**: newline `⏎` and comma `,` `，` determine the parsing mode.

---

## ❓ 常见问题 / FAQ
<!-- anchor: faq -->

**Q: 为什么我的逗号让描红结果完全变了？**
**Q: Why did a comma change my entire tracing output?**

中文：逗号在描红系统中是控制字符——检测到逗号会自动切换为"词组模式"，每个逗号分隔的片段作为一整行去描红，而不是逐字拆开。详情见上方「输入格式说明」。

English: The comma is a control character — it auto-switches to Phrase mode, where each comma-separated segment becomes one tracing row instead of being split per character. See Input Syntax above.

**Q: 英文四线格按钮为什么是灰色的？**
**Q: Why is the English 4-line grid button disabled?**

中文：输入中检测到了中文字符时，英文四线格不可用（中文不适合在四线格上显示）。清空文本框或只输入英文/拼音即可启用。

English: The English 4-line staff is disabled when Chinese characters are detected in the input. Clear the text or use only English/pinyin to enable it.

---

## 📚 术语表 / Glossary
<!-- anchor: glossary -->

**田字格 / Tian Grid**
中文：传统汉字书写格，由十字虚线将方格四等分，帮助掌握汉字笔画位置和比例。
English: Traditional Chinese writing grid with a crosshair dividing the square into four quadrants for stroke placement.

**米字格 / Mi Grid**
中文：在田字格基础上增加两条对角线，提供更多位置参考线。
English: Tian grid plus two diagonal lines for extra position reference.

**四线格 / Four-line Staff (ENGLISH_LINES)**
中文：英文书写练习的三线两格系统（含红色基准线），用于拼音或英文字母描红。
English: A 3-line, 2-space writing system with a red baseline, used for pinyin or English letter tracing.
