export interface MemoryCard {
  id: string;
  pairId: string;
  type: "question" | "answer";
  text: { fr: string; ar: string; en: string; nl: string; tr: string; ur: string };
}

export interface MemoryLevel {
  pairs: number;
  labelKey: string;
}

export const MEMORY_LEVELS: MemoryLevel[] = [
  { pairs: 3, labelKey: "easy" },
  { pairs: 6, labelKey: "medium" },
  { pairs: 10, labelKey: "hard" },
];

interface PairData {
  id: string;
  q: { fr: string; ar: string; en: string; nl: string; tr: string; ur: string };
  a: { fr: string; ar: string; en: string; nl: string; tr: string; ur: string };
}

export const ALL_PAIRS: PairData[] = [
  {
    id: "ikhlas",
    q: { fr: "Al-Ikhlass", ar: "الإخلاص", en: "Al-Ikhlas", nl: "Al-Ikhlas", tr: "İhlas", ur: "الاخلاص" },
    a: { fr: "Dis : Il est Allah, Unique", ar: "قل هو الله أحد", en: "Say: He is Allah, the One", nl: "Zeg: Hij is Allah, de Enige", tr: "De ki: O Allah'tır, Bir'dir", ur: "کہو: وہ اللہ ایک ہے" },
  },
  {
    id: "falaq",
    q: { fr: "Al-Falaq", ar: "الفلق", en: "Al-Falaq", nl: "Al-Falaq", tr: "Felak", ur: "الفلق" },
    a: { fr: "Protection contre le mal", ar: "أعوذ برب الفلق", en: "Seeking refuge from evil", nl: "Bescherming tegen kwaad", tr: "Kötülükten sığınma", ur: "برائی سے پناہ" },
  },
  {
    id: "nas",
    q: { fr: "An-Nas", ar: "الناس", en: "An-Nas", nl: "An-Nas", tr: "Nas", ur: "الناس" },
    a: { fr: "Protection contre le chuchoteur", ar: "من شر الوسواس", en: "Protection from the whisperer", nl: "Bescherming tegen de fluisteraar", tr: "Vesveseciden korunma", ur: "وسوسہ دینے والے سے حفاظت" },
  },
  {
    id: "fatiha",
    q: { fr: "Al-Fatiha", ar: "الفاتحة", en: "Al-Fatiha", nl: "Al-Fatiha", tr: "Fatiha", ur: "الفاتحہ" },
    a: { fr: "L'ouverture du Coran", ar: "فاتحة الكتاب", en: "The Opening of the Quran", nl: "De opening van de Koran", tr: "Kur'an'ın açılışı", ur: "قرآن کا آغاز" },
  },
  {
    id: "shahada",
    q: { fr: "Shahada", ar: "الشهادة", en: "Shahada", nl: "Shahada", tr: "Şehadet", ur: "شہادت" },
    a: { fr: "Témoignage de foi", ar: "شهادة أن لا إله إلا الله", en: "Declaration of faith", nl: "Getuigenis van geloof", tr: "İman tanıklığı", ur: "ایمان کی گواہی" },
  },
  {
    id: "salah",
    q: { fr: "Salah", ar: "الصلاة", en: "Salah", nl: "Salat", tr: "Namaz", ur: "نماز" },
    a: { fr: "5 prières quotidiennes", ar: "خمس صلوات يومية", en: "5 daily prayers", nl: "5 dagelijkse gebeden", tr: "5 vakit namaz", ur: "5 روزانہ نمازیں" },
  },
  {
    id: "zakat",
    q: { fr: "Zakat", ar: "الزكاة", en: "Zakat", nl: "Zakat", tr: "Zekat", ur: "زکاۃ" },
    a: { fr: "Aumône obligatoire", ar: "إيتاء الزكاة", en: "Obligatory charity", nl: "Verplichte liefdadigheid", tr: "Zorunlu sadaka", ur: "فرض صدقہ" },
  },
  {
    id: "sawm",
    q: { fr: "Sawm", ar: "الصوم", en: "Sawm", nl: "Vasten", tr: "Oruç", ur: "روزہ" },
    a: { fr: "Jeûne du Ramadan", ar: "صيام رمضان", en: "Fasting in Ramadan", nl: "Vasten in Ramadan", tr: "Ramazan orucu", ur: "رمضان کے روزے" },
  },
  {
    id: "hajj",
    q: { fr: "Hajj", ar: "الحج", en: "Hajj", nl: "Hadj", tr: "Hac", ur: "حج" },
    a: { fr: "Pèlerinage à la Mecque", ar: "الحج إلى مكة", en: "Pilgrimage to Mecca", nl: "Bedevaart naar Mekka", tr: "Mekke'ye hac", ur: "مکہ کا حج" },
  },
  {
    id: "kursi",
    q: { fr: "Ayatul Kursi", ar: "آية الكرسي", en: "Ayatul Kursi", nl: "Ayatul Kursi", tr: "Ayetel Kürsi", ur: "آیت الکرسی" },
    a: { fr: "Le plus grand verset", ar: "أعظم آية في القرآن", en: "The greatest verse", nl: "Het grootste vers", tr: "En büyük ayet", ur: "سب سے بڑی آیت" },
  },
  {
    id: "kawthar",
    q: { fr: "Al-Kawthar", ar: "الكوثر", en: "Al-Kawthar", nl: "Al-Kawthar", tr: "Kevser", ur: "الکوثر" },
    a: { fr: "L'abondance divine", ar: "إنا أعطيناك الكوثر", en: "Divine abundance", nl: "Goddelijke overvloed", tr: "İlahi bolluk", ur: "الٰہی فراوانی" },
  },
  {
    id: "asr",
    q: { fr: "Al-Asr", ar: "العصر", en: "Al-Asr", nl: "Al-Asr", tr: "Asr", ur: "العصر" },
    a: { fr: "Le temps qui passe", ar: "والعصر إن الإنسان لفي خسر", en: "Time is passing", nl: "De tijd gaat voorbij", tr: "Zaman geçiyor", ur: "وقت گزر رہا ہے" },
  },
  {
    id: "massad",
    q: { fr: "Al-Massad", ar: "المسد", en: "Al-Masad", nl: "Al-Masad", tr: "Tebbet", ur: "المسد" },
    a: { fr: "Sourate sur Abu Lahab", ar: "تبت يدا أبي لهب", en: "Surah about Abu Lahab", nl: "Soera over Abu Lahab", tr: "Ebu Leheb suresi", ur: "ابو لہب کی سورت" },
  },
  {
    id: "nasr",
    q: { fr: "An-Nasr", ar: "النصر", en: "An-Nasr", nl: "An-Nasr", tr: "Nasr", ur: "النصر" },
    a: { fr: "Le secours d'Allah", ar: "إذا جاء نصر الله", en: "The help of Allah", nl: "De hulp van Allah", tr: "Allah'ın yardımı", ur: "اللہ کی مدد" },
  },
  {
    id: "kafiroon",
    q: { fr: "Al-Kafiroon", ar: "الكافرون", en: "Al-Kafirun", nl: "Al-Kafirun", tr: "Kafirun", ur: "الکافرون" },
    a: { fr: "Dis : Ô mécréants…", ar: "قل يا أيها الكافرون", en: "Say: O disbelievers…", nl: "Zeg: O ongelovigen…", tr: "De ki: Ey kafirler…", ur: "کہو: اے کافرو…" },
  },
  {
    id: "maoon",
    q: { fr: "Al-Maoon", ar: "الماعون", en: "Al-Ma'un", nl: "Al-Ma'un", tr: "Maun", ur: "الماعون" },
    a: { fr: "L'aide aux nécessiteux", ar: "أرأيت الذي يكذب بالدين", en: "Helping the needy", nl: "De behoeftigen helpen", tr: "Muhtaçlara yardım", ur: "ضرورت مندوں کی مدد" },
  },
  {
    id: "quraysh",
    q: { fr: "Quraysh", ar: "قريش", en: "Quraysh", nl: "Quraysh", tr: "Kureyş", ur: "قریش" },
    a: { fr: "Union de Quraysh", ar: "لإيلاف قريش", en: "Unity of Quraysh", nl: "Eenheid van Quraysh", tr: "Kureyş birliği", ur: "قریش کا اتحاد" },
  },
  {
    id: "fil",
    q: { fr: "Al-Fil", ar: "الفيل", en: "Al-Fil", nl: "Al-Fil", tr: "Fil", ur: "الفیل" },
    a: { fr: "L'histoire de l'éléphant", ar: "ألم تر كيف فعل ربك بأصحاب الفيل", en: "The story of the elephant", nl: "Het verhaal van de olifant", tr: "Fil hikayesi", ur: "ہاتھی کی کہانی" },
  },
  {
    id: "humazah",
    q: { fr: "Al-Humazah", ar: "الهمزة", en: "Al-Humazah", nl: "Al-Humazah", tr: "Hümeze", ur: "الہمزہ" },
    a: { fr: "Malheur aux médisants", ar: "ويل لكل همزة لمزة", en: "Woe to every slanderer", nl: "Wee de lasteraars", tr: "Dedikoducuların vay haline", ur: "ہر طعنہ زن کے لیے تباہی" },
  },
  {
    id: "takathur",
    q: { fr: "At-Takathur", ar: "التكاثر", en: "At-Takathur", nl: "At-Takathur", tr: "Tekasür", ur: "التکاثر" },
    a: { fr: "La course aux richesses", ar: "ألهاكم التكاثر", en: "The race for wealth", nl: "De race om rijkdom", tr: "Çoğalma yarışı", ur: "دولت کی دوڑ" },
  },
  {
    id: "tawba",
    q: { fr: "Le repentir", ar: "التوبة", en: "Repentance", nl: "Berouw", tr: "Tövbe", ur: "توبہ" },
    a: { fr: "Revenir vers Allah", ar: "العودة إلى الله", en: "Returning to Allah", nl: "Terugkeren naar Allah", tr: "Allah'a dönmek", ur: "اللہ کی طرف لوٹنا" },
  },
  {
    id: "bismillah",
    q: { fr: "Bismillah", ar: "بسم الله", en: "Bismillah", nl: "Bismillah", tr: "Bismillah", ur: "بسم اللہ" },
    a: { fr: "Au nom d'Allah", ar: "بسم الله الرحمن الرحيم", en: "In the name of Allah", nl: "In de naam van Allah", tr: "Allah'ın adıyla", ur: "اللہ کے نام سے" },
  },
];

export function buildCards(pairCount: number): MemoryCard[] {
  const pairs = ALL_PAIRS.slice(0, pairCount);
  const cards: MemoryCard[] = [];
  pairs.forEach((p) => {
    cards.push({ id: p.id + "_q", pairId: p.id, type: "question", text: p.q });
    cards.push({ id: p.id + "_a", pairId: p.id, type: "answer", text: p.a });
  });
  // shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}
