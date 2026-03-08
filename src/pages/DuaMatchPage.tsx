import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useXP } from "@/hooks/useXP";
import Confetti from "@/components/Confetti";
import DifficultySelector from "@/components/DifficultySelector";

interface DuaPair {
  situation: string;
  situationEn: string;
  dua: string;
  emoji: string;
}

const DUA_PAIRS: DuaPair[] = [
  { situation: "Avant de manger", situationEn: "Before eating", dua: "بِسْمِ ٱللَّهِ", emoji: "🍽️" },
  { situation: "En entrant à la mosquée", situationEn: "Entering mosque", dua: "ٱللَّهُمَّ ٱفْتَحْ لِى أَبْوَابَ رَحْمَتِكَ", emoji: "🕌" },
  { situation: "Avant de dormir", situationEn: "Before sleeping", dua: "بِٱسْمِكَ ٱللَّهُمَّ أَمُوتُ وَأَحْيَا", emoji: "😴" },
  { situation: "En se réveillant", situationEn: "Waking up", dua: "ٱلْحَمْدُ لِلَّهِ ٱلَّذِى أَحْيَانَا", emoji: "🌅" },
  { situation: "Quand il pleut", situationEn: "When it rains", dua: "ٱللَّهُمَّ صَيِّبًا نَافِعًا", emoji: "🌧️" },
  { situation: "En voyage", situationEn: "When traveling", dua: "سُبْحَانَ ٱلَّذِى سَخَّرَ لَنَا هَٰذَا", emoji: "✈️" },
  { situation: "Après l'adhan", situationEn: "After adhan", dua: "ٱللَّهُمَّ رَبَّ هَٰذِهِ ٱلدَّعْوَةِ", emoji: "📢" },
  { situation: "En regardant le miroir", situationEn: "Looking in mirror", dua: "ٱللَّهُمَّ أَحْسِنْ خُلُقِى", emoji: "🪞" },
];

const DIFF_CONFIG: Record<string, { pairsPerRound: number; totalRounds: number; xp: number }> = {
  easy:   { pairsPerRound: 3, totalRounds: 1, xp: 10 },
  medium: { pairsPerRound: 4, totalRounds: 2, xp: 20 },
  hard:   { pairsPerRound: 4, totalRounds: 3, xp: 35 },
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function DuaMatchPage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { addXP } = useXP();

  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const [pairs, setPairs] = useState<DuaPair[]>([]);
  const [shuffledDuas, setShuffledDuas] = useState<DuaPair[]>([]);
  const [selectedSituation, setSelectedSituation] = useState<number | null>(null);
  const [selectedDua, setSelectedDua] = useState<number | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<number>>(new Set());
  const [wrongPair, setWrongPair] = useState<[number, number] | null>(null);
  const [score, setScore] = useState(0);
  const [showVictory, setShowVictory] = useState(false);

  const cfg = difficulty ? DIFF_CONFIG[difficulty] : null;

  const initRound = useCallback((r: number, diff?: string) => {
    const d = diff || difficulty;
    if (!d) return;
    const c = DIFF_CONFIG[d];
    const start = (r * c.pairsPerRound) % DUA_PAIRS.length;
    const p: DuaPair[] = [];
    for (let i = 0; i < c.pairsPerRound; i++) {
      p.push(DUA_PAIRS[(start + i) % DUA_PAIRS.length]);
    }
    setPairs(p);
    setShuffledDuas(shuffle(p));
    setMatchedIds(new Set());
    setSelectedSituation(null);
    setSelectedDua(null);
    setWrongPair(null);
  }, [difficulty]);

  useEffect(() => { if (difficulty) initRound(round); }, [round, difficulty, initRound]);

  const handleSituationClick = (idx: number) => {
    if (matchedIds.has(idx) || wrongPair) return;
    setSelectedSituation(idx);
    if (selectedDua !== null) checkMatch(idx, selectedDua);
  };

  const handleDuaClick = (idx: number) => {
    if (matchedIds.has(idx) || wrongPair) return;
    setSelectedDua(idx);
    if (selectedSituation !== null) checkMatch(selectedSituation, idx);
  };

  const checkMatch = (sitIdx: number, duaIdx: number) => {
    if (!cfg) return;
    const sit = pairs[sitIdx];
    const dua = shuffledDuas[duaIdx];
    if (sit.dua === dua.dua) {
      const newMatched = new Set(matchedIds);
      newMatched.add(sitIdx);
      setMatchedIds(newMatched);
      setScore(s => s + 10);
      setSelectedSituation(null);
      setSelectedDua(null);
      if (newMatched.size === cfg.pairsPerRound) {
        if (round + 1 >= cfg.totalRounds) {
          addXP(cfg.xp);
          setTimeout(() => setShowVictory(true), 600);
        } else {
          setTimeout(() => setRound(r => r + 1), 800);
        }
      }
    } else {
      setWrongPair([sitIdx, duaIdx]);
      setTimeout(() => { setWrongPair(null); setSelectedSituation(null); setSelectedDua(null); }, 800);
    }
  };

  const restart = () => { setRound(0); setScore(0); setShowVictory(false); };
  const getSituationLabel = (p: DuaPair) => language === "en" ? p.situationEn : p.situation;

  if (!difficulty) {
    return <DifficultySelector title={t("kidsGames.duaMatch" as any)} icon="🤲" onSelect={(d) => { setDifficulty(d); initRound(0, d); }} onBack={() => navigate(-1)} t={(k) => t(k as any)} difficulties={[
      { key: "easy", emoji: "🌱", xpBase: 10, description: "3 " + t("memoryFaith.pairs" as any) },
      { key: "medium", emoji: "🌿", xpBase: 20, description: "4 " + t("memoryFaith.pairs" as any) + " × 2" },
      { key: "hard", emoji: "🔥", xpBase: 35, description: "4 " + t("memoryFaith.pairs" as any) + " × 3" },
    ]} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 dark:from-background dark:via-background dark:to-background flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-6 pb-3">
        <button onClick={() => setDifficulty(null)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <h1 className="text-sm font-bold text-foreground flex-1">🤲 {t(`memoryFaith.${difficulty}` as any)}</h1>
        {cfg && <span className="text-[10px] text-muted-foreground">{round + 1}/{cfg.totalRounds}</span>}
        <span className="bg-primary/15 text-primary px-3 py-1 rounded-full text-xs font-bold">⭐ {score}</span>
      </div>

      <p className="text-xs text-center text-muted-foreground mb-3">{t("kidsGames.duaMatchHint" as any)}</p>

      <div className="flex-1 px-3 pb-8">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            {pairs.map((p, i) => {
              const isMatched = matchedIds.has(i);
              const isSelected = selectedSituation === i;
              const isWrong = wrongPair?.[0] === i;
              return (
                <motion.button key={`sit-${i}`} whileTap={{ scale: 0.95 }} onClick={() => handleSituationClick(i)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all ${
                    isMatched ? "bg-emerald-500/15 border-emerald-500/30 opacity-60" :
                    isWrong ? "bg-destructive/15 border-destructive/30 animate-pulse" :
                    isSelected ? "bg-primary/15 border-primary ring-2 ring-primary/30" : "bg-card border-border"
                  }`}>
                  <span className="text-xl mb-1 block">{p.emoji}</span>
                  <span className="text-xs font-semibold text-foreground">{getSituationLabel(p)}</span>
                </motion.button>
              );
            })}
          </div>
          <div className="space-y-2">
            {shuffledDuas.map((p, i) => {
              const matchIdx = pairs.findIndex(pp => pp.dua === p.dua);
              const isMatched = matchedIds.has(matchIdx);
              const isSelected = selectedDua === i;
              const isWrong = wrongPair?.[1] === i;
              return (
                <motion.button key={`dua-${i}`} whileTap={{ scale: 0.95 }} onClick={() => handleDuaClick(i)}
                  className={`w-full p-3 rounded-2xl border text-right transition-all ${
                    isMatched ? "bg-emerald-500/15 border-emerald-500/30 opacity-60" :
                    isWrong ? "bg-destructive/15 border-destructive/30 animate-pulse" :
                    isSelected ? "bg-primary/15 border-primary ring-2 ring-primary/30" : "bg-card border-border"
                  }`} dir="rtl">
                  <span className="text-xs font-bold font-quran text-foreground leading-relaxed">{p.dua}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <Confetti active={showVictory} emoji duration={3000} />
      <AnimatePresence>
        {showVictory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="bg-card border border-border rounded-3xl p-6 mx-6 text-center shadow-2xl max-w-sm w-full">
              <span className="text-5xl block mb-3">🤲</span>
              <h2 className="text-xl font-bold text-foreground mb-2">{t("memoryFaith.victory" as any)}</h2>
              <p className="text-sm text-muted-foreground mb-4">⭐ {score} XP</p>
              <div className="flex gap-2">
                <button onClick={restart} className="flex-1 py-3 rounded-2xl bg-muted text-foreground font-bold text-sm"><RotateCcw size={14} className="inline mr-1" />{t("memoryFaith.replay" as any)}</button>
                <button onClick={() => setDifficulty(null)} className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm">{t("memoryFaith.changeDifficulty" as any)}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
