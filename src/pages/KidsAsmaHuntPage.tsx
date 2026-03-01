import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { ASMA_UL_HUSNA, AsmaName } from "@/data/asmaUlHusnaData";

const GRID_W = 11;
const GRID_H = 9;

function generateMap(): number[][] {
  const grid: number[][] = Array.from({ length: GRID_H }, () => Array(GRID_W).fill(0));
  // borders
  for (let x = 0; x < GRID_W; x++) { grid[0][x] = 1; grid[GRID_H - 1][x] = 1; }
  for (let y = 0; y < GRID_H; y++) { grid[y][0] = 1; grid[y][GRID_W - 1] = 1; }
  // random inner walls
  for (let i = 0; i < 12; i++) {
    const x = 2 + Math.floor(Math.random() * (GRID_W - 4));
    const y = 2 + Math.floor(Math.random() * (GRID_H - 4));
    if (!(x === 1 && y === 1)) grid[y][x] = 1;
  }
  grid[1][1] = 0; // ensure player start clear
  return grid;
}

interface Bubble { x: number; y: number; nameIdx: number; collected: boolean; }

function placeBubbles(grid: number[][], count: number, levelOffset: number): Bubble[] {
  const bubbles: Bubble[] = [];
  const used = new Set<string>();
  used.add("1,1");
  let placed = 0;
  let attempts = 0;
  while (placed < count && attempts < 200) {
    const x = 1 + Math.floor(Math.random() * (GRID_W - 2));
    const y = 1 + Math.floor(Math.random() * (GRID_H - 2));
    const key = `${x},${y}`;
    if (grid[y][x] === 0 && !used.has(key)) {
      used.add(key);
      bubbles.push({ x, y, nameIdx: levelOffset + placed, collected: false });
      placed++;
    }
    attempts++;
  }
  return bubbles;
}

export default function KidsAsmaHuntPage() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [level, setLevel] = useState<number | null>(null);
  const [grid, setGrid] = useState<number[][]>([]);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [collected, setCollected] = useState<AsmaName[]>([]);
  const [showCard, setShowCard] = useState<AsmaName | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const LEVELS = [
    { count: 5, label: "5" },
    { count: 10, label: "10" },
    { count: 15, label: "15" },
  ];

  const labels: Record<string, Record<string, string>> = {
    title: { fr: "Noms d'Allah", en: "Names of Allah", ar: "أسماء الله الحسنى", nl: "Namen van Allah", tr: "Allah'ın İsimleri", ur: "اللہ کے نام" },
    selectLevel: { fr: "Choisis un niveau", en: "Choose a level", ar: "اختر مستوى", nl: "Kies een niveau", tr: "Seviye seç", ur: "سطح منتخب کریں" },
    level: { fr: "Niveau", en: "Level", ar: "مستوى", nl: "Niveau", tr: "Seviye", ur: "سطح" },
    names: { fr: "noms", en: "names", ar: "أسماء", nl: "namen", tr: "isim", ur: "نام" },
    collected: { fr: "Collectés", en: "Collected", ar: "مجموعة", nl: "Verzameld", tr: "Toplanan", ur: "جمع شدہ" },
    quiz: { fr: "Quiz des Noms", en: "Names Quiz", ar: "اختبار الأسماء", nl: "Namen Quiz", tr: "İsim Testi", ur: "ناموں کا کوئز" },
    bravo: { fr: "MashaAllah ! 🌟", en: "MashaAllah! 🌟", ar: "ماشاء الله! 🌟", nl: "MashaAllah! 🌟", tr: "MaşaAllah! 🌟", ur: "ماشاء اللہ! 🌟" },
    retry: { fr: "Rejouer", en: "Retry", ar: "إعادة", nl: "Opnieuw", tr: "Tekrar", ur: "دوبارہ" },
    menu: { fr: "Menu", en: "Menu", ar: "القائمة", nl: "Menu", tr: "Menü", ur: "مینیو" },
    whatMeans: { fr: "Que signifie", en: "What does", ar: "ماذا يعني", nl: "Wat betekent", tr: "Ne demek", ur: "کیا مطلب ہے" },
    score: { fr: "Score quiz", en: "Quiz score", ar: "نتيجة", nl: "Quiz score", tr: "Test puanı", ur: "کوئز سکور" },
  };
  const L = (k: string) => labels[k]?.[lang] || labels[k]?.fr || k;

  const startLevel = (lvl: number) => {
    const g = generateMap();
    const offset = lvl * 5;
    const count = Math.min(LEVELS[lvl].count, ASMA_UL_HUSNA.length - offset);
    setGrid(g);
    setBubbles(placeBubbles(g, count, offset));
    setPlayerPos({ x: 1, y: 1 });
    setCollected([]);
    setShowCard(null);
    setShowQuiz(false);
    setQuizIdx(0);
    setQuizScore(0);
    setQuizAnswer(null);
    setFinished(false);
    setLevel(lvl);
  };

  const move = useCallback((dx: number, dy: number) => {
    if (showCard || showQuiz || finished) return;
    setPlayerPos(prev => {
      const nx = prev.x + dx;
      const ny = prev.y + dy;
      if (ny < 0 || ny >= GRID_H || nx < 0 || nx >= GRID_W || grid[ny][nx] === 1) return prev;
      // Check bubble
      const bi = bubbles.findIndex(b => b.x === nx && b.y === ny && !b.collected);
      if (bi >= 0) {
        const name = ASMA_UL_HUSNA[bubbles[bi].nameIdx];
        if (name) {
          setBubbles(bs => bs.map((b, i) => i === bi ? { ...b, collected: true } : b));
          setCollected(c => [...c, name]);
          setShowCard(name);
        }
      }
      return { x: nx, y: ny };
    });
  }, [grid, bubbles, showCard, showQuiz, finished]);

  // Check all collected
  useEffect(() => {
    if (level !== null && bubbles.length > 0 && bubbles.every(b => b.collected) && !showCard && !showQuiz && !finished) {
      setShowQuiz(true);
      setQuizIdx(0);
      setQuizScore(0);
      setQuizAnswer(null);
    }
  }, [bubbles, showCard, showQuiz, finished, level]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") move(0, -1);
      else if (e.key === "ArrowDown") move(0, 1);
      else if (e.key === "ArrowLeft") move(-1, 0);
      else if (e.key === "ArrowRight") move(1, 0);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [move]);

  // Canvas render
  useEffect(() => {
    if (!canvasRef.current || level === null) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const cs = Math.floor(Math.min((window.innerWidth - 40) / GRID_W, 240 / GRID_H));
    canvasRef.current.width = GRID_W * cs;
    canvasRef.current.height = GRID_H * cs;

    grid.forEach((row, ry) => row.forEach((cell, rx) => {
      ctx.fillStyle = cell === 1 ? "#1a3a2f" : "#0a1a14";
      ctx.fillRect(rx * cs, ry * cs, cs, cs);
    }));

    // Bubbles
    ctx.font = `${cs * 0.5}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    bubbles.forEach(b => {
      if (b.collected) return;
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(b.x * cs + cs / 2, b.y * cs + cs / 2, cs * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.font = `bold ${cs * 0.3}px sans-serif`;
      ctx.fillText("✨", b.x * cs + cs / 2, b.y * cs + cs / 2);
    });

    // Player
    ctx.font = `${cs * 0.6}px sans-serif`;
    ctx.fillText("🧒", playerPos.x * cs + cs / 2, playerPos.y * cs + cs / 2);
  }, [grid, bubbles, playerPos, level]);

  // Quiz logic
  const quizNames = collected;
  const currentQuizName = quizNames[quizIdx];
  const quizOptions = currentQuizName ? (() => {
    const correct = currentQuizName.meaning[lang as keyof typeof currentQuizName.meaning] || currentQuizName.meaning.fr;
    const others = ASMA_UL_HUSNA.filter(n => n.id !== currentQuizName.id).sort(() => Math.random() - 0.5).slice(0, 3)
      .map(n => n.meaning[lang as keyof typeof n.meaning] || n.meaning.fr);
    const all = [correct, ...others].sort(() => Math.random() - 0.5);
    return { options: all, correctIdx: all.indexOf(correct) };
  })() : null;

  const handleQuizAnswer = (idx: number) => {
    if (quizAnswer !== null) return;
    setQuizAnswer(idx);
    if (idx === quizOptions!.correctIdx) setQuizScore(s => s + 1);
    setTimeout(() => {
      if (quizIdx + 1 >= quizNames.length) {
        setFinished(true);
        setShowQuiz(false);
      } else {
        setQuizIdx(i => i + 1);
        setQuizAnswer(null);
      }
    }, 1200);
  };

  if (level === null) {
    return (
      <div className="min-h-screen pb-24 px-5 pt-14">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/kids")} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"><ArrowLeft size={18} /></button>
          <h1 className="text-xl font-bold">✨ {L("title")}</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{L("selectLevel")}</p>
        <div className="flex flex-col gap-3">
          {LEVELS.map((lv, i) => (
            <motion.button key={i} whileTap={{ scale: 0.96 }} onClick={() => startLevel(i)}
              className="p-4 rounded-2xl bg-gradient-to-br from-amber-600/20 to-yellow-600/10 border border-amber-500/20 text-left">
              <p className="font-bold text-foreground">{L("level")} {i + 1} – {lv.count} {L("names")}</p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen pb-24 px-5 pt-14 flex flex-col items-center justify-center gap-4">
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl">🌟</motion.p>
        <h2 className="text-xl font-bold">{L("bravo")}</h2>
        <p className="text-sm text-muted-foreground">{L("collected")}: {collected.length} · {L("score")}: {quizScore}/{collected.length}</p>
        <div className="flex gap-3 mt-4">
          <button onClick={() => startLevel(level)} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center gap-1"><RotateCcw size={14} /> {L("retry")}</button>
          <button onClick={() => setLevel(null)} className="px-4 py-2 rounded-xl bg-muted text-foreground text-sm font-bold">{L("menu")}</button>
        </div>
        {/* Show collected names */}
        <div className="mt-4 w-full max-w-sm flex flex-col gap-2">
          {collected.map(n => (
            <div key={n.id} className="p-2 rounded-xl bg-card border border-border text-center">
              <p className="text-lg font-bold">{n.arabic}</p>
              <p className="text-xs text-muted-foreground">{n.transliteration} – {n.meaning[lang as keyof typeof n.meaning] || n.meaning.fr}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-14">
      <div className="flex items-center gap-3 mb-3">
        <button onClick={() => setLevel(null)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"><ArrowLeft size={18} /></button>
        <h1 className="text-lg font-bold flex-1">✨ {L("title")}</h1>
        <span className="text-xs text-muted-foreground">{L("collected")}: {collected.length}/{bubbles.length}</span>
      </div>

      {!showQuiz && (
        <>
          <div className="flex justify-center mb-3">
            <canvas ref={canvasRef} className="rounded-xl border border-border" />
          </div>
          <div className="flex justify-center">
            <div className="grid grid-cols-3 gap-1 w-32">
              <div />
              <button onClick={() => move(0, -1)} className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center active:bg-primary/40"><ChevronUp size={20} /></button>
              <div />
              <button onClick={() => move(-1, 0)} className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center active:bg-primary/40"><ChevronLeft size={20} /></button>
              <div />
              <button onClick={() => move(1, 0)} className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center active:bg-primary/40"><ChevronRight size={20} /></button>
              <div />
              <button onClick={() => move(0, 1)} className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center active:bg-primary/40"><ChevronDown size={20} /></button>
              <div />
            </div>
          </div>
        </>
      )}

      {/* Name card popup */}
      <AnimatePresence>
        {showCard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6"
            onClick={() => setShowCard(null)}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-xs w-full text-center" onClick={e => e.stopPropagation()}>
              <p className="text-3xl font-bold mb-1">{showCard.arabic}</p>
              <p className="text-sm font-semibold text-primary mb-1">{showCard.transliteration}</p>
              <p className="text-sm text-foreground mb-2">{showCard.meaning[lang as keyof typeof showCard.meaning] || showCard.meaning.fr}</p>
              <p className="text-xs text-muted-foreground mb-4">{showCard.explanation[lang as keyof typeof showCard.explanation] || showCard.explanation.fr}</p>
              <button onClick={() => setShowCard(null)} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold">OK ✨</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz overlay */}
      {showQuiz && currentQuizName && quizOptions && (
        <div className="mt-4">
          <h3 className="text-sm font-bold text-foreground mb-3">{L("quiz")} ({quizIdx + 1}/{quizNames.length})</h3>
          <p className="text-sm mb-3">{L("whatMeans")} <strong>{currentQuizName.arabic}</strong> ({currentQuizName.transliteration}) ?</p>
          <div className="flex flex-col gap-2">
            {quizOptions.options.map((opt, i) => {
              let bg = "bg-card border border-border";
              if (quizAnswer !== null && i === quizOptions.correctIdx) bg = "bg-emerald-500/20 border-emerald-400";
              else if (quizAnswer === i && i !== quizOptions.correctIdx) bg = "bg-red-500/20 border-red-400";
              return (
                <button key={i} onClick={() => handleQuizAnswer(i)}
                  className={`p-3 rounded-xl text-sm text-left ${bg}`}>{opt}</button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
