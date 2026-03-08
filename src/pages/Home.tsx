import { Component, type ReactNode } from "react";
import { useUserMode } from "@/hooks/useUserMode";
import { HomeDashboard } from "@/components/dashboard/FeatureBubbles";
import KidsHomePage from "@/pages/KidsHomePage";
import TeacherHomePage from "@/pages/TeacherHomePage";
import SEOHead from "@/components/SEOHead";
import { useLoginStreak } from "@/hooks/useLoginStreak";
import LoginBonusPopup from "@/components/LoginBonusPopup";
import StreakWidget from "@/components/StreakWidget";
import { useDesignPreference } from "@/hooks/useDesignPreference";
import { DesignModeToggle } from "@/components/home/DesignModeToggle";
import { FuturisticBubbleHome } from "@/components/home/FuturisticBubbleHome";
import { NewDesignBanner } from "@/components/home/NewDesignBanner";
import { motion, AnimatePresence } from "framer-motion";

class HomeErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error) { console.error("Home error:", error); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
          <p className="text-lg font-bold">⚠️ Erreur de chargement</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold">
            🔄 Recharger
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Home() {
  const { mode: userMode } = useUserMode();
  const { bonusResult, dismiss } = useLoginStreak();
  const { mode: designMode } = useDesignPreference();

  if (userMode === "child") {
    return (
      <>
        <KidsHomePage />
        <LoginBonusPopup result={bonusResult} onDismiss={dismiss} />
        <StreakWidget />
      </>
    );
  }

  if (userMode === "teacher") {
    return (
      <HomeErrorBoundary>
        <TeacherHomePage />
        <LoginBonusPopup result={bonusResult} onDismiss={dismiss} />
        <StreakWidget />
      </HomeErrorBoundary>
    );
  }

  return (
    <HomeErrorBoundary>
      <SEOHead title="Ta'alam - Apprendre le Coran facilement" description="Apprenez le Coran avec Ta'alam : quiz, récitation vocale, mémorisation et progression gamifiée pour toute la famille." path="/" />
      <NewDesignBanner />
      <DesignModeToggle />
      <AnimatePresence mode="wait">
        <motion.div
          key={designMode}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.35 }}
        >
          {designMode === "futuristic" ? <FuturisticBubbleHome /> : <HomeDashboard />}
        </motion.div>
      </AnimatePresence>
      <LoginBonusPopup result={bonusResult} onDismiss={dismiss} />
      <StreakWidget />
    </HomeErrorBoundary>
  );
}
