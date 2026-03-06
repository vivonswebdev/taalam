import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useDailyTarteelChallenge } from "@/hooks/useDailyTarteelChallenge";
import { useHifzSRS } from "@/hooks/useHifzSRS";
import PageBackground from "@/components/PageBackground";
import DailyTarteelChallenge from "@/components/DailyTarteelChallenge";
import WeakSurahsSection from "@/components/WeakSurahsSection";
import HeroSection from "@/components/home/HeroSection";
import PrimaryActions from "@/components/home/PrimaryActions";
import DailyPractice from "@/components/home/DailyPractice";
import LearningSection from "@/components/home/LearningSection";
import ProgressDashboard from "@/components/home/ProgressDashboard";
import QuickLinks from "@/components/home/QuickLinks";

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
      <div className="min-h-screen pb-24 overflow-y-auto scrollbar-hide">
        {/* Daily challenge */}
        {!adminSettings.hide_daily_challenge && !dailyChallenge.isCompleted && dailyChallenge.surah && dailyChallenge.surah.number && typeof dailyChallenge.complete === "function" && (
          <DailyTarteelChallenge
            surah={dailyChallenge.surah}
            onComplete={(score) => dailyChallenge.complete(score)}
            onDismiss={() => dailyChallenge.dismiss()}
          />
        )}

        {/* 1. Hero */}
        <HeroSection />

        {/* Signup banner for guests */}
        {!user && (
          <div className="px-4 mt-3">
            <Link
              to="/auth"
              className="flex items-center gap-3 rounded-2xl p-4 bg-gradient-to-r from-[hsl(var(--primary))]/20 to-[hsl(var(--accent))]/10 border border-[hsl(var(--primary))]/30 shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
            >
              <span className="text-2xl">✨</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{t("home.signupTitle" as any)}</p>
                <p className="text-[10px] text-muted-foreground">{t("home.signupDesc" as any)}</p>
              </div>
              <span className="text-xs font-bold text-[hsl(var(--primary))] shrink-0">{t("home.signupBtn" as any)} →</span>
            </Link>
          </div>
        )}

        {/* 2. Primary actions */}
        <PrimaryActions />

        {/* 3. Daily practice */}
        <DailyPractice />

        {/* 4. Learning */}
        <LearningSection />

        {/* 5. Progress */}
        <ProgressDashboard />

        {/* Hifz SRS Widget */}
        {srsItems.length > 0 && (
          <div className="px-4 mt-4">
            <button
              onClick={() => navigate("/hifz-today")}
              className="w-full flex items-center gap-3 rounded-2xl p-4 bg-gradient-to-r from-[hsl(var(--primary))]/15 to-[hsl(var(--accent))]/10 border border-[hsl(var(--primary))]/20 shadow-sm active:scale-[0.98] transition-transform"
            >
              <span className="text-2xl">🧠</span>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold text-foreground">
                  {srsTodayItems.length > 0
                    ? `${srsTodayItems.length} ${t("hifzSrs.passagesToReview" as any)}`
                    : t("hifzSrs.noneToday" as any)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {learningCount} {t("hifzSrs.learning" as any)} · {reviewingCount} {t("hifzSrs.reviewing" as any)} · {masteredCount} {t("hifzSrs.mastered" as any)}
                </p>
              </div>
              <span className="text-xs font-bold text-[hsl(var(--primary))] shrink-0">{t("hifzSrs.review" as any)} →</span>
            </button>
          </div>
        )}

        {/* Weak Surahs */}
        <WeakSurahsSection />

        {/* 6. Quick Links */}
        <QuickLinks onAction={handleAction} />

        {/* Free message */}
        <p className="mt-5 mb-4 text-[10px] text-muted-foreground/70 text-center leading-relaxed max-w-[280px] mx-auto">
          {t("home.freeMessage" as any)}{" "}
          <a href="https://taalam.eu" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--primary))]/60 font-medium underline underline-offset-2">
            taalam.eu
          </a>
        </p>
      </div>
    </PageBackground>
  );
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