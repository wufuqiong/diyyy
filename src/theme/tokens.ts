// ---------- Colors ----------
export const colors = {
  /** Primary gradient stops used in section headers (e.g. SettingsHeader) */
  primaryGradientStart: '#2563eb',
  primaryGradientEnd: '#4f46e5',

  /** Default grid / trace color — light reddish, standard for 字帖 (zitie) */
  gridDefault: '#e57373',
  traceDefault: '#e57373',

  /** Primary text color */
  ink: '#000000',
  /** Secondary text color (dark grey) */
  inkSecondary: '#333',

  /** Paper / card background */
  paper: '#fafafa',
  paperDark: '#f5f5f5',

  /** Red used for answer display and error states */
  errorRed: '#d32f2f',

  /** Light border (e.g. problem cards) */
  borderLight: '#e0e0e0',

  /** Red baseline for English 4-line grid */
  englishBaseline: '#ef5350',

  /** Fill-blank answer box border */
  fillBlankBox: '#80cbc4',

  /** Emoji mode circle fill */
  emojiCircle: '#fff59d',

  /** Fact family separator bar */
  factFamilyBar: '#ce93d8',
} as const;

// ---------- Spacing ----------
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

// ---------- Fonts ----------
/** KaiTi stack — Chinese calligraphy / 描红 font */
export const kaitiStack = 'KaiTi, STKaiti, "Kaiti SC", "SimKai", serif';

/** Pinyin stack — Andika for literacy-friendly single-story 'a'/'g' + tone marks */
export const pinyinStack =
  '"Andika", "Comic Sans MS", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';

/** English print font for 描红 */
export const englishPrintStack = '"Fredoka", "Comic Sans MS", "Andika", sans-serif';

/** English handwriting font */
export const englishHandStack = '"Patrick Hand", "Comic Sans MS", cursive';

/** Generic sans-serif fallback */
export const sansStack = 'Arial, Helvetica, sans-serif';
