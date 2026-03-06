import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useDailyTarteelChallenge } from "@/hooks/useDailyTarteelChallenge";

import DailyTarteelChallenge from "@/components/DailyTarteelChallenge";
import WeakSurahsSection from "@/components/WeakSurahsSection";
import HeroSection from "@/components/home/HeroSection";
import PrimaryActions from "@/components/home/PrimaryActions";
import DailyPractice from "@/components/home/DailyPractice";
import LearningSection from "@/components/home/LearningSection";
import ProgressDashboard from "@/components/home/ProgressDashboard";
import QuickLinks from "@/components/home/QuickLinks";

// ═══ Main Dashboard ═══

export function HomeDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { settings: adminSettings } = useAdminSettings();
  const dailyChallenge = useDailyTarteelChallenge();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-24" style={{ background: "linear-gradient(180deg, #0A2A1A 0%, #0F3823 40%, #0A2A1A 100%)" }}>
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

      {/* 2. Primary Actions */}
      <div className="mt-4">
        <PrimaryActions />
      </div>

      {/* 3. Daily Practice */}
      <div className="mt-5">
        <DailyPractice />
      </div>

      {/* 4. Learning */}
      <div className="mt-5">
        <LearningSection />
      </div>

      {/* 5. Progress */}
      <div className="mt-5">
        <ProgressDashboard />
      </div>

      {/* Weak Surahs */}
      <div className="mt-4">
        <WeakSurahsSection />
      </div>

      {/* 6. Quick Links */}
      <div className="mt-5">
        <QuickLinks />
      </div>
    </div>
  );
}
