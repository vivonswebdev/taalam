import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { Users, Home, GraduationCap, Globe, ArrowLeft } from "lucide-react";

const GROUPS = [
  {
    id: "family",
    emoji: "👨‍👩‍👧",
    icon: Home,
    titleKey: "groups.family",
    descKey: "groups.familyDesc",
    href: "/family",
    gradient: "from-pink-500/20 via-rose-500/20 to-red-500/20",
  },
  {
    id: "class",
    emoji: "🎓",
    icon: GraduationCap,
    titleKey: "groups.class",
    descKey: "groups.classDesc",
    href: "/classrooms",
    gradient: "from-blue-500/20 via-indigo-500/20 to-purple-500/20",
  },
  {
    id: "mosque",
    emoji: "🕌",
    icon: Users,
    titleKey: "groups.mosque",
    descKey: "groups.mosqueDesc",
    href: "/community",
    gradient: "from-green-500/20 via-teal-500/20 to-cyan-500/20",
  },
  {
    id: "country",
    emoji: "🌍",
    icon: Globe,
    titleKey: "groups.country",
    descKey: "groups.countryDesc",
    href: "/leaderboard",
    gradient: "from-amber-500/20 via-orange-500/20 to-yellow-500/20",
  },
];

export default function CommunityGroups() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header glassmorphism */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-muted/60 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform"
          >
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            🌍 {t("groups.title" as any)}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        <p className="text-xs text-muted-foreground mb-4 text-center">
          {t("groups.subtitle" as any)}
        </p>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3">
          {GROUPS.map((group, i) => {
            const Icon = group.icon;
            return (
              <motion.button
                key={group.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 200, damping: 20 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(group.href)}
                className={`
                  relative flex flex-col justify-between min-h-[160px] p-5 text-left
                  rounded-3xl overflow-hidden
                  bg-gradient-to-br ${group.gradient}
                  backdrop-blur-xl border border-white/20
                  shadow-xl hover:shadow-2xl transition-all
                `}
              >
                {/* Shimmer */}
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    style={{ animation: "shimmer 3s infinite" }}
                  />
                </div>

                {/* Icon + Emoji */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-3xl">{group.emoji}</span>
                  <Icon size={18} className="text-foreground/50" />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-end">
                  <p className="text-sm font-bold text-foreground leading-tight">
                    {t(group.titleKey as any)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                    {t(group.descKey as any)}
                  </p>
                </div>

                {/* Glow */}
                <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
              </motion.button>
            );
          })}
        </div>

        {/* Info card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl p-4"
        >
          <p className="text-xs text-muted-foreground text-center">
            💬 {t("groups.info" as any)}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
