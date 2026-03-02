import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useUserMode } from "@/hooks/useUserMode";
import { ModeSelector } from "@/components/ModeSelector";
import ProfileBubble from "@/components/ProfileBubble";
import BottomNav from "@/components/BottomNav";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface MenuItem {
  emoji: string;
  labelKey: string;
  descKey?: string;
  path: string;
}

interface Section {
  id: string;
  emoji: string;
  titleKey: string;
  items: MenuItem[];
  showIf?: boolean;
}

export default function More() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { mode } = useUserMode();

  const SECTIONS: Section[] = [
    {
      id: "lecture",
      emoji: "📖",
      titleKey: "more.sectionLecture",
      items: [
        { emoji: "🔍", labelKey: "more.findAyah", descKey: "more.findAyahDesc", path: "/find-ayah" },
        { emoji: "📚", labelKey: "more.juzHizb", descKey: "more.juzHizbDesc", path: "/juz" },
        { emoji: "📖", labelKey: "more.readingMode", descKey: "more.readingModeDesc", path: "/quran-hub" },
        { emoji: "⭐", labelKey: "more.bookmarks", descKey: "more.bookmarksDesc", path: "/bookmarks" },
        { emoji: "📝", labelKey: "more.favoritesNotes", descKey: "more.favoritesNotesDesc", path: "/favorites-notes" },
      ],
    },
    {
      id: "learning",
      emoji: "🎓",
      titleKey: "more.sectionLearning",
      items: [
        { emoji: "🧠", labelKey: "more.quizLevel", descKey: "more.quizLevelDesc", path: "/quiz" },
        { emoji: "📝", labelKey: "more.studyMode", descKey: "more.studyModeDesc", path: "/study?surah=1" },
        { emoji: "🎯", labelKey: "more.hifzSrs", descKey: "more.hifzSrsDesc", path: "/hifz-today" },
        { emoji: "📖", labelKey: "more.noorani", descKey: "more.nooraniDesc", path: "/noorani" },
        { emoji: "🎙️", labelKey: "more.recitation", descKey: "more.recitationDesc", path: "/recitation" },
      ],
    },
    {
      id: "practice",
      emoji: "🕌",
      titleKey: "more.sectionPractice",
      items: [
        { emoji: "🕐", labelKey: "more.prayerTimes", descKey: "more.prayerTimesDesc", path: "/prayers" },
        { emoji: "📿", labelKey: "more.athkar", descKey: "more.athkarDesc", path: "/moods" },
        { emoji: "📻", labelKey: "more.liveQuran", descKey: "more.liveQuranDesc", path: "/live-quran" },
        { emoji: "🎧", labelKey: "more.advancedListening", descKey: "more.advancedListeningDesc", path: "/listening" },
      ],
    },
    {
      id: "social",
      emoji: "👥",
      titleKey: "more.sectionSocial",
      items: [
        { emoji: "🌍", labelKey: "more.community", descKey: "more.communityDesc", path: "/community" },
        { emoji: "👨‍👩‍👧", labelKey: "more.familyClass", descKey: "more.familyClassDesc", path: "/family" },
        { emoji: "🏆", labelKey: "more.ranking", descKey: "more.rankingDesc", path: "/leaderboard" },
        { emoji: "👨‍🏫", labelKey: "more.teacherClass", descKey: "more.teacherClassDesc", path: "/classrooms" },
        ...(mode === "teacher" ? [{ emoji: "📊", labelKey: "more.teacherDashboard", descKey: "more.teacherDashboardDesc", path: "/teacher-dashboard" }] : []),
      ],
    },
    {
      id: "progress",
      emoji: "📊",
      titleKey: "more.sectionProgress",
      items: [
        { emoji: "📊", labelKey: "more.habitsProgress", descKey: "more.habitsDesc", path: "/habits" },
        { emoji: "🗺️", labelKey: "more.hifzMap", descKey: "more.hifzMapDesc", path: "/hifz-map" },
        { emoji: "📅", labelKey: "more.hifzPlan", descKey: "more.hifzPlanDesc", path: "/hifz-plan" },
      ],
    },
    {
      id: "settings",
      emoji: "⚙️",
      titleKey: "more.sectionSettings",
      items: [
        { emoji: "⚙️", labelKey: "nav.settings", descKey: "more.settingsDesc", path: "/settings" },
        { emoji: "🔔", labelKey: "more.notifications", descKey: "more.notificationsDesc", path: "/notification-settings" },
        { emoji: "📥", labelKey: "more.offline", descKey: "more.offlineDesc", path: "/offline-settings" },
        { emoji: "📲", labelKey: "more.installApp", descKey: "more.installAppDesc", path: "/install-app" },
        { emoji: "👤", labelKey: "more.loginProfile", path: "/auth" },
        { emoji: "❓", labelKey: "more.helpFaq", descKey: "more.helpFaqDesc", path: "/faq" },
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-5 pt-10 pb-3 flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold text-foreground flex items-center gap-2"
          >
            ⚙️ {t("more.title")}
          </motion.h1>
          <p className="text-xs text-muted-foreground mt-0.5">{t("more.subtitle")}</p>
        </div>
        <ProfileBubble />
      </div>

      <div className="px-4 space-y-4">
        {/* Role Selector */}
        <ModeSelector />

        {/* Accordion Sections */}
        <Accordion type="multiple" defaultValue={["lecture"]} className="space-y-2">
          {SECTIONS.map((section) => (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3.5 hover:no-underline">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{section.emoji}</span>
                  <span className="text-sm font-bold text-foreground">
                    {t(section.titleKey as any)}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-1 pb-2">
                <div className="divide-y divide-border/50">
                  {section.items.map((item) => (
                    <button
                      key={item.path + item.labelKey}
                      onClick={() => navigate(item.path)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/40 transition-colors active:scale-[0.99] rounded-xl"
                    >
                      <span className="text-lg shrink-0">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-card-foreground truncate">
                          {t(item.labelKey as any)}
                        </p>
                        {item.descKey && (
                          <p className="text-[11px] text-muted-foreground truncate">
                            {t(item.descKey as any)}
                          </p>
                        )}
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Footer */}
        <div className="text-center py-4 space-y-1">
          <p className="text-[10px] text-muted-foreground">
            {t("more.version" as any)} 2.0.0
          </p>
          <p className="text-[10px] text-muted-foreground/70">
            💚 {t("home.freeMessage" as any)}
          </p>
          <a
            href="https://app.taalam.eu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-primary/60 font-medium underline underline-offset-2"
          >
            app.taalam.eu
          </a>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
