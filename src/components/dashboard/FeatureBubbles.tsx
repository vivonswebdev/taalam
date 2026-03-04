import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuranXp } from "@/hooks/useQuranXp";
import { useAuth } from "@/hooks/useAuth";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useDailyTarteelChallenge } from "@/hooks/useDailyTarteelChallenge";
import { useHifzSRS } from "@/hooks/useHifzSRS";
import ProfileBubble from "@/components/ProfileBubble";

import WeakSurahsSection from "@/components/WeakSurahsSection";
import DailyTarteelChallenge from "@/components/DailyTarteelChallenge";
import PageBackground from "@/components/PageBackground";
import taaloumLogo from "@/assets/taaloum-logo.png";
import { Flame } from "lucide-react";

// ═══ Types ═══

interface Feature {
  id: string;
  nameKey: string;
  emoji: string;
  path?: string;
  action?: "theme" | "language" | "donate" | "reciter";
  gradient: string;
}

interface Category {
  id: string;
  titleKey: string;
  emoji: string;
  features: Feature[];
}

// ═══ 6 Categories ═══

const CATEGORIES: Category[] = [
{
  id: "reading",
  titleKey: "home.cat.lecture",
  emoji: "📖",
  features: [
  { id: "quran", nameKey: "dashboard.tarteel", emoji: "📖", path: "/quran", gradient: "from-blue-400 to-cyan-500" },
  { id: "listenTest", nameKey: "dashboard.shazamCoran", emoji: "🎵", path: "/listen-test", gradient: "from-fuchsia-400 to-pink-500" },
  { id: "reading", nameKey: "dashboard.reading", emoji: "📚", path: "/reading", gradient: "from-emerald-400 to-green-500" },
  { id: "mushaf", nameKey: "dashboard.mushaf", emoji: "📗", path: "/mushaf", gradient: "from-teal-400 to-emerald-500" },
  { id: "listening", nameKey: "dashboard.listening", emoji: "🎧", path: "/listening", gradient: "from-violet-400 to-purple-500" },
  { id: "tarteel", nameKey: "dashboard.tarteel", emoji: "🎤", path: "/tarteel", gradient: "from-orange-400 to-red-400" },
  { id: "liveQuran", nameKey: "home.cat.liveQuran", emoji: "🔴", path: "/live-quran", gradient: "from-red-400 to-rose-500" }]

},
{
  id: "learning",
  titleKey: "home.cat.apprentissage",
  emoji: "🎓",
  features: [
  { id: "quiz", nameKey: "dashboard.quiz", emoji: "🧠", path: "/quiz", gradient: "from-purple-400 to-violet-500" },
  { id: "hifzPlan", nameKey: "dashboard.hifzPlan", emoji: "🎯", path: "/hifz-plan", gradient: "from-rose-400 to-pink-500" },
  { id: "hifzMap", nameKey: "dashboard.hifzMap", emoji: "🗺️", path: "/hifz-map", gradient: "from-amber-400 to-orange-500" },
  { id: "noorani", nameKey: "dashboard.noorani", emoji: "📚", path: "/noorani", gradient: "from-indigo-400 to-blue-500" },
  { id: "study", nameKey: "home.cat.study", emoji: "✍️", path: "/study", gradient: "from-cyan-400 to-sky-500" },
  { id: "findAyah", nameKey: "dashboard.findAyah", emoji: "🔍", path: "/find-ayah", gradient: "from-lime-400 to-green-500" }]

},
{
  id: "spiritual",
  titleKey: "home.cat.pratique",
  emoji: "🕌",
  features: [
  { id: "moods", nameKey: "dashboard.moods", emoji: "💎", path: "/moods", gradient: "from-pink-400 to-rose-500" },
  { id: "habits", nameKey: "dashboard.habits", emoji: "✅", path: "/habits", gradient: "from-emerald-400 to-teal-500" },
  { id: "athkar", nameKey: "home.cat.athkar", emoji: "🤲", path: "/athkar/morning", gradient: "from-amber-300 to-orange-400" },
  { id: "qibla", nameKey: "dashboard.qibla", emoji: "🧭", path: "/qibla", gradient: "from-sky-400 to-blue-500" },
  { id: "zakat", nameKey: "dashboard.zakat", emoji: "💰", path: "/zakat", gradient: "from-green-400 to-emerald-500" },
  { id: "tasbih", nameKey: "dashboard.tasbih", emoji: "📿", path: "/tasbih", gradient: "from-purple-400 to-indigo-500" },
  { id: "calendar", nameKey: "dashboard.calendar", emoji: "🌙", path: "/islamic-calendar", gradient: "from-indigo-400 to-violet-500" },
  { id: "stories", nameKey: "dashboard.stories", emoji: "📜", path: "/kids-stories", gradient: "from-orange-300 to-amber-400" },
  { id: "mosques", nameKey: "dashboard.mosques", emoji: "🕌", path: "/kids-mosque-map", gradient: "from-teal-400 to-cyan-500" },
  { id: "liveHaramain", nameKey: "dashboard.liveHaramain", emoji: "🕋", path: "/live-haramain", gradient: "from-rose-500 to-red-500" },
  { id: "athan", nameKey: "dashboard.athan", emoji: "📢", path: "/prayers", gradient: "from-amber-400 to-orange-500" }]

},
{
  id: "social",
  titleKey: "home.cat.social",
  emoji: "👥",
  features: [
  { id: "kids", nameKey: "dashboard.kids", emoji: "👨‍👩‍👧", path: "/kids", gradient: "from-fuchsia-400 to-pink-500" },
  { id: "classrooms", nameKey: "dashboard.classrooms", emoji: "🏫", path: "/classrooms", gradient: "from-blue-400 to-indigo-500" },
  { id: "teacher", nameKey: "dashboard.teacher", emoji: "👨‍🏫", path: "/teacher-dashboard", gradient: "from-violet-400 to-purple-500" },
  { id: "community", nameKey: "dashboard.community", emoji: "🌍", path: "/community", gradient: "from-emerald-400 to-green-500" },
  { id: "leaderboard", nameKey: "dashboard.leaderboard", emoji: "🏆", path: "/leaderboard", gradient: "from-yellow-300 to-amber-400" }]

},
{
  id: "progress",
  titleKey: "home.cat.progression",
  emoji: "📊",
  features: [
  { id: "progress", nameKey: "dashboard.progress", emoji: "📊", path: "/progress", gradient: "from-cyan-400 to-blue-500" },
  { id: "hifzToday", nameKey: "home.cat.hifzToday", emoji: "📅", path: "/hifz-today", gradient: "from-orange-400 to-red-400" },
  { id: "bookmarks", nameKey: "dashboard.bookmarks", emoji: "🔖", path: "/bookmarks", gradient: "from-rose-400 to-pink-500" },
  { id: "perfectLb", nameKey: "home.cat.perfectLb", emoji: "⭐", path: "/perfect-leaderboard", gradient: "from-yellow-300 to-amber-400" }]

},
{
  id: "settings",
  titleKey: "home.cat.parametres",
  emoji: "⚙️",
  features: [
  { id: "theme", nameKey: "dashboard.theme", emoji: "🎨", action: "theme", gradient: "from-violet-400 to-fuchsia-500" },
  { id: "reciter", nameKey: "dashboard.reciter", emoji: "🔊", action: "reciter", gradient: "from-sky-400 to-cyan-500" },
  { id: "athan", nameKey: "dashboard.athan", emoji: "⏰", path: "/athan-settings", gradient: "from-amber-400 to-orange-500" },
  { id: "notifs", nameKey: "dashboard.notifs", emoji: "🔔", path: "/notification-settings", gradient: "from-yellow-300 to-amber-400" },
  { id: "languages", nameKey: "dashboard.languages", emoji: "🌍", action: "language", gradient: "from-emerald-400 to-teal-500" },
  { id: "offline", nameKey: "dashboard.offline", emoji: "📱", path: "/offline-settings", gradient: "from-blue-400 to-indigo-500" },
  { id: "profile", nameKey: "dashboard.profile", emoji: "👤", path: "/settings", gradient: "from-slate-400 to-gray-500" },
  { id: "games", nameKey: "dashboard.games", emoji: "🎮", path: "/jeux", gradient: "from-purple-400 to-pink-500" },
  { id: "donate", nameKey: "dashboard.donate", emoji: "❤️", action: "donate", gradient: "from-red-400 to-rose-500" },
  { id: "faq", nameKey: "dashboard.faq", emoji: "❓", path: "/faq", gradient: "from-teal-400 to-cyan-500" }]

}];


// ═══ Single Bubble ═══

function FeatureBubble({ item, onAction, t }: {item: Feature;onAction: (a: string) => void;t: (k: any) => string;}) {
  const inner =
  <div className="flex flex-col items-center gap-1.5 w-[72px] shrink-0">
      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center text-2xl shadow-lg shadow-black/15 hover:scale-110 active:scale-95 transition-transform duration-200`}>
        {item.emoji}
      </div>
      <span className="text-[10px] font-medium text-foreground text-center leading-tight line-clamp-2 w-full">
        {t(item.nameKey as any)}
      </span>
    </div>;


  if (item.path) return <Link to={item.path} className="block shrink-0">{inner}</Link>;
  if (item.action) return <button onClick={() => onAction(item.action!)} className="block shrink-0">{inner}</button>;
  return inner;
}

// ═══ Category Carousel ═══

function CategoryCarousel({ category, onAction, t }: {category: Category;onAction: (a: string) => void;t: (k: any) => string;}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-5">
        <span className="text-lg">{category.emoji}</span>
        <h2 className="text-sm font-bold text-foreground">{t(category.titleKey as any)}</h2>
      </div>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-5 pb-2">
          {category.features.map((item) =>
          <FeatureBubble key={item.id} item={item} onAction={onAction} t={t} />
          )}
        </div>
      </div>
    </div>);

}

// ═══ Social 2x2 Block ═══

function SocialActionsBlock({ t, user, navigate }: {t: (k: any) => string;user: any;navigate: (p: string) => void;}) {
  return (
    <div className="grid grid-cols-2 gap-3 px-5">
      <button
        onClick={() => navigate("/progress")}
        className="group rounded-2xl p-4 bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left">
        
        <span className="text-2xl block mb-1">📤</span>
        <p className="text-xs font-bold text-foreground">{t("home.cat.shareProgress" as any)}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{t("home.cat.shareDesc" as any)}</p>
      </button>
      <button
        onClick={() => navigate(user ? "/community" : "/auth")}
        className="group rounded-2xl p-4 bg-gradient-to-br from-accent/10 to-secondary/5 border border-accent/20 shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left">
        
        <span className="text-2xl block mb-1">🌍</span>
        <p className="text-xs font-bold text-foreground">{t(user ? "dashboard.community" as any : "home.joinCommunity" as any)}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{t(user ? "home.cat.communityDesc" as any : "home.joinCommunityDesc" as any)}</p>
      </button>
    </div>);

}

// ═══ Stats Header ═══

function StatsHeader({ t }: {t: (k: any) => string;}) {
  const xp = useQuranXp();

  return (
    <div className="px-5 pt-10 pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src={taaloumLogo} alt="Taaloum" className="w-9 h-9 rounded-full shadow-md" />
          <div>
            <h1 className="text-base font-bold text-foreground tracking-tight">Ta'alam</h1>
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
    </div>);

}

// ═══ Main Dashboard ═══

export function HomeDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { settings: adminSettings } = useAdminSettings();
  const dailyChallenge = useDailyTarteelChallenge();
  const { items: srsItems, todayItems: srsTodayItems, learningCount, reviewingCount, masteredCount } = useHifzSRS();
  const navigate = useNavigate();
  const [showReciterPicker, setShowReciterPicker] = useState(false);

  const handleAction = (action: string) => {
    switch (action) {
      case "theme":
        document.documentElement.classList.toggle("dark");
        break;
      case "language":
        navigate("/settings");
        break;
      case "reciter":
        setShowReciterPicker(true);
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
        {!adminSettings.hide_daily_challenge && !dailyChallenge.isCompleted && dailyChallenge.surah && dailyChallenge.surah.number && typeof dailyChallenge.complete === "function" &&
        <DailyTarteelChallenge
          surah={dailyChallenge.surah}
          onComplete={(score) => dailyChallenge.complete(score)}
          onDismiss={() => dailyChallenge.dismiss()} />

        }

        <StatsHeader t={t} />

        {/* Signup banner for guests */}
        {!user && (
          <div className="px-5 mb-3">
            <Link
              to="/auth"
              className="flex items-center gap-3 rounded-2xl p-4 bg-gradient-to-r from-primary/20 to-accent/10 border border-primary/30 shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
            >
              <span className="text-2xl">✨</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{t("home.signupTitle" as any)}</p>
                <p className="text-[10px] text-muted-foreground">{t("home.signupDesc" as any)}</p>
              </div>
              <span className="text-xs font-bold text-primary shrink-0">{t("home.signupBtn" as any)} →</span>
            </Link>
          </div>
        )}

        {/* Basmala */}
        <p className="font-arabic text-xl text-primary text-center mb-3 px-5">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>

        {/* 6 Categories */}
        <div className="space-y-5">
          {CATEGORIES.map((cat) =>
          <CategoryCarousel key={cat.id} category={cat} onAction={handleAction} t={t} />
          )}
        </div>

        {/* Hifz SRS Widget */}
        {srsItems.length > 0 &&
        <div className="px-5 mt-5">
            <button
            onClick={() => navigate("/hifz-today")}
            className="w-full flex items-center gap-3 rounded-2xl p-4 bg-gradient-to-r from-primary/15 to-accent/10 border border-primary/20 shadow-sm active:scale-[0.98] transition-transform">
            
              <span className="text-2xl">🧠</span>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold text-foreground">
                  {srsTodayItems.length > 0 ?
                `${srsTodayItems.length} ${t("hifzSrs.passagesToReview" as any)}` :
                t("hifzSrs.noneToday" as any)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {learningCount} {t("hifzSrs.learning" as any)} · {reviewingCount} {t("hifzSrs.reviewing" as any)} · {masteredCount} {t("hifzSrs.mastered" as any)}
                </p>
              </div>
              <span className="text-xs font-bold text-primary shrink-0">{t("hifzSrs.review" as any)} →</span>
            </button>
          </div>
        }

        {/* Weak Surahs */}
        <WeakSurahsSection />

        {/* Free message */}
        <p className="mt-5 mb-4 text-[10px] text-muted-foreground/70 text-center leading-relaxed max-w-[280px] mx-auto">
          {t("home.freeMessage" as any)}{" "}
          <a href="https://taalam.eu" target="_blank" rel="noopener noreferrer" className="text-primary/60 font-medium underline underline-offset-2">
            taalam.eu
          </a>
        </p>
      </div>
    </PageBackground>);

}