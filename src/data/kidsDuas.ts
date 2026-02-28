export interface KidsDua {
  id: string;
  category: DuaCategory;
  emoji: string;
  arabic: string;
  transliteration: string;
  translationKey: string;
  titleKey: string;
  reference?: string;
}

export type DuaCategory = "sleep" | "wake" | "food" | "mosque" | "home" | "daily";

export interface DuaCategoryInfo {
  id: DuaCategory;
  emoji: string;
  labelKey: string;
}

export const DUA_CATEGORIES: DuaCategoryInfo[] = [
  { id: "sleep", emoji: "🌙", labelKey: "kidsDuas.catSleep" },
  { id: "wake", emoji: "☀️", labelKey: "kidsDuas.catWake" },
  { id: "food", emoji: "🍽️", labelKey: "kidsDuas.catFood" },
  { id: "mosque", emoji: "🕌", labelKey: "kidsDuas.catMosque" },
  { id: "home", emoji: "🏠", labelKey: "kidsDuas.catHome" },
  { id: "daily", emoji: "⭐", labelKey: "kidsDuas.catDaily" },
];

export const KIDS_DUAS: KidsDua[] = [
  // ─── Sleep ────────────────────────────────────────
  {
    id: "sleep-1",
    category: "sleep",
    emoji: "🌙",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismika Allâhumma amûtu wa ahyâ",
    translationKey: "kidsDuas.sleep1Trans",
    titleKey: "kidsDuas.sleep1Title",
    reference: "Al-Bukhârî",
  },
  {
    id: "sleep-2",
    category: "sleep",
    emoji: "😴",
    arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
    transliteration: "Allâhumma qinî 'adhâbaka yawma tab'athu 'ibâdak",
    translationKey: "kidsDuas.sleep2Trans",
    titleKey: "kidsDuas.sleep2Title",
    reference: "Abû Dâwûd",
  },
  {
    id: "sleep-3",
    category: "sleep",
    emoji: "🛏️",
    arabic: "اللَّهُمَّ بِاسْمِكَ أَحْيَا وَبِاسْمِكَ أَمُوتُ",
    transliteration: "Allâhumma bismika ahyâ wa bismika amût",
    translationKey: "kidsDuas.sleep3Trans",
    titleKey: "kidsDuas.sleep3Title",
  },

  // ─── Wake ─────────────────────────────────────────
  {
    id: "wake-1",
    category: "wake",
    emoji: "☀️",
    arabic: "الحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration: "Al-hamdu lillâhi alladhî ahyânâ ba'da mâ amâtanâ wa ilayhi an-nushûr",
    translationKey: "kidsDuas.wake1Trans",
    titleKey: "kidsDuas.wake1Title",
    reference: "Al-Bukhârî",
  },

  // ─── Food ─────────────────────────────────────────
  {
    id: "food-1",
    category: "food",
    emoji: "🍽️",
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Bismillâh",
    translationKey: "kidsDuas.food1Trans",
    titleKey: "kidsDuas.food1Title",
    reference: "Muslim",
  },
  {
    id: "food-2",
    category: "food",
    emoji: "🍽️",
    arabic: "بِسْمِ اللَّهِ وَبَرَكَةِ اللَّهِ",
    transliteration: "Bismillâhi wa barakatillâh",
    translationKey: "kidsDuas.food2Trans",
    titleKey: "kidsDuas.food2Title",
  },
  {
    id: "food-3",
    category: "food",
    emoji: "🥛",
    arabic: "الحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    transliteration: "Al-hamdu lillâhi alladhî at'amanî hâdhâ wa razaqanîhi min ghayri hawlin minnî wa lâ quwwah",
    translationKey: "kidsDuas.food3Trans",
    titleKey: "kidsDuas.food3Title",
    reference: "At-Tirmidhî",
  },

  // ─── Mosque ───────────────────────────────────────
  {
    id: "mosque-1",
    category: "mosque",
    emoji: "🕌",
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    transliteration: "Allâhumma iftah lî abwâba rahmatik",
    translationKey: "kidsDuas.mosque1Trans",
    titleKey: "kidsDuas.mosque1Title",
    reference: "Muslim",
  },
  {
    id: "mosque-2",
    category: "mosque",
    emoji: "🚶",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    transliteration: "Allâhumma innî as'aluka min fadlik",
    translationKey: "kidsDuas.mosque2Trans",
    titleKey: "kidsDuas.mosque2Title",
    reference: "Muslim",
  },

  // ─── Home ─────────────────────────────────────────
  {
    id: "home-1",
    category: "home",
    emoji: "🏠",
    arabic: "بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا",
    transliteration: "Bismillâhi walajnâ wa bismillâhi kharajnâ wa 'alâ Allâhi rabbinâ tawakkalnâ",
    translationKey: "kidsDuas.home1Trans",
    titleKey: "kidsDuas.home1Title",
    reference: "Abû Dâwûd",
  },
  {
    id: "home-2",
    category: "home",
    emoji: "🚪",
    arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration: "Bismillâhi tawakkaltu 'alâ Allâh, wa lâ hawla wa lâ quwwata illâ billâh",
    translationKey: "kidsDuas.home2Trans",
    titleKey: "kidsDuas.home2Title",
    reference: "At-Tirmidhî",
  },

  // ─── Daily ────────────────────────────────────────
  {
    id: "daily-1",
    category: "daily",
    emoji: "👕",
    arabic: "الحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    transliteration: "Al-hamdu lillâhi alladhî kasânî hâdhâ wa razaqanîhi min ghayri hawlin minnî wa lâ quwwah",
    translationKey: "kidsDuas.daily1Trans",
    titleKey: "kidsDuas.daily1Title",
    reference: "At-Tirmidhî",
  },
  {
    id: "daily-2",
    category: "daily",
    emoji: "🚿",
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Bismillâh",
    translationKey: "kidsDuas.daily2Trans",
    titleKey: "kidsDuas.daily2Title",
  },
  {
    id: "daily-3",
    category: "daily",
    emoji: "🚻",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ",
    transliteration: "Allâhumma innî a'ûdhu bika minal-khubuthi wal-khabâ'ith",
    translationKey: "kidsDuas.daily3Trans",
    titleKey: "kidsDuas.daily3Title",
    reference: "Al-Bukhârî & Muslim",
  },
  {
    id: "daily-4",
    category: "daily",
    emoji: "🤧",
    arabic: "الحَمْدُ لِلَّهِ",
    transliteration: "Al-hamdu lillâh",
    translationKey: "kidsDuas.daily4Trans",
    titleKey: "kidsDuas.daily4Title",
  },
  {
    id: "daily-5",
    category: "daily",
    emoji: "🪞",
    arabic: "اللَّهُمَّ أَنْتَ حَسَّنْتَ خَلْقِي فَحَسِّنْ خُلُقِي",
    transliteration: "Allâhumma anta hassanta khalqî fa-hassin khuluqî",
    translationKey: "kidsDuas.daily5Trans",
    titleKey: "kidsDuas.daily5Title",
    reference: "Ahmad",
  },
];

// Quiz questions generated from the duas
export interface DuaQuizQuestion {
  id: string;
  type: "situation" | "text";
  questionKey: string;
  correctDuaId: string;
  options: string[]; // dua IDs
}

export function generateDuaQuiz(count = 5): DuaQuizQuestion[] {
  const shuffled = [...KIDS_DUAS].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return selected.map((dua) => {
    // Get 3 wrong options from different duas
    const others = KIDS_DUAS.filter(d => d.id !== dua.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const options = [dua.id, ...others.map(o => o.id)].sort(() => Math.random() - 0.5);

    return {
      id: `quiz-${dua.id}`,
      type: Math.random() > 0.5 ? "situation" : "text",
      questionKey: dua.titleKey,
      correctDuaId: dua.id,
      options,
    };
  });
}
