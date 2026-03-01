import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useUserMode } from "@/hooks/useUserMode";
import { ModeSelector } from "@/components/ModeSelector";

interface MenuItem {
  icon: string;
  label: string;
  desc?: string;
  path: string;
}

function MenuSection({ title, items }: { title: string; items: MenuItem[] }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-1.5"
    >
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
        {title}
      </p>
      <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
        {items.map((item) => (
          <button
            key={item.path + item.label}
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
    </motion.div>
  );
}

export default function More() {
  const { t } = useLanguage();
  const { mode } = useUserMode();

  // SECTION – Communauté
  const communityItems: MenuItem[] = [
    { icon: "🌍", label: t("community.title" as any), desc: t("more.communityDesc" as any), path: "/community" },
  ];

  // SECTION – Qur'an & pratique
  const quranItems: MenuItem[] = [
    { icon: "📖", label: t("more.mushaf" as any), desc: t("more.mushafDesc" as any), path: "/mushaf" },
    { icon: "📿", label: t("more.athkar" as any), desc: t("more.athkarDesc" as any), path: "/moods" },
    { icon: "🕋", label: t("more.prayerTimes"), desc: t("more.prayerTimesDesc"), path: "/prayers" },
    { icon: "📡", label: t("more.liveQuran"), desc: t("more.liveQuranDesc"), path: "/live-quran" },
    { icon: "🔍", label: t("more.findAyah"), desc: t("more.findAyahDesc"), path: "/find-ayah" },
    { icon: "🧮", label: t("more.juzHizb"), desc: t("more.juzHizbDesc"), path: "/juz" },
    { icon: "🎧", label: t("more.advancedListening" as any), desc: t("more.advancedListeningDesc" as any), path: "/listening" },
  ];

  // SECTION – Outils pédagogiques
  const toolsItems: MenuItem[] = [
    { icon: "🎙️", label: t("more.recitation" as any), desc: t("more.recitationDesc" as any), path: "/recitation" },
    { icon: "📚", label: t("more.quranHub" as any), desc: t("more.quranHubDesc" as any), path: "/quran-hub" },
    { icon: "📝", label: t("more.quranReading" as any), desc: t("more.quranReadingDesc" as any), path: "/reading" },
    { icon: "📋", label: t("more.assignmentsTutorial" as any), desc: t("more.assignmentsTutorialDesc" as any), path: "/assignments-tutorial" },
  ];

  // SECTION – Progression & gamification
  const progressItems: MenuItem[] = [
    { icon: "🏆", label: t("more.ranking"), desc: t("more.rankingDesc"), path: "/leaderboard" },
    { icon: "🎯", label: t("more.habitsProgress"), desc: t("more.habitsDesc"), path: "/habits" },
  ];

  // SECTION – Compte & réglages
  const accountItems: MenuItem[] = [
    { icon: "⚙️", label: t("nav.settings"), desc: t("more.settingsDesc"), path: "/settings" },
    { icon: "👤", label: t("more.loginProfile"), path: "/auth" },
    { icon: "🔔", label: t("more.notifications" as any), desc: t("more.notificationsDesc" as any), path: "/notification-settings" },
    { icon: "❓", label: t("more.helpFaq" as any), desc: t("more.helpFaqDesc" as any), path: "/faq" },
  ];

  // SECTION – Modules d'étude
  const modulesItems: MenuItem[] = [
    { icon: "🧠", label: t("more.hifzPlan"), desc: t("more.hifzPlanDesc"), path: "/hifz-plan" },
    { icon: "🔁", label: t("more.hifzSrs" as any), desc: t("more.hifzSrsDesc" as any), path: "/hifz-today" },
    { icon: "📚", label: t("more.studyMode"), desc: t("more.studyModeDesc"), path: "/study?surah=1" },
    { icon: "📖", label: t("more.noorani" as any), desc: t("more.nooraniDesc" as any), path: "/noorani" },
    { icon: "🔖", label: t("more.bookmarks"), desc: t("more.bookmarksDesc"), path: "/bookmarks" },
    { icon: "⭐", label: t("more.favoritesNotes" as any), desc: t("more.favoritesNotesDesc" as any), path: "/favorites-notes" },
  ];

  // SECTION – Famille & classes
  const familyItems: MenuItem[] = [
    { icon: "👨‍👩‍👧", label: t("more.familyClass"), desc: t("more.familyClassDesc"), path: "/family" },
    { icon: "👨‍🏫", label: t("more.teacherClass"), desc: t("more.teacherClassDesc"), path: "/classrooms" },
    { icon: "📊", label: t("more.teacherDashboard" as any), desc: t("more.teacherDashboardDesc" as any), path: "/teacher-dashboard" },
  ];

  // SECTION – Installer l'app
  const installItems: MenuItem[] = [
    { icon: "📲", label: t("more.installApp" as any), desc: t("more.installAppDesc" as any), path: "/install-app" },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-6 pt-14 pb-2">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-foreground">
          {t("more.title")}
        </motion.h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t("more.subtitle")}</p>
      </div>

      <div className="px-5 pt-4 space-y-6">
        {/* SECTION 1 – Mon rôle */}
        <ModeSelector />

        {/* SECTION 2 – Communauté */}
        <MenuSection title={t("more.sectionCommunity" as any)} items={communityItems} />

        {/* Qur'an & pratique */}
        <MenuSection title={t("more.sectionQuranPractice" as any)} items={quranItems} />

        {/* Outils pédagogiques */}
        <MenuSection title={t("more.sectionTools" as any)} items={toolsItems} />

        {/* Progression */}
        <MenuSection title={t("more.sectionProgress" as any)} items={progressItems} />

        {/* SECTION 5 – Compte & réglages */}
        <MenuSection title={t("more.sectionAccountSettings" as any)} items={accountItems} />

        {/* SECTION 6 – Modules */}
        <MenuSection title={t("more.sectionStudyModules" as any)} items={modulesItems} />

        {/* SECTION 7 – Famille & classes */}
        {(mode === "teacher" || mode === "parent" || mode === "solo") && (
          <MenuSection title={t("more.sectionFamily" as any)} items={familyItems} />
        )}

        {/* SECTION 8 – Installer */}
        <MenuSection title={t("more.sectionInstall" as any)} items={installItems} />
      </div>
    </div>
  );
}
