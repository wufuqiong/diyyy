import type { MiemieData, MiemieLesson, MiemieDetails, LanguageLevels } from 'src/types';

export type LessonField = 'word' | 'phrase' | 'sentence';

/**
 * Transform miemie-details.json into a MiemieData structure keyed by language + level.
 * Shared by charcolor, charmaze, and chartrace.
 */
export function loadMiemieLessons(miemieDetails: MiemieDetails, field: LessonField): MiemieData {
  const result: MiemieData = {};

  Object.keys(miemieDetails).forEach((key) => {
    const lessons = miemieDetails[key as keyof MiemieDetails];
    if (!lessons) return;

    const items = lessons.reduce((acc: string[], lesson: MiemieLesson) => acc.concat(lesson[field] || []), []);
    if (items.length === 0) return;

    const isChinese = items.some((item: string) => /[\u4e00-\u9fff]/.test(item));
    const language = isChinese ? 'Chinese' : 'English';

    if (!result[language]) {
      result[language] = {} as LanguageLevels;
    }
    (result[language] as LanguageLevels)[key] = items;
  });

  return result;
}
