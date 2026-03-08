import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useUserMode } from "@/hooks/useUserMode";
import { ArrowLeft, Trophy } from "lucide-react";
import { GlassCard } from "@/components/kids/futuristic/GlassCard";
import { FloatingParticles } from "@/components/kids/futuristic/FloatingParticles";

const GRADIENTS = ["primary", "cosmic", "sunset", "forest"] as const;

const GAMES = [
  { key: "coranCrush", emoji: "🎮", path: "/crush" },
  { key: "quizProphets", emoji: "🧠", path: "/kids-quiz" },
  { key: "quizAnimals", emoji: "🦁", path: "/kids-quiz" },
  { key: "quizGoodDeeds", emoji: "⭐", path: "/kids-checklist" },
  { key: "sheytanGame", emoji: "👹", path: "/kids-sheytan" },
  { key: "memoryCoran", emoji: "📿", path: "/kids-memory" },
  { key: "pillarQuiz", emoji: "🕌", path: "/kids-pillar-quiz" },
  { key: "balance", emoji: "⚖️", path: "/kids-balance" },
  { key: "memoryFaith", emoji: "💎", path: "/kids-memory-faith" },
  { key: "popHassanates", emoji: "🎈", path: "/kids-pop-hassanates" },
  { key: "prophetGame", emoji: "📖", path: "/kids-prophet-game" },
  { key: "asmaHunt", emoji: "🔎", path: "/kids-asma-hunt" },
  { key: "prayerMaze", emoji: "🧩", path: "/kids-prayer-maze" },
  { key: "tetrisIslam", emoji: "🕌", path: "/tetris-islam" },
  { key: "arabicBubbles", emoji: "🫧", path: "/kids-arabic-bubbles" },
  { key: "quranWordOrder", emoji: "🔤", path: "/kids-quran-word-order" },
  { key: "duaMatch", emoji: "🤲", path: "/kids-dua-match" },
  { key: "islamicColors", emoji: "🎨", path: "/kids-islamic-colors" },
] as const;

export default function JeuxKids() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { mode } = useUserMode();

  if (mode !== "child") {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 text-center">
        <p className="text-muted-foreground text-lg">🔒</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden bg-gradient-to-b from-[hsl(260,50%,12%)] via-[hsl(240,40%,18%)] to-[hsl(220,35%,10%)]">
      <FloatingParticles count={14} />

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(0 0% 100% / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-6 pb-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15"
        >
          <ArrowLeft size={20} className="text-white" />
        </motion.button>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-extrabold text-white flex items-center gap-2"
        >
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            🎮
          </motion.span>
          {t("kidsGames.title" as any)}
        </motion.h1>

        <div className="flex-1" />

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/kids-leaderboard")}
          className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-400/30 to-orange-500/30 backdrop-blur-md border border-amber-400/30"
        >
          <Trophy size={20} className="text-amber-300" />
        </motion.button>
      </div>

      {/* Games Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-4 px-4 mt-2">
        {GAMES.map((game, i) => (
          <GlassCard
            key={game.key}
            gradient={GRADIENTS[i % GRADIENTS.length]}
            delay={i * 0.05}
            onClick={() => navigate(game.path)}
            className="aspect-square flex flex-col items-center justify-center p-4"
          >
            <div className="flex flex-col items-center justify-center gap-2 text-center h-full">
              {/* Sparkle */}
              <motion.span
                className="absolute top-2 right-3 text-sm"
                animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.15, 0.8] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.15 }}
              >
                ✨
              </motion.span>

              {/* Emoji */}
              <motion.span
                className="text-5xl drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]"
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.2, ease: "easeInOut" }}
              >
                {game.emoji}
              </motion.span>

              {/* Title */}
              <span className="text-sm font-bold text-white drop-shadow-sm">
                {t(`kidsGames.${game.key}` as any)}
              </span>

              {/* Description */}
              <span className="text-[10px] text-white/65 font-medium leading-tight">
                {t(`kidsGames.${game.key}Desc` as any)}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
