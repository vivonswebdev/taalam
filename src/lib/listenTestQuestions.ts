import { surahs } from "@/data/surahs";
import type { QuizQuestion } from "@/data/quizQuestions";

/**
 * Generate 3-5 quiz questions based on a surah the user just listened to.
 * Does NOT modify any existing quiz logic.
 */
export function generateListenTestQuestions(surahNumber: number): QuizQuestion[] {
  const surah = surahs.find((s) => s.number === surahNumber);
  if (!surah || surah.ayahs.length === 0) return [];

  const questions: QuizQuestion[] = [];

  // 1. Which surah did you just listen to?
  const otherSurahs = surahs.filter((s) => s.number !== surahNumber);
  const decoys1 = shuffle(otherSurahs).slice(0, 3);
  const opts1 = shuffle([
    surah.nameArabic,
    ...decoys1.map((s) => s.nameArabic),
  ]);
  questions.push({
    question: `Quelle sourate venez-vous d'écouter ?`,
    options: opts1,
    correctIndex: opts1.indexOf(surah.nameArabic),
    category: "memorization",
  });

  // 2. How many ayahs?
  const correctCount = surah.versesCount;
  const wrongCounts = shuffle(
    [correctCount + 2, correctCount - 1, correctCount + 5].filter((n) => n > 0 && n !== correctCount)
  ).slice(0, 3);
  while (wrongCounts.length < 3) wrongCounts.push(correctCount + wrongCounts.length + 3);
  const opts2 = shuffle([String(correctCount), ...wrongCounts.map(String)]);
  questions.push({
    question: `Combien d'ayahs comporte la sourate ${surah.name} ?`,
    options: opts2,
    correctIndex: opts2.indexOf(String(correctCount)),
    category: "memorization",
  });

  // 3. Complete the first ayah (if ayahs available)
  if (surah.ayahs.length >= 2) {
    const firstAyah = surah.ayahs[0];
    const words = firstAyah.arabic.split(" ");
    if (words.length >= 4) {
      const half = Math.floor(words.length / 2);
      const prompt = words.slice(0, half).join(" ") + " ____";
      const correctEnd = words.slice(half).join(" ");
      // Pick wrong endings from other ayahs
      const wrongEnds = shuffle(
        surah.ayahs
          .slice(1)
          .map((a) => {
            const w = a.arabic.split(" ");
            return w.slice(Math.floor(w.length / 2)).join(" ");
          })
          .filter((e) => e !== correctEnd)
      ).slice(0, 3);
      if (wrongEnds.length >= 2) {
        while (wrongEnds.length < 3) wrongEnds.push(surah.ayahs[1].arabic);
        const opts3 = shuffle([correctEnd, ...wrongEnds]);
        questions.push({
          question: `Complétez : « ${prompt} »`,
          options: opts3,
          correctIndex: opts3.indexOf(correctEnd),
          category: "memorization",
        });
      }
    }
  }

  // 4. What comes after ayah 1?
  if (surah.ayahs.length >= 3) {
    const ayah1 = surah.ayahs[0];
    const ayah2 = surah.ayahs[1];
    const wrongNexts = shuffle(
      surah.ayahs.slice(2).map((a) => a.arabic).filter((t) => t !== ayah2.arabic)
    ).slice(0, 3);
    if (wrongNexts.length >= 2) {
      while (wrongNexts.length < 3) wrongNexts.push(surah.ayahs[surah.ayahs.length - 1].arabic);
      const truncate = (t: string) => t.length > 50 ? t.slice(0, 50) + "…" : t;
      const opts4 = shuffle([ayah2.arabic, ...wrongNexts]).map(truncate);
      const correctTrunc = truncate(ayah2.arabic);
      questions.push({
        question: `Après « ${truncate(ayah1.arabic)} », quelle est l'ayah suivante ?`,
        options: opts4,
        correctIndex: opts4.indexOf(correctTrunc),
        category: "memorization",
      });
    }
  }

  // 5. Surah position question
  const surahIdx = surahs.findIndex((s) => s.number === surahNumber);
  if (surahIdx >= 0) {
    const neighbors = [
      surahIdx > 0 ? surahs[surahIdx - 1] : null,
      surahIdx < surahs.length - 1 ? surahs[surahIdx + 1] : null,
    ].filter(Boolean) as typeof surahs;
    if (neighbors.length >= 1) {
      const after = surahIdx < surahs.length - 1 ? surahs[surahIdx + 1] : null;
      if (after) {
        const decoys5 = shuffle(surahs.filter((s) => s.number !== after.number && s.number !== surahNumber)).slice(0, 3);
        const opts5 = shuffle([after.name, ...decoys5.map((s) => s.name)]);
        questions.push({
          question: `Quelle sourate vient juste APRÈS ${surah.name} dans le Muṣḥaf ?`,
          options: opts5,
          correctIndex: opts5.indexOf(after.name),
          category: "memorization",
        });
      }
    }
  }

  return questions.slice(0, 5);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
