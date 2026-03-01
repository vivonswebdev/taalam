import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Mic, Radio } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export default function QuranHub() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <h1 className="text-xl font-bold text-foreground">📖 {t("nav.quran" as any)}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{t("quranHub.subtitle" as any) || "Choisissez votre mode de lecture"}</p>
      </div>

      <div className="px-5 space-y-3">
        {/* Mushaf */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/mushaf")}
          className="w-full flex items-center gap-4 rounded-2xl p-5 text-left bg-gradient-to-br from-amber-700/50 to-yellow-800/30 border border-amber-400/30 shadow-lg"
        >
          <span className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-3xl shrink-0">📖</span>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-white">{t("quranHub.mushafTitle" as any) || "Mushaf"}</p>
            <p className="text-xs text-white/60 mt-1 line-clamp-2">{t("quranHub.mushafDesc" as any) || "Lecture simple du Coran, comme un vrai mushaf. Idéal pour la lecture quotidienne."}</p>
          </div>
        </motion.button>

        {/* Lecture avancée */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/reading")}
          className="w-full flex items-center gap-4 rounded-2xl p-5 text-left bg-gradient-to-br from-emerald-700/50 to-teal-800/30 border border-emerald-400/30 shadow-lg"
        >
          <span className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-3xl shrink-0">📚</span>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-white">{t("quranHub.readingTitle" as any) || "Lecture avancée"}</p>
            <p className="text-xs text-white/60 mt-1 line-clamp-2">{t("quranHub.readingDesc" as any) || "Lecture avec traduction, audio, fond immersif et quiz de fin."}</p>
          </div>
        </motion.button>

        {/* Raccourcis rapides */}
        <div className="pt-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 mb-2">{t("quranHub.quickLinks" as any) || "Accès rapide"}</p>
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/quran")}
              className="flex items-center gap-2.5 rounded-xl p-3 bg-card/70 border border-border hover:border-primary/40 transition-colors"
            >
              <Mic size={18} className="text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{t("home.tarteelButton" as any) || "Tarteel"}</p>
                <p className="text-[10px] text-muted-foreground truncate">{t("quranHub.tarteelShort" as any) || "Récitation & dictée"}</p>
              </div>
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/live-quran")}
              className="flex items-center gap-2.5 rounded-xl p-3 bg-card/70 border border-border hover:border-primary/40 transition-colors"
            >
              <Radio size={18} className="text-green-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{t("more.liveQuran" as any) || "Live Coran"}</p>
                <p className="text-[10px] text-muted-foreground truncate">{t("quranHub.liveShort" as any) || "Écoute en direct"}</p>
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
