import { useNavigate } from "react-router-dom";
import { moodPresets } from "@/data/moodPresets";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

function MoodCard({ icon, title, desc, loop, onClick }: {
  icon: string;
  title: string;
  desc: string;
  loop?: boolean;
  onClick?: () => void;
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
        <p className="text-sm font-semibold text-foreground leading-tight">
          {title}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2 leading-snug">
          {desc}
        </p>
      </div>
    </button>
  );
}

export default function Moods() {
  const navigate = useNavigate();
  const { t } = useLanguage();

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

      {/* List */}
      <div className="space-y-2 p-4">
        {moodPresets.map((mood, i) => {
          const titleKey = `mood.${mood.id}` as any;
          const subKey = `mood.${mood.id}.sub` as any;
          return (
            <motion.div
              key={mood.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
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
    </div>
  );
}
