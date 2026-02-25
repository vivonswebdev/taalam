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
}

export const TAJWID_RULES: TajwidRule[] = [
  {
    id: "idgham_bighunnah",
    name: "Idgham bi Ghunnah",
    nameArabic: "إدغام بغنة",
    description: "Assimilation nasale avec ي ن م و",
    color: "142 71% 45%",   // green
    icon: "🟢",
  },
  {
    id: "idgham_bilaghunnah",
    name: "Idgham bila Ghunnah",
    nameArabic: "إدغام بلا غنة",
    description: "Assimilation sans nasalité avec ل ر",
    color: "142 50% 35%",   // dark green
    icon: "🟩",
  },
  {
    id: "ikhfa",
    name: "Ikhfa",
    nameArabic: "إخفاء",
    description: "Dissimulation du noun sakina",
    color: "38 92% 50%",    // amber/orange
    icon: "🟠",
  },
  {
    id: "iqlab",
    name: "Iqlab",
    nameArabic: "إقلاب",
    description: "Conversion du noun en mim devant ب",
    color: "262 83% 58%",   // purple
    icon: "🟣",
  },
  {
    id: "izhar",
    name: "Izhar",
    nameArabic: "إظهار",
    description: "Prononciation claire du noun sakina",
    color: "199 89% 48%",   // blue
    icon: "🔵",
  },
  {
    id: "ghunnah",
    name: "Ghunnah",
    nameArabic: "غنة",
    description: "Nasalisation prolongée (2 temps)",
    color: "330 81% 60%",   // pink
    icon: "🩷",
  },
  {
    id: "qalqala",
    name: "Qalqala",
    nameArabic: "قلقلة",
    description: "Rebond sur les lettres ق ط ب ج د",
    color: "0 84% 60%",     // red
    icon: "🔴",
  },
  {
    id: "madd_tabii",
    name: "Madd Tabi'i",
    nameArabic: "مد طبيعي",
    description: "Prolongation naturelle (2 temps)",
    color: "47 96% 53%",    // yellow
    icon: "🟡",
  },
  {
    id: "madd_muttasil",
    name: "Madd Muttasil",
    nameArabic: "مد متصل",
    description: "Prolongation obligatoire (4-5 temps)",
    color: "25 95% 53%",    // orange
    icon: "🟧",
  },
  {
    id: "madd_munfasil",
    name: "Madd Munfasil",
    nameArabic: "مد منفصل",
    description: "Prolongation permise (2-4-5 temps)",
    color: "174 72% 40%",   // teal
    icon: "🩵",
  },
  {
    id: "madd_lazim",
    name: "Madd Lazim",
    nameArabic: "مد لازم",
    description: "Prolongation obligatoire (6 temps)",
    color: "271 91% 65%",   // violet
    icon: "💜",
  },
  {
    id: "idgham_shafawi",
    name: "Idgham Shafawi",
    nameArabic: "إدغام شفوي",
    description: "Fusion labiale du mim sakina avec mim",
    color: "160 84% 39%",   // emerald
    icon: "💚",
  },
  {
    id: "ikhfa_shafawi",
    name: "Ikhfa Shafawi",
    nameArabic: "إخفاء شفوي",
    description: "Dissimulation du mim devant ب",
    color: "220 70% 50%",   // indigo
    icon: "🫐",
  },
  {
    id: "lam_shamsiyyah",
    name: "Lam Shamsiyyah",
    nameArabic: "لام شمسية",
    description: "Lam assimilée (lettres solaires)",
    color: "45 93% 47%",    // gold
    icon: "☀️",
  },
  {
    id: "lam_qamariyyah",
    name: "Lam Qamariyyah",
    nameArabic: "لام قمرية",
    description: "Lam prononcée (lettres lunaires)",
    color: "210 40% 65%",   // slate blue
    icon: "🌙",
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
