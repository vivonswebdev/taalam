import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calculator } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { MATH_GAMES } from "@/data/mathDifficultyConfig";

const GAME_COLORS: Record<string, string> = {
  quick_calc: "from-amber-500/20 to-orange-500/20 border-amber-500/40",
  calc_merge: "from-blue-500/20 to-indigo-500/20 border-blue-500/40",
  number_runner: "from-green-500/20 to-emerald-500/20 border-green-500/40",
  math_shooter: "from-pink-500/20 to-red-500/20 border-pink-500/40",
};

const GAME_ROUTES: Record<string, string> = {
  quick_calc: "/kids-quick-calc",
  calc_merge: "",
  number_runner: "",
  math_shooter: "",
};

export default function KidsMathMenuPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 p-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <Calculator size={22} className="text-primary" />
        <h1 className="text-lg font-bold text-foreground">
          {t("mathGames.title" as any) || "🧮 Jeux Maths"}
        </h1>
      </div>

      <div className="px-4">
        <p className="text-sm text-muted-foreground mb-6 text-center">
          {t("mathGames.subtitle" as any) || "Objectif Médaille d'Or ! 🏆"}
        </p>

        <div className="grid grid-cols-2 gap-4">
          {MATH_GAMES.map((game, i) => {
            const route = GAME_ROUTES[game.id];
            const available = !!route;

            return (
              <motion.button
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => available && navigate(route)}
                disabled={!available}
                className={`relative flex flex-col items-center gap-2 p-6 rounded-2xl border-2 bg-gradient-to-br shadow-sm transition-all
                  ${GAME_COLORS[game.id] || "from-muted to-muted border-border"}
                  ${available ? "active:scale-95" : "opacity-50 grayscale"}
                `}
              >
                <span className="text-4xl">{game.icon}</span>
                <span className="text-sm font-bold text-foreground">
                  {t(`mathGames.${game.i18nKey}` as any) || game.name}
                </span>
                {!available && (
                  <span className="absolute top-2 right-2 text-[9px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-semibold">
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
