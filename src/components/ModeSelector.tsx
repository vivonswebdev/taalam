import { useLanguage } from "@/hooks/useLanguage";
import { useUserMode, type UserMode, type AgeGroup } from "@/hooks/useUserMode";
import { trackEvent } from "@/lib/trackEvent";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const ALL_MODES: { id: UserMode; icon: string; titleKey: string; descKey: string }[] = [
  { id: "solo", icon: "🕌", titleKey: "more.modeSolo.title", descKey: "more.modeSolo.desc" },
  { id: "child", icon: "🧒", titleKey: "more.modeChild.title", descKey: "more.modeChild.desc" },
  { id: "teacher", icon: "👨‍🏫", titleKey: "more.modeTeacher.title", descKey: "more.modeTeacher.desc" },
  { id: "parent", icon: "👨‍👩‍👧", titleKey: "more.modeParent.title", descKey: "more.modeParent.desc" },
];

function getOrderedModes(ageGroup: AgeGroup) {
  if (ageGroup === "child") {
    // child + solo first, prof/parent smaller
    return {
      primary: ALL_MODES.filter(m => m.id === "child" || m.id === "solo"),
      secondary: ALL_MODES.filter(m => m.id === "teacher" || m.id === "parent"),
    };
  }
  if (ageGroup === "senior") {
    return {
      primary: ALL_MODES.filter(m => m.id === "solo"),
      secondary: ALL_MODES.filter(m => m.id !== "solo"),
    };
  }
  // adult: solo/parent/teacher prominent, child smaller
  return {
    primary: ALL_MODES.filter(m => m.id === "solo" || m.id === "parent" || m.id === "teacher"),
    secondary: ALL_MODES.filter(m => m.id === "child"),
  };
}

export function ModeSelector() {
  const { t } = useLanguage();
  const { mode, setMode, ageGroup } = useUserMode();
  const { primary, secondary } = getOrderedModes(ageGroup);

  const handleSelect = async (next: UserMode) => {
    await setMode(next);
    trackEvent("mode_selected", "settings", { mode: next });
  };

  const renderCard = (m: typeof ALL_MODES[0], small = false) => (
    <button
      key={m.id}
      onClick={() => handleSelect(m.id)}
      className={`relative flex flex-col items-start gap-1 rounded-2xl px-3 ${small ? "py-2" : "py-3"} bg-card border transition-all text-left ${
        mode === m.id
          ? "border-primary ring-1 ring-primary/30"
          : "border-border hover:border-muted-foreground/30"
      }`}
    >
      <span className={small ? "text-lg" : "text-xl"}>{m.icon}</span>
      <p className={`${small ? "text-[10px]" : "text-xs"} font-semibold text-card-foreground`}>{t(m.titleKey as any)}</p>
      {!small && <p className="text-[10px] text-muted-foreground leading-tight">{t(m.descKey as any)}</p>}
      {mode === m.id && (
        <Badge variant="default" className="absolute top-2 right-2 text-[9px] px-1.5 py-0">
          {t("more.modeActive" as any)}
        </Badge>
      )}
    </button>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
      <p className="text-sm font-semibold text-foreground">{t("more.chooseModeTitle" as any)}</p>
      <p className="text-xs text-muted-foreground">{t("more.chooseModeSubtitle" as any)}</p>
      <div className="grid grid-cols-2 gap-2 pt-1">
        {primary.map(m => renderCard(m))}
      </div>
      {secondary.length > 0 && (
        <div className={`grid gap-2 pt-1 ${secondary.length === 1 ? "grid-cols-2" : "grid-cols-2"}`}>
          {secondary.map(m => renderCard(m))}
        </div>
      )}
    </motion.div>
  );
}
