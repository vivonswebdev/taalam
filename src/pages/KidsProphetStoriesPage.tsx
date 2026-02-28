import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { prophetStories } from "@/data/prophetStories";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const GRADIENTS = [
  "from-orange-600/30 to-amber-600/15",
  "from-cyan-600/30 to-teal-600/15",
  "from-indigo-600/30 to-violet-600/15",
  "from-rose-600/30 to-pink-600/15",
  "from-emerald-600/30 to-green-600/15",
  "from-purple-600/30 to-fuchsia-600/15",
  "from-sky-600/30 to-blue-600/15",
  "from-amber-600/30 to-yellow-600/15",
  "from-teal-600/30 to-cyan-600/15",
  "from-lime-600/30 to-green-600/15",
];

function getUnlockedStickers(): string[] {
  try {
    return JSON.parse(localStorage.getItem("kids_prophet_stickers") || "[]");
  } catch { return []; }
}

export default function KidsProphetStoriesPage() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const unlocked = getUnlockedStickers();
  const total = prophetStories.length;
  const done = unlocked.length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="min-h-screen pb-24">
      <div className="px-6 pt-14 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              🐦 {t("kidsStories.title" as any)}
            </h1>
            <p className="text-xs text-muted-foreground">{t("kidsStories.subtitle" as any)}</p>
          </div>
        </div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 rounded-2xl p-3 mb-4"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-foreground">
              {done}/{total} {t("kidsStories.known" as any)}
            </span>
            <span className="text-lg">{done >= total ? "🏆" : "📚"}</span>
          </div>
          <Progress value={pct} className="h-2" />
          {done > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {unlocked.map((s, i) => (
                <span key={i} className="text-lg">{s}</span>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Stories grid */}
      <div className="px-5 grid grid-cols-2 gap-3">
        {prophetStories.map((story, i) => {
          const isComplete = unlocked.includes(story.sticker);
          const langKey = (lang === "fr" || lang === "en" || lang === "ar" || lang === "nl" || lang === "tr" || lang === "ur") ? lang : "en";
          return (
            <motion.button
              key={story.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(`/kids-stories/${story.id}`)}
              className={`flex flex-col gap-2 rounded-2xl p-4 text-left bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} border border-border/40 shadow-lg relative overflow-hidden`}
            >
              {isComplete && (
                <Badge variant="secondary" className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5">
                  ✅
                </Badge>
              )}
              <span className="text-3xl">{story.emoji}</span>
              <p className="text-sm font-bold text-foreground leading-tight">
                {story.prophet[langKey]}
              </p>
              <p className="text-[10px] text-muted-foreground line-clamp-2">
                {story.title[langKey]}
              </p>
              <span className="mt-auto pt-1 text-[10px] font-semibold text-primary">
                {t("home.open" as any)} →
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
