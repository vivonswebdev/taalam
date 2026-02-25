// ─── Tajwid Rule Definitions ────────────────────────────────
// 15 main Tajwid rules with HSL-based colors for theming

export interface TajwidRule {
  id: string;
  name: string;
  nameArabic: string;
  description: string;
  /** HSL color string for highlighting */
  color: string;
  /** Emoji icon */
  icon: string;
  /** Detailed tutorial explanation */
  detailedExplanation?: string;
  /** Example Arabic words demonstrating the rule */
  examples?: { word: string; context: string }[];
  /** Letters involved */
  letters?: string;
}

export const TAJWID_RULES: TajwidRule[] = [
  {
    id: "idgham_bighunnah",
    name: "Idgham bi Ghunnah",
    nameArabic: "إدغام بغنة",
    description: "Assimilation nasale avec ي ن م و",
    color: "142 71% 45%",
    icon: "🟢",
    detailedExplanation: "Lorsqu'un Noun Sakina (نْ) ou un Tanwin est suivi par l'une des lettres ي ن م و, le Noon est assimilé dans la lettre suivante avec un son nasal (Ghunnah) de 2 temps. Le son du Noon disparaît et est remplacé par la lettre suivante avec nasalisation.",
    examples: [
      { word: "مِنْ يَعْمَلْ", context: "Sourate An-Nisa 4:123" },
      { word: "مِنْ وَلِيٍّ", context: "Sourate Al-Baqara 2:107" },
    ],
    letters: "ي ن م و",
  },
  {
    id: "idgham_bilaghunnah",
    name: "Idgham bila Ghunnah",
    nameArabic: "إدغام بلا غنة",
    description: "Assimilation sans nasalité avec ل ر",
    color: "142 50% 35%",
    icon: "🟩",
    detailedExplanation: "Lorsqu'un Noon Sakina ou un Tanwin est suivi par ل ou ر, le Noon est complètement assimilé SANS nasalisation. Le son du Noon disparaît entièrement et seule la lettre suivante est prononcée.",
    examples: [
      { word: "مِنْ رَبِّهِمْ", context: "Sourate Al-Baqara 2:5" },
      { word: "مِنْ لَدُنْهُ", context: "Sourate Al-Kahf 18:2" },
    ],
    letters: "ل ر",
  },
  {
    id: "ikhfa",
    name: "Ikhfa",
    nameArabic: "إخفاء",
    description: "Dissimulation du noun sakina",
    color: "38 92% 50%",
    icon: "🟠",
    detailedExplanation: "L'Ikhfa (dissimulation) se produit quand un Noon Sakina ou un Tanwin est suivi par l'une des 15 lettres d'Ikhfa. Le Noon n'est ni complètement prononcé ni complètement assimilé — il est prononcé 'entre les deux' avec une Ghunnah de 2 temps.",
    examples: [
      { word: "أَنْتُمْ", context: "Prononcé avec nasalisation légère" },
      { word: "مِنْ قَبْلِ", context: "Sourate Al-Baqara 2:25" },
    ],
    letters: "ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك",
  },
  {
    id: "iqlab",
    name: "Iqlab",
    nameArabic: "إقلاب",
    description: "Conversion du noun en mim devant ب",
    color: "262 83% 58%",
    icon: "🟣",
    detailedExplanation: "L'Iqlab (conversion) se produit quand un Noon Sakina ou un Tanwin est suivi par la lettre ب. Le son du Noon est converti en Mim (م) avec une Ghunnah de 2 temps. C'est la seule lettre qui provoque cette règle.",
    examples: [
      { word: "مِنْ بَعْدِ", context: "Sourate Al-Baqara 2:27" },
      { word: "سَمِيعٌ بَصِيرٌ", context: "Tanwin + Ba" },
    ],
    letters: "ب",
  },
  {
    id: "izhar",
    name: "Izhar",
    nameArabic: "إظهار",
    description: "Prononciation claire du noun sakina",
    color: "199 89% 48%",
    icon: "🔵",
    detailedExplanation: "L'Izhar (prononciation claire) se produit quand un Noon Sakina ou un Tanwin est suivi par l'une des 6 lettres gutturales. Le Noon est prononcé clairement sans nasalisation ni assimilation.",
    examples: [
      { word: "مِنْ عِلْمٍ", context: "Noon Sakina + Ayn" },
      { word: "مِنْ حَكِيمٍ", context: "Noon Sakina + Ha" },
    ],
    letters: "ء ه ع ح غ خ",
  },
  {
    id: "ghunnah",
    name: "Ghunnah",
    nameArabic: "غنة",
    description: "Nasalisation prolongée (2 temps)",
    color: "330 81% 60%",
    icon: "🩷",
    detailedExplanation: "La Ghunnah est un son nasal prolongé de 2 temps qui sort du nez. Elle apparaît avec le Noon ou le Mim mushaddad (portant une Shadda). C'est le fondement de nombreuses règles du Tajwid.",
    examples: [
      { word: "إِنَّ", context: "Noon avec Shadda" },
      { word: "ثُمَّ", context: "Mim avec Shadda" },
    ],
    letters: "نّ مّ",
  },
  {
    id: "qalqala",
    name: "Qalqala",
    nameArabic: "قلقلة",
    description: "Rebond sur les lettres ق ط ب ج د",
    color: "0 84% 60%",
    icon: "🔴",
    detailedExplanation: "La Qalqala (rebond/écho) se produit sur les 5 lettres قطبجد quand elles portent un Sukun ou sont en fin de mot. La lettre est prononcée avec un léger rebond sonore. La Qalqala est plus forte en fin de verset (Qalqala Kubra) qu'au milieu d'un mot (Qalqala Sughra).",
    examples: [
      { word: "يَخْلُقْ", context: "Qaf avec Sukun en fin de mot" },
      { word: "أَحَدْ", context: "Sourate Al-Ikhlas — Qalqala Kubra" },
    ],
    letters: "ق ط ب ج د",
  },
  {
    id: "madd_tabii",
    name: "Madd Tabi'i",
    nameArabic: "مد طبيعي",
    description: "Prolongation naturelle (2 temps)",
    color: "47 96% 53%",
    icon: "🟡",
    detailedExplanation: "Le Madd Tabi'i (prolongation naturelle) est l'allongement de base de 2 temps. Il se produit avec : Alif après Fathah, Waw Sakina après Dammah, Ya Sakina après Kasrah. Aucune Hamza ni Sukun ne suit la lettre de Madd.",
    examples: [
      { word: "قَالَ", context: "Alif après Fathah — 2 temps" },
      { word: "يَقُولُ", context: "Waw après Dammah — 2 temps" },
    ],
    letters: "ا و ي",
  },
  {
    id: "madd_muttasil",
    name: "Madd Muttasil",
    nameArabic: "مد متصل",
    description: "Prolongation obligatoire (4-5 temps)",
    color: "25 95% 53%",
    icon: "🟧",
    detailedExplanation: "Le Madd Muttasil (prolongation liée) se produit quand une lettre de Madd est suivie d'une Hamza dans le MÊME mot. La prolongation est obligatoire de 4 à 5 temps selon la lecture.",
    examples: [
      { word: "جَاءَ", context: "Alif suivi de Hamza dans le même mot" },
      { word: "سُوءٌ", context: "Waw suivi de Hamza" },
    ],
    letters: "ا و ي + ء",
  },
  {
    id: "madd_munfasil",
    name: "Madd Munfasil",
    nameArabic: "مد منفصل",
    description: "Prolongation permise (2-4-5 temps)",
    color: "174 72% 40%",
    icon: "🩵",
    detailedExplanation: "Le Madd Munfasil (prolongation séparée) se produit quand un mot se termine par une lettre de Madd et le mot suivant commence par une Hamza. La prolongation varie de 2 à 5 temps selon la lecture.",
    examples: [
      { word: "بِمَا أُنْزِلَ", context: "Alif en fin de mot + Hamza au début du suivant" },
      { word: "فِي أَنْفُسِكُمْ", context: "Ya en fin de mot + Hamza" },
    ],
    letters: "ا و ي ← ء",
  },
  {
    id: "madd_lazim",
    name: "Madd Lazim",
    nameArabic: "مد لازم",
    description: "Prolongation obligatoire (6 temps)",
    color: "271 91% 65%",
    icon: "💜",
    detailedExplanation: "Le Madd Lazim (prolongation nécessaire) est la plus longue prolongation : 6 temps obligatoires. Il se produit quand une lettre de Madd est suivie d'un Sukun original (non causé par un arrêt). C'est rare dans le Coran.",
    examples: [
      { word: "الضَّالِّينَ", context: "Sourate Al-Fatiha — Alif suivi de Lam mushaddad" },
      { word: "الٓمٓ", context: "Lettres isolées au début des sourates" },
    ],
    letters: "ا و ي + سكون أصلي",
  },
  {
    id: "idgham_shafawi",
    name: "Idgham Shafawi",
    nameArabic: "إدغام شفوي",
    description: "Fusion labiale du mim sakina avec mim",
    color: "160 84% 39%",
    icon: "💚",
    detailedExplanation: "L'Idgham Shafawi se produit quand un Mim Sakina (مْ) est suivi par un autre Mim. Les deux Mim fusionnent en un seul Mim mushaddad avec une Ghunnah de 2 temps.",
    examples: [
      { word: "لَهُمْ مَا", context: "Mim Sakina + Mim" },
      { word: "أَمْ مَنْ", context: "Fusion des deux Mim" },
    ],
    letters: "مْ + م",
  },
  {
    id: "ikhfa_shafawi",
    name: "Ikhfa Shafawi",
    nameArabic: "إخفاء شفوي",
    description: "Dissimulation du mim devant ب",
    color: "220 70% 50%",
    icon: "🫐",
    detailedExplanation: "L'Ikhfa Shafawi se produit quand un Mim Sakina (مْ) est suivi par la lettre ب. Le Mim est prononcé de manière dissimulée avec une légère Ghunnah, les lèvres restant presque fermées.",
    examples: [
      { word: "تَرْمِيهِمْ بِحِجَارَةٍ", context: "Sourate Al-Fil — Mim Sakina + Ba" },
      { word: "هُمْ بِهِ", context: "Mim dissimulé devant Ba" },
    ],
    letters: "مْ + ب",
  },
  {
    id: "lam_shamsiyyah",
    name: "Lam Shamsiyyah",
    nameArabic: "لام شمسية",
    description: "Lam assimilée (lettres solaires)",
    color: "45 93% 47%",
    icon: "☀️",
    detailedExplanation: "La Lam Shamsiyyah (Lam solaire) dans l'article 'Al' (ال) est assimilée quand elle est suivie par une lettre solaire. Le Lam n'est pas prononcé et la lettre suivante est doublée (mushaddad).",
    examples: [
      { word: "الشَّمْسُ", context: "Le Lam est assimilé dans le Shin" },
      { word: "النَّاسِ", context: "Le Lam est assimilé dans le Noun" },
    ],
    letters: "ت ث د ذ ر ز س ش ص ض ط ظ ن ل",
  },
  {
    id: "lam_qamariyyah",
    name: "Lam Qamariyyah",
    nameArabic: "لام قمرية",
    description: "Lam prononcée (lettres lunaires)",
    color: "210 40% 65%",
    icon: "🌙",
    detailedExplanation: "La Lam Qamariyyah (Lam lunaire) dans l'article 'Al' (ال) est prononcée clairement quand elle est suivie par une lettre lunaire. Le Lam garde sa prononciation normale.",
    examples: [
      { word: "الْقَمَرُ", context: "Le Lam est prononcé clairement devant Qaf" },
      { word: "الْكِتَابِ", context: "Le Lam est prononcé devant Kaf" },
    ],
    letters: "ا ب ج ح خ ع غ ف ق ك م و ه ي",
  },
];

export const TAJWID_MAP = new Map(TAJWID_RULES.map((r) => [r.id, r]));

// ─── Pattern-based rule detection ───────────────────────────
// Detects tajwid rules from Arabic text patterns

const NOON_SAKIN = "نْ";
const TANWIN_FATHAH = "\u064B"; // ً
const TANWIN_DAMMAH = "\u064C"; // ٌ
const TANWIN_KASRAH = "\u064D"; // ٍ
const SUKUN = "\u0652"; // ْ
const SHADDA = "\u0651"; // ّ

const IDGHAM_BIGHUNNAH_LETTERS = "ينمو";
const IDGHAM_BILAGHUNNAH_LETTERS = "لر";
const IZHAR_LETTERS = "ءهعحغخ";
const QALQALA_LETTERS = "قطبجد";
const IKHFA_LETTERS = "تثجدذزسشصضطظفقك";

// Madd letters
const ALIF = "ا";
const WAW = "و";
const YA = "ي";
const FATHAH = "\u064E";
const DAMMAH = "\u064F";
const KASRAH = "\u0650";
const HAMZA = "ء";

// Lam Shamsiyyah letters
const SHAMS_LETTERS = "تثدذرزسشصضطظنل";

/**
 * Detect tajwid rules in an Arabic word.
 * Returns array of rule IDs found.
 */
export function detectTajwidRules(word: string): string[] {
  const rules = new Set<string>();
  const chars = [...word];

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    const next = chars[i + 1] || "";
    const next2 = chars[i + 2] || "";
    const prev = chars[i - 1] || "";

    // Noon sakina / Tanwin rules
    const isNoonSakin = c === "ن" && next === SUKUN;
    const isTanwin = [TANWIN_FATHAH, TANWIN_DAMMAH, TANWIN_KASRAH].includes(c);

    if (isNoonSakin || isTanwin) {
      const letterAfter = isNoonSakin ? next2 : next;
      if (IDGHAM_BIGHUNNAH_LETTERS.includes(letterAfter)) rules.add("idgham_bighunnah");
      else if (IDGHAM_BILAGHUNNAH_LETTERS.includes(letterAfter)) rules.add("idgham_bilaghunnah");
      else if (letterAfter === "ب") rules.add("iqlab");
      else if (IZHAR_LETTERS.includes(letterAfter)) rules.add("izhar");
      else if (IKHFA_LETTERS.includes(letterAfter)) rules.add("ikhfa");
    }

    // Ghunnah (noon/mim with shadda)
    if ((c === "ن" || c === "م") && next === SHADDA) {
      rules.add("ghunnah");
    }

    // Qalqala
    if (QALQALA_LETTERS.includes(c) && next === SUKUN) {
      rules.add("qalqala");
    }
    // Qalqala at end of word (last letter without vowel)
    if (i === chars.length - 1 && QALQALA_LETTERS.includes(c)) {
      rules.add("qalqala");
    }

    // Mim sakina rules
    if (c === "م" && next === SUKUN) {
      const after = next2;
      if (after === "م") rules.add("idgham_shafawi");
      else if (after === "ب") rules.add("ikhfa_shafawi");
    }

    // Madd rules
    if (c === ALIF && prev === FATHAH) rules.add("madd_tabii");
    if (c === WAW && prev === DAMMAH && next === SUKUN) rules.add("madd_tabii");
    if (c === YA && prev === KASRAH && next === SUKUN) rules.add("madd_tabii");

    // Madd Muttasil: madd letter followed by hamza in SAME word
    if ((c === ALIF || c === WAW || c === YA) && next === HAMZA) {
      rules.add("madd_muttasil");
    }

    // Lam in ال
    if (c === "ل" && prev === "ا" && i >= 1) {
      if (SHAMS_LETTERS.includes(next)) rules.add("lam_shamsiyyah");
      else rules.add("lam_qamariyyah");
    }
  }

  return [...rules];
}

/**
 * Analyze a full ayah text and return word-level tajwid annotations.
 */
export interface TajwidWord {
  text: string;
  rules: TajwidRule[];
  /** Primary color (first rule) */
  primaryColor: string | null;
}

export function analyzeAyahTajwid(arabicText: string): TajwidWord[] {
  const words = arabicText.split(/\s+/).filter(Boolean);
  return words.map((word) => {
    const ruleIds = detectTajwidRules(word);
    const rules = ruleIds.map((id) => TAJWID_MAP.get(id)!).filter(Boolean);
    return {
      text: word,
      rules,
      primaryColor: rules.length > 0 ? rules[0].color : null,
    };
  });
}
