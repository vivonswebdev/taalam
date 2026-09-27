import { describe, it, expect } from "vitest";
import { compareTexts, compareSurahDictation } from "@/hooks/useVoiceRecognition";
import { stripLeadingBasmala } from "@/lib/arabicMatch";

describe("compareTexts", () => {
  it("accepte la bonne récitation", () => {
    expect(compareTexts("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", "بسم الله الرحمن الرحيم").score).toBe(100);
  });

  it("ne valide pas un mot dont les lettres sont simplement permutées", () => {
    // ملك (roi) ≠ كلم (parler) : mêmes lettres, mot différent
    expect(compareTexts("مَلِكِ", "كلم").score).toBe(0);
  });

  it("tolère une petite erreur de reconnaissance (1 lettre)", () => {
    expect(compareTexts("الْمُسْتَقِيمَ", "المستقين").score).toBe(100);
  });
});

describe("compareSurahDictation", () => {
  it("un mot en trop au début ne décale pas les scores par ayah", () => {
    const ayahs = ["قُلْ هُوَ اللَّهُ أَحَدٌ", "اللَّهُ الصَّمَدُ"];
    const { ayahScores, totalScore } = compareSurahDictation(ayahs, "اه قل هو الله احد الله الصمد");
    expect(totalScore).toBe(100);
    expect(ayahScores.map((a) => a.score)).toEqual([100, 100]);
  });
});

describe("transcription iOS réelle (An-Nas, simulateur)", () => {
  // Texte renvoyé par SFSpeechRecognizer, avec son U+200F en tête
  const IOS = "‏بسم الله الرحمن الرحيم قل أعوذ برب بالناس ملك للناس إله النفس من شر الوسواس الخناس الذي يوسوس في صدور ناس من الجنة والناس";
  const AN_NAS = [
    "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ", "مَلِكِ ٱلنَّاسِ", "إِلَـٰهِ ٱلنَّاسِ",
    "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ", "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ", "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ",
  ];

  it("retire la basmala malgré la marque de direction", () => {
    expect(stripLeadingBasmala(IOS).startsWith("قل")).toBe(true);
  });

  it("valide « قل أعوذ برب » et note correctement la sourate", () => {
    const { wordResults, totalScore } = compareSurahDictation(AN_NAS, stripLeadingBasmala(IOS));
    const first = wordResults.filter((r) => r.originalIndex !== undefined).slice(0, 3);
    expect(first.every((r) => r.status === "correct")).toBe(true);
    // Erreurs réelles de reconnaissance : بالناس, للناس, النفس, ناس → score élevé mais pas 100
    expect(totalScore).toBeGreaterThanOrEqual(75);
    expect(totalScore).toBeLessThan(100);
  });
});
