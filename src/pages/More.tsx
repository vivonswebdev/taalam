import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Radio, BarChart3, Settings, User, Brain, Star, Users, ChevronRight, BookOpen, Trophy, Search, Headphones } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  desc?: string;
  path: string;
}

function MenuSection({ title, items }: { title: string; items: MenuItem[] }) {
  const navigate = useNavigate();
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">{title}</p>
      <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
        {items.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-accent/40 transition-colors active:scale-[0.99]"
          >
            <span className="text-lg shrink-0">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-card-foreground truncate">{item.label}</p>
              {item.desc && <p className="text-[11px] text-muted-foreground truncate">{item.desc}</p>}
            </div>
            <ChevronRight size={16} className="text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function More() {
  const { t } = useLanguage();

  const quranSection: MenuItem[] = [
    { icon: <Clock size={20} className="text-primary" />, label: t("more.prayerTimes"), desc: t("more.prayerTimesDesc"), path: "/prayers" },
    { icon: <Radio size={20} className="text-green-500" />, label: t("more.liveQuran"), desc: t("more.liveQuranDesc"), path: "/live-quran" },
    { icon: <Search size={20} className="text-indigo-500" />, label: t("more.findAyah"), desc: t("more.findAyahDesc"), path: "/find-ayah" },
    { icon: <Trophy size={20} className="text-amber-500" />, label: t("more.ranking"), desc: t("more.rankingDesc"), path: "/leaderboard" },
    { icon: <BookOpen size={20} className="text-teal-500" />, label: t("more.juzHizb"), desc: t("more.juzHizbDesc"), path: "/juz" },
  ];

  const accountSection: MenuItem[] = [
    { icon: <Settings size={20} className="text-muted-foreground" />, label: t("nav.settings"), desc: t("more.settingsDesc"), path: "/settings" },
    { icon: <BarChart3 size={20} className="text-primary" />, label: t("more.habitsProgress"), desc: t("more.habitsDesc"), path: "/habits" },
    { icon: <User size={20} className="text-blue-500" />, label: t("more.loginProfile"), path: "/auth" },
  ];

  const modulesSection: MenuItem[] = [
    { icon: <Brain size={20} className="text-purple-500" />, label: t("more.hifzPlan"), desc: t("more.hifzPlanDesc"), path: "/hifz-plan" },
    { icon: <BookOpen size={20} className="text-emerald-500" />, label: t("more.studyMode"), desc: t("more.studyModeDesc"), path: "/study?surah=1" },
    { icon: <Star size={20} className="text-yellow-500" />, label: t("more.bookmarks"), desc: t("more.bookmarksDesc"), path: "/bookmarks" },
    { icon: <Users size={20} className="text-pink-500" />, label: t("more.familyClass"), desc: t("more.familyClassDesc"), path: "/family" },
    { icon: <Users size={20} className="text-indigo-500" />, label: t("more.teacherClass"), desc: t("more.teacherClassDesc"), path: "/classrooms" },
  ];

  return (
    <div className="min-h-screen pb-24">
      <div className="px-6 pt-14 pb-2">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-foreground">
          {t("more.title")}
        </motion.h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t("more.subtitle")}</p>
      </div>

      <div className="px-5 pt-4 space-y-5">
        <MenuSection title={t("more.sectionQuran")} items={quranSection} />
        <MenuSection title={t("more.sectionAccount")} items={accountSection} />
        <MenuSection title={t("more.sectionModules")} items={modulesSection} />
      </div>
    </div>
  );
}
