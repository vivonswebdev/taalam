import { motion } from "framer-motion";
import { Image } from "lucide-react";
import { useImmersiveBg, BG_OPTIONS, type BgTheme, type BgChoices } from "@/hooks/useImmersiveBg";

import readingBg from "@/assets/reading-bg.jpg";
import tarteelBg from "@/assets/tarteel-bg.jpg";
import quizBg from "@/assets/quiz-bg.jpg";
import galaxyBg from "@/assets/bg-galaxy.jpg";
import gardenBg from "@/assets/bg-garden.jpg";
import oceanBg from "@/assets/bg-ocean.jpg";
import starryBg from "@/assets/bg-starry-calligraphy.jpg";
import forestBg from "@/assets/bg-forest.jpg";
import auroraBg from "@/assets/bg-aurora.jpg";
import sunsetBg from "@/assets/bg-sunset.jpg";

const BG_THUMBS: Record<BgTheme, string | null> = {
  mountain: readingBg,
  desert: tarteelBg,
  mosque: quizBg,
  galaxy: galaxyBg,
  garden: gardenBg,
  ocean: oceanBg,
  starry: starryBg,
  forest: forestBg,
  aurora: auroraBg,
  sunset: sunsetBg,
  none: null,
};

const MODE_LABELS: { key: keyof BgChoices; label: string; icon: string }[] = [
  { key: "home", label: "Accueil", icon: "🏠" },
  { key: "reading", label: "Coran", icon: "📖" },
  { key: "tarteel", label: "Tarteel", icon: "🎙️" },
  { key: "quiz", label: "Quiz", icon: "❓" },
];

export default function BackgroundPicker() {
  const { immersiveEnabled, toggleImmersive, choices, setModeTheme } = useImmersiveBg();

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Toggle */}
      <button onClick={toggleImmersive} className="w-full flex items-center gap-4 p-4 text-left border-b border-border">
        <Image size={20} className={immersiveEnabled ? "text-secondary" : "text-muted-foreground"} />
        <div className="flex-1">
          <p className="text-sm font-medium text-card-foreground">Arrière-plans épiques</p>
          <p className="text-xs text-muted-foreground">Personnalise le fond de chaque écran</p>
        </div>
        <div className={`w-12 h-7 rounded-full transition-colors relative ${immersiveEnabled ? "bg-success" : "bg-muted"}`}>
          <motion.div animate={{ x: immersiveEnabled ? 20 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-1 w-5 h-5 rounded-full bg-card shadow-md" />
        </div>
      </button>

      {/* Per-mode picker */}
      {immersiveEnabled && (
        <div className="p-4 space-y-4">
          {MODE_LABELS.map(({ key, label, icon }) => (
            <div key={key}>
              <p className="text-xs font-semibold text-card-foreground mb-2">{icon} {label}</p>
              <div className="grid grid-cols-4 gap-2">
                {BG_OPTIONS.map((opt) => {
                  const selected = choices[key] === opt.id;
                  const thumb = BG_THUMBS[opt.id];
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setModeTheme(key, opt.id)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-[4/3] ${
                        selected ? "border-primary ring-2 ring-primary/30 scale-[1.02]" : "border-border hover:border-muted-foreground/40"
                      }`}
                    >
                      {thumb ? (
                        <img src={thumb} alt={opt.label} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-lg">⬜</span>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-foreground/60 backdrop-blur-sm px-1 py-0.5">
                        <span className="text-[9px] font-medium text-primary-foreground leading-none">{opt.emoji} {opt.label}</span>
                      </div>
                      {selected && (
                        <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-[8px] text-primary-foreground">✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
