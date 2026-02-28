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
import { BG_CSS_CLASS, type BgTheme } from "@/hooks/useImmersiveBg";

const BG_IMAGES: Record<BgTheme, string | null> = {
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

export function getEpicBg(theme: BgTheme) {
  return {
    className: BG_CSS_CLASS[theme] || "",
    image: BG_IMAGES[theme] || null,
  };
}
