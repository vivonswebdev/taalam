import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import { useLanguage, Lang } from "@/hooks/useLanguage";
import { buildCards, MEMORY_LEVELS, MemoryCard } from "@/data/memoryCoranCards";

export default function KidsMemoryCoranPage() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();

  const [level, setLevel] = useState<number | null>(null);
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const labels: Record<string, Record<string, string>> = {
    title: { fr: "Memory Coran", en: "Quran Memory", ar: "ذاكرة القرآن", nl: "Koran Memory", tr: "Kuran Hafıza", ur: "قرآن میموری" },
    selectLevel: { fr: "Choisis un niveau", en: "Choose a level", ar: "اختر مستوى", nl: "Kies een niveau", tr: "Seviye seç", ur: "سطح منتخب کریں" },
    easy: { fr: "Facile (3 paires)", en: "Easy (3 pairs)", ar: "سهل (٣ أزواج)", nl: "Makkelijk (3 paren)", tr: "Kolay (3 çift)", ur: "آسان (3 جوڑے)" },
    medium: { fr: "Moyen (6 paires)", en: "Medium (6 pairs)", ar: "متوسط (٦ أزواج)", nl: "Gemiddeld (6 paren)", tr: "Orta (6 çift)", ur: "درمیانہ (6 جوڑے)" },
    hard: { fr: "Difficile (10 paires)", en: "Hard (10 pairs)", ar: "صعب (١٠ أزواج)", nl: "Moeilijk (10 paren)", tr: "Zor (10 çift)", ur: "مشکل (10 جوڑے)" },
    bravo: { fr: "Bravo ! MashaAllah ! 🎉", en: "Bravo! MashaAllah! 🎉", ar: "أحسنت! ماشاء الله! 🎉", nl: "Bravo! MashaAllah! 🎉", tr: "Bravo! MaşaAllah! 🎉", ur: "شاباش! ماشاء اللہ! 🎉" },
    attempts: { fr: "Tentatives", en: "Attempts", ar: "محاولات", tr: "Deneme", nl: "Pogingen", ur: "کوششیں" },
    time: { fr: "Temps", en: "Time", ar: "الوقت", nl: "Tijd", tr: "Süre", ur: "وقت" },
    retry: { fr: "Rejouer", en: "Play again", ar: "إعادة", nl: "Opnieuw", tr: "Tekrar", ur: "دوبارہ" },
    back: { fr: "Menu", en: "Menu", ar: "القائمة", nl: "Menu", tr: "Menü", ur: "مینیو" },
  };
  const L = (k: string) => labels[k]?.[lang] || labels[k]?.fr || k;

  const startGame = useCallback((lvl: number) => {
    setLevel(lvl);
    setCards(buildCards(MEMORY_LEVELS[lvl].pairs));
    setFlipped(new Set());
    setMatched(new Set());
    setSelected([]);
    setAttempts(0);
    setStartTime(Date.now());
    setGameWon(false);
  }, []);

  const handleCardClick = useCallback((cardId: string) => {
    if (isChecking || flipped.has(cardId) || matched.has(cardId) || selected.length >= 2) return;
    
    const newSelected = [...selected, cardId];
    setFlipped(prev => new Set([...prev, cardId]));
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setIsChecking(true);
      setAttempts(a => a + 1);
      const c1 = cards.find(c => c.id === newSelected[0])!;
      const c2 = cards.find(c => c.id === newSelected[1])!;
      
      if (c1.pairId === c2.pairId) {
        setTimeout(() => {
          setMatched(prev => new Set([...prev, newSelected[0], newSelected[1]]));
          setSelected([]);
          setIsChecking(false);
        }, 600);
      } else {
        setTimeout(() => {
          setFlipped(prev => {
            const s = new Set(prev);
            s.delete(newSelected[0]);
            s.delete(newSelected[1]);
            return s;
          });
          setSelected([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  }, [isChecking, flipped, matched, selected, cards]);

  useEffect(() => {
    if (cards.length > 0 && matched.size === cards.length) {
      setGameWon(true);
    }
  }, [matched, cards]);

  const elapsedSec = gameWon ? Math.round((Date.now() - startTime) / 1000) : 0;

  // Level select
  if (level === null) {
    return (
      <div className="min-h-screen pb-24 px-5 pt-14">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/kids")} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold">🕌 {L("title")}</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{L("selectLevel")}</p>
        <div className="flex flex-col gap-3">
          {["easy", "medium", "hard"].map((lbl, i) => (
            <motion.button key={lbl} whileTap={{ scale: 0.96 }}
              onClick={() => startGame(i)}
              className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600/20 to-teal-600/10 border border-emerald-500/20 text-left">
              <p className="font-bold text-foreground">{L(lbl)}</p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // Win screen
  if (gameWon) {
    return (
      <div className="min-h-screen pb-24 px-5 pt-14 flex flex-col items-center justify-center gap-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl">🏆</motion.div>
        <h2 className="text-xl font-bold text-foreground">{L("bravo")}</h2>
        <p className="text-sm text-muted-foreground">{L("attempts")}: {attempts} · {L("time")}: {elapsedSec}s</p>
        <div className="flex gap-3 mt-4">
          <button onClick={() => startGame(level)} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center gap-1">
            <RotateCcw size={14} /> {L("retry")}
          </button>
          <button onClick={() => setLevel(null)} className="px-4 py-2 rounded-xl bg-muted text-foreground text-sm font-bold">
            {L("back")}
          </button>
        </div>
      </div>
    );
  }

  const cols = cards.length <= 6 ? 2 : cards.length <= 12 ? 3 : 4;

  return (
    <div className="min-h-screen pb-24 px-4 pt-14">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setLevel(null)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold flex-1">🕌 {L("title")}</h1>
        <span className="text-xs text-muted-foreground">{L("attempts")}: {attempts}</span>
      </div>

      <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {cards.map(card => {
          const isFlipped = flipped.has(card.id) || matched.has(card.id);
          const isMatched = matched.has(card.id);
          return (
            <motion.button
              key={card.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardClick(card.id)}
              className={`aspect-[3/4] rounded-xl flex items-center justify-center p-2 text-center transition-all duration-300 ${
                isMatched
                  ? "bg-emerald-500/30 border-2 border-emerald-400"
                  : isFlipped
                  ? "bg-primary/20 border-2 border-primary"
                  : "bg-gradient-to-br from-primary/40 to-primary/20 border border-primary/30"
              }`}
            >
              {isFlipped ? (
                <motion.span initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} className="text-xs font-semibold text-foreground leading-tight break-words">
                  {card.text[lang as keyof typeof card.text] || card.text.fr}
                </motion.span>
              ) : (
                <span className="text-2xl">📖</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
