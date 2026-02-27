import { useNavigate } from "react-router-dom";
import { useChildMode } from "@/hooks/useChildMode";
import FindAyah from "@/components/FindAyah";
import { useLanguage } from "@/hooks/useLanguage";
import { motion } from "framer-motion";
import bgStarry from "@/assets/bg-starry-calligraphy.jpg";

export default function FindAyahPage() {
  const navigate = useNavigate();
  const { isChildMode } = useChildMode();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen relative pb-28">
      {/* Immersive background */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgStarry})` }} />
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative z-10">
        {/* Hero header */}
        <div className="pt-14 pb-4 px-6 text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl mb-2">🔍</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-xl font-bold text-white">
            {t("findAyah.title")}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="text-sm text-white/60 mt-1">
            {t("findAyah.heroSubtitle")}
          </motion.p>

          {/* Steps */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="mt-4 flex justify-center gap-3">
            {[
              { num: "1", label: t("findAyah.step1") },
              { num: "2", label: t("findAyah.step2") },
              { num: "3", label: t("findAyah.step3") },
            ].map((step) => (
              <div key={step.num} className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {step.num}
                </span>
                <span className="text-[11px] text-white/80 font-medium">{step.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <FindAyah
          onBack={() => navigate(-1)}
          onOpenSurah={(surahNumber, ayahNumber) => {
            navigate(`/quran?surah=${surahNumber}&ayah=${ayahNumber}&mode=mushaf`);
          }}
          onStartHifz={(surahNumber) => {
            navigate(`/quran?surah=${surahNumber}&mode=hifz`);
          }}
          isChildMode={isChildMode}
        />
      </div>
    </div>
  );
}
