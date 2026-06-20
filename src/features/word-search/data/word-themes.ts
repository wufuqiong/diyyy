import miemieDetails from 'src/data/miemie-details.json';

export interface WordTheme {
  id: string;
  label_zh: string;
  label_en: string;
  words: string[];
}

interface PhonicsEntry {
  title: string;
  word: string[];
  phrase: string[];
  sentence: string[];
}

function buildThemes(): WordTheme[] {
  const raw = miemieDetails as Record<string, unknown>;
  const phonics = raw.phonics as PhonicsEntry[] | undefined;
  if (!phonics || !Array.isArray(phonics)) return [];

  return phonics.map((entry) => {
    // Filter out phrases containing spaces (multi-word entries can't go in the grid)
    const words = entry.phrase.filter((w) => !w.includes(' '));

    // Generate a readable label from the title (e.g. "th-words" → "th Words")
    const labelEn = entry.title
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const labelZh = labelEn;

    return {
      id: entry.title,
      label_zh: labelZh,
      label_en: labelEn,
      words,
    };
  }).filter((t) => t.words.length > 0);
}

export const WORD_THEMES: WordTheme[] = buildThemes();
