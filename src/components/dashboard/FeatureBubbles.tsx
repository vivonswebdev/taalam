import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuranXp } from "@/hooks/useQuranXp";
import { useAuth } from "@/hooks/useAuth";
import { useUserMode } from "@/hooks/useUserMode";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useDailyTarteelChallenge } from "@/hooks/useDailyTarteelChallenge";
import { useHifzSRS } from "@/hooks/useHifzSRS";
import ProfileBubble from "@/components/ProfileBubble";
import ShareProgressCard from "@/components/ShareProgressCard";
import WeakSurahsSection from "@/components/WeakSurahsSection";
import DailyTarteelChallenge from "@/components/DailyTarteelChallenge";
import GoodDeedsWidget from "@/components/GoodDeedsWidget";
import PageBackground from "@/components/PageBackground";
import taaloumLogo from "@/assets/taaloum-logo.png";
import { useNavigate } from "react-router-dom";
import { Flame, Star, TrendingUp } from "lucide-react";

// ═══ Feature data ═══

interface Feature {
  id: string;
  nameKey: string;
  emoji: string;
  path?: string;
  action?: "theme" | "language" | "donate";
  gradient: string;
}

const MAIN_FEATURES: Feature[] = [
  { id: "mushaf", nameKey: "dashboard.mushaf", emoji: "📖", path: "/mushaf", gradient: "from-primary/30 to-accent/20" },
  { id: "tarteel", nameKey: "dashboard.tarteel", emoji: "🎤", path: "/tarteel", gradient: "from-accent/30 to-primary/20" },
  { id: "quiz", nameKey: "dashboard.quiz", emoji: "🧠", path: "/quiz", gradient: "from-secondary/30 to-primary/20" },
  { id: "progress", nameKey: "dashboard.progress", emoji: "📊", path: "/progress", gradient: "from-primary/20 to-secondary/20" },
  { id: "leaderboard", nameKey: "dashboard.leaderboard", emoji: "🏆", path: "/leaderboard", gradient: "from-secondary/30 to-accent/20" },
  { id: "prayers", nameKey: "dashboard.prayers", emoji: "🕌", path: "/prayers", gradient: "from-accent/20 to-primary/20" },
  { id: "hifzPlan", nameKey: "dashboard.hifzPlan", emoji: "🎯", path: "/hifz-plan", gradient: "from-primary/30 to-secondary/20" },
  { id: "moods", nameKey: "dashboard.moods", emoji: "💎", path: "/moods", gradient: "from-accent/30 to-secondary/20" },
  { id: "kids", nameKey: "dashboard.kids", emoji: "👨‍👩‍👧", path: "/kids", gradient: "from-secondary/20 to-primary/20" },
  { id: "classrooms", nameKey: "dashboard.classrooms", emoji: "🏫", path: "/classrooms", gradient: "from-primary/20 to-accent/20" },
  { id: "listening", nameKey: "dashboard.listening", emoji: "🎧", path: "/listening", gradient: "from-accent/20 to-secondary/20" },
  { id: "reading", nameKey: "dashboard.reading", emoji: "📖", path: "/reading", gradient: "from-primary/30 to-accent/20" },
  { id: "findAyah", nameKey: "dashboard.findAyah", emoji: "🔍", path: "/find-ayah", gradient: "from-secondary/30 to-primary/20" },
  { id: "habits", nameKey: "dashboard.habits", emoji: "✅", path: "/habits", gradient: "from-primary/20 to-secondary/20" },
  { id: "noorani", nameKey: "dashboard.noorani", emoji: "📚", path: "/noorani", gradient: "from-accent/30 to-primary/20" },
];

const SETTINGS_FEATURES: Feature[] = [
  { id: "theme", nameKey: "dashboard.theme", emoji: "🎨", action: "theme", gradient: "from-accent/30 to-secondary/20" },
  { id: "reciter", nameKey: "dashboard.reciter", emoji: "🔊", path: "/tarteel", gradient: "from-secondary/20 to-primary/20" },
  { id: "athan", nameKey: "dashboard.athan", emoji: "⏰", path: "/athan-settings", gradient: "from-primary/20 to-accent/20" },
  { id: "qibla", nameKey: "dashboard.qibla", emoji: "🧭", path: "/prayers", gradient: "from-accent/20 to-secondary/20" },
  { id: "notifs", nameKey: "dashboard.notifs", emoji: "🔔", path: "/notification-settings", gradient: "from-secondary/30 to-primary/20" },
  { id: "languages", nameKey: "dashboard.languages", emoji: "🌍", action: "language", gradient: "from-primary/30 to-accent/20" },
  { id: "offline", nameKey: "dashboard.offline", emoji: "📱", path: "/offline-settings", gradient: "from-accent/20 to-primary/20" },
  { id: "profile", nameKey: "dashboard.profile", emoji: "👤", path: "/settings", gradient: "from-primary/20 to-secondary/20" },
  { id: "bookmarks", nameKey: "dashboard.bookmarks", emoji: "🔖", path: "/bookmarks", gradient: "from-secondary/30 to-accent/20" },
  { id: "hifzMap", nameKey: "dashboard.hifzMap", emoji: "🗺️", path: "/hifz-map", gradient: "from-primary/30 to-secondary/20" },
  { id: "games", nameKey: "dashboard.games", emoji: "🎮", path: "/jeux", gradient: "from-accent/30 to-secondary/20" },
  { id: "teacher", nameKey: "dashboard.teacher", emoji: "👨‍🏫", path: "/teacher-dashboard", gradient: "from-primary/20 to-accent/20" },
  { id: "community", nameKey: "dashboard.community", emoji: "🌍", path: "/community", gradient: "from-accent/20 to-primary/20" },
  { id: "donate", nameKey: "dashboard.donate", emoji: "❤️", action: "donate", gradient: "from-destructive/20 to-secondary/20" },
  { id: "faq", nameKey: "dashboard.faq", emoji: "❓", path: "/faq", gradient: "from-primary/20 to-accent/20" },
];

// ═══ Single Bubble ═══

function FeatureBubble({ item, onAction, t }: { item: Feature; onAction: (a: string) => void; t: (k: any) => string }) {
  const inner = (
    <div className={`flex flex-col items-center gap-1.5 w-[72px] shrink-0`}>
      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${item.gradient} border border-border/40 flex items-center justify-center text-2xl shadow-sm hover:scale-110 active:scale-95 transition-transform duration-200`}>
        {item.emoji}
      </div>
      <span className="text-[10px] font-medium text-foreground text-center leading-tight line-clamp-2 w-full">
        {t(item.nameKey as any)}
      </span>
    </div>
  );

  if (item.path) {
    return <Link to={item.path} className="block shrink-0">{inner}</Link>;
  }
  if (item.action) {
    return <button onClick={() => onAction(item.action!)} className="block shrink-0">{inner}</button>;
  }
  return inner;
}

// ═══ Carousel Row ═══

function BubbleCarousel({ title, items, onAction, t }: { title: string; items: Feature[]; onAction: (a: string) => void; t: (k: any) => string }) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-bold text-foreground px-5">{title}</h2>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-5 pb-2">
          {items.map((item) => (
            <FeatureBubble key={item.id} item={item} onAction={onAction} t={t} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══ Stats Header ═══

function StatsHeader({ t }: { t: (k: any) => string }) {
  const xp = useQuranXp();

  return (
    <div className="px-5 pt-10 pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src={taaloumLogo} alt="Taaloum" className="w-9 h-9 rounded-full shadow-md" />
          <div>
            <h1 className="text-base font-bold text-foreground tracking-tight">Taaloum</h1>
            <p className="text-[11px] text-muted-foreground">
              {t("home.level.label" as any)} {xp.level} · {xp.xp} XP
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-card/60 backdrop-blur-sm border border-border/40 rounded-full px-2 py-1">
            <Flame size={13} className="text-destructive" />
            <span className="text-[11px] font-semibold text-foreground">0j</span>
          </div>
          <ProfileBubble />
        </div>
      </div>
    </div>
  );
}

// ═══ Main Dashboard ═══

export function HomeDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { settings: adminSettings } = useAdminSettings();
  const dailyChallenge = useDailyTarteelChallenge();
  const { items: srsItems, todayItems: srsTodayItems, learningCount, reviewingCount, masteredCount } = useHifzSRS();
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    switch (action) {
      case "theme":
        document.documentElement.classList.toggle("dark");
        break;
      case "language":
        navigate("/settings");
        break;
      case "donate":
        window.open("https://buy.stripe.com/9AQ5mR6SldWrdQ84GI", "_blank");
        break;
    }
  };

  return (
    <PageBackground intensity="medium">
      <div className="home-bg min-h-screen pb-24">
        {/* Daily challenge */}
        {!adminSettings.hide_daily_challenge && !dailyChallenge.isCompleted && dailyChallenge.surah && dailyChallenge.surah.number && typeof dailyChallenge.complete === "function" && (
          <DailyTarteelChallenge
            surah={dailyChallenge.surah}
            onComplete={(score) => dailyChallenge.complete(score)}
            onDismiss={() => dailyChallenge.dismiss()}
          />
        )}

        <StatsHeader t={t} />

        {/* Basmala */}
        <p className="font-arabic text-xl text-primary text-center mb-3 px-5">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>

        {/* Feature Bubbles */}
        <div className="space-y-5">
          <BubbleCarousel title={t("dashboard.features" as any)} items={MAIN_FEATURES} onAction={handleAction} t={t} />
          <BubbleCarousel title={t("dashboard.settings" as any)} items={SETTINGS_FEATURES} onAction={handleAction} t={t} />
        </div>

        {/* Hifz SRS Widget */}
        {srsItems.length > 0 && (
          <div className="px-5 mt-5">
            <button
              onClick={() => navigate("/hifz-today")}
              className="w-full flex items-center gap-3 rounded-2xl p-4 bg-gradient-to-r from-primary/15 to-accent/10 border border-primary/20 shadow-sm active:scale-[0.98] transition-transform"
            >
              <span className="text-2xl">🧠</span>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold text-foreground">
                  {srsTodayItems.length > 0
                    ? `${srsTodayItems.length} ${t("hifzSrs.passagesToReview")}`
                    : t("hifzSrs.noneToday")}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {learningCount} {t("hifzSrs.learning")} · {reviewingCount} {t("hifzSrs.reviewing")} · {masteredCount} {t("hifzSrs.mastered")}
                </p>
              </div>
              <span className="text-xs font-bold text-primary shrink-0">{t("hifzSrs.review")} →</span>
            </button>
          </div>
        )}

        {/* Share */}
        <div className="px-5 mt-3">
          <ShareProgressCard />
        </div>

        {/* Weak Surahs */}
        <WeakSurahsSection />

        {/* Join CTA */}
        {!user && (
          <div className="px-5 mt-4">
            <button
              onClick={() => navigate("/auth")}
              className="w-full flex items-center gap-4 bg-primary/10 border border-primary/20 rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
            >
              <span className="text-2xl">👤</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{t("home.joinCommunity")}</p>
                <p className="text-xs text-muted-foreground">{t("home.joinCommunityDesc")}</p>
              </div>
            </button>
          </div>
        )}

        {/* Free message */}
        <p className="mt-5 mb-4 text-[10px] text-muted-foreground/70 text-center leading-relaxed max-w-[280px] mx-auto">
          {t("home.freeMessage" as any)}{" "}
          <a href="https://taalam.eu" target="_blank" rel="noopener noreferrer" className="text-primary/60 font-medium underline underline-offset-2">
            taalam.eu
          </a>
        </p>
      </div>
    </PageBackground>
  );
}
