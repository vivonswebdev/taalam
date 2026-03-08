import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { MATH_GAMES } from "@/data/mathDifficultyConfig";

const GAME_STYLES: Record<string, { gradient: string; shadow: string; emoji_bg: string }> = {
  quick_calc: {
    gradient: "from-amber-400 via-orange-400 to-rose-400",
    shadow: "shadow-amber-500/30",
    emoji_bg: "bg-amber-500/20",
  },
  calc_merge: {
    gradient: "from-sky-400 via-blue-500 to-indigo-500",
    shadow: "shadow-blue-500/30",
    emoji_bg: "bg-blue-500/20",
  },
  number_runner: {
    gradient: "from-emerald-400 via-green-400 to-teal-400",
    shadow: "shadow-emerald-500/30",
    emoji_bg: "bg-emerald-500/20",
  },
  math_shooter: {
    gradient: "from-pink-400 via-rose-400 to-red-400",
    shadow: "shadow-pink-500/30",
    emoji_bg: "bg-pink-500/20",
  },
  math_memory: {
    gradient: "from-violet-400 via-purple-400 to-fuchsia-400",
    shadow: "shadow-purple-500/30",
    emoji_bg: "bg-violet-500/20",
  },
  math_bomb: {
    gradient: "from-red-500 via-orange-500 to-yellow-400",
    shadow: "shadow-red-500/30",
    emoji_bg: "bg-red-500/20",
  },
};

const GAME_ROUTES: Record<string, string> = {
  quick_calc: "/kids-quick-calc",
  calc_merge: "/kids-calc-merge",
  number_runner: "/kids-number-runner",
  math_shooter: "/kids-math-shooter",
  math_memory: "/kids-math-memory",
  math_bomb: "/kids-math-bomb",
};

// Floating candy decorations
function FloatingCandy() {
  const candies = ["🍬", "🍭", "🧁", "🍩", "🌟", "✨", "🎀", "🫧"];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {candies.map((c, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl opacity-20"
          initial={{
            x: `${10 + (i * 12) % 80}%`,
            y: `${5 + (i * 17) % 90}%`,
          }}
          animate={{
            y: [`${5 + (i * 17) % 90}%`, `${(5 + (i * 17) % 90) - 5}%`, `${5 + (i * 17) % 90}%`],
            rotate: [0, 10, -10, 0],
          }}
          transition={{ repeat: Infinity, duration: 3 + i * 0.5, ease: "easeInOut" }}
        >
          {c}
        </motion.span>
      ))}
    </div>
  );
}

export default function KidsMathMenuPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-sky-50 dark:from-background dark:via-background dark:to-background pb-24 relative">
      <FloatingCandy />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 p-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl bg-white/80 dark:bg-card flex items-center justify-center border border-pink-200 dark:border-border shadow-sm backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            🍭 {t("mathGames.title" as any) || "Jeux Maths"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {t("mathGames.subtitle" as any) || "Objectif Médaille d'Or ! 🏆"}
          </p>
        </div>
      </div>

      {/* Games grid */}
      <div className="relative z-10 px-4 mt-2">
        <div className="grid grid-cols-2 gap-3">
          {MATH_GAMES.map((game, i) => {
            const route = GAME_ROUTES[game.id];
            const available = !!route;
            const style = GAME_STYLES[game.id] || GAME_STYLES.quick_calc;

            return (
              <motion.button
                key={game.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.07, type: "spring", damping: 15 }}
                whileTap={available ? { scale: 0.93 } : {}}
                onClick={() => available && navigate(route)}
                disabled={!available}
                className={`relative flex flex-col items-center gap-2 p-5 rounded-3xl border border-white/50 dark:border-border overflow-hidden transition-all
                  ${available ? `shadow-lg ${style.shadow}` : "opacity-40 grayscale"}
                `}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-15 dark:opacity-10`} />

                {/* Emoji circle */}
                <motion.div
                  className={`relative z-10 w-16 h-16 rounded-2xl ${style.emoji_bg} flex items-center justify-center`}
                  animate={available ? { rotate: [0, -3, 3, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: i * 0.3 }}
                >
                  <span className="text-3xl">{game.icon}</span>
                </motion.div>

                {/* Name */}
                <span className="relative z-10 text-sm font-bold text-foreground">
                  {t(`mathGames.${game.i18nKey}` as any) || game.name}
                </span>

                {/* New badge for math_bomb */}
                {game.id === "math_bomb" && (
                  <span className="absolute top-2 right-2 z-10 text-[9px] bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full font-black animate-pulse">
                    NEW
                  </span>
                )}

                {!available && (
                  <span className="absolute top-2 right-2 z-10 text-[9px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-semibold">
                    {t("common.comingSoon" as any) || "Bientôt"}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
