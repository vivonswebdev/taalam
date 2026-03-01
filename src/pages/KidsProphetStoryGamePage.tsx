import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, BookOpen } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { PROPHET_STORY_SCRIPTS, ProphetStoryScript, StoryScene } from "@/data/prophetStoryScripts";

// Illustration imports
import storyMusaRiver from "@/assets/story-musa-river.jpg";
import storyMusaBush from "@/assets/story-musa-bush.jpg";
import storyMusaSea from "@/assets/story-musa-sea.jpg";
import storyYusufCoat from "@/assets/story-yusuf-coat.jpg";
import storyYusufWell from "@/assets/story-yusuf-well.jpg";
import storyYusufEgypt from "@/assets/story-yusuf-egypt.jpg";
import storySulaymanThrone from "@/assets/story-sulayman-throne.jpg";
import storySulaymanHoopoe from "@/assets/story-sulayman-hoopoe.jpg";
import storySulaymanAnts from "@/assets/story-sulayman-ants.jpg";

const ILLUSTRATIONS: Record<string, string> = {
  "story-musa-river": storyMusaRiver,
  "story-musa-bush": storyMusaBush,
  "story-musa-sea": storyMusaSea,
  "story-yusuf-coat": storyYusufCoat,
  "story-yusuf-well": storyYusufWell,
  "story-yusuf-egypt": storyYusufEgypt,
  "story-sulayman-throne": storySulaymanThrone,
  "story-sulayman-hoopoe": storySulaymanHoopoe,
  "story-sulayman-ants": storySulaymanAnts,
};

export default function KidsProphetStoryGamePage() {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const [story, setStory] = useState<ProphetStoryScript | null>(null);
  const [sceneId, setSceneId] = useState<string>("");

  const labels: Record<string, Record<string, string>> = {
    title: { fr: "Histoires des Prophètes", en: "Stories of the Prophets", ar: "قصص الأنبياء", nl: "Verhalen van de Profeten", tr: "Peygamber Hikayeleri", ur: "انبیاء کی کہانیاں" },
    chooseStory: { fr: "Choisis une histoire", en: "Choose a story", ar: "اختر قصة", nl: "Kies een verhaal", tr: "Bir hikaye seç", ur: "ایک کہانی منتخب کریں" },
    moral: { fr: "Morale", en: "Moral", ar: "العبرة", nl: "Moraal", tr: "Ders", ur: "سبق" },
    theEnd: { fr: "Fin de l'histoire 🌈", en: "The End 🌈", ar: "نهاية القصة 🌈", nl: "Einde 🌈", tr: "Son 🌈", ur: "کہانی ختم 🌈" },
    restart: { fr: "Recommencer", en: "Restart", ar: "إعادة", nl: "Opnieuw", tr: "Tekrar", ur: "دوبارہ" },
    otherStory: { fr: "Autre histoire", en: "Other story", ar: "قصة أخرى", nl: "Ander verhaal", tr: "Başka hikaye", ur: "اور کہانی" },
    menu: { fr: "Menu", en: "Menu", ar: "القائمة", nl: "Menu", tr: "Menü", ur: "مینیو" },
  };
  const L = (k: string) => labels[k]?.[lang] || labels[k]?.fr || k;
  const getText = (obj: Record<string, string>) => obj[lang] || obj.fr;

  const startStory = (s: ProphetStoryScript) => {
    setStory(s);
    setSceneId(s.scenes[0].id);
  };

  const scene: StoryScene | undefined = story?.scenes.find(s => s.id === sceneId);

  // Story selection
  if (!story) {
    return (
      <div className="min-h-screen pb-24 px-5 pt-14">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/kids")} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"><ArrowLeft size={18} /></button>
          <h1 className="text-xl font-bold">📖 {L("title")}</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{L("chooseStory")}</p>
        <div className="flex flex-col gap-3">
          {PROPHET_STORY_SCRIPTS.map(s => (
            <motion.button key={s.id} whileTap={{ scale: 0.96 }} onClick={() => startStory(s)}
              className="p-4 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/20 text-left flex items-center gap-3">
              <span className="text-3xl">{s.emoji}</span>
              <div>
                <p className="font-bold text-foreground">{getText(s.prophet as any)}</p>
                <p className="text-[10px] text-muted-foreground">{s.scenes.length} scènes</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (!scene) return null;

  const illustrationSrc = scene.illustration ? ILLUSTRATIONS[scene.illustration] : null;

  return (
    <div className="min-h-screen pb-24 px-5 pt-14">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setStory(null)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"><ArrowLeft size={18} /></button>
        <h1 className="text-lg font-bold flex-1">{scene.emoji || "📖"} {getText(story.prophet as any)}</h1>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={scene.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
          className="bg-gradient-to-br from-blue-600/10 to-indigo-600/5 border border-blue-500/15 rounded-2xl overflow-hidden">
          
          {/* Illustration */}
          {illustrationSrc && (
            <img src={illustrationSrc} alt="" className="w-full h-44 object-cover" />
          )}

          <div className="p-5">
            <p className="text-sm text-foreground leading-relaxed mb-4">{getText(scene.text as any)}</p>

            {scene.moral && (
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-4">
                <p className="text-[10px] font-bold text-primary uppercase mb-1">{L("moral")}</p>
                <p className="text-xs text-foreground">{getText(scene.moral as any)}</p>
                {scene.verse && <p className="text-[10px] text-muted-foreground mt-1">📖 {scene.verse}</p>}
              </div>
            )}

            {scene.isEnd ? (
              <div className="text-center mt-4">
                <p className="text-lg font-bold text-foreground mb-4">{L("theEnd")}</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setSceneId(story.scenes[0].id)}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center gap-1">
                    <RotateCcw size={14} /> {L("restart")}
                  </button>
                  <button onClick={() => setStory(null)}
                    className="px-4 py-2 rounded-xl bg-muted text-foreground text-sm font-bold flex items-center gap-1">
                    <BookOpen size={14} /> {L("otherStory")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-4">
                {scene.choices?.map((choice, i) => (
                  <motion.button key={i} whileTap={{ scale: 0.97 }} onClick={() => setSceneId(choice.nextSceneId)}
                    className="p-3 rounded-xl bg-card border border-border text-left text-sm font-medium hover:bg-primary/10 transition-colors">
                    {getText(choice.label as any)}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
