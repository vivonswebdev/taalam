import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { moodPresets } from "@/data/moodPresets";
import { maladiesPresets } from "@/data/maladiesPresets";
import { athkarGroups, ATHKAR_FILTERS, CORE_ATHKAR_IDS, type AthkarCategory } from "@/data/athkarData";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

type Tab = "moods" | "maladies" | "athkar";

const TAB_IDS: Tab[] = ["moods", "maladies", "athkar"];
const TAB_EMOJIS: Record<Tab, string> = { moods: "💓", maladies: "🩺", athkar: "📿" };
const TAB_KEYS: Record<Tab, string> = { moods: "moods.tabMoods", maladies: "moods.tabMaladies", athkar: "moods.tabAthkar" };

function MoodCard({ icon, title, desc, loop, onClick }: {
  icon: string; title: string; desc: string; loop?: boolean; onClick?: () => void;
}) {
  const { t } = useLanguage();
  return (
    <button
      onClick={onClick}
      className="w-full flex flex-col items-start gap-2 rounded-2xl px-3 py-3 bg-card/70 border border-border hover:border-primary/70 transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[90px]"
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-3xl leading-none">{icon}</span>
        {loop && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/40 whitespace-nowrap">
            {t("moods.loopBadge" as any)}
          </span>
        )}
      </div>
      <div className="text-left">
        <p className="text-sm font-semibold text-foreground leading-tight">{title}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2 leading-snug">{desc}</p>
      </div>
    </button>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-black/30 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border/50 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-muted">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-semibold">❤️ {t("moods.title")}</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">{t("moods.subtitle")}</p>
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
            <div className="grid grid-cols-2 gap-3 px-4 pt-3 pb-4">
              {[...moodPresets.filter(m => m.loop), ...moodPresets.filter(m => !m.loop)].map((mood, i) => {
                const titleKey = `mood.${mood.id}` as any;
                const subKey = `mood.${mood.id}.sub` as any;
                return (
                  <motion.div
                    key={mood.id}
                    initial={{ opacity: 0, y: 24, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: Math.min(i * 0.04, 0.4), type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <MoodCard
                      icon={mood.emoji}
                      title={t(titleKey) || mood.title}
                      desc={t(subKey) || mood.subtitle}
                      loop={mood.loop}
                      onClick={() => navigate(`/moods/${mood.id}`)}
                    />
                  </motion.div>
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
            className="grid grid-cols-2 gap-3 p-4"
          >
            {maladiesPresets.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 24, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: Math.min(i * 0.04, 0.4), type: "spring", stiffness: 260, damping: 20 }}
              >
                <MoodCard
                  icon={m.emoji}
                  title={t(`maladie.${m.id}` as any) || m.title}
                  desc={t(`maladie.${m.id}.sub` as any) || m.subtitle}
                  loop={m.loop}
                  onClick={() => navigate(`/maladies/${m.id}`)}
                />
              </motion.div>
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
            <div className="px-4 pt-3 pb-1 flex gap-1.5 overflow-x-auto no-scrollbar">
              {ATHKAR_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setAthkarFilter(f.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    athkarFilter === f.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card/70 text-muted-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {f.emoji} {f.label}
                </button>
              ))}
            </div>

            {/* Core athkar */}
            {(() => {
              const coreFiltered = filteredAthkar.filter(g => CORE_ATHKAR_IDS.includes(g.id));
              const situationFiltered = filteredAthkar.filter(g => !CORE_ATHKAR_IDS.includes(g.id));
              return (
                <>
                  {coreFiltered.length > 0 && (
                    <>
                      <div className="px-4 pt-2 pb-1">
                        <h2 className="text-sm font-bold text-foreground">📿 Adhkar principaux</h2>
                      </div>
                      <div className="grid grid-cols-2 gap-3 px-4 pb-2">
                        {coreFiltered.map((g, i) => (
                          <motion.div
                            key={g.id}
                            initial={{ opacity: 0, y: 24, scale: 0.92 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: Math.min(i * 0.04, 0.4), type: "spring", stiffness: 260, damping: 20 }}
                          >
                            <MoodCard icon={g.emoji} title={g.title} desc={g.subtitle} onClick={() => navigate(`/athkar/${g.id}`)} />
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                  {situationFiltered.length > 0 && (
                    <>
                      <div className="px-4 pt-3 pb-1">
                        <h2 className="text-sm font-bold text-foreground">🗂️ Situations particulières</h2>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Voyage, maison, mosquée, événements de vie…</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 px-4 pb-4">
                        {situationFiltered.map((g, i) => (
                          <motion.div
                            key={g.id}
                            initial={{ opacity: 0, y: 24, scale: 0.92 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: Math.min(i * 0.04, 0.4), type: "spring", stiffness: 260, damping: 20 }}
                          >
                            <MoodCard icon={g.emoji} title={g.title} desc={g.subtitle} onClick={() => navigate(`/athkar/${g.id}`)} />
                          </motion.div>
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
  );
}
