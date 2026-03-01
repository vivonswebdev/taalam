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
