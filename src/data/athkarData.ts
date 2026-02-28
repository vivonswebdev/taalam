export type AthkarCategory = "morning" | "evening" | "after-prayer" | "protection" | "forgiveness" | "praise";

export interface Dhikr {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  repeat: number; // how many times to repeat
  source?: string;
}

export interface AthkarGroup {
  id: string;
  title: string;
  titleAr: string;
  emoji: string;
  subtitle: string;
  category: AthkarCategory;
  color: string;
  adhkar: Dhikr[];
}

export const ATHKAR_FILTERS: { id: AthkarCategory | "all"; label: string; emoji: string }[] = [
  { id: "all", label: "Tous", emoji: "📿" },
  { id: "morning", label: "Matin", emoji: "🌅" },
  { id: "evening", label: "Soir", emoji: "🌙" },
  { id: "after-prayer", label: "Après la prière", emoji: "🕋" },
  { id: "protection", label: "Protection", emoji: "🛡️" },
  { id: "forgiveness", label: "Pardon", emoji: "🕊️" },
  { id: "praise", label: "Louanges", emoji: "🤲" },
];

export const athkarGroups: AthkarGroup[] = [
  {
    id: "morning",
    title: "Adhkar du matin",
    titleAr: "أذكار الصباح",
    emoji: "🌅",
    subtitle: "À réciter après Fajr",
    category: "morning",
    color: "from-amber-900 to-orange-950",
    adhkar: [
      {
        id: "m1",
        arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        transliteration: "Asbahna wa asbahal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadir",
        translation: "Nous voilà au matin et le royaume appartient à Allah. Louange à Allah. Nul ne mérite d'être adoré sauf Allah, Seul, sans associé. À Lui le royaume et la louange. Il est Omnipotent.",
        repeat: 1,
        source: "Muslim",
      },
      {
        id: "m2",
        arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
        transliteration: "Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu, wa ilaykan-nushur",
        translation: "Ô Allah, c'est par Toi que nous entrons dans le matin et dans la nuit, c'est par Toi que nous vivons et mourons, et c'est vers Toi la résurrection.",
        repeat: 1,
        source: "Tirmidhi",
      },
      {
        id: "m3",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        transliteration: "SubhanAllahi wa bihamdihi",
        translation: "Gloire et louange à Allah.",
        repeat: 100,
        source: "Muslim",
      },
      {
        id: "m4",
        arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        transliteration: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu, wa huwa 'ala kulli shay'in qadir",
        translation: "Nul ne mérite d'être adoré sauf Allah, Seul, sans associé. À Lui le royaume et la louange. Il est Omnipotent.",
        repeat: 10,
        source: "Bukhari & Muslim",
      },
      {
        id: "m5",
        arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
        transliteration: "Astaghfirullaha wa atubu ilayh",
        translation: "Je demande pardon à Allah et je me repens vers Lui.",
        repeat: 100,
        source: "Bukhari & Muslim",
      },
    ],
  },
  {
    id: "evening",
    title: "Adhkar du soir",
    titleAr: "أذكار المساء",
    emoji: "🌙",
    subtitle: "À réciter après Asr / Maghrib",
    category: "evening",
    color: "from-indigo-950 to-slate-900",
    adhkar: [
      {
        id: "e1",
        arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        transliteration: "Amsayna wa amsal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadir",
        translation: "Nous voilà au soir et le royaume appartient à Allah. Louange à Allah. Nul ne mérite d'être adoré sauf Allah, Seul, sans associé.",
        repeat: 1,
        source: "Muslim",
      },
      {
        id: "e2",
        arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
        transliteration: "Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namutu, wa ilaykal-masir",
        translation: "Ô Allah, c'est par Toi que nous entrons dans la nuit et dans le matin, c'est par Toi que nous vivons et mourons, et c'est vers Toi le retour.",
        repeat: 1,
        source: "Tirmidhi",
      },
      {
        id: "e3",
        arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        transliteration: "A'udhu bi kalimatillahi at-tammati min sharri ma khalaq",
        translation: "Je me réfugie dans les paroles parfaites d'Allah contre le mal de ce qu'Il a créé.",
        repeat: 3,
        source: "Muslim",
      },
      {
        id: "e4",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        transliteration: "SubhanAllahi wa bihamdihi",
        translation: "Gloire et louange à Allah.",
        repeat: 100,
        source: "Muslim",
      },
    ],
  },
  {
    id: "after-prayer",
    title: "Adhkar après la prière",
    titleAr: "أذكار بعد الصلاة",
    emoji: "🕋",
    subtitle: "Après chaque prière obligatoire",
    category: "after-prayer",
    color: "from-emerald-900 to-teal-950",
    adhkar: [
      {
        id: "ap1",
        arabic: "أَسْتَغْفِرُ اللَّهَ",
        transliteration: "Astaghfirullah",
        translation: "Je demande pardon à Allah.",
        repeat: 3,
        source: "Muslim",
      },
      {
        id: "ap2",
        arabic: "اللَّهُمَّ أَنْتَ السَّلَامُ، وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
        transliteration: "Allahumma antas-salam, wa minkas-salam, tabarakta ya dhal-jalali wal-ikram",
        translation: "Ô Allah, Tu es la Paix et la paix vient de Toi. Béni sois-Tu, ô Plein de Majesté et de Munificence.",
        repeat: 1,
        source: "Muslim",
      },
      {
        id: "ap3",
        arabic: "سُبْحَانَ اللَّهِ",
        transliteration: "SubhanAllah",
        translation: "Gloire à Allah.",
        repeat: 33,
        source: "Muslim",
      },
      {
        id: "ap4",
        arabic: "الْحَمْدُ لِلَّهِ",
        transliteration: "Alhamdulillah",
        translation: "Louange à Allah.",
        repeat: 33,
        source: "Muslim",
      },
      {
        id: "ap5",
        arabic: "اللَّهُ أَكْبَرُ",
        transliteration: "Allahu Akbar",
        translation: "Allah est le Plus Grand.",
        repeat: 33,
        source: "Muslim",
      },
      {
        id: "ap6",
        arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        transliteration: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu, wa huwa 'ala kulli shay'in qadir",
        translation: "Nul ne mérite d'être adoré sauf Allah, Seul, sans associé. À Lui le royaume et la louange. Il est Omnipotent.",
        repeat: 1,
        source: "Muslim",
      },
    ],
  },
  {
    id: "protection",
    title: "Adhkar de protection",
    titleAr: "أذكار الحماية",
    emoji: "🛡️",
    subtitle: "Protection contre le mal",
    category: "protection",
    color: "from-cyan-950 to-slate-900",
    adhkar: [
      {
        id: "p1",
        arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        transliteration: "Bismillahilladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa huwas-sami'ul-'alim",
        translation: "Au nom d'Allah, avec le nom de Qui rien ne peut nuire sur terre ni au ciel, et Il est l'Audient, l'Omniscient.",
        repeat: 3,
        source: "Abu Dawud & Tirmidhi",
      },
      {
        id: "p2",
        arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        transliteration: "A'udhu bi kalimatillahi at-tammati min sharri ma khalaq",
        translation: "Je me réfugie dans les paroles parfaites d'Allah contre le mal de ce qu'Il a créé.",
        repeat: 3,
        source: "Muslim",
      },
      {
        id: "p3",
        arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
        transliteration: "HasbiyAllahu la ilaha illa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Adhim",
        translation: "Allah me suffit, il n'y a de divinité que Lui. En Lui je place ma confiance et Il est le Seigneur du Trône immense.",
        repeat: 7,
        source: "Abu Dawud",
      },
    ],
  },
  {
    id: "forgiveness",
    title: "Istighfar",
    titleAr: "الاستغفار",
    emoji: "🕊️",
    subtitle: "Demande de pardon",
    category: "forgiveness",
    color: "from-amber-950 to-gray-900",
    adhkar: [
      {
        id: "f1",
        arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
        transliteration: "Astaghfirullaha al-'Adhim alladhi la ilaha illa Huwal-Hayyul-Qayyumu wa atubu ilayh",
        translation: "Je demande pardon à Allah l'Immense, Celui qu'il n'y a de divinité que Lui, le Vivant, l'Immuable, et je me repens vers Lui.",
        repeat: 3,
        source: "Abu Dawud & Tirmidhi",
      },
      {
        id: "f2",
        arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
        transliteration: "Allahumma anta Rabbi, la ilaha illa anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mastata'tu…",
        translation: "Ô Allah, Tu es mon Seigneur, il n'y a de divinité que Toi. Tu m'as créé et je suis Ton serviteur… (Sayyid al-Istighfar)",
        repeat: 1,
        source: "Bukhari",
      },
      {
        id: "f3",
        arabic: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الْغَفُورُ",
        transliteration: "Rabbighfir li wa tub 'alayya innaka antat-Tawwabul-Ghafur",
        translation: "Seigneur, pardonne-moi et accepte mon repentir. Tu es Celui qui accepte le repentir, le Pardonneur.",
        repeat: 100,
        source: "Abu Dawud & Tirmidhi",
      },
    ],
  },
  {
    id: "praise",
    title: "Louanges & tasbih",
    titleAr: "التسبيح والحمد",
    emoji: "🤲",
    subtitle: "Louanges et remerciements",
    category: "praise",
    color: "from-emerald-950 to-green-950",
    adhkar: [
      {
        id: "pr1",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
        transliteration: "SubhanAllahi wa bihamdihi, SubhanAllahil-'Adhim",
        translation: "Gloire et louange à Allah, Gloire à Allah l'Immense.",
        repeat: 100,
        source: "Bukhari & Muslim",
      },
      {
        id: "pr2",
        arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        transliteration: "La hawla wa la quwwata illa billah",
        translation: "Il n'y a de force ni de puissance qu'en Allah.",
        repeat: 10,
        source: "Bukhari & Muslim",
      },
      {
        id: "pr3",
        arabic: "سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ",
        transliteration: "SubhanAllah, walhamdulillah, wa la ilaha illallah, wallahu akbar",
        translation: "Gloire à Allah, louange à Allah, nul ne mérite d'être adoré sauf Allah, Allah est le Plus Grand.",
        repeat: 10,
        source: "Muslim",
      },
    ],
  },
];

export function getAthkarGroupById(id: string): AthkarGroup | undefined {
  return athkarGroups.find((g) => g.id === id);
}
