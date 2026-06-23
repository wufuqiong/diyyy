# DIYYY

**Free, printable worksheet generator for kids.** Customize content, preview in real time, and print with one click — no sign-up, no server, everything runs in your browser.

[https://diyyy.netlify.app](https://diyyy.netlify.app/)

---

## Tools

### Math Genie
Generate arithmetic worksheets with addition, subtraction, mixed operations, and multi-step problems. Choose from text, emoji, or word-problem display modes. Supports fill-in-the-blank, fact families, number bonds, zero drills, and customizable difficulty ranges. Font sizes auto-scale to fit large numbers and long equations on one line.

### Char Trace
Create Chinese character tracing sheets with Tianzige (田字格), Mizige (米字格), square, or English 4-line grids. Adjust trace count, font, colors, pinyin display, and stroke count. Supports characters, phrases, sentences, Pinyin, and alphabet practice. Load content from preset lesson libraries.

### Char Maze
Build character recognition mazes in word, phrase, or sentence modes with adjustable grid sizes (8×8 to 12×12). Select lessons from preset libraries via multi-select, or type custom content. Mode is controlled via toggle buttons that also load content from selected lessons.

### Char Color
Generate "find and color" worksheets — kids locate and color target characters among others. Choose from 4 color presets, adjust words per page, and load content from multi-select lesson books.

### Hundred Chart
10×10 hundred-chart worksheets with two modes: grid fill-in (random/pattern/manual blank strategies) and cross puzzles (arithmetic puzzles with configurable difficulty). Multi-version support with optional answer keys.

### Word Search
English word-search worksheets: target words hidden in a letter grid with configurable grid size, difficulty, and display options. Load preset themes or type custom words. Supports answer key pages.

---

## Features

- **Fully client-side** — nothing is uploaded, works offline after first load
- **Real-time preview** — see exactly what will print as you adjust settings
- **Print-optimized** — styled for clean A4 output with proper page breaks
- **Bilingual** — English and Chinese (中文) interface
- **Persistent settings** — your config per tool is saved locally
- **Lesson libraries** — built-in character sets organized by level and book

---

## Development

```bash
yarn dev        # Start dev server at localhost:3039
yarn build      # Type-check and build for production
yarn test:run   # Run tests
```

Built with React 19, MUI v7, TypeScript, and Vite 6. See [CLAUDE.md](./CLAUDE.md) for architecture details.

---

## License

MIT © [minimals.cc](https://minimals.cc)
