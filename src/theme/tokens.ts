// ---------- Colors ----------

/** Candy palette — high-saturation solid colors for the kid-friendly UI shell */
export const candyColors = {
  red: '#FF6B6B',
  orange: '#FFA63D',
  yellow: '#FFD23F',
  green: '#4ECB71',
  teal: '#2EC4B6',
  blue: '#4D9DE0',
  purple: '#9B72CF',
  pink: '#FF7AAE',
} as const;

/** Surface colors */
export const surface = {
  sky: '#EAF6FF',
  cloudWhite: '#FFFFFF',
} as const;

/** Text ink colors */
export const ink = {
  primary: '#3A3550',
  soft: '#6E6A85',
} as const;

/** Tool identity → candy color mapping (one token per tool, used everywhere) */
export const toolColors: Record<string, string> = {
  charcolor: candyColors.red,
  charmaze: candyColors.orange,
  chartrace: candyColors.green,
  'math-genie': candyColors.blue,
  'hundred-chart': candyColors.purple,
  'word-search': candyColors.pink,
};

/** Soft (light) variant for each tool color — used as nav-item hover/active bg */
export const toolColorSoft: Record<string, string> = {
  charcolor: '#FFE8E8',
  charmaze: '#FFF0E0',
  chartrace: '#E4F7EA',
  'math-genie': '#E6F2FB',
  'hundred-chart': '#F2ECFA',
  'word-search': '#FFE4F0',
};

/** Border radius tokens */
export const radius = {
  card: '28px',
  button: '16px',
  pill: '999px',
} as const;

/** Physical-button shadows (solid offset, not blur) */
export const shadow = {
  buttonRest: '0 4px 0 0 rgba(0,0,0,0.12)',
  buttonPressed: '0 1px 0 0 rgba(0,0,0,0.12)',
  cardRest: '0 6px 0 0 rgba(0,0,0,0.08)',
} as const;

/** Form control candy styling tokens */
export const formControl = {
  borderRadius: '14px',
  borderWidth: '2px',
  borderColor: 'rgba(58,53,80,0.12)',
  focusShadow: (color: string) => `0 0 0 3px ${color}33`,
} as const;

/** Slider candy styling tokens */
export const sliderToken = {
  trackHeight: '8px',
  trackColor: 'rgba(58,53,80,0.1)',
  thumbSize: '24px',
} as const;

/** Preview area layout tokens */
export const previewLayout = {
  stageMaxWidth: '760px',
  sheetRadius: '24px',
  sheetPadding: '40px 44px 48px',
  sheetPaddingCompact: '36px 40px 40px',
  sheetShadow: '0 12px 0 0 rgba(58,53,80,0.06), 0 20px 40px -16px rgba(58,53,80,0.18)',
  navBarRadius: '16px',
  navBarShadow: '0 2px 0 rgba(58,53,80,0.04)',
  navBarGap: '14px',
} as const;

/** Setting card layout tokens */
export const settingCardLayout = {
  radius: '20px',
  padding: '20px',
  gapBetweenCards: '16px',
  gapBetweenFields: '14px',
  gapTitleToFields: '16px',
} as const;

/** Setting card typography tokens */
export const settingCardTypography = {
  sectionTitle: {
    fontSize: '13px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.4px',
  },
  fieldLabel: {
    fontSize: '13px',
    fontWeight: 600,
  },
} as const;

/** Legacy colors — kept for existing worksheet printing */
export const colors = {
  primaryGradientStart: '#2563eb',
  primaryGradientEnd: '#4f46e5',
  gridDefault: '#e57373',
  traceDefault: '#e57373',
  ink: ink.primary,
  inkSecondary: ink.soft,
  paper: '#fafafa',
  paperDark: '#f5f5f5',
  errorRed: '#d32f2f',
  borderLight: '#e0e0e0',
  englishBaseline: '#ef5350',
  fillBlankBox: '#80cbc4',
  emojiCircle: '#fff59d',
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
