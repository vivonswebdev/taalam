import { describe, it, expect } from "vitest";
import { compareTexts, compareSurahDictation } from "@/hooks/useVoiceRecognition";

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
