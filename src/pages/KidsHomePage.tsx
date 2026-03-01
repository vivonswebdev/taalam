import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useNooraniProgress } from "@/hooks/useNooraniProgress";
import { useChildProfiles } from "@/hooks/useChildProfiles";
import { useKidsChecklist } from "@/hooks/useKidsChecklist";
import { Badge } from "@/components/ui/badge";

type KidsTab = "education" | "games";

const TAB_IDS: KidsTab[] = ["education", "games"];
const TAB_EMOJIS: Record<KidsTab, string> = { education: "📚", games: "🎮" };
const TAB_KEYS: Record<KidsTab, string> = { education: "kidsHome.educationSection", games: "kidsHome.gamesSection" };

const EDUCATION_CARDS = [
  { emoji: "🌙", titleKey: "kidsHome.checklist", descKey: "kidsHome.checklistDesc", path: "/kids-checklist", gradient: "from-indigo-600/30 to-violet-600/15", border: "border-indigo-500/25" },
  { emoji: "🧒", titleKey: "kidsHome.kidsQuiz", descKey: "kidsHome.kidsQuizDesc", path: "/kids-quiz", gradient: "from-teal-600/30 to-cyan-600/15", border: "border-teal-500/25" },
  { emoji: "🐦", titleKey: "kidsHome.prophetStories", descKey: "kidsHome.prophetStoriesDesc", path: "/kids-stories", gradient: "from-orange-600/30 to-amber-600/15", border: "border-orange-500/25" },
  { emoji: "🔤", titleKey: "kidsHome.noorani", descKey: "kidsHome.nooraniDesc", path: "/noorani", gradient: "from-violet-600/30 to-purple-600/15", border: "border-violet-500/25" },
  { emoji: "🧎", titleKey: "kidsHome.prayer", descKey: "kidsHome.prayerDesc", path: "/kids-prayer", gradient: "from-emerald-600/30 to-teal-600/15", border: "border-emerald-500/25" },
  { emoji: "🕋", titleKey: "kidsHome.hajjUmra", descKey: "kidsHome.hajjUmraDesc", path: "/kids-hajj", gradient: "from-amber-600/30 to-orange-600/15", border: "border-amber-500/25" },
  { emoji: "📍🕌", titleKey: "kidsHome.mosqueMap", descKey: "kidsHome.mosqueMapDesc", path: "/kids-mosque-map", gradient: "from-cyan-600/30 to-teal-600/15", border: "border-cyan-500/25" },
  { emoji: "🤲", titleKey: "kidsHome.duas", descKey: "kidsHome.duasDesc", path: "/kids-duas", gradient: "from-teal-600/30 to-emerald-600/15", border: "border-teal-500/25" },
];

const GAMES_CARDS = [
  { emoji: "🎮", titleKey: "kidsHome.coranCrush", descKey: "kidsHome.coranCrushDesc", path: "/crush", gradient: "from-pink-600/30 to-rose-600/15", border: "border-pink-500/25" },
  { emoji: "🫧", titleKey: "kidsHome.popHassanates", descKey: "kidsHome.popHassanatesDesc", path: "/kids-pop-hassanates", gradient: "from-emerald-600/30 to-teal-600/15", border: "border-emerald-500/25" },
  { emoji: "🛡️", titleKey: "kidsHome.sheytanGame", descKey: "kidsHome.sheytanGameDesc", path: "/kids-sheytan", gradient: "from-red-600/30 to-amber-600/15", border: "border-red-500/25" },
  { emoji: "🕌", titleKey: "kidsHome.memoryCoran", descKey: "kidsHome.memoryCoranDesc", path: "/kids-memory", gradient: "from-emerald-600/30 to-green-600/15", border: "border-emerald-500/25" },
  { emoji: "🧠", titleKey: "kidsHome.memoryFaith", descKey: "kidsHome.memoryFaithDesc", path: "/kids-memory-faith", gradient: "from-violet-600/30 to-purple-600/15", border: "border-violet-500/25" },
  { emoji: "🕋", titleKey: "kidsHome.pillarQuiz", descKey: "kidsHome.pillarQuizDesc", path: "/kids-pillar-quiz", gradient: "from-amber-600/30 to-yellow-600/15", border: "border-amber-500/25" },
  { emoji: "🕌", titleKey: "kidsHome.prayerMaze", descKey: "kidsHome.prayerMazeDesc", path: "/kids-prayer-maze", gradient: "from-indigo-600/30 to-blue-600/15", border: "border-indigo-500/25" },
  { emoji: "✨", titleKey: "kidsHome.asmaHunt", descKey: "kidsHome.asmaHuntDesc", path: "/kids-asma-hunt", gradient: "from-yellow-600/30 to-amber-600/15", border: "border-yellow-500/25" },
  { emoji: "📖", titleKey: "kidsHome.prophetStoryGame", descKey: "kidsHome.prophetStoryGameDesc", path: "/kids-prophet-game", gradient: "from-blue-600/30 to-indigo-600/15", border: "border-blue-500/25" },
];

export default function KidsHomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const noorani = useNooraniProgress();
  const { profiles } = useChildProfiles();
  const checklist = useKidsChecklist();
  const hasChildren = profiles.length > 0;
  const [activeTab, setActiveTab] = useState<KidsTab>("education");

  // Quiz stats from localStorage
  const quizScore = (() => {
    try {
      const d = JSON.parse(localStorage.getItem("quran_quiz_stats") || "{}");
      return { correct: d.correct || 0, total: d.total || 0 };
    } catch { return { correct: 0, total: 0 }; }
  })();
  const prayerDone = (() => { try { return localStorage.getItem("kids_prayer_completed") === "true"; } catch { return false; } })();
  const hajjDone = (() => { try { return localStorage.getItem("kids_hajj_completed") === "true"; } catch { return false; } })();
  const duasLearned = (() => { try { return JSON.parse(localStorage.getItem("kids_duas_learned") || "[]").length; } catch { return 0; } })();

  const badgeForCard = (path: string) => {
    if (path === "/noorani" && noorani.completedLessonsCount > 0)
      return `${noorani.completedLessonsCount}/${noorani.totalLessons}`;
    if (path === "/quiz" && quizScore.total > 0)
      return `${quizScore.correct}/${quizScore.total}`;
    if (path === "/kids-prayer" && prayerDone) return "✅";
    if (path === "/kids-hajj" && hajjDone) return "✅";
    if (path === "/kids-checklist" && checklist.completedCount > 0)
      return `${checklist.completedCount}/${checklist.totalCount}`;
    if (path === "/kids-duas" && duasLearned > 0)
      return `${duasLearned}`;
    return null;
  };

  const renderCard = (card: typeof EDUCATION_CARDS[0], i: number) => (
    <motion.button
      key={card.path}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => navigate(card.path)}
      className={`flex flex-col items-center gap-1 rounded-2xl p-3 text-center bg-gradient-to-br ${card.gradient} border ${card.border} shadow-md min-h-[90px] relative`}
    >
      {badgeForCard(card.path) && (
        <Badge variant="secondary" className="absolute top-1.5 right-1.5 text-[8px] px-1 py-0 shrink-0">
          {badgeForCard(card.path)}
        </Badge>
      )}
      <span className="text-2xl">{card.emoji}</span>
      <p className="text-xs font-bold text-foreground leading-tight line-clamp-2">
        {t(card.titleKey as any)}
      </p>
      {card.path === "/noorani" && noorani.completedLessonsCount > 0 && (
        <div className="w-full mt-0.5">
          <div className="h-1 rounded-full bg-muted/40 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(noorani.completionPercent, 100)}%` }}
            />
          </div>
        </div>
      )}
    </motion.button>
  );

  const currentCards = activeTab === "education" ? EDUCATION_CARDS : GAMES_CARDS;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-black/30 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border/50 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-semibold">🧸 {t("kidsHome.title" as any)}</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">{t("kidsHome.subtitle" as any)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex bg-muted/60 rounded-2xl p-1 gap-1">
          {TAB_IDS.map((tabId) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tabId
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {TAB_EMOJIS[tabId]} {t(TAB_KEYS[tabId] as any)}
            </button>
          ))}
        </div>
      </div>

      {/* Discovery banner when no child profile */}
      {!hasChildren && (
        <div className="px-4 mb-2">
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

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-3 gap-2.5 px-4 pb-4"
        >
          {currentCards.map((card, i) => renderCard(card, i))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
