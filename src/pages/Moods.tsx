import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { moodPresets } from "@/data/moodPresets";
import { maladiesPresets } from "@/data/maladiesPresets";
import { athkarGroups, ATHKAR_FILTERS, CORE_ATHKAR_IDS, type AthkarCategory } from "@/data/athkarData";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import PageBackground from "@/components/PageBackground";
import SEOHead from "@/components/SEOHead";

type Tab = "moods" | "maladies" | "athkar";

const TAB_IDS: Tab[] = ["moods", "maladies", "athkar"];
const TAB_EMOJIS: Record<Tab, string> = { moods: "💓", maladies: "🩺", athkar: "📿" };
const TAB_KEYS: Record<Tab, string> = { moods: "moods.tabMoods", maladies: "moods.tabMaladies", athkar: "moods.tabAthkar" };

const RECENT_MOODS_KEY = "taalam_recent_moods";
const MAX_RECENT = 3;

// Vibrant gradient mapping for moods
const MOOD_GRADIENTS: Record<string, string> = {
  sleep: "from-indigo-500 to-purple-600",
  sadness: "from-blue-500 to-slate-600",
  anxiety: "from-teal-500 to-cyan-600",
  anger: "from-red-500 to-rose-600",
  loneliness: "from-violet-500 to-purple-700",
  forgiveness: "from-amber-500 to-orange-600",
  gratitude: "from-emerald-500 to-green-600",
  hope: "from-orange-400 to-amber-600",
  love: "from-rose-500 to-pink-600",
  hardship: "from-stone-500 to-zinc-600",
  doubts: "from-purple-600 to-indigo-700",
  ruqya: "from-cyan-500 to-teal-600",
  success: "from-yellow-400 to-amber-500",
  study: "from-sky-500 to-indigo-600",
};

// Vibrant gradient mapping for maladies
const MALADIE_GRADIENTS: Record<string, string> = {
  "general-illness": "from-teal-500 to-emerald-600",
  "heart-disease": "from-rose-500 to-red-600",
  insomnia: "from-indigo-500 to-violet-600",
  fears: "from-purple-500 to-fuchsia-600",
  depression: "from-slate-500 to-gray-600",
  "evil-eye": "from-cyan-500 to-blue-600",
};

// Vibrant gradient mapping for athkar
const ATHKAR_GRADIENTS = [
  "from-emerald-500 to-teal-600",
  "from-blue-500 to-indigo-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-sky-600",
  "from-lime-500 to-green-600",
  "from-fuchsia-500 to-pink-600",
  "from-orange-500 to-red-500",
  "from-teal-500 to-cyan-600",
  "from-indigo-500 to-blue-600",
  "from-yellow-400 to-amber-500",
];

function getRecentMoods(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_MOODS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch { return []; }
}

export function trackMoodVisit(id: string) {
  try {
    const recent = getRecentMoods().filter(r => r !== id);
    recent.unshift(id);
    localStorage.setItem(RECENT_MOODS_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {}
}

function VibrantCard({ emoji, title, desc, gradient, loop, onClick, index }: {
  emoji: string; title: string; desc: string; gradient: string; loop?: boolean; onClick?: () => void; index: number;
}) {
  const { t } = useLanguage();
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(index * 0.05, 0.4), type: "spring", stiffness: 300, damping: 20 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className={`relative w-full flex flex-col items-center justify-center gap-1 rounded-2xl p-3 bg-gradient-to-br ${gradient} shadow-lg shadow-black/10 min-h-[100px] overflow-hidden`}
    >
      {/* Sparkle */}
      <motion.span
        className="absolute top-1.5 right-2 text-sm"
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
        transition={{ repeat: Infinity, duration: 1.5, delay: index * 0.2 }}
      >
        ✨
      </motion.span>

      {/* Loop badge */}
      {loop && (
        <span className="absolute top-1.5 left-2 text-[7px] px-1.5 py-0.5 rounded-full bg-white/25 text-white font-bold backdrop-blur-sm">
          {t("moods.loopBadge" as any)}
        </span>
      )}

      {/* Emoji */}
      <motion.span
        className="text-3xl"
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 2, delay: index * 0.3 }}
      >
        {emoji}
      </motion.span>

      {/* Title */}
      <span className="text-[11px] font-bold text-white drop-shadow leading-tight text-center">
        {title}
      </span>

      {/* Description */}
      <span className="text-[8px] text-white/75 font-medium leading-tight text-center line-clamp-2">
        {desc}
      </span>
    </motion.button>
  );
}

function RecentMoodsSection() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    setRecentIds(getRecentMoods());
  }, []);

  if (recentIds.length === 0) return null;

  const items = recentIds.map(id => {
    const mood = moodPresets.find(m => m.id === id);
    if (mood) return { id, emoji: mood.emoji, title: t(`mood.${id}` as any) || mood.title, path: `/moods/${id}` };
    const mal = maladiesPresets.find(m => m.id === id);
    if (mal) return { id, emoji: mal.emoji, title: t(`maladie.${id}` as any) || mal.title, path: `/maladies/${id}` };
    return null;
  }).filter(Boolean) as { id: string; emoji: string; title: string; path: string }[];

  if (items.length === 0) return null;

  return (
    <div className="px-4 pt-3 pb-1">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 mb-2">
        🕐 {t("moods.recentTitle" as any)}
      </p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className="shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-card/70 border border-border hover:border-primary/50 transition-colors"
          >
            <span className="text-base">{item.emoji}</span>
            <span className="text-xs font-medium text-foreground whitespace-nowrap">{item.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Moods() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("moods");
  const [athkarFilter, setAthkarFilter] = useState<AthkarCategory | "all">("all");

  const filteredAthkar = athkarFilter === "all"
    ? athkarGroups
    : athkarGroups.filter((g) => g.category === athkarFilter);

  const allMoods = [
    ...moodPresets.filter(m => !m.loop),
    ...moodPresets.filter(m => m.loop),
  ];

  return (
    <PageBackground intensity="medium">
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10 backdrop-blur">
          <ArrowLeft size={20} />
        </button>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-xl font-extrabold text-foreground">❤️ {t("moods.title")}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{t("moods.subtitle")}</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="px-4 pb-2">
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

      <AnimatePresence mode="wait">
        {/* ═══ ÉTATS DU CŒUR ═══ */}
        {activeTab === "moods" && (
          <motion.div
            key="moods"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <RecentMoodsSection />

            <div className="grid grid-cols-3 gap-3 px-4 pt-2 pb-4">
              {allMoods.map((mood, i) => {
                const titleKey = `mood.${mood.id}` as any;
                const subKey = `mood.${mood.id}.sub` as any;
                return (
                  <VibrantCard
                    key={mood.id}
                    index={i}
                    emoji={mood.emoji}
                    title={t(titleKey) || mood.title}
                    desc={t(subKey) || mood.subtitle}
                    gradient={MOOD_GRADIENTS[mood.id] || "from-gray-500 to-slate-600"}
                    loop={mood.loop}
                    onClick={() => navigate(`/moods/${mood.id}`)}
                  />
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ═══ MALADIES ═══ */}
        {activeTab === "maladies" && (
          <motion.div
            key="maladies"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-3 gap-3 p-4"
          >
            {maladiesPresets.map((m, i) => (
              <VibrantCard
                key={m.id}
                index={i}
                emoji={m.emoji}
                title={t(`maladie.${m.id}` as any) || m.title}
                desc={t(`maladie.${m.id}.sub` as any) || m.subtitle}
                gradient={MALADIE_GRADIENTS[m.id] || "from-gray-500 to-slate-600"}
                loop={m.loop}
                onClick={() => navigate(`/maladies/${m.id}`)}
              />
            ))}
          </motion.div>
        )}

        {/* ═══ ATHKÂR ═══ */}
        {activeTab === "athkar" && (
          <motion.div
            key="athkar"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Filters */}
            <div className="px-4 pt-2 pb-1 flex gap-1.5 overflow-x-auto no-scrollbar">
              {ATHKAR_FILTERS.map((f) => {
                const filterKey = f.id === "all" ? "athkar.filterAll" : `athkar.filter${f.id.charAt(0).toUpperCase()}${f.id.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase())}`;
                return (
                  <button
                    key={f.id}
                    onClick={() => setAthkarFilter(f.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      athkarFilter === f.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card/70 text-muted-foreground border-border hover:border-primary/40"
                    }`}
                  >
                    {f.emoji} {t(filterKey as any) || f.label}
                  </button>
                );
              })}
            </div>

            {(() => {
              const coreFiltered = filteredAthkar.filter(g => CORE_ATHKAR_IDS.includes(g.id));
              const situationFiltered = filteredAthkar.filter(g => !CORE_ATHKAR_IDS.includes(g.id));
              return (
                <>
                  {coreFiltered.length > 0 && (
                    <>
                      <div className="px-4 pt-2 pb-1">
                        <h2 className="text-sm font-bold text-foreground">📿 {t("athkar.coreTitle" as any)}</h2>
                      </div>
                      <div className="grid grid-cols-3 gap-3 px-4 pb-2">
                        {coreFiltered.map((g, i) => (
                          <VibrantCard
                            key={g.id}
                            index={i}
                            emoji={g.emoji}
                            title={t(`athkar.${g.id}` as any) || g.title}
                            desc={t(`athkar.${g.id}.sub` as any) || g.subtitle}
                            gradient={ATHKAR_GRADIENTS[i % ATHKAR_GRADIENTS.length]}
                            onClick={() => navigate(`/athkar/${g.id}`)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  {situationFiltered.length > 0 && (
                    <>
                      <div className="px-4 pt-3 pb-1">
                        <h2 className="text-sm font-bold text-foreground">🗂️ {t("athkar.situationsTitle" as any)}</h2>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{t("athkar.situationsSubtitle" as any)}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3 px-4 pb-4">
                        {situationFiltered.map((g, i) => (
                          <VibrantCard
                            key={g.id}
                            index={i}
                            emoji={g.emoji}
                            title={t(`athkar.${g.id}` as any) || g.title}
                            desc={t(`athkar.${g.id}.sub` as any) || g.subtitle}
                            gradient={ATHKAR_GRADIENTS[(i + 3) % ATHKAR_GRADIENTS.length]}
                            onClick={() => navigate(`/athkar/${g.id}`)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </PageBackground>
  );
}
