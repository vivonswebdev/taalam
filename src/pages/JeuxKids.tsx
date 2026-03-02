import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { useUserMode } from "@/hooks/useUserMode";
import { ArrowLeft } from "lucide-react";
import PageBackground from "@/components/PageBackground";

const GAMES = [
  { key: "coranCrush", emoji: "🎮", path: "/crush", color: "from-pink-400 to-rose-500" },
  { key: "quizProphets", emoji: "🧠", path: "/kids-quiz", color: "from-violet-400 to-purple-500" },
  { key: "quizAnimals", emoji: "🦁", path: "/kids-quiz", color: "from-amber-400 to-orange-500" },
  { key: "quizGoodDeeds", emoji: "⭐", path: "/kids-checklist", color: "from-emerald-400 to-green-500" },
  { key: "sheytanGame", emoji: "👹", path: "/kids-sheytan", color: "from-red-400 to-red-600" },
  { key: "memoryCoran", emoji: "📿", path: "/kids-memory", color: "from-cyan-400 to-blue-500" },
  { key: "pillarQuiz", emoji: "🕌", path: "/kids-pillar-quiz", color: "from-teal-400 to-emerald-500" },
  { key: "balance", emoji: "⚖️", path: "/kids-balance", color: "from-indigo-400 to-violet-500" },
  { key: "memoryFaith", emoji: "💎", path: "/kids-memory-faith", color: "from-sky-400 to-blue-500" },
  { key: "popHassanates", emoji: "🎈", path: "/kids-pop-hassanates", color: "from-fuchsia-400 to-pink-500" },
  { key: "prophetGame", emoji: "📖", path: "/kids-prophet-game", color: "from-lime-400 to-green-500" },
  { key: "asmaHunt", emoji: "🔎", path: "/kids-asma-hunt", color: "from-yellow-400 to-amber-500" },
  { key: "prayerMaze", emoji: "🧩", path: "/kids-prayer-maze", color: "from-rose-400 to-pink-500" },
] as const;

export default function JeuxKids() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { mode } = useUserMode();

  // Redirect non-kids
  if (mode !== "child") {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 text-center">
        <p className="text-muted-foreground text-lg">🔒</p>
      </div>
    );
  }

  return (
    <PageBackground intensity="immersive">
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-amber-100 dark:from-yellow-900/30 dark:via-orange-900/20 dark:to-amber-900/30 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/60 dark:bg-white/10 backdrop-blur">
          <ArrowLeft size={20} />
        </button>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-extrabold text-foreground"
        >
          {t("kidsGames.title" as any)}
        </motion.h1>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-4 px-4 mt-2">
        {GAMES.map((game, i) => (
          <motion.button
            key={game.key}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 20 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate(game.path)}
            className={`relative flex flex-col items-center justify-center gap-2 p-5 rounded-3xl bg-gradient-to-br ${game.color} shadow-lg shadow-black/10 aspect-square`}
          >
            <motion.span
              className="text-5xl"
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
            >
              {game.emoji}
            </motion.span>
            <span className="text-sm font-bold text-white drop-shadow">
              {t(`kidsGames.${game.key}` as any)}
            </span>
            <span className="text-[10px] text-white/80 font-medium">
              {t(`kidsGames.${game.key}Desc` as any)}
            </span>
            {/* Sparkle decorations */}
            <motion.span
              className="absolute top-2 right-3 text-lg"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
            >
              ✨
            </motion.span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
