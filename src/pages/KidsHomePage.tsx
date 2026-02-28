import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useNooraniProgress } from "@/hooks/useNooraniProgress";
import { useChildProfiles } from "@/hooks/useChildProfiles";
import { useKidsChecklist } from "@/hooks/useKidsChecklist";
import { Badge } from "@/components/ui/badge";

const KIDS_CARDS = [
  {
    emoji: "🔤",
    titleKey: "kidsHome.noorani",
    descKey: "kidsHome.nooraniDesc",
    path: "/noorani",
    gradient: "from-violet-600/30 to-purple-600/15",
    border: "border-violet-500/25",
  },
  {
    emoji: "🧎",
    titleKey: "kidsHome.prayer",
    descKey: "kidsHome.prayerDesc",
    path: "/kids-prayer",
    gradient: "from-emerald-600/30 to-teal-600/15",
    border: "border-emerald-500/25",
  },
  {
    emoji: "🕋",
    titleKey: "kidsHome.hajjUmra",
    descKey: "kidsHome.hajjUmraDesc",
    path: "/kids-hajj",
    gradient: "from-amber-600/30 to-orange-600/15",
    border: "border-amber-500/25",
  },
  {
    emoji: "📍🕌",
    titleKey: "kidsHome.mosqueMap",
    descKey: "kidsHome.mosqueMapDesc",
    path: "/kids-mosque-map",
    gradient: "from-cyan-600/30 to-teal-600/15",
    border: "border-cyan-500/25",
  },
  {
    emoji: "🧠",
    titleKey: "kidsHome.quizzes",
    descKey: "kidsHome.quizzesDesc",
    path: "/quiz",
    gradient: "from-pink-600/30 to-rose-600/15",
    border: "border-pink-500/25",
  },
  {
    emoji: "🌙",
    titleKey: "kidsHome.checklist",
    descKey: "kidsHome.checklistDesc",
    path: "/kids-checklist",
    gradient: "from-indigo-600/30 to-violet-600/15",
    border: "border-indigo-500/25",
  },
];

export default function KidsHomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const noorani = useNooraniProgress();
  const { profiles } = useChildProfiles();
  const checklist = useKidsChecklist();
  const hasChildren = profiles.length > 0;

  // Quiz stats from localStorage
  const quizScore = (() => {
    try {
      const d = JSON.parse(localStorage.getItem("quran_quiz_stats") || "{}");
      return { correct: d.correct || 0, total: d.total || 0 };
    } catch { return { correct: 0, total: 0 }; }
  })();
  const prayerDone = (() => { try { return localStorage.getItem("kids_prayer_completed") === "true"; } catch { return false; } })();
  const hajjDone = (() => { try { return localStorage.getItem("kids_hajj_completed") === "true"; } catch { return false; } })();

  const badgeForCard = (path: string) => {
    if (path === "/noorani" && noorani.completedLessonsCount > 0)
      return `${noorani.completedLessonsCount}/${noorani.totalLessons}`;
    if (path === "/quiz" && quizScore.total > 0)
      return `${quizScore.correct}/${quizScore.total}`;
    if (path === "/kids-prayer" && prayerDone) return "✅";
    if (path === "/kids-hajj" && hajjDone) return "✅";
    if (path === "/kids-checklist" && checklist.completedCount > 0)
      return `${checklist.completedCount}/${checklist.totalCount}`;
    return null;
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-6 pt-14 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span>🧸</span> {t("kidsHome.title" as any)}
            </h1>
            <p className="text-xs text-muted-foreground">{t("kidsHome.subtitle" as any)}</p>
          </div>
        </div>
      </div>

      {/* Discovery banner when no child profile */}
      {!hasChildren && (
        <div className="px-5 mb-3">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/10 border border-primary/20 rounded-2xl p-3.5 flex items-center gap-3"
          >
            <span className="text-2xl shrink-0">👀</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">
                {t("kidsHome.discoveryTitle" as any)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {t("kidsHome.discoveryDesc" as any)}
              </p>
            </div>
            <button
              onClick={() => navigate("/parent")}
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold active:scale-95 transition-transform"
            >
              <UserPlus size={12} />
              {t("kidsHome.addChild" as any)}
            </button>
          </motion.div>
        </div>
      )}

      {/* Cards grid */}
      <div className="px-5 grid grid-cols-2 gap-3">
        {KIDS_CARDS.map((card, i) => (
          <motion.button
            key={card.path}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(card.path)}
            className={`flex flex-col gap-2 rounded-2xl p-4 text-left bg-gradient-to-br ${card.gradient} border ${card.border} shadow-lg`}
          >
            <div className="flex items-start justify-between w-full">
              <span className="text-3xl">{card.emoji}</span>
              {badgeForCard(card.path) && (
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5 shrink-0">
                  {badgeForCard(card.path)}
                </Badge>
              )}
            </div>
            <p className="text-sm font-bold text-foreground leading-tight">
              {t(card.titleKey as any)}
            </p>
            <p className="text-[10px] text-muted-foreground line-clamp-2">
              {t(card.descKey as any)}
            </p>
            {/* Noorani progress indicator */}
            {card.path === "/noorani" && noorani.completedLessonsCount > 0 && (
              <div className="mt-1">
                <p className="text-[9px] text-muted-foreground mb-0.5">
                  {noorani.completedLessonsCount}/{noorani.totalLessons}
                </p>
                <div className="h-1 rounded-full bg-muted/40 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(noorani.completionPercent, 100)}%` }}
                  />
                </div>
              </div>
            )}
            <span className="mt-auto pt-1 text-[10px] font-semibold text-primary">
              {t("home.open" as any)} →
            </span>
          </motion.button>
        ))}
      </div>

      {/* Safety message */}
      <div className="px-5 mt-4">
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 text-center">
          ⚠️ {t("kidsMosque.safetyMsg" as any) || "Va toujours avec un adulte (Papa, Maman ou un proche). Ne pars jamais seul."}
        </div>
      </div>
    </div>
  );
}
