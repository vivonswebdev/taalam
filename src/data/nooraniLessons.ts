export type NooraniExerciseType = "recognition" | "audio-choice";

export type NooraniItem = { arabic: string; label?: string; audioUrl?: string };

export type NooraniLesson = {
  id: string;
  titleKey: string;
  descKey: string;
  level: "beginner" | "intermediate" | "advanced";
  emoji: string;
  items: NooraniItem[];
  exerciseType?: NooraniExerciseType;
};

export const NOORANI_LESSONS: NooraniLesson[] = [
  // ═══ BEGINNER ═══
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

  // ═══ INTERMEDIATE ═══
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
  {
    id: "lesson-9",
    titleKey: "noorani.lesson9Title",
    descKey: "noorani.lesson9Desc",
    level: "intermediate",
    emoji: "🔊",
    exerciseType: "recognition",
    items: [
      { arabic: "بَا" }, { arabic: "بُو" }, { arabic: "بِي" },
      { arabic: "تَا" }, { arabic: "تُو" }, { arabic: "تِي" },
      { arabic: "مَا" }, { arabic: "مُو" }, { arabic: "مِي" },
    ],
  },
  {
    id: "lesson-10",
    titleKey: "noorani.lesson10Title",
    descKey: "noorani.lesson10Desc",
    level: "intermediate",
    emoji: "📏",
    items: [
      { arabic: "كِتَابٌ" }, { arabic: "رَسُولٌ" }, { arabic: "عَظِيمٌ" },
      { arabic: "نُورٌ" }, { arabic: "قَدِيرٌ" }, { arabic: "حَكِيمٌ" },
    ],
  },
  {
    id: "lesson-11",
    titleKey: "noorani.lesson11Title",
    descKey: "noorani.lesson11Desc",
    level: "intermediate",
    emoji: "⚡",
    exerciseType: "recognition",
    items: [
      { arabic: "بَّ" }, { arabic: "تَّ" }, { arabic: "سَّ" },
      { arabic: "مَّ" }, { arabic: "نَّ" }, { arabic: "لَّ" },
      { arabic: "رَّ" }, { arabic: "دَّ" },
    ],
  },
  {
    id: "lesson-12",
    titleKey: "noorani.lesson12Title",
    descKey: "noorani.lesson12Desc",
    level: "intermediate",
    emoji: "💪",
    items: [
      { arabic: "رَبَّنَا" }, { arabic: "إِنَّ" }, { arabic: "أَنَّ" },
      { arabic: "ثُمَّ" }, { arabic: "حَقَّ" }, { arabic: "جَنَّةٌ" },
    ],
  },

  // ═══ ADVANCED ═══
  {
    id: "lesson-13",
    titleKey: "noorani.lesson13Title",
    descKey: "noorani.lesson13Desc",
    level: "advanced",
    emoji: "🔗",
    exerciseType: "recognition",
    items: [
      { arabic: "بـ", label: "début" }, { arabic: "ـبـ", label: "milieu" }, { arabic: "ـب", label: "fin" },
      { arabic: "عـ", label: "début" }, { arabic: "ـعـ", label: "milieu" }, { arabic: "ـع", label: "fin" },
      { arabic: "كـ", label: "début" }, { arabic: "ـكـ", label: "milieu" }, { arabic: "ـك", label: "fin" },
    ],
  },
  {
    id: "lesson-14",
    titleKey: "noorani.lesson14Title",
    descKey: "noorani.lesson14Desc",
    level: "advanced",
    emoji: "🌟",
    exerciseType: "recognition",
    items: [
      { arabic: "لا" }, { arabic: "لَا" }, { arabic: "لُو" },
      { arabic: "لِي" }, { arabic: "لَّا" }, { arabic: "لِلَّهِ" },
    ],
  },
  {
    id: "lesson-15",
    titleKey: "noorani.lesson15Title",
    descKey: "noorani.lesson15Desc",
    level: "advanced",
    emoji: "🤫",
    items: [
      { arabic: "الْقَمَرُ", label: "al-Qamar" },
      { arabic: "الْكِتَابُ", label: "al-Kitāb" },
      { arabic: "الْحَمْدُ", label: "al-Ḥamd" },
      { arabic: "الشَّمْسُ", label: "ash-Shams" },
      { arabic: "النَّاسُ", label: "an-Nās" },
      { arabic: "الرَّحْمَنُ", label: "ar-Raḥmān" },
    ],
  },
  {
    id: "lesson-16",
    titleKey: "noorani.lesson16Title",
    descKey: "noorani.lesson16Desc",
    level: "advanced",
    emoji: "🛑",
    items: [
      { arabic: "ۚ", label: "Waqf Lāzim" },
      { arabic: "ۖ", label: "Waqf Jā'iz" },
      { arabic: "ۗ", label: "Qif" },
      { arabic: "ۘ", label: "Saktah" },
      { arabic: "ۙ", label: "Lā Taqif" },
      { arabic: "ۜ", label: "Mu'ānaqah" },
    ],
  },
  {
    id: "lesson-17",
    titleKey: "noorani.lesson17Title",
    descKey: "noorani.lesson17Desc",
    level: "advanced",
    emoji: "📜",
    items: [
      { arabic: "بِسْمِ ٱللَّهِ", label: "Bismillâh" },
      { arabic: "ٱلرَّحْمَٰنِ", label: "ar-Raḥmān" },
      { arabic: "ٱلرَّحِيمِ", label: "ar-Raḥīm" },
      { arabic: "ٱلْحَمْدُ لِلَّهِ", label: "al-Ḥamdu lillāh" },
      { arabic: "رَبِّ ٱلْعَٰلَمِينَ", label: "Rabbi-l-'ālamīn" },
      { arabic: "إِيَّاكَ نَعْبُدُ", label: "Iyyāka na'budu" },
    ],
  },
];
