import { motion } from "framer-motion";
import { X, User } from "lucide-react";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useLanguage } from "@/hooks/useLanguage";

interface ActiveChildBannerProps {
  compact?: boolean;
}

export default function ActiveChildBanner({ compact = false }: ActiveChildBannerProps) {
  const { activeChild, clearActiveChild } = useActiveChild();
  const { t } = useLanguage();

  if (!activeChild) return null;

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

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 bg-secondary/10 border border-secondary/20 rounded-xl px-3 py-2"
    >
      <span className="text-xl">{activeChild.avatarEmoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-secondary font-semibold">{t("activeChild.workingWith")}</p>
        <p className="text-sm font-bold text-foreground truncate">
          {activeChild.name}
          {activeChild.age ? ` (${activeChild.age} ${t("parent.years")})` : ""}
        </p>
      </div>
      <button
        onClick={clearActiveChild}
        className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/10 transition-colors"
      >
        <X size={14} className="text-muted-foreground" />
      </button>
    </motion.div>
  );
}
