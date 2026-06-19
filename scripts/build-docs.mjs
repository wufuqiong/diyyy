#!/usr/bin/env node
/**
 * build-docs.mjs
 *
 * Converts docs/{tool-id}.md (the bilingual help doc format) into
 * structured JSON at src/data/docs/{tool-id}.json, consumed by
 * HelpTooltip / HelpDrawer components at import time.
 *
 * Usage:
 *   node scripts/build-docs.mjs
 *
 * Validation:
 *   - Every section anchor must have content
 *   - Every field reference must have both zh and en rows
 *   - Missing required sections produce warnings
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const OUT_DIR = path.join(ROOT, 'src', 'data', 'docs');

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Parse YAML-like frontmatter between --- markers */
function parseFrontmatter(md) {
  const match = md.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const result = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx < 0) continue;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();
    // Parse arrays: [a, b, c]
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
    }
    result[key] = value;
  }
  return result;
}

/** Extract HTML comment anchor: <!-- anchor: foo --> */
function extractAnchor(line) {
  const m = line.match(/<!--\s*anchor:\s*(\S+)\s*-->/);
  return m ? m[1] : null;
}

/** Check if line is a ### heading */
function isH3(line) {
  return /^###\s/.test(line);
}

/** Check if line is a #### heading */
function isH4(line) {
  return /^####\s/.test(line);
}

/**
 * Parse a field-reference table of the form:
 *   | | 中文 | English |
 *   | **是什么** | zh text | en text |
 *   | **示例** | zh text | en text |
 *   | **注意事项** | zh text | en text |
 */
function parseFieldTable(tableBlock) {
  const rows = tableBlock
    .split('\n')
    .filter((l) => l.startsWith('|') && l !== '|' && !l.includes('|---|---|') && !l.includes('中文') && !l.includes('English'));

  const fields = {};
  for (const row of rows) {
    const cells = row.split('|').filter((c) => c.trim() !== '');
    // Expect 3 non-empty cells: key, zh, en
    if (cells.length < 3) continue;
    const key = cells[0].replace(/\*\*/g, '').trim();
    const zh = cells[1].trim();
    const en = cells[2].trim();
    if (key && zh && en) {
      const mapped = mapKey(key);
      if (mapped) fields[mapped] = { zh, en };
    }
  }
  return Object.keys(fields).length > 0 ? fields : null;
}

/** Map Chinese field-reference keys to stable English identifiers */
function mapKey(raw) {
  const map = {
    '是什么': 'what',
    '何时使用': 'when',
    '示例': 'example',
    '注意事项': 'note',
    '选项': 'options',
    '选项说明': 'options',
    What: 'what',
    Example: 'example',
    Note: 'note',
    Options: 'options',
  };
  return map[raw] || raw.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Parse an input-syntax comparison table.
 * Returns an array of { input, parsed, result_zh, result_en } or similar.
 */
function parseSyntaxTable(tableBlock) {
  const lines = tableBlock.split('\n');
  const headerLine = lines.find((l) => l.includes('输入') || (l.includes('Input') && l.includes('How')));
  const rows = lines.filter((l) => {
    const trimmed = l.trim();
    return trimmed.startsWith('|') && !trimmed.includes('---|---') && !trimmed.includes('输入') && !trimmed.includes('How it') && !trimmed.includes('你输入') && trimmed !== '|';
  });

  if (rows.length === 0) return null;

  return rows.map((row) => {
    const cells = row
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);
    return {
      input: cells[0] || '',
      parsed: cells[1] || '',
      result: cells[2] || '',
    };
  });
}

/**
 * Parse FAQ Q&A pairs. Each FAQ entry has a zh question line and
 * an en question line (both starting with **Q:**), followed by
 * a bilingual answer block:
 *
 *   **Q: 中文问题？**
 *   **Q: English question?**
 *   中文：answer text...
 *   English: answer text...
 */
function parseFAQ(text) {
  const qa = [];
  // Match paired Q lines: zh Q followed by en Q
  const pattern = /\*\*Q:\s*(.+?)\*\*\s*\n\*\*Q:\s*(.+?)\*\*\s*\n([\s\S]*?)(?=\n\*\*Q:\s|\n*$)/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const zhQ = match[1].trim();
    const enQ = match[2].trim();
    const body = match[3].trim();
    // Split answer by language
    const zhMatch = body.match(/中文[：:]\s*([\s\S]*?)(?=\nEnglish[：:]|\n*$)/);
    const enMatch = body.match(/English[：:]\s*([\s\S]*?)$/);
    qa.push({
      question_zh: zhQ,
      question_en: enQ,
      answer_zh: zhMatch ? zhMatch[1].trim() : body.trim(),
      answer_en: enMatch ? enMatch[1].trim() : body.trim(),
    });
  }
  return qa;
}

/**
 * Parse glossary terms. Each term is:
 *   **中文 / English**
 *   中文：...
 *   English: ...
 */
function parseGlossary(text) {
  const terms = [];
  const termBlocks = text.split(/\*\*(.+?)\*\*/g).slice(1);
  for (let i = 0; i < termBlocks.length; i += 2) {
    const name = termBlocks[i].trim();
    const body = (termBlocks[i + 1] || '').trim();
    terms.push({ term: name, definition: body });
  }
  return terms;
}

// ---------------------------------------------------------------------------
// Main parser
// ---------------------------------------------------------------------------

function parseDoc(md) {
  const frontmatter = parseFrontmatter(md);
  const toolId = frontmatter.tool_id || 'unknown';

  // Strip frontmatter
  const body = md.replace(/^---[\s\S]*?---\n?/, '');

  const sections = {};
  const fieldRefs = {};
  const syntaxRules = [];
  const faq = [];
  const glossary = [];
  const featureItems = [];
  const quickStarts = [];

  // Split by H2 sections
  const h2s = body.split(/\n(?=##\s)/);
  let currentSection = '';

  for (const h2Block of h2s) {
    const h2Lines = h2Block.split('\n');
    const h2Content = h2Lines.slice(1).join('\n');

    // Extract anchor from the comment line after H2 heading
    const anchorLine = h2Lines[1] || h2Lines[2] || '';
    const anchor = extractAnchor(anchorLine);
    if (anchor) currentSection = anchor;

    // Store section content
    if (anchor) {
      sections[anchor] = {
        title: h2Lines[0].replace(/^##\s*/, '').trim(),
        content: h2Content.trim(),
      };
    }

    // --- H2: field-reference ---
    if (anchor === 'field-reference') {
      const h4s = h2Content.split(/\n(?=####\s)/);
      for (const h4Block of h4s) {
        const h4Lines = h4Block.split('\n');
        const h4Title = h4Lines[0]?.replace(/^####\s*/, '').trim() || '';
        const h4AnchorLine = h4Lines[1] || '';
        const h4Anchor = extractAnchor(h4AnchorLine);
        if (!h4Anchor) continue;

        // Split bilingual title: "⭐ 预设字库 / Word Library" → { zh: "⭐ 预设字库", en: "Word Library" }
        const titleParts = h4Title.split(/\s+\/\s+/);
        const fieldData = parseFieldTable(h4Block);
        if (fieldData) {
          fieldRefs[h4Anchor] = {
            ...fieldData,
            _title_zh: titleParts[0] || '',
            _title_en: titleParts[1] || titleParts[0] || '',
          };
        }
      }
    }

    // --- H2: input-syntax ---
    if (anchor === 'input-syntax') {
      const tables = h2Content.match(/\|.+\|[\s\S]*?(?=\n\n|$)/g);
      if (tables) {
        for (const table of tables) {
          const rows = parseSyntaxTable(table);
          if (rows) syntaxRules.push(...rows);
        }
      }
    }

    // --- H2: feature-map ---
    if (anchor === 'feature-map') {
      // Parse both Chinese and English tables (they appear consecutively)
      const tables = h2Content.match(/\|.+\|[\s\S]*?(?=\n\n|\n\|\n|$)/g);
      const zhRows = [];
      const enRows = [];

      for (const table of tables || []) {
        const header = table.split('\n')[0] || '';
        const rows = table
          .split('\n')
          .filter((l) => l.startsWith('|') && !l.includes('---|---') && !l.includes('在哪里') && !l.includes('Where to') && !l.includes('它能') && !l.includes('What it') && !l.includes('功能') && !l.includes('Feature'));
        if (header.includes('在哪里')) zhRows.push(...rows);
        else if (header.includes('Where to')) enRows.push(...rows);
      }

      for (let i = 0; i < Math.max(zhRows.length, enRows.length); i++) {
        const zhCells = (zhRows[i] || '').split('|').filter((c) => c.trim());
        const enCells = (enRows[i] || '').split('|').filter((c) => c.trim());
        featureItems.push({
          feature_zh: zhCells[0]?.trim() || '',
          feature_en: enCells[0]?.trim() || '',
          location_zh: zhCells[1]?.trim() || '',
          location_en: enCells[1]?.trim() || '',
          description_zh: zhCells[2]?.trim() || '',
          description_en: enCells[2]?.trim() || '',
        });
      }
    }

    // --- H2: faq ---
    if (anchor === 'faq') {
      const qas = parseFAQ(h2Content);
      faq.push(...qas);
    }

    // --- H2: glossary ---
    if (anchor === 'glossary') {
      const terms = parseGlossary(h2Content);
      glossary.push(...terms);
    }

    // --- H2: quick-start ---
    if (anchor === 'quick-start') {
      const h4s = h2Content.split(/\n(?=####\s)/);
      for (const h4Block of h4s) {
        const h4Lines = h4Block.split('\n');
        const h4Anchor = extractAnchor(h4Lines[1] || '');
        if (h4Anchor && h4Block.trim()) {
          quickStarts.push({
            anchor: h4Anchor,
            content: h4Block.trim(),
          });
        }
      }
    }
  }

  // Build output
  return {
    tool_id: toolId,
    title: {
      zh: frontmatter.title_zh || '',
      en: frontmatter.title_en || '',
    },
    route: frontmatter.route || '',
    sections,
    fieldRefs,
    syntaxRules,
    featureItems,
    faq,
    glossary,
    quickStarts,
  };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validate(data, filename) {
  const errors = [];

  if (!data.tool_id) {
    errors.push(`${filename}: missing tool_id in frontmatter`);
  }
  if (!data.title.zh || !data.title.en) {
    errors.push(`${filename}: missing title_zh or title_en in frontmatter`);
  }

  // Validate field refs have bilingual content
  for (const [anchor, ref] of Object.entries(data.fieldRefs)) {
    for (const [key, val] of Object.entries(ref)) {
      if (key.startsWith('_')) continue; // skip internal meta fields
      if (!val.zh) errors.push(`${filename}: field ${anchor}.${key} missing zh`);
      if (!val.en) errors.push(`${filename}: field ${anchor}.${key} missing en`);
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  if (!fs.existsSync(DOCS_DIR)) {
    console.warn('No docs directory found');
    process.exit(0);
  }

  const mdFiles = fs.readdirSync(DOCS_DIR).filter((f) => f.endsWith('.md'));
  if (mdFiles.length === 0) {
    console.warn('No .md files in docs/');
    process.exit(0);
  }

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  let totalErrors = 0;

  for (const file of mdFiles) {
    const md = fs.readFileSync(path.join(DOCS_DIR, file), 'utf-8');
    // Skip files that don't have the tool_id frontmatter (non-help docs)
    if (!md.includes('tool_id:')) {
      console.log(`⏭️  ${file} (skipped: no tool_id frontmatter)`);
      continue;
    }
    const data = parseDoc(md);
    const errors = validate(data, file);

    if (errors.length > 0) {
      console.error(`\n❌ ${file} has ${errors.length} error(s):`);
      for (const err of errors) console.error(`   - ${err}`);
      totalErrors += errors.length;
    }

    const jsonFile = file.replace('.md', '.json');
    fs.writeFileSync(
      path.join(OUT_DIR, jsonFile),
      JSON.stringify(data, null, 2),
      'utf-8',
    );
    console.log(`✅ ${file} → src/data/docs/${jsonFile}`);
  }

  if (totalErrors > 0) {
    console.error(`\n❌ Build failed with ${totalErrors} error(s)`);
    process.exit(1);
  }

  console.log(`\n✅ All ${mdFiles.length} doc(s) parsed successfully`);
}

main();
