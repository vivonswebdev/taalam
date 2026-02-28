import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, BookOpen, Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { prophetStories } from "@/data/prophetStories";
import { Button } from "@/components/ui/button";
import Confetti from "@/components/Confetti";
import { useStoryNarration } from "@/hooks/useStoryNarration";

type Step = "story" | "quiz" | "sticker";

function getUnlockedStickers(): string[] {
  try { return JSON.parse(localStorage.getItem("kids_prophet_stickers") || "[]"); }
  catch { return []; }
}
function saveSticker(sticker: string) {
  const arr = getUnlockedStickers();
  if (!arr.includes(sticker)) {
    arr.push(sticker);
    localStorage.setItem("kids_prophet_stickers", JSON.stringify(arr));
  }
}

export default function KidsProphetStoryDetail() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [step, setStep] = useState<Step>("story");
  const [selected, setSelected] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { isNarrating, toggle: toggleNarration, stop: stopNarration } = useStoryNarration();

  const story = prophetStories.find((s) => s.id === storyId);
  if (!story) return <div className="p-8 text-center text-muted-foreground">Story not found</div>;

  const langKey = (lang === "fr" || lang === "en" || lang === "ar" || lang === "nl" || lang === "tr" || lang === "ur") ? lang : "en";
  const isCorrect = selected === story.quiz.correctIndex;

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === story.quiz.correctIndex) {
      saveSticker(story.sticker);
      setTimeout(() => {
        setShowConfetti(true);
        setTimeout(() => setStep("sticker"), 600);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen pb-24 relative">
      {showConfetti && <Confetti active={true} />}

      {/* Header */}
      <div className="px-6 pt-14 pb-2 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            {story.emoji} {story.prophet[langKey]}
          </h1>
          <p className="text-[10px] text-muted-foreground">{t("kidsStories.surah" as any)} {story.surahRef}</p>
        </div>
        <div className="flex gap-1">
          {["story", "quiz", "sticker"].map((s, i) => (
            <div key={s} className={`w-2 h-2 rounded-full ${step === s ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ═══ STORY STEP ═══ */}
        {step === "story" && (
          <motion.div
            key="story"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="px-5 mt-4"
          >
            {/* Hudhud narrator */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🐦</span>
              <div className="bg-card border border-border rounded-2xl px-4 py-2">
                <p className="text-xs font-bold text-foreground">{t("kidsStories.narrator" as any)}</p>
                <p className="text-[10px] text-muted-foreground">{t("kidsStories.narratorDesc" as any)}</p>
              </div>
            </div>

            {/* Story title + listen button */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-foreground">{story.title[langKey]}</h2>
              <button
                onClick={() => toggleNarration(story.story[langKey], langKey)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isNarrating ? "bg-primary text-primary-foreground animate-pulse" : "bg-muted text-foreground"
                }`}
                aria-label={isNarrating ? "Stop" : "Listen"}
              >
                {isNarrating ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>

            {/* Story text */}
            <div className="bg-card border border-border rounded-2xl p-5 mb-4">
              <p className="text-sm text-card-foreground leading-relaxed whitespace-pre-line" dir={lang === "ar" || lang === "ur" ? "rtl" : "ltr"}>
                {story.story[langKey]}
              </p>
            </div>

            {/* Ayah reference */}
            <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={16} className="text-primary" />
                <span className="text-xs font-bold text-primary">{t("kidsStories.surah" as any)} {story.surahRef}</span>
              </div>
              <p className="font-arabic text-base text-foreground text-right leading-loose mb-2" dir="rtl">
                {story.ayahText.ar}
              </p>
              <p className="text-xs text-muted-foreground italic">
                {langKey === "ar" ? story.ayahText.en : story.ayahText[langKey as "fr" | "en"] || story.ayahText.en}
              </p>
            </div>

            <Button onClick={() => { stopNarration(); setStep("quiz"); }} className="w-full gap-2">
              {t("kidsStories.goQuiz" as any)} <ChevronRight size={16} />
            </Button>
          </motion.div>
        )}

        {/* ═══ QUIZ STEP ═══ */}
        {step === "quiz" && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="px-5 mt-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🧠</span>
              <h2 className="text-lg font-bold text-foreground">{t("kidsStories.quizTime" as any)}</h2>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 mb-4">
              <p className="text-sm font-semibold text-card-foreground mb-4">{story.quiz.question[langKey]}</p>
              <div className="space-y-2">
                {story.quiz.options[langKey].map((opt, idx) => {
                  const isThisCorrect = idx === story.quiz.correctIndex;
                  const isSelected = selected === idx;
                  let cls = "border-border bg-muted/30 hover:bg-muted/60";
                  if (selected !== null) {
                    if (isThisCorrect) cls = "border-green-500 bg-green-500/15";
                    else if (isSelected) cls = "border-destructive bg-destructive/15";
                  }
                  return (
                    <motion.button
                      key={idx}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleAnswer(idx)}
                      className={`w-full text-left rounded-xl border p-3 text-sm transition-all ${cls}`}
                    >
                      {opt}
                    </motion.button>
                  );
                })}
              </div>
              {selected !== null && !isCorrect && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-destructive mt-3 font-medium">
                  {t("kidsStories.tryAgain" as any)}
                </motion.p>
              )}
              {selected !== null && !isCorrect && (
                <Button variant="outline" onClick={() => setSelected(null)} className="mt-3 w-full text-xs">
                  {t("kidsStories.retry" as any)}
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══ STICKER STEP ═══ */}
        {step === "sticker" && (
          <motion.div
            key="sticker"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-5 mt-8 text-center"
          >
            <motion.span
              className="text-7xl inline-block"
              animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1, repeat: 2 }}
            >
              {story.sticker}
            </motion.span>
            <h2 className="text-2xl font-bold text-foreground mt-4">MashaAllah ! 🎉</h2>
            <p className="text-sm text-muted-foreground mt-2">{t("kidsStories.stickerUnlocked" as any)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {story.prophet[langKey]} — {story.title[langKey]}
            </p>

            <div className="mt-8 space-y-3">
              <Button onClick={() => navigate(`/quran?mode=dictation&surah=${story.surahRef.split(":")[0]}`)} variant="outline" className="w-full gap-2">
                📖 {t("kidsStories.findInQuran" as any)}
              </Button>
              <Button onClick={() => navigate("/kids-stories")} className="w-full">
                {t("kidsStories.backToStories" as any)}
              </Button>
            </div>

            {/* Collected stickers */}
            <div className="mt-6 bg-card border border-border rounded-2xl p-4">
              <p className="text-xs font-bold text-muted-foreground mb-2">{t("kidsStories.collection" as any)}</p>
              <div className="flex gap-2 flex-wrap justify-center">
                {getUnlockedStickers().map((s, i) => (
                  <span key={i} className="text-2xl">{s}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
