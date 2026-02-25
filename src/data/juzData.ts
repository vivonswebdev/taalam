/**
 * Juz (part) mapping for the Quran.
 * Each Juz has a start and end surah:ayah.
 * We only show details for surahs available in our app data (1, 78–114).
 */

export interface JuzInfo {
  juz: number;
  name: string; // Arabic name
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}

// Complete 30 Juz mapping
export const juzData: JuzInfo[] = [
  { juz: 1, name: "آلم", startSurah: 1, startAyah: 1, endSurah: 2, endAyah: 141 },
  { juz: 2, name: "سيقول", startSurah: 2, startAyah: 142, endSurah: 2, endAyah: 252 },
  { juz: 3, name: "تلك الرسل", startSurah: 2, startAyah: 253, endSurah: 3, endAyah: 92 },
  { juz: 4, name: "لن تنالوا", startSurah: 3, startAyah: 93, endSurah: 4, endAyah: 23 },
  { juz: 5, name: "والمحصنات", startSurah: 4, startAyah: 24, endSurah: 4, endAyah: 147 },
  { juz: 6, name: "لا يحب الله", startSurah: 4, startAyah: 148, endSurah: 5, endAyah: 81 },
  { juz: 7, name: "وإذا سمعوا", startSurah: 5, startAyah: 82, endSurah: 6, endAyah: 110 },
  { juz: 8, name: "ولو أننا", startSurah: 6, startAyah: 111, endSurah: 7, endAyah: 87 },
  { juz: 9, name: "قال الملأ", startSurah: 7, startAyah: 88, endSurah: 8, endAyah: 40 },
  { juz: 10, name: "واعلموا", startSurah: 8, startAyah: 41, endSurah: 9, endAyah: 92 },
  { juz: 11, name: "يعتذرون", startSurah: 9, startAyah: 93, endSurah: 11, endAyah: 5 },
  { juz: 12, name: "وما من دابة", startSurah: 11, startAyah: 6, endSurah: 12, endAyah: 52 },
  { juz: 13, name: "وما أبرئ", startSurah: 12, startAyah: 53, endSurah: 14, endAyah: 52 },
  { juz: 14, name: "ربما", startSurah: 15, startAyah: 1, endSurah: 16, endAyah: 128 },
  { juz: 15, name: "سبحان", startSurah: 17, startAyah: 1, endSurah: 18, endAyah: 74 },
  { juz: 16, name: "قال ألم", startSurah: 18, startAyah: 75, endSurah: 20, endAyah: 135 },
  { juz: 17, name: "اقترب", startSurah: 21, startAyah: 1, endSurah: 22, endAyah: 78 },
  { juz: 18, name: "قد أفلح", startSurah: 23, startAyah: 1, endSurah: 25, endAyah: 20 },
  { juz: 19, name: "وقال الذين", startSurah: 25, startAyah: 21, endSurah: 27, endAyah: 55 },
  { juz: 20, name: "أمن خلق", startSurah: 27, startAyah: 56, endSurah: 29, endAyah: 45 },
  { juz: 21, name: "اتل ما أوحي", startSurah: 29, startAyah: 46, endSurah: 33, endAyah: 30 },
  { juz: 22, name: "ومن يقنت", startSurah: 33, startAyah: 31, endSurah: 36, endAyah: 27 },
  { juz: 23, name: "وما لي", startSurah: 36, startAyah: 28, endSurah: 39, endAyah: 31 },
  { juz: 24, name: "فمن أظلم", startSurah: 39, startAyah: 32, endSurah: 41, endAyah: 46 },
  { juz: 25, name: "إليه يرد", startSurah: 41, startAyah: 47, endSurah: 45, endAyah: 37 },
  { juz: 26, name: "حم", startSurah: 46, startAyah: 1, endSurah: 51, endAyah: 30 },
  { juz: 27, name: "قال فما خطبكم", startSurah: 51, startAyah: 31, endSurah: 57, endAyah: 29 },
  { juz: 28, name: "قد سمع", startSurah: 58, startAyah: 1, endSurah: 66, endAyah: 12 },
  { juz: 29, name: "تبارك", startSurah: 67, startAyah: 1, endSurah: 77, endAyah: 50 },
  { juz: 30, name: "عم", startSurah: 78, startAyah: 1, endSurah: 114, endAyah: 6 },
];

/**
 * Given a surah number and ayah number, return which Juz it belongs to.
 */
export function getJuzForAyah(surahNumber: number, ayahNumber: number): number {
  for (let i = juzData.length - 1; i >= 0; i--) {
    const j = juzData[i];
    if (
      surahNumber > j.startSurah ||
      (surahNumber === j.startSurah && ayahNumber >= j.startAyah)
    ) {
      return j.juz;
    }
  }
  return 1;
}

/**
 * Get all surahs that belong (partially or fully) to a given Juz.
 */
export function getSurahsInJuz(juzNumber: number): { surahNumber: number; startAyah: number; endAyah: number | null }[] {
  const juz = juzData.find((j) => j.juz === juzNumber);
  if (!juz) return [];

  const result: { surahNumber: number; startAyah: number; endAyah: number | null }[] = [];

  for (let s = juz.startSurah; s <= juz.endSurah; s++) {
    const startAyah = s === juz.startSurah ? juz.startAyah : 1;
    const endAyah = s === juz.endSurah ? juz.endAyah : null; // null = entire surah
    result.push({ surahNumber: s, startAyah, endAyah });
  }

  return result;
}

/**
 * Get a readable label "Surah X:Y → Surah Z:W" for a Juz
 */
export function getJuzLabel(juzNumber: number): string {
  const juz = juzData.find((j) => j.juz === juzNumber);
  if (!juz) return "";
  if (juz.startSurah === juz.endSurah) {
    return `S${juz.startSurah}:${juz.startAyah} → S${juz.endSurah}:${juz.endAyah}`;
  }
  return `S${juz.startSurah}:${juz.startAyah} → S${juz.endSurah}:${juz.endAyah}`;
}
