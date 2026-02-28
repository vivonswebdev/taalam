import type { MoodVerse } from "./moodPresets";

export interface MaladiePreset {
  id: string;
  title: string;
  titleAr: string;
  emoji: string;
  subtitle: string;
  loop: boolean;
  color: string;
  verses: MoodVerse[];
}

export const maladiesPresets: MaladiePreset[] = [
  {
    id: "general-illness",
    title: "Maladie générale",
    titleAr: "المرض العام",
    emoji: "🩺",
    subtitle: "Douleurs, maladie physique",
    loop: true,
    color: "from-teal-900 to-slate-900",
    verses: [
      { surahNumber: 26, surahName: "Ash-Shu'ara", surahNameArabic: "الشعراء", ayahs: [80] },
      { surahNumber: 10, surahName: "Yunus", surahNameArabic: "يونس", ayahs: [57] },
      { surahNumber: 17, surahName: "Al-Isra", surahNameArabic: "الإسراء", ayahs: [82] },
      { surahNumber: 41, surahName: "Fussilat", surahNameArabic: "فصلت", ayahs: [44] },
    ],
  },
  {
    id: "heart-disease",
    title: "Maladie du cœur",
    titleAr: "مرض القلب",
    emoji: "❤️‍🩹",
    subtitle: "Nifaq, dureté du cœur",
    loop: false,
    color: "from-rose-950 to-gray-900",
    verses: [
      { surahNumber: 2, surahName: "Al-Baqarah", surahNameArabic: "البقرة", ayahs: [10] },
      { surahNumber: 57, surahName: "Al-Hadid", surahNameArabic: "الحديد", ayahs: [16] },
      { surahNumber: 39, surahName: "Az-Zumar", surahNameArabic: "الزمر", ayahs: [22, 23] },
      { surahNumber: 8, surahName: "Al-Anfal", surahNameArabic: "الأنفال", ayahs: [2, 3, 4] },
    ],
  },
  {
    id: "insomnia",
    title: "Insomnie",
    titleAr: "الأرق",
    emoji: "😴",
    subtitle: "Difficulté à dormir",
    loop: true,
    color: "from-indigo-950 to-slate-900",
    verses: [
      { surahNumber: 67, surahName: "Al-Mulk", surahNameArabic: "الملك", start: 1, end: 30 },
      { surahNumber: 2, surahName: "Al-Baqarah", surahNameArabic: "البقرة", ayahs: [255] },
      { surahNumber: 112, surahName: "Al-Ikhlas", surahNameArabic: "الإخلاص", start: 1, end: 4 },
      { surahNumber: 113, surahName: "Al-Falaq", surahNameArabic: "الفلق", start: 1, end: 5 },
      { surahNumber: 114, surahName: "An-Nas", surahNameArabic: "الناس", start: 1, end: 6 },
    ],
  },
  {
    id: "fears",
    title: "Peurs / Phobies",
    titleAr: "الخوف",
    emoji: "😨",
    subtitle: "Crainte excessive",
    loop: false,
    color: "from-purple-950 to-slate-900",
    verses: [
      { surahNumber: 3, surahName: "Al-Imran", surahNameArabic: "آل عمران", ayahs: [173, 174, 175] },
      { surahNumber: 9, surahName: "At-Tawbah", surahNameArabic: "التوبة", ayahs: [51] },
      { surahNumber: 33, surahName: "Al-Ahzab", surahNameArabic: "الأحزاب", ayahs: [3] },
    ],
  },
  {
    id: "depression",
    title: "Dépression",
    titleAr: "الاكتئاب",
    emoji: "🧠",
    subtitle: "Profond abattement",
    loop: true,
    color: "from-gray-900 to-zinc-900",
    verses: [
      { surahNumber: 93, surahName: "Ad-Duha", surahNameArabic: "الضحى", start: 1, end: 11 },
      { surahNumber: 94, surahName: "Ash-Sharh", surahNameArabic: "الشرح", start: 1, end: 8 },
      { surahNumber: 13, surahName: "Ar-Ra'd", surahNameArabic: "الرعد", ayahs: [28] },
      { surahNumber: 65, surahName: "At-Talaq", surahNameArabic: "الطلاق", ayahs: [2, 3] },
    ],
  },
  {
    id: "evil-eye",
    title: "Mauvais œil / Sihr",
    titleAr: "العين والسحر",
    emoji: "🩸",
    subtitle: "Protection et rouqya",
    loop: true,
    color: "from-cyan-950 to-slate-900",
    verses: [
      { surahNumber: 1, surahName: "Al-Fatiha", surahNameArabic: "الفاتحة", start: 1, end: 7 },
      { surahNumber: 2, surahName: "Al-Baqarah", surahNameArabic: "البقرة", ayahs: [102, 255, 285, 286] },
      { surahNumber: 7, surahName: "Al-A'raf", surahNameArabic: "الأعراف", ayahs: [117, 118, 119, 120, 121, 122] },
      { surahNumber: 10, surahName: "Yunus", surahNameArabic: "يونس", ayahs: [81, 82] },
      { surahNumber: 20, surahName: "Taha", surahNameArabic: "طه", ayahs: [69] },
      { surahNumber: 112, surahName: "Al-Ikhlas", surahNameArabic: "الإخلاص", start: 1, end: 4 },
      { surahNumber: 113, surahName: "Al-Falaq", surahNameArabic: "الفلق", start: 1, end: 5 },
      { surahNumber: 114, surahName: "An-Nas", surahNameArabic: "الناس", start: 1, end: 6 },
    ],
  },
];

export function getMaladieById(id: string): MaladiePreset | undefined {
  return maladiesPresets.find((m) => m.id === id);
}
