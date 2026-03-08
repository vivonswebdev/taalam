import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useXP } from "@/hooks/useXP";
import Confetti from "@/components/Confetti";
import DifficultySelector from "@/components/DifficultySelector";

const VERSES_EASY = [
  { id: 1, words: ["بِسْمِ", "ٱللَّهِ"], surah: "Al-Fatiha" },
  { id: 2, words: ["ٱللَّهُ", "أَحَدٌ"], surah: "Al-Ikhlas" },
  { id: 3, words: ["ٱللَّهُ", "ٱلصَّمَدُ"], surah: "Al-Ikhlas" },
  { id: 4, words: ["قُلْ", "أَعُوذُ"], surah: "Al-Falaq" },
];

const VERSES_MEDIUM = [
  { id: 1, words: ["بِسْمِ", "ٱللَّهِ", "ٱلرَّحْمَٰنِ", "ٱلرَّحِيمِ"], surah: "Al-Fatiha 1:1" },
  { id: 2, words: ["ٱلْحَمْدُ", "لِلَّهِ", "رَبِّ", "ٱلْعَٰلَمِينَ"], surah: "Al-Fatiha 1:2" },
  { id: 3, words: ["قُلْ", "هُوَ", "ٱللَّهُ", "أَحَدٌ"], surah: "Al-Ikhlas 112:1" },
  { id: 4, words: ["قُلْ", "أَعُوذُ", "بِرَبِّ", "ٱلْفَلَقِ"], surah: "Al-Falaq 113:1" },
  { id: 5, words: ["إِيَّاكَ", "نَعْبُدُ", "وَإِيَّاكَ", "نَسْتَعِينُ"], surah: "Al-Fatiha 1:5" },
];

const VERSES_HARD = [
  { id: 1, words: ["بِسْمِ", "ٱللَّهِ", "ٱلرَّحْمَٰنِ", "ٱلرَّحِيمِ"], surah: "Al-Fatiha 1:1" },
  { id: 2, words: ["ٱلْحَمْدُ", "لِلَّهِ", "رَبِّ", "ٱلْعَٰلَمِينَ"], surah: "Al-Fatiha 1:2" },
  { id: 3, words: ["إِيَّاكَ", "نَعْبُدُ", "وَإِيَّاكَ", "نَسْتَعِينُ"], surah: "Al-Fatiha 1:5" },
  { id: 4, words: ["وَٱلْعَصْرِ", "إِنَّ", "ٱلْإِنسَٰنَ", "لَفِى", "خُسْرٍ"], surah: "Al-Asr 103:1-2" },
  { id: 5, words: ["فَٱذْكُرُونِى", "أَذْكُرْكُمْ", "وَٱشْكُرُوا", "لِى", "وَلَا", "تَكْفُرُونِ"], surah: "Al-Baqarah 2:152" },
  { id: 6, words: ["وَمَن", "يَتَوَكَّلْ", "عَلَى", "ٱللَّهِ", "فَهُوَ", "حَسْبُهُ"], surah: "At-Talaq 65:3" },
];

const VERSE_SETS: Record<string, typeof VERSES_EASY> = { easy: VERSES_EASY, medium: VERSES_MEDIUM, hard: VERSES_HARD };
const XP_MAP: Record<string, number> = { easy: 5, medium: 8, hard: 12 };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuranWordOrderPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addXP } = useXP();

  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showVictory, setShowVictory] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);

  const verses = difficulty ? VERSE_SETS[difficulty] : [];
  const verse = verses[level % verses.length];
  const hasTimer = difficulty === "hard";

  const initLevel = useCallback((lvl: number, diff?: string) => {
    const d = diff || difficulty;
    if (!d) return;
    const v = VERSE_SETS[d][lvl % VERSE_SETS[d].length];
    setShuffledWords(shuffle(v.words));
    setSelected([]);
    setIsCorrect(null);
    if (d === "hard") setTimer(15);
  }, [difficulty]);

  useEffect(() => { if (difficulty) initLevel(level); }, [level, difficulty, initLevel]);

  // Timer countdown for hard mode
  useEffect(() => {
    if (!hasTimer || timer === null || timer <= 0 || isCorrect !== null) return;
    const id = setTimeout(() => setTimer(t => t !== null ? t - 1 : null), 1000);
    return () => clearTimeout(id);
  }, [timer, hasTimer, isCorrect]);

  useEffect(() => {
    if (hasTimer && timer === 0 && isCorrect === null) {
      setIsCorrect(false);
    }
  }, [timer, hasTimer, isCorrect]);

  const handleWordTap = (word: string) => {
    if (isCorrect !== null) return;
    const newSelected = [...selected, word];
    setSelected(newSelected);
    setShuffledWords(prev => {
      const idx = prev.indexOf(word);
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });

    if (newSelected.length === verse.words.length) {
      const correct = newSelected.every((w, i) => w === verse.words[i]);
      setIsCorrect(correct);
      if (correct) {
        const xp = XP_MAP[difficulty!] + level;
        setScore(s => s + xp);
        addXP(xp);
        if (level >= verses.length - 1) {
          setTimeout(() => setShowVictory(true), 800);
        }
      }
    }
  };

  const undoLast = () => {
    if (selected.length === 0 || isCorrect !== null) return;
    const last = selected[selected.length - 1];
    setSelected(prev => prev.slice(0, -1));
    setShuffledWords(prev => [...prev, last]);
  };

  const nextLevel = () => setLevel(l => l + 1);
  const retry = () => initLevel(level);
  const restart = () => { setLevel(0); setScore(0); setShowVictory(false); };

  if (!difficulty) {
    return <DifficultySelector title={t("kidsGames.quranWordOrder" as any)} icon="🔤" onSelect={(d) => { setDifficulty(d); initLevel(0, d); }} onBack={() => navigate(-1)} t={(k) => t(k as any)} difficulties={[
      { key: "easy", emoji: "🌱", xpBase: 5, description: "2 " + t("kidsGames.wordsPerVerse" as any) },
      { key: "medium", emoji: "🌿", xpBase: 8, description: "4 " + t("kidsGames.wordsPerVerse" as any) },
      { key: "hard", emoji: "🔥", xpBase: 12, description: "5-6 " + t("kidsGames.wordsPerVerse" as any) + " + ⏱️" },
    ]} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-cyan-50 dark:from-background dark:via-background dark:to-background flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-6 pb-3">
        <button onClick={() => setDifficulty(null)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <h1 className="text-sm font-bold text-foreground flex-1">🔤 {t(`memoryFaith.${difficulty}` as any)}</h1>
        {hasTimer && timer !== null && (
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${timer <= 5 ? "bg-destructive/15 text-destructive animate-pulse" : "bg-muted text-muted-foreground"}`}>⏱️ {timer}s</span>
        )}
        <span className="bg-primary/15 text-primary px-3 py-1 rounded-full text-xs font-bold">⭐ {score}</span>
      </div>

      <div className="px-4 mb-2">
        <p className="text-xs text-muted-foreground text-center">{verse?.surah} — {t("kidsGames.level" as any)} {level + 1}/{verses.length}</p>
      </div>

      <div className="px-4 mb-4">
        <div className="min-h-[70px] bg-card border-2 border-dashed border-primary/30 rounded-2xl p-3 flex flex-wrap gap-2 justify-center items-center" dir="rtl">
          {selected.length === 0 && <p className="text-xs text-muted-foreground">{t("kidsGames.tapWordsHint" as any)}</p>}
          <AnimatePresence>
            {selected.map((w, i) => (
              <motion.span key={`${w}-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                className={`px-3 py-2 rounded-xl text-lg font-bold font-quran ${
                  isCorrect === true ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" :
                  isCorrect === false ? "bg-destructive/20 text-destructive" : "bg-primary/10 text-foreground"
                }`}>{w}</motion.span>
            ))}
          </AnimatePresence>
        </div>
        {selected.length > 0 && isCorrect === null && (
          <button onClick={undoLast} className="mt-2 text-xs text-muted-foreground underline mx-auto block">↩ {t("common.undo" as any)}</button>
        )}
      </div>

      <div className="px-4 flex-1">
        <div className="flex flex-wrap gap-2 justify-center" dir="rtl">
          {shuffledWords.map((w, i) => (
            <motion.button key={`${w}-${i}`} whileTap={{ scale: 0.9 }} onClick={() => handleWordTap(w)}
              className="px-4 py-3 rounded-2xl bg-card border border-border shadow-md text-lg font-bold font-quran text-foreground active:bg-primary/10 transition-colors">{w}</motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isCorrect !== null && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className={`mx-4 mb-6 p-4 rounded-2xl flex items-center gap-3 ${isCorrect ? "bg-emerald-500/15 border border-emerald-500/30" : "bg-destructive/10 border border-destructive/30"}`}>
            <span className="text-2xl">{isCorrect ? "✅" : "❌"}</span>
            <p className="flex-1 text-sm font-bold text-foreground">{isCorrect ? t("kidsGames.correct" as any) : t("kidsGames.tryAgain" as any)}</p>
            <button onClick={isCorrect ? nextLevel : retry} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center gap-1">
              {isCorrect ? <><ChevronRight size={14} /> {t("common.next" as any)}</> : <><RotateCcw size={14} /> {t("memoryFaith.replay" as any)}</>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Confetti active={showVictory} emoji duration={3000} />
      <AnimatePresence>
        {showVictory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="bg-card border border-border rounded-3xl p-6 mx-6 text-center shadow-2xl max-w-sm w-full">
              <span className="text-5xl block mb-3">🏆</span>
              <h2 className="text-xl font-bold text-foreground mb-2">{t("memoryFaith.victory" as any)}</h2>
              <p className="text-sm text-muted-foreground mb-4">⭐ {score} XP</p>
              <div className="flex gap-2">
                <button onClick={restart} className="flex-1 py-3 rounded-2xl bg-muted text-foreground font-bold text-sm">{t("memoryFaith.replay" as any)}</button>
                <button onClick={() => setDifficulty(null)} className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm">{t("memoryFaith.changeDifficulty" as any)}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
