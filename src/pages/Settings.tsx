import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Info, Baby, Heart, Globe, Languages, Users, Sun, Moon, Megaphone } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { useChildMode } from "@/hooks/useChildMode";
import { useLanguage, LANGUAGES } from "@/hooks/useLanguage";
import { useTranslationPreference, AVAILABLE_EDITIONS } from "@/hooks/useTranslationPreference";
import { StickerCollection } from "@/components/StickerReward";
import { useNavigate } from "react-router-dom";
import DedicationPopup from "@/components/DedicationPopup";
import BackgroundPicker from "@/components/BackgroundPicker";

export default function Settings() {
  const { resetProgress } = useProgress();
  const { isChildMode, toggleChildMode, stickers, resetStickers } = useChildMode();
  const { t, lang, setLang } = useLanguage();
  const { isAuto, setAuto, manualEditionId, setManualEdition, resolvedEditionId } = useTranslationPreference();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDedication, setShowDedication] = useState(false);
  const { immersiveEnabled, toggleImmersive } = useImmersiveBg();

  // Theme state: "light" | "dark" | "system"
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    return (localStorage.getItem("quranEasyTheme") as "light" | "dark" | "system") || "system";
  });

  useEffect(() => {
    localStorage.setItem("quranEasyTheme", theme);
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // system
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [theme]);

  const handleReset = () => {
    resetProgress();
    resetStickers();
    setShowConfirm(false);
    navigate("/");
  };

  const currentLangInfo = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <div className="min-h-screen pb-24">
      <div className="px-6 pt-14 pb-4">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-foreground">
          {t("settings.title")}
        </motion.h1>
      </div>

      <div className="px-6 space-y-3">
        {/* Child Mode Toggle */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card border border-border rounded-2xl overflow-hidden">
          <button onClick={toggleChildMode} className="w-full flex items-center gap-4 p-4 text-left">
            <Baby size={20} className={isChildMode ? "text-secondary" : "text-primary"} />
            <div className="flex-1">
              <p className="text-sm font-medium text-card-foreground">{t("settings.childMode")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.childModeDesc")}</p>
            </div>
            <div className={`w-12 h-7 rounded-full transition-colors relative ${isChildMode ? "bg-success" : "bg-muted"}`}>
              <motion.div animate={{ x: isChildMode ? 20 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-1 w-5 h-5 rounded-full bg-card shadow-md" />
            </div>
          </button>
        </motion.div>

        {/* Theme selector */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }} className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-4">
            <p className="text-sm font-medium text-card-foreground mb-3 flex items-center gap-2">
              {theme === "dark" ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-primary" />}
              {t("settings.appearance")}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { key: "light" as const, label: t("settings.light"), icon: <Sun size={14} /> },
                { key: "dark" as const, label: t("settings.dark"), icon: <Moon size={14} /> },
                { key: "system" as const, label: t("settings.auto"), icon: null },
              ]).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setTheme(opt.key)}
                  className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border-2 transition-colors text-xs font-medium ${
                    theme === opt.key ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent/50 text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Immersive Backgrounds Toggle */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="bg-card border border-border rounded-2xl overflow-hidden">
          <button onClick={toggleImmersive} className="w-full flex items-center gap-4 p-4 text-left">
            <Image size={20} className={immersiveEnabled ? "text-secondary" : "text-muted-foreground"} />
            <div className="flex-1">
              <p className="text-sm font-medium text-card-foreground">Arrière-plans épiques</p>
              <p className="text-xs text-muted-foreground">Montagne, désert, mosquée sur les écrans</p>
            </div>
            <div className={`w-12 h-7 rounded-full transition-colors relative ${immersiveEnabled ? "bg-success" : "bg-muted"}`}>
              <motion.div animate={{ x: immersiveEnabled ? 20 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-1 w-5 h-5 rounded-full bg-card shadow-md" />
            </div>
          </button>
        </motion.div>
        {isChildMode && stickers.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-4">
            <p className="text-sm font-semibold text-card-foreground mb-3">{t("progress.stickers")}</p>
            <StickerCollection stickers={stickers} />
          </motion.div>
        )}

        {/* Language selector */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-4">
            <p className="text-sm font-medium text-card-foreground mb-3">{t("settings.language")}</p>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 transition-colors ${
                    lang === l.code ? "border-primary bg-primary/10" : "border-border hover:bg-accent/50"
                  }`}
                >
                  <span className="text-lg">{l.flag}</span>
                  <span className={`text-xs font-medium ${lang === l.code ? "text-primary" : "text-foreground"}`}>{l.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>


        {/* Translation preference */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Auto toggle */}
          <button onClick={() => setAuto(!isAuto)} className="w-full flex items-center gap-4 p-4 text-left border-b border-border">
            <Globe size={20} className={isAuto ? "text-primary" : "text-muted-foreground"} />
            <div className="flex-1">
              <p className="text-sm font-medium text-card-foreground">{t("settings.translationAuto")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.translationAutoDesc")}</p>
            </div>
            <div className={`w-12 h-7 rounded-full transition-colors relative ${isAuto ? "bg-success" : "bg-muted"}`}>
              <motion.div animate={{ x: isAuto ? 20 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-1 w-5 h-5 rounded-full bg-card shadow-md" />
            </div>
          </button>

          {/* Manual edition selector */}
          {!isAuto && (
            <div className="p-4">
              <p className="text-xs font-medium text-card-foreground mb-2 flex items-center gap-1.5">
                <Languages size={14} />
                {t("settings.translationManual")}
              </p>
              <div className="space-y-1.5">
                {AVAILABLE_EDITIONS.map((ed) => (
                  <button
                    key={ed.id}
                    onClick={() => setManualEdition(ed.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border-2 transition-colors text-xs font-medium ${
                      resolvedEditionId === ed.id ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent/50 text-foreground"
                    }`}
                  >
                    {ed.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Parent / Teacher Area */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-2xl overflow-hidden">
          <button onClick={() => navigate("/parent")} className="w-full flex items-center gap-4 p-4 text-left">
            <Users size={20} className="text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium text-card-foreground">{t("parent.access")}</p>
              <p className="text-xs text-muted-foreground">{t("parent.accessDesc")}</p>
            </div>
          </button>
        </motion.div>

        {/* Announcements */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }} className="bg-card border border-border rounded-2xl overflow-hidden">
          <button onClick={() => navigate("/announcements")} className="w-full flex items-center gap-4 p-4 text-left">
            <Megaphone size={20} className="text-secondary" />
            <div className="flex-1">
              <p className="text-sm font-medium text-card-foreground">{t("home.announcements")}</p>
              <p className="text-xs text-muted-foreground">{t("announcements.title")}</p>
            </div>
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-2xl overflow-hidden">
          <button onClick={() => setShowConfirm(true)} className="w-full flex items-center gap-4 p-4 text-left">
            <RotateCcw size={20} className="text-destructive" />
            <div className="flex-1">
              <p className="text-sm font-medium text-card-foreground">{t("settings.reset")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.resetDesc")}</p>
            </div>
          </button>
        </motion.div>

        {/* Dedication */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card border border-border rounded-2xl overflow-hidden">
          <button onClick={() => setShowDedication(true)} className="w-full flex items-center gap-4 p-4 text-left">
            <Heart size={20} className="text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium text-card-foreground">{t("settings.dedication")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.dedicationDesc")}</p>
            </div>
          </button>
        </motion.div>

        {/* Version */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-4 p-4">
            <Info size={20} className="text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-card-foreground">QuranEasy v1.0</p>
              <p className="text-xs text-muted-foreground">{t("settings.version")}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Reset confirmation */}
      {showConfirm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm px-8">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-card-foreground mb-2">{t("settings.confirmTitle")}</h3>
            <p className="text-sm text-muted-foreground mb-6">{t("settings.confirmMessage")}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-card-foreground active:scale-[0.98] transition-transform">
                {t("settings.cancel")}
              </button>
              <button onClick={handleReset} className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium active:scale-[0.98] transition-transform">
                {t("settings.confirmReset")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showDedication && (
        <DedicationPopup forceShow onClose={() => setShowDedication(false)} />
      )}
    </div>
  );
}
