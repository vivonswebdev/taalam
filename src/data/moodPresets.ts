export interface MoodVerse {
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  ayahs?: number[];       // specific ayahs
  start?: number;         // range start
  end?: number;           // range end
}

export interface MoodPreset {
  id: string;
  title: string;
  titleAr: string;
  emoji: string;
  subtitle: string;
  loop: boolean;
  type: "sleep" | "emotion" | "study" | "ruqya";
  color: string; // gradient accent
  verses: MoodVerse[];
}

export const moodPresets: MoodPreset[] = [
  {
    id: "sleep",
    title: "Pour dormir",
    titleAr: "للنوم",
    emoji: "😴",
    subtitle: "Calme et protection avant le sommeil",
    loop: true,
    type: "sleep",
    color: "from-indigo-900 to-slate-900",
    verses: [
      { surahNumber: 1, surahName: "Al-Fatiha", surahNameArabic: "الفاتحة", start: 1, end: 7 },
      { surahNumber: 2, surahName: "Al-Baqarah", surahNameArabic: "البقرة", ayahs: [255, 285, 286] },
      { surahNumber: 67, surahName: "Al-Mulk", surahNameArabic: "الملك", start: 1, end: 30 },
      { surahNumber: 112, surahName: "Al-Ikhlas", surahNameArabic: "الإخلاص", start: 1, end: 4 },
      { surahNumber: 113, surahName: "Al-Falaq", surahNameArabic: "الفلق", start: 1, end: 5 },
      { surahNumber: 114, surahName: "An-Nas", surahNameArabic: "الناس", start: 1, end: 6 },
    ],
  },
  {
    id: "sadness",
    title: "Tristesse",
    titleAr: "الحزن",
    emoji: "😔",
    subtitle: "Réconfort dans la peine",
    loop: false,
    type: "emotion",
    color: "from-blue-900 to-gray-900",
    verses: [
      { surahNumber: 93, surahName: "Ad-Duha", surahNameArabic: "الضحى", start: 1, end: 11 },
      { surahNumber: 94, surahName: "Ash-Sharh", surahNameArabic: "الشرح", start: 1, end: 8 },
    ],
  },
  {
    id: "anxiety",
    title: "Stress / Anxiété",
    titleAr: "القلق",
    emoji: "😰",
    subtitle: "Apaisement et confiance en Allah",
    loop: false,
    type: "emotion",
    color: "from-teal-900 to-slate-900",
    verses: [
      { surahNumber: 13, surahName: "Ar-Ra'd", surahNameArabic: "الرعد", ayahs: [28] },
      { surahNumber: 3, surahName: "Al-Imran", surahNameArabic: "آل عمران", ayahs: [173, 174] },
      { surahNumber: 94, surahName: "Ash-Sharh", surahNameArabic: "الشرح", start: 1, end: 8 },
    ],
  },
  {
    id: "anger",
    title: "Colère",
    titleAr: "الغضب",
    emoji: "😡",
    subtitle: "Maîtriser sa colère par le Coran",
    loop: false,
    type: "emotion",
    color: "from-red-950 to-gray-900",
    verses: [
      { surahNumber: 3, surahName: "Al-Imran", surahNameArabic: "آل عمران", ayahs: [134] },
      { surahNumber: 41, surahName: "Fussilat", surahNameArabic: "فصلت", ayahs: [34, 35, 36] },
      { surahNumber: 7, surahName: "Al-A'raf", surahNameArabic: "الأعراف", ayahs: [199, 200, 201] },
    ],
  },
  {
    id: "loneliness",
    title: "Solitude",
    titleAr: "الوحدة",
    emoji: "😶",
    subtitle: "Allah est toujours avec toi",
    loop: false,
    type: "emotion",
    color: "from-violet-950 to-slate-900",
    verses: [
      { surahNumber: 2, surahName: "Al-Baqarah", surahNameArabic: "البقرة", ayahs: [186] },
      { surahNumber: 9, surahName: "At-Tawbah", surahNameArabic: "التوبة", ayahs: [40] },
      { surahNumber: 93, surahName: "Ad-Duha", surahNameArabic: "الضحى", start: 1, end: 11 },
    ],
  },
  {
    id: "forgiveness",
    title: "Besoin de pardon",
    titleAr: "طلب المغفرة",
    emoji: "🥺",
    subtitle: "Implorer le pardon d'Allah",
    loop: false,
    type: "emotion",
    color: "from-amber-950 to-gray-900",
    verses: [
      { surahNumber: 39, surahName: "Az-Zumar", surahNameArabic: "الزمر", ayahs: [53] },
      { surahNumber: 71, surahName: "Nuh", surahNameArabic: "نوح", ayahs: [10, 11, 12] },
      { surahNumber: 3, surahName: "Al-Imran", surahNameArabic: "آل عمران", ayahs: [135, 136] },
    ],
  },
  {
    id: "gratitude",
    title: "Gratitude",
    titleAr: "الشكر",
    emoji: "🤲",
    subtitle: "Reconnaissance envers Allah",
    loop: false,
    type: "emotion",
    color: "from-emerald-900 to-teal-950",
    verses: [
      { surahNumber: 14, surahName: "Ibrahim", surahNameArabic: "إبراهيم", ayahs: [7] },
      { surahNumber: 55, surahName: "Ar-Rahman", surahNameArabic: "الرحمن", start: 1, end: 16 },
      { surahNumber: 16, surahName: "An-Nahl", surahNameArabic: "النحل", ayahs: [18] },
    ],
  },
  {
    id: "hope",
    title: "Espoir / Motivation",
    titleAr: "الأمل",
    emoji: "🌅",
    subtitle: "Retrouver force et espérance",
    loop: false,
    type: "emotion",
    color: "from-orange-900 to-amber-950",
    verses: [
      { surahNumber: 94, surahName: "Ash-Sharh", surahNameArabic: "الشرح", start: 1, end: 8 },
      { surahNumber: 65, surahName: "At-Talaq", surahNameArabic: "الطلاق", ayahs: [2, 3] },
      { surahNumber: 12, surahName: "Yusuf", surahNameArabic: "يوسف", ayahs: [87] },
    ],
  },
  {
    id: "doubts",
    title: "Doutes / Waswas",
    titleAr: "الوسوسة",
    emoji: "🧠",
    subtitle: "Chasser les doutes avec le Coran",
    loop: true,
    type: "emotion",
    color: "from-purple-950 to-indigo-950",
    verses: [
      { surahNumber: 114, surahName: "An-Nas", surahNameArabic: "الناس", start: 1, end: 6 },
      { surahNumber: 113, surahName: "Al-Falaq", surahNameArabic: "الفلق", start: 1, end: 5 },
      { surahNumber: 2, surahName: "Al-Baqarah", surahNameArabic: "البقرة", ayahs: [255] },
    ],
  },
  {
    id: "love",
    title: "Amour d'Allah",
    titleAr: "حب الله",
    emoji: "❤️",
    subtitle: "Proximité et amour divin",
    loop: false,
    type: "emotion",
    color: "from-rose-950 to-pink-950",
    verses: [
      { surahNumber: 2, surahName: "Al-Baqarah", surahNameArabic: "البقرة", ayahs: [165] },
      { surahNumber: 3, surahName: "Al-Imran", surahNameArabic: "آل عمران", ayahs: [31] },
      { surahNumber: 89, surahName: "Al-Fajr", surahNameArabic: "الفجر", ayahs: [27, 28, 29, 30] },
    ],
  },
  {
    id: "hardship",
    title: "Épreuves",
    titleAr: "الابتلاء",
    emoji: "🏹",
    subtitle: "Patience face aux difficultés",
    loop: false,
    type: "emotion",
    color: "from-stone-900 to-zinc-900",
    verses: [
      { surahNumber: 2, surahName: "Al-Baqarah", surahNameArabic: "البقرة", ayahs: [155, 156, 157] },
      { surahNumber: 94, surahName: "Ash-Sharh", surahNameArabic: "الشرح", start: 1, end: 8 },
      { surahNumber: 65, surahName: "At-Talaq", surahNameArabic: "الطلاق", ayahs: [2, 3] },
    ],
  },
  {
    id: "ruqya",
    title: "Rouqya / Protection",
    titleAr: "الرقية الشرعية",
    emoji: "🛡️",
    subtitle: "Protection et sérénité spirituelle",
    loop: true,
    type: "ruqya",
    color: "from-cyan-950 to-slate-900",
    verses: [
      { surahNumber: 1, surahName: "Al-Fatiha", surahNameArabic: "الفاتحة", start: 1, end: 7 },
      { surahNumber: 2, surahName: "Al-Baqarah", surahNameArabic: "البقرة", ayahs: [102, 255, 285, 286] },
      { surahNumber: 112, surahName: "Al-Ikhlas", surahNameArabic: "الإخلاص", start: 1, end: 4 },
      { surahNumber: 113, surahName: "Al-Falaq", surahNameArabic: "الفلق", start: 1, end: 5 },
      { surahNumber: 114, surahName: "An-Nas", surahNameArabic: "الناس", start: 1, end: 6 },
    ],
  },
];

export function getMoodById(id: string): MoodPreset | undefined {
  return moodPresets.find((m) => m.id === id);
}
