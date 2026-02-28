export type NooraniLesson = {
  id: string;
  titleKey: string;
  descKey: string;
  level: "beginner" | "intermediate";
  emoji: string;
  items: { arabic: string; label?: string; audioUrl?: string }[];
};

export const NOORANI_LESSONS: NooraniLesson[] = [
  {
    id: "lesson-1",
    titleKey: "noorani.lesson1Title",
    descKey: "noorani.lesson1Desc",
    level: "beginner",
    emoji: "🔤",
    items: [
      { arabic: "ا", label: "Alif", audioUrl: "/audio/noorani/letters/alif.mp3" },
      { arabic: "ب", label: "Baa", audioUrl: "/audio/noorani/letters/ba.mp3" },
      { arabic: "ت", label: "Taa", audioUrl: "/audio/noorani/letters/ta.mp3" },
      { arabic: "ث", label: "Thaa", audioUrl: "/audio/noorani/letters/tha.mp3" },
      { arabic: "ج", label: "Jiim", audioUrl: "/audio/noorani/letters/jim.mp3" },
      { arabic: "ح", label: "Haa", audioUrl: "/audio/noorani/letters/ha.mp3" },
      { arabic: "خ", label: "Khaa", audioUrl: "/audio/noorani/letters/kha.mp3" },
      { arabic: "د", label: "Daal", audioUrl: "/audio/noorani/letters/dal.mp3" },
      { arabic: "ذ", label: "Dhaal", audioUrl: "/audio/noorani/letters/dhal.mp3" },
    ],
  },
  {
    id: "lesson-2",
    titleKey: "noorani.lesson2Title",
    descKey: "noorani.lesson2Desc",
    level: "beginner",
    emoji: "🔡",
    items: [
      { arabic: "ر", label: "Raa", audioUrl: "/audio/noorani/letters/ra.mp3" },
      { arabic: "ز", label: "Zaay", audioUrl: "/audio/noorani/letters/zay.mp3" },
      { arabic: "س", label: "Siin", audioUrl: "/audio/noorani/letters/sin.mp3" },
      { arabic: "ش", label: "Shiin", audioUrl: "/audio/noorani/letters/shin.mp3" },
      { arabic: "ص", label: "Saad", audioUrl: "/audio/noorani/letters/sad.mp3" },
      { arabic: "ض", label: "Daad", audioUrl: "/audio/noorani/letters/dad.mp3" },
      { arabic: "ط", label: "Taa", audioUrl: "/audio/noorani/letters/taa.mp3" },
      { arabic: "ظ", label: "Dhaa", audioUrl: "/audio/noorani/letters/dhaa.mp3" },
    ],
  },
  {
    id: "lesson-3",
    titleKey: "noorani.lesson3Title",
    descKey: "noorani.lesson3Desc",
    level: "beginner",
    emoji: "🧩",
    items: [
      { arabic: "ع", label: "'Ayn", audioUrl: "/audio/noorani/letters/ayn.mp3" },
      { arabic: "غ", label: "Ghayn", audioUrl: "/audio/noorani/letters/ghayn.mp3" },
      { arabic: "ف", label: "Faa", audioUrl: "/audio/noorani/letters/fa.mp3" },
      { arabic: "ق", label: "Qaaf", audioUrl: "/audio/noorani/letters/qaf.mp3" },
      { arabic: "ك", label: "Kaaf", audioUrl: "/audio/noorani/letters/kaf.mp3" },
      { arabic: "ل", label: "Laam", audioUrl: "/audio/noorani/letters/lam.mp3" },
      { arabic: "م", label: "Miim", audioUrl: "/audio/noorani/letters/mim.mp3" },
      { arabic: "ن", label: "Nuun", audioUrl: "/audio/noorani/letters/nun.mp3" },
      { arabic: "ه", label: "Haa", audioUrl: "/audio/noorani/letters/haa.mp3" },
      { arabic: "و", label: "Waaw", audioUrl: "/audio/noorani/letters/waw.mp3" },
      { arabic: "ي", label: "Yaa", audioUrl: "/audio/noorani/letters/ya.mp3" },
    ],
  },
  {
    id: "lesson-4",
    titleKey: "noorani.lesson4Title",
    descKey: "noorani.lesson4Desc",
    level: "beginner",
    emoji: "📝",
    items: [
      { arabic: "بَ", label: "Ba (Fatha)", audioUrl: "/audio/noorani/harakat/ba-fatha.mp3" },
      { arabic: "بُ", label: "Bu (Damma)", audioUrl: "/audio/noorani/harakat/ba-damma.mp3" },
      { arabic: "بِ", label: "Bi (Kasra)", audioUrl: "/audio/noorani/harakat/ba-kasra.mp3" },
      { arabic: "تَ", label: "Ta (Fatha)", audioUrl: "/audio/noorani/harakat/ta-fatha.mp3" },
      { arabic: "تُ", label: "Tu (Damma)", audioUrl: "/audio/noorani/harakat/ta-damma.mp3" },
      { arabic: "تِ", label: "Ti (Kasra)", audioUrl: "/audio/noorani/harakat/ta-kasra.mp3" },
      { arabic: "مَ", label: "Ma (Fatha)", audioUrl: "/audio/noorani/harakat/ma-fatha.mp3" },
      { arabic: "مُ", label: "Mu (Damma)", audioUrl: "/audio/noorani/harakat/ma-damma.mp3" },
      { arabic: "مِ", label: "Mi (Kasra)", audioUrl: "/audio/noorani/harakat/ma-kasra.mp3" },
    ],
  },
  {
    id: "lesson-5",
    titleKey: "noorani.lesson5Title",
    descKey: "noorani.lesson5Desc",
    level: "beginner",
    emoji: "🕌",
    items: [
      { arabic: "بً", label: "Ban (Tanwiin Fatha)", audioUrl: "/audio/noorani/tanwin/ba-fathatayn.mp3" },
      { arabic: "بٌ", label: "Bun (Tanwiin Damma)", audioUrl: "/audio/noorani/tanwin/ba-dammatayn.mp3" },
      { arabic: "بٍ", label: "Bin (Tanwiin Kasra)", audioUrl: "/audio/noorani/tanwin/ba-kasratayn.mp3" },
      { arabic: "مً", label: "Man (Tanwiin Fatha)", audioUrl: "/audio/noorani/tanwin/ma-fathatayn.mp3" },
      { arabic: "مٌ", label: "Mun (Tanwiin Damma)", audioUrl: "/audio/noorani/tanwin/ma-dammatayn.mp3" },
      { arabic: "مٍ", label: "Min (Tanwiin Kasra)", audioUrl: "/audio/noorani/tanwin/ma-kasratayn.mp3" },
    ],
  },
  {
    id: "lesson-6",
    titleKey: "noorani.lesson6Title",
    descKey: "noorani.lesson6Desc",
    level: "intermediate",
    emoji: "⏸️",
    items: [
      { arabic: "أَبْ", label: "Ab (Sukuun)", audioUrl: "/audio/noorani/sukun/ab.mp3" },
      { arabic: "أَتْ", label: "At (Sukuun)", audioUrl: "/audio/noorani/sukun/at.mp3" },
      { arabic: "أَحْ", label: "Ah (Sukuun)", audioUrl: "/audio/noorani/sukun/ah.mp3" },
      { arabic: "مَبْ", label: "Mab (Sukuun)", audioUrl: "/audio/noorani/sukun/mab.mp3" },
      { arabic: "مَنْ", label: "Man (Sukuun)", audioUrl: "/audio/noorani/sukun/man.mp3" },
      { arabic: "يَلْ", label: "Yal (Sukuun)", audioUrl: "/audio/noorani/sukun/yal.mp3" },
    ],
  },
];
