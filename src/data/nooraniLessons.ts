export type NooraniLesson = {
  id: string;
  titleKey: string;
  descKey: string;
  level: "beginner" | "intermediate";
  emoji: string;
  items: { arabic: string; label?: string }[];
};

export const NOORANI_LESSONS: NooraniLesson[] = [
  {
    id: "lesson-1",
    titleKey: "noorani.lesson1Title",
    descKey: "noorani.lesson1Desc",
    level: "beginner",
    emoji: "🔤",
    items: [
      { arabic: "ا", label: "Alif" },
      { arabic: "ب", label: "Baa" },
      { arabic: "ت", label: "Taa" },
      { arabic: "ث", label: "Thaa" },
      { arabic: "ج", label: "Jiim" },
      { arabic: "ح", label: "Haa" },
      { arabic: "خ", label: "Khaa" },
      { arabic: "د", label: "Daal" },
      { arabic: "ذ", label: "Dhaal" },
    ],
  },
  {
    id: "lesson-2",
    titleKey: "noorani.lesson2Title",
    descKey: "noorani.lesson2Desc",
    level: "beginner",
    emoji: "🔡",
    items: [
      { arabic: "ر", label: "Raa" },
      { arabic: "ز", label: "Zaay" },
      { arabic: "س", label: "Siin" },
      { arabic: "ش", label: "Shiin" },
      { arabic: "ص", label: "Saad" },
      { arabic: "ض", label: "Daad" },
      { arabic: "ط", label: "Taa" },
      { arabic: "ظ", label: "Dhaa" },
    ],
  },
  {
    id: "lesson-3",
    titleKey: "noorani.lesson3Title",
    descKey: "noorani.lesson3Desc",
    level: "beginner",
    emoji: "🧩",
    items: [
      { arabic: "ع", label: "'Ayn" },
      { arabic: "غ", label: "Ghayn" },
      { arabic: "ف", label: "Faa" },
      { arabic: "ق", label: "Qaaf" },
      { arabic: "ك", label: "Kaaf" },
      { arabic: "ل", label: "Laam" },
      { arabic: "م", label: "Miim" },
      { arabic: "ن", label: "Nuun" },
      { arabic: "ه", label: "Haa" },
      { arabic: "و", label: "Waaw" },
      { arabic: "ي", label: "Yaa" },
    ],
  },
  {
    id: "lesson-4",
    titleKey: "noorani.lesson4Title",
    descKey: "noorani.lesson4Desc",
    level: "beginner",
    emoji: "📝",
    items: [
      { arabic: "بَ", label: "Ba (Fatha)" },
      { arabic: "بُ", label: "Bu (Damma)" },
      { arabic: "بِ", label: "Bi (Kasra)" },
      { arabic: "تَ", label: "Ta (Fatha)" },
      { arabic: "تُ", label: "Tu (Damma)" },
      { arabic: "تِ", label: "Ti (Kasra)" },
      { arabic: "مَ", label: "Ma (Fatha)" },
      { arabic: "مُ", label: "Mu (Damma)" },
      { arabic: "مِ", label: "Mi (Kasra)" },
    ],
  },
  {
    id: "lesson-5",
    titleKey: "noorani.lesson5Title",
    descKey: "noorani.lesson5Desc",
    level: "beginner",
    emoji: "🕌",
    items: [
      { arabic: "بً", label: "Ban (Tanwiin Fatha)" },
      { arabic: "بٌ", label: "Bun (Tanwiin Damma)" },
      { arabic: "بٍ", label: "Bin (Tanwiin Kasra)" },
      { arabic: "مً", label: "Man (Tanwiin Fatha)" },
      { arabic: "مٌ", label: "Mun (Tanwiin Damma)" },
      { arabic: "مٍ", label: "Min (Tanwiin Kasra)" },
    ],
  },
  {
    id: "lesson-6",
    titleKey: "noorani.lesson6Title",
    descKey: "noorani.lesson6Desc",
    level: "intermediate",
    emoji: "⏸️",
    items: [
      { arabic: "أَبْ", label: "Ab (Sukuun)" },
      { arabic: "أَتْ", label: "At (Sukuun)" },
      { arabic: "أَحْ", label: "Ah (Sukuun)" },
      { arabic: "مَبْ", label: "Mab (Sukuun)" },
      { arabic: "مَنْ", label: "Man (Sukuun)" },
      { arabic: "يَلْ", label: "Yal (Sukuun)" },
    ],
  },
];
