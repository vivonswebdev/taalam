import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, Radio } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import PageBackground from "@/components/PageBackground";
import SEOHead from "@/components/SEOHead";

export default function QuranHub() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <PageBackground intensity="subtle">
    <SEOHead title="Coran - Lecture, Écoute & Récitation" description="Lisez le Mushaf, écoutez des récitateurs et récitez le Coran avec correction vocale IA." path="/quran-hub" />
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <h1 className="text-xl font-bold text-foreground">📖 {t("quranHub.title")}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{t("quranHub.subtitle")}</p>
      </div>

      <div className="px-5 grid grid-cols-2 gap-3 flex-1">
        {/* Mushaf */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/mushaf")}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl p-5 text-center bg-gradient-to-br from-amber-700/50 to-yellow-800/30 border border-amber-400/30 shadow-lg aspect-square py-[30px]">

          <span className="text-6xl">📖</span>
          <div className="min-w-0">
            <p className="text-base font-bold text-white">{t("quranHub.mushafTitle")}</p>
            <p className="text-xs font-semibold text-white/80 mt-1">{t("quranHub.mushafSubtitle")}</p>
            <p className="text-[10px] text-white/50 mt-1 line-clamp-2">{t("quranHub.mushafDesc")}</p>
          </div>
        </motion.button>

        {/* Lecture avec audio */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/reading")}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl p-5 text-center bg-gradient-to-br from-emerald-700/50 to-teal-800/30 border border-emerald-400/30 shadow-lg aspect-square">

          <span className="text-6xl">🎧</span>
          <div className="min-w-0">
            <p className="text-base font-bold text-white">{t("quranHub.readingTitle")}</p>
            <p className="text-xs font-semibold text-white/80 mt-1">{t("quranHub.readingSubtitle")}</p>
            <p className="text-[10px] text-white/50 mt-1 line-clamp-2">{t("quranHub.readingDesc")}</p>
          </div>
        </motion.button>
      </div>

      {/* Raccourcis rapides */}
      <div className="px-5 pt-3">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 mb-2">{t("quranHub.quickLinks")}</p>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/quran")}
            className="flex items-center gap-2.5 rounded-xl p-3 bg-card/70 border border-border hover:border-primary/40 transition-colors">

            <Mic size={18} className="text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{t("quranHub.tarteelButton")}</p>
              <p className="text-[10px] text-muted-foreground truncate">{t("quranHub.tarteelShort")}</p>
            </div>
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/live-quran")}
            className="flex items-center gap-2.5 rounded-xl p-3 bg-card/70 border border-border hover:border-primary/40 transition-colors">

            <Radio size={18} className="text-green-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{t("quranHub.liveTitle")}</p>
              <p className="text-[10px] text-muted-foreground truncate">{t("quranHub.liveShort")}</p>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
    </PageBackground>);

}