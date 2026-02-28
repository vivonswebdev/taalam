export type NooraniExerciseType = "recognition" | "audio-choice";

export type NooraniItem = { arabic: string; label?: string; audioUrl?: string };

export type NooraniLesson = {
  id: string;
  titleKey: string;
  descKey: string;
  level: "beginner" | "intermediate";
  emoji: string;
  items: NooraniItem[];
  exerciseType?: NooraniExerciseType;
};

export const NOORANI_LESSONS: NooraniLesson[] = [
  {
    id: "lesson-1",
    titleKey: "noorani.lesson1Title",
    descKey: "noorani.lesson1Desc",
    level: "beginner",
    emoji: "🔤",
    exerciseType: "recognition",
    items: [
      { arabic: "ا" }, { arabic: "ب" }, { arabic: "ت" }, { arabic: "ث" },
      { arabic: "ج" }, { arabic: "ح" }, { arabic: "خ" }, { arabic: "د" }, { arabic: "ذ" },
    ],
  },
  {
    id: "lesson-2",
    titleKey: "noorani.lesson2Title",
    descKey: "noorani.lesson2Desc",
    level: "beginner",
    emoji: "🔡",
    exerciseType: "recognition",
    items: [
      { arabic: "ر" }, { arabic: "ز" }, { arabic: "س" }, { arabic: "ش" },
      { arabic: "ص" }, { arabic: "ض" }, { arabic: "ط" }, { arabic: "ظ" },
    ],
  },
  {
    id: "lesson-3",
    titleKey: "noorani.lesson3Title",
    descKey: "noorani.lesson3Desc",
    level: "beginner",
    emoji: "🧩",
    exerciseType: "recognition",
    items: [
      { arabic: "ع" }, { arabic: "غ" }, { arabic: "ف" }, { arabic: "ق" },
      { arabic: "ك" }, { arabic: "ل" }, { arabic: "م" }, { arabic: "ن" },
      { arabic: "ه" }, { arabic: "و" }, { arabic: "ي" },
    ],
  },
  {
    id: "lesson-4",
    titleKey: "noorani.lesson4Title",
    descKey: "noorani.lesson4Desc",
    level: "beginner",
    emoji: "📝",
    exerciseType: "audio-choice",
    items: [
      { arabic: "بَ" }, { arabic: "بُ" }, { arabic: "بِ" },
      { arabic: "تَ" }, { arabic: "تُ" }, { arabic: "تِ" },
      { arabic: "مَ" }, { arabic: "مُ" }, { arabic: "مِ" },
      { arabic: "نَ" }, { arabic: "نُ" }, { arabic: "نِ" },
    ],
  },
  {
    id: "lesson-5",
    titleKey: "noorani.lesson5Title",
    descKey: "noorani.lesson5Desc",
    level: "beginner",
    emoji: "🕌",
    items: [
      { arabic: "بً" }, { arabic: "بٌ" }, { arabic: "بٍ" },
      { arabic: "مً" }, { arabic: "مٌ" }, { arabic: "مٍ" },
      { arabic: "نً" }, { arabic: "نٌ" }, { arabic: "نٍ" },
    ],
  },
  {
    id: "lesson-6",
    titleKey: "noorani.lesson6Title",
    descKey: "noorani.lesson6Desc",
    level: "intermediate",
    emoji: "📖",
    items: [
      { arabic: "كِتابًا" }, { arabic: "قَلَمٌ" }, { arabic: "بَيْتٍ" },
      { arabic: "طِفْلٌ" }, { arabic: "رَجُلًا" }, { arabic: "يَوْمٍ" },
    ],
  },
  {
    id: "lesson-7",
    titleKey: "noorani.lesson7Title",
    descKey: "noorani.lesson7Desc",
    level: "intermediate",
    emoji: "⏸️",
    items: [
      { arabic: "أَبْ" }, { arabic: "أَتْ" }, { arabic: "أَحْ" },
      { arabic: "مَبْ" }, { arabic: "مَنْ" }, { arabic: "يَلْ" },
    ],
  },
  {
    id: "lesson-8",
    titleKey: "noorani.lesson8Title",
    descKey: "noorani.lesson8Desc",
    level: "intermediate",
    emoji: "✍️",
    items: [
      { arabic: "يَكْتُبْ" }, { arabic: "يَلْعَبْ" }, { arabic: "نَعْبُدْ" },
      { arabic: "نَرْجِعْ" }, { arabic: "يَسْمَعْ" }, { arabic: "اُدْخُلْ" },
    ],
  },
];
