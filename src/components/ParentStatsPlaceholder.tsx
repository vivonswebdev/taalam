import { motion } from "framer-motion";
import { Users, Heart } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export default function ParentStatsPlaceholder() {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-6 text-center space-y-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
        <Users size={32} className="text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-foreground">
          {t("parent.stats.comingSoonTitle" as any)}
        </h3>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          {t("parent.stats.comingSoonDesc" as any)}
        </p>
      </div>
      <div className="flex items-center justify-center gap-1 text-primary">
        <Heart size={14} className="fill-current" />
        <span className="text-xs font-semibold">In shā Allāh</span>
      </div>
    </motion.div>
  );
}
