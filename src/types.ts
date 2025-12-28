export interface LanguageLevels {
  [level: string]: string[];
}

export interface MiemieData {
  [language: string]: LanguageLevels;
}

export interface MiemieLesson {
  word: string[];
  title: string;
  phrase: string[];
  sentence: string[];
}

export interface MiemieDetails {
  "小羊上山-1级": MiemieLesson[];
  "小羊上山-2级": MiemieLesson[];
  "小羊上山-3级": MiemieLesson[];
  "小羊上山-4级": MiemieLesson[];
  "小羊上山-5级": MiemieLesson[];
  "小羊上山-6级": MiemieLesson[];
}

export interface PreviewSheetState {
  currentPage: number;
}