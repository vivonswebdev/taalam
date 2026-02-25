import { motion } from "framer-motion";
import { X, RefreshCw } from "lucide-react";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useLanguage } from "@/hooks/useLanguage";
import { Progress } from "@/components/ui/progress";

type SessionMode = "control_hifz" | "tahaddi" | "reading";

interface ActiveChildBannerProps {
  compact?: boolean;
  /** Session HUD props — when provided, shows mode + surah + progress */
  mode?: SessionMode;
  surahName?: string;
  ayahFrom?: number;
  ayahTo?: number;
  /** 0–1 progress ratio */
  progress?: number;
  onChangeChild?: () => void;
}

const MODE_LABELS: Record<SessionMode, Record<string, string>> = {
  control_hifz: { fr: "Contrôle Hifz", en: "Hifz Control", ar: "تحكم حفظ", nl: "Hifz Controle" },
  tahaddi: { fr: "Tahaddi", en: "Tahaddi", ar: "تحدي", nl: "Tahaddi" },
  reading: { fr: "Lecture", en: "Reading", ar: "قراءة", nl: "Lezen" },
};

export default function ActiveChildBanner({
  compact = false,
  mode,
  surahName,
  ayahFrom,
  ayahTo,
  progress: progressValue,
  onChangeChild,
}: ActiveChildBannerProps) {
  const { activeChild, clearActiveChild } = useActiveChild();
  const { lang, t } = useLanguage();

  if (!activeChild) return null;

  // Compact pill version
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 bg-secondary/15 text-secondary px-2.5 py-1 rounded-full text-xs font-semibold">
        <span>{activeChild.avatarEmoji}</span>
        <span className="truncate max-w-[80px]">{activeChild.name}</span>
        <button onClick={clearActiveChild} className="ml-0.5 hover:text-destructive transition-colors">
          <X size={12} />
        </button>
      </div>
    );
  }

  const modeLabel = mode ? (MODE_LABELS[mode]?.[lang] || MODE_LABELS[mode]?.en) : null;
  const hasSession = mode || surahName;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-secondary/10 border border-secondary/20 rounded-xl px-3 py-2 space-y-2"
    >
      {/* Row 1: child info */}
      <div className="flex items-center gap-3">
        <span className="text-xl">{activeChild.avatarEmoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-secondary font-semibold uppercase tracking-wide">
            {t("activeChild.workingWith")}
          </p>
          <p className="text-sm font-bold text-foreground truncate">
            {activeChild.name}
            {activeChild.age ? ` (${activeChild.age} ${t("parent.years")})` : ""}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {onChangeChild && (
            <button
              onClick={onChangeChild}
              className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
            >
              <RefreshCw size={12} className="text-muted-foreground" />
            </button>
          )}
          <button
            onClick={clearActiveChild}
            className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/10 transition-colors"
          >
            <X size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Row 2: session info (only if mode is provided) */}
      {hasSession && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {modeLabel && (
            <span className="bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full text-[10px]">
              {modeLabel}
            </span>
          )}
          {surahName && (
            <span className="truncate">
              {surahName}
              {ayahFrom != null && ayahTo != null ? ` · ${t("tafsir.ayah")} ${ayahFrom}–${ayahTo}` : ""}
            </span>
          )}
        </div>
      )}

      {/* Row 3: progress bar */}
      {progressValue != null && progressValue >= 0 && (
        <div className="flex items-center gap-2">
          <Progress value={Math.round(progressValue * 100)} className="h-1.5 flex-1" />
          <span className="text-[10px] font-bold text-primary min-w-[32px] text-right">
            {Math.round(progressValue * 100)}%
          </span>
        </div>
      )}
    </motion.div>
  );
}
