import { useLanguage } from "@/hooks/useLanguage";
import { useUserMode, type UserMode } from "@/hooks/useUserMode";
import { trackEvent } from "@/lib/trackEvent";
import { motion } from "framer-motion";

const ALL_MODES: { id: UserMode; icon: string; titleKey: string }[] = [
  { id: "solo", icon: "🕌", titleKey: "more.modeSolo.title" },
  { id: "child", icon: "🧒", titleKey: "more.modeChild.title" },
  { id: "teacher", icon: "👨‍🏫", titleKey: "more.modeTeacher.title" },
  { id: "parent", icon: "👨‍👩‍👧", titleKey: "more.modeParent.title" },
];

export function ModeSelector() {
  const { t } = useLanguage();
  const { mode, setMode } = useUserMode();

  const handleModeClick = async (next: UserMode) => {
    if (next === mode) return;
    await setMode(next);
    trackEvent("mode_selected", "settings", { mode: next });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
      <p className="text-sm font-semibold text-foreground">{t("more.chooseModeTitle" as any)}</p>
      <div className="grid grid-cols-4 gap-1.5">
        {ALL_MODES.map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => handleModeClick(m.id)}
              className={`relative flex flex-col items-center gap-0.5 rounded-xl py-2 px-1 transition-all ${
                active
                  ? "bg-primary/15 border border-primary ring-1 ring-primary/30"
                  : "bg-card border border-border hover:border-muted-foreground/30"
              }`}
            >
              <span className="text-xl">{m.icon}</span>
              <span className={`text-[10px] font-semibold leading-tight text-center ${active ? "text-primary" : "text-card-foreground"}`}>
                {t(m.titleKey as any)}
              </span>
              {active && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-[8px] text-primary-foreground font-bold">✓</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
