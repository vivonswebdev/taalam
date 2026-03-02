import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { motion } from "framer-motion";
import { Zap, Target, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TarteelSelector() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Récupérer la dernière sourate utilisée (ou Al-Ikhlas par défaut)
  const getLastSurah = (): number => {
    try {
      const stored = localStorage.getItem("quranEasyLastSurah");
      if (stored) return parseInt(stored, 10);
    } catch {}
    return 112; // Al-Ikhlas par défaut
  };

  const modes = [
    {
      id: "easy",
      emoji: "🌱",
      icon: Zap,
      titleKey: "tarteel.easyMode",
      descKey: "tarteel.easyModeDesc",
      features: [
        t("tarteel.featureSimple" as any),
        t("tarteel.featureFeedback" as any),
        t("tarteel.featureJuz30" as any),
        t("tarteel.featureAudio" as any),
      ],
      gradient: "from-green-500/20 to-emerald-500/20",
      onClick: () => navigate("/tarteel/easy"),
      badge: t("tarteel.recommended" as any),
    },
    {
      id: "pro",
      emoji: "🎯",
      icon: Target,
      titleKey: "tarteel.proMode",
      descKey: "tarteel.proModeDesc",
      features: [
        t("tarteel.featureTajwid" as any),
        t("tarteel.featureMultiAyat" as any),
        t("tarteel.featureAllJuz" as any),
      ],
      gradient: "from-purple-500/20 to-indigo-500/20",
      onClick: () => navigate(`/recitation?surah=${getLastSurah()}`),
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-lg font-bold">🎤 {t("tarteel.title" as any)}</h1>
            <p className="text-xs text-muted-foreground">{t("tarteel.chooseMode" as any)}</p>
          </div>
        </div>

        {/* Mode Cards */}
        <div className="space-y-4">
          {modes.map((mode, i) => {
            const Icon = mode.icon;
            return (
              <motion.button
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                onClick={() => mode.onClick()}
                className={`relative w-full p-6 rounded-3xl text-left bg-gradient-to-br ${mode.gradient} backdrop-blur-xl border border-border/40 hover:scale-[1.02] transition-all`}
              >
                {mode.badge && (
                  <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {mode.badge}
                  </span>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{mode.emoji}</span>
                  <Icon size={24} className="text-primary" />
                </div>

                <h2 className="text-base font-bold mb-1">{t(mode.titleKey as any)}</h2>
                <p className="text-xs text-muted-foreground mb-3">{t(mode.descKey as any)}</p>

                <div className="space-y-1.5">
                  {mode.features.map((feat, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs">
                      <span className="text-primary font-bold">✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
