import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

// 0=path, 1=wall, 2=player start, C1-C5=checkpoints
const MAZES = [
  // Level 1 – simple, 3 checkpoints
  {
    grid: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,0,0,0,1,0,0,0,0,0,0,1],
      [1,0,1,1,0,1,0,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,1,0,1],
      [1,1,1,0,1,1,1,1,1,0,1,0,1],
      [1,0,0,0,0,0,0,0,1,0,0,0,1],
      [1,0,1,1,1,1,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    checkpoints: [
      { x: 3, y: 1, step: 0 },
      { x: 6, y: 5, step: 1 },
      { x: 11, y: 7, step: 2 },
    ],
    steps: ["Qiyam","Rukû","Sujûd"],
  },
  // Level 2 – all 5 steps
  {
    grid: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,0,0,0,1,0,0,0,0,1,0,0,0,1],
      [1,0,1,1,0,1,0,1,1,0,1,0,1,0,1],
      [1,0,0,0,0,0,0,0,1,0,0,0,1,0,1],
      [1,1,1,0,1,1,1,0,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,0,1,1,1,1,1,0,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,0,1,1,1,0,1,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    checkpoints: [
      { x: 4, y: 1, step: 0 },
      { x: 8, y: 3, step: 1 },
      { x: 5, y: 5, step: 2 },
      { x: 10, y: 7, step: 3 },
      { x: 13, y: 9, step: 4 },
    ],
    steps: ["Qiyam","Rukû","Sujûd","Tashahhud","Salam"],
  },
];

const STEP_EMOJIS = ["🧍","🙇","🤲","🧎","👋"];
const STEP_LABELS: Record<string, Record<string, string>> = {
  Qiyam: { fr: "Qiyam (debout)", en: "Qiyam (standing)", ar: "القيام", nl: "Qiyam (staan)", tr: "Kıyam", ur: "قیام" },
  "Rukû": { fr: "Rukû (inclinaison)", en: "Ruku (bowing)", ar: "الركوع", nl: "Rukoe (buigen)", tr: "Rükû", ur: "رکوع" },
  "Sujûd": { fr: "Sujûd (prosternation)", en: "Sujud (prostration)", ar: "السجود", nl: "Sudjoed (knielen)", tr: "Sücud", ur: "سجدہ" },
  Tashahhud: { fr: "Tashahhud (attestation)", en: "Tashahhud (testimony)", ar: "التشهد", nl: "Tashahoed", tr: "Tahiyyat", ur: "تشہد" },
  Salam: { fr: "Salam (salutation)", en: "Salam (greeting)", ar: "السلام", nl: "Salaam", tr: "Selam", ur: "سلام" },
};

export default function KidsPrayerMazePage() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [nextStep, setNextStep] = useState(0);
  const [won, setWon] = useState(false);
  const [startTime, setStartTime] = useState(0);

  const labels: Record<string, Record<string, string>> = {
    title: { fr: "Labyrinthe de la Prière", en: "Prayer Maze", ar: "متاهة الصلاة", nl: "Gebedsdoolhof", tr: "Namaz Labirenti", ur: "نماز بھول بھلیاں" },
    selectLevel: { fr: "Choisis un niveau", en: "Choose a level", ar: "اختر مستوى", nl: "Kies een niveau", tr: "Seviye seç", ur: "سطح منتخب کریں" },
    level: { fr: "Niveau", en: "Level", ar: "مستوى", nl: "Niveau", tr: "Seviye", ur: "سطح" },
    bravo: { fr: "Bravo ! Prière complète ! 🕌", en: "Bravo! Prayer complete! 🕌", ar: "أحسنت! الصلاة كاملة! 🕌", nl: "Bravo! Gebed compleet!", tr: "Bravo! Namaz tamam!", ur: "شاباش! نماز مکمل!" },
    time: { fr: "Temps", en: "Time", ar: "الوقت", nl: "Tijd", tr: "Süre", ur: "وقت" },
    retry: { fr: "Rejouer", en: "Retry", ar: "إعادة", nl: "Opnieuw", tr: "Tekrar", ur: "دوبارہ" },
    menu: { fr: "Menu", en: "Menu", ar: "القائمة", nl: "Menu", tr: "Menü", ur: "مینیو" },
    nextStep: { fr: "Cherche :", en: "Find:", ar: "ابحث عن:", nl: "Zoek:", tr: "Bul:", ur: "تلاش کریں:" },
  };
  const L = (k: string) => labels[k]?.[lang] || labels[k]?.fr || k;

  const maze = level !== null ? MAZES[level] : null;

  const startLevel = (lvl: number) => {
    const m = MAZES[lvl];
    setLevel(lvl);
    // find start
    let sx = 1, sy = 1;
    m.grid.forEach((row, ry) => row.forEach((cell, rx) => { if (cell === 2) { sx = rx; sy = ry; } }));
    setPlayerPos({ x: sx, y: sy });
    setCompletedSteps([]);
    setNextStep(0);
    setWon(false);
    setStartTime(Date.now());
  };

  const move = useCallback((dx: number, dy: number) => {
    if (!maze || won) return;
    setPlayerPos(prev => {
      const nx = prev.x + dx;
      const ny = prev.y + dy;
      if (ny < 0 || ny >= maze.grid.length || nx < 0 || nx >= maze.grid[0].length) return prev;
      if (maze.grid[ny][nx] === 1) return prev;
      // Check checkpoint
      const cp = maze.checkpoints.find(c => c.x === nx && c.y === ny && c.step === nextStep);
      if (cp) {
        setCompletedSteps(s => [...s, cp.step]);
        setNextStep(n => {
          const next = n + 1;
          if (next >= maze.steps.length) setWon(true);
          return next;
        });
      }
      return { x: nx, y: ny };
    });
  }, [maze, won, nextStep]);

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
    if (!canvasRef.current || !maze) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const cols = maze.grid[0].length;
    const rows = maze.grid.length;
    const cs = Math.floor(Math.min((window.innerWidth - 40) / cols, 280 / rows));
    canvasRef.current.width = cols * cs;
    canvasRef.current.height = rows * cs;

    // Draw maze
    maze.grid.forEach((row, ry) => {
      row.forEach((cell, rx) => {
        ctx.fillStyle = cell === 1 ? "#1e3a5f" : "#0a1628";
        ctx.fillRect(rx * cs, ry * cs, cs, cs);
        if (cell !== 1) {
          ctx.strokeStyle = "#1a2744";
          ctx.strokeRect(rx * cs, ry * cs, cs, cs);
        }
      });
    });

    // Draw checkpoints
    maze.checkpoints.forEach(cp => {
      const done = completedSteps.includes(cp.step);
      const isNext = cp.step === nextStep;
      ctx.font = `${cs * 0.6}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (done) {
        ctx.globalAlpha = 0.3;
        ctx.fillText("✅", cp.x * cs + cs / 2, cp.y * cs + cs / 2);
        ctx.globalAlpha = 1;
      } else {
        ctx.fillText(STEP_EMOJIS[cp.step] || "⭐", cp.x * cs + cs / 2, cp.y * cs + cs / 2);
        if (isNext) {
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 2;
          ctx.strokeRect(cp.x * cs + 2, cp.y * cs + 2, cs - 4, cs - 4);
        }
      }
    });

    // Draw player
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.arc(playerPos.x * cs + cs / 2, playerPos.y * cs + cs / 2, cs * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `${cs * 0.5}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🧕", playerPos.x * cs + cs / 2, playerPos.y * cs + cs / 2);
  }, [maze, playerPos, completedSteps, nextStep]);

  if (level === null) {
    return (
      <div className="min-h-screen pb-24 px-5 pt-14">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/kids")} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"><ArrowLeft size={18} /></button>
          <h1 className="text-xl font-bold">🕌 {L("title")}</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{L("selectLevel")}</p>
        <div className="flex flex-col gap-3">
          {MAZES.map((_, i) => (
            <motion.button key={i} whileTap={{ scale: 0.96 }} onClick={() => startLevel(i)}
              className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-violet-600/10 border border-indigo-500/20 text-left">
              <p className="font-bold text-foreground">{L("level")} {i + 1} ({MAZES[i].steps.length} étapes)</p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (won) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    return (
      <div className="min-h-screen pb-24 px-5 pt-14 flex flex-col items-center justify-center gap-4">
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl">🕌</motion.p>
        <h2 className="text-xl font-bold text-foreground">{L("bravo")}</h2>
        <p className="text-sm text-muted-foreground">{L("time")}: {elapsed}s</p>
        <div className="flex gap-3 mt-4">
          <button onClick={() => startLevel(level)} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center gap-1"><RotateCcw size={14} /> {L("retry")}</button>
          <button onClick={() => setLevel(null)} className="px-4 py-2 rounded-xl bg-muted text-foreground text-sm font-bold">{L("menu")}</button>
        </div>
      </div>
    );
  }

  const currentStepName = maze!.steps[nextStep] || "";
  const stepLabel = STEP_LABELS[currentStepName]?.[lang] || STEP_LABELS[currentStepName]?.fr || currentStepName;

  return (
    <div className="min-h-screen pb-24 px-4 pt-14">
      <div className="flex items-center gap-3 mb-3">
        <button onClick={() => setLevel(null)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"><ArrowLeft size={18} /></button>
        <h1 className="text-lg font-bold flex-1">🕌 {L("title")}</h1>
      </div>

      {/* Steps tracker */}
      <div className="flex gap-1 mb-3 flex-wrap">
        {maze!.steps.map((s, i) => (
          <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full ${
            completedSteps.includes(i) ? "bg-emerald-500/30 text-emerald-300" :
            i === nextStep ? "bg-amber-500/30 text-amber-300 animate-pulse" : "bg-muted text-muted-foreground"
          }`}>
            {STEP_EMOJIS[i]} {STEP_LABELS[s]?.[lang] || s}
          </span>
        ))}
      </div>

      {nextStep < maze!.steps.length && (
        <p className="text-xs text-amber-400 mb-2">{L("nextStep")} {STEP_EMOJIS[nextStep]} {stepLabel}</p>
      )}

      <div className="flex justify-center mb-4">
        <canvas ref={canvasRef} className="rounded-xl border border-border" />
      </div>

      {/* D-pad */}
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
    </div>
  );
}
