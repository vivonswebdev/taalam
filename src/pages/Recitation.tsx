import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import useAntiDoubleAudio from "@/hooks/useAntiDoubleAudio";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Mic, MicOff, RotateCcw, ChevronDown, Flame, Award, Volume2, Eye, EyeOff, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import AudioPlayer from "@/components/AudioPlayer";
import { surahs, getSurahsByDifficulty, type Surah } from "@/data/surahs";
import { useProgress } from "@/hooks/useProgress";
import { useClassSuccessShare } from "@/hooks/useClassSuccessShare";
import { useChildMode, type EarnedSticker } from "@/hooks/useChildMode";
import { useVoiceRecognition, compareTexts, type WordResult } from "@/hooks/useVoiceRecognition";
import { useLiveWordFeedback, type LiveWordStatus } from "@/hooks/useLiveWordFeedback";
import { useStreak } from "@/hooks/useStreak";
import { useLanguage } from "@/hooks/useLanguage";
import { useSound } from "@/hooks/useSound";
import { analyzeAyahTajwid } from "@/data/tajwidRules";
import Confetti from "@/components/Confetti";
import StickerReward from "@/components/StickerReward";
import BottomNav from "@/components/BottomNav";

type TarteelPhase = "select" | "listen" | "recite" | "results";

const getLiveWordColor = (status: LiveWordStatus) => {
  switch (status) {
    case "correct": return "text-success bg-success/10";
    case "almost": return "text-warning bg-warning/10";
    case "incorrect": return "text-destructive bg-destructive/10";
    case "pending": return "text-muted-foreground/30";
  }
};

interface AyahResult {
  ayahIndex: number;
  results: WordResult[];
  score: number;
}

const BADGES = [
  { minScore: 90, label: "Hâfiz en herbe", emoji: "🌟", color: "text-yellow-500" },
  { minScore: 75, label: "Récitateur assidu", emoji: "📖", color: "text-primary" },
  { minScore: 50, label: "En progression", emoji: "💪", color: "text-secondary" },
] as const;

function getBadge(score: number) {
  return BADGES.find((b) => score >= b.minScore) || null;
}

export default function Recitation() {
  const { updateSurahProgress } = useProgress();
  const { shareSuccess } = useClassSuccessShare();
  const { playSafely: safePlay } = useAntiDoubleAudio();
  const { isChildMode, earnSticker } = useChildMode();
  const { streak, recordSession, hasPracticedToday } = useStreak();
  const { t } = useLanguage();
  const { play, vibrate } = useSound();

  // Selection state
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Phase state
  const [phase, setPhase] = useState<TarteelPhase>("select");

  // Listen state
  const [playing, setPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [currentAyah, setCurrentAyah] = useState(-1);
  const [textMasked, setTextMasked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const maskTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Recite state
  const [recitingAyah, setRecitingAyah] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [ayahResults, setAyahResults] = useState<AyahResult[]>([]);
  const [showArabic, setShowArabic] = useState(true);
  const [showAyahResult, setShowAyahResult] = useState(false);
  const [lastAyahResult, setLastAyahResult] = useState<AyahResult | null>(null);
  const [completedAyahs, setCompletedAyahs] = useState<Set<number>>(new Set());

  // Live word feedback for current ayah only
  const currentAyahTexts = selectedSurah && phase === "recite"
    ? [selectedSurah.ayahs[recitingAyah]?.arabic || ""]
    : [""];
  const { liveWords, totalMatched: ayahMatched } = useLiveWordFeedback(currentAyahTexts, currentTranscript);
  const currentAyahWordCount = currentAyahTexts[0].split(/\s+/).filter(Boolean).length;

  const voice = useVoiceRecognition({
    lang: "ar-SA",
    continuous: true,
    onResult: (transcript) => {
      setCurrentTranscript(transcript);
    },
    onError: (error) => {
      console.warn("[Recitation] voice error:", error);
    },
  });
  // Rewards
  const [showConfetti, setShowConfetti] = useState(false);
  const [earnedSticker, setEarnedSticker] = useState<EarnedSticker | null>(null);

  const filteredSurahs = getSurahsByDifficulty(difficulty);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (maskTimerRef.current) clearTimeout(maskTimerRef.current);
    };
  }, []);

  const playAyahSequence = useCallback((index: number, urls: string[]) => {
    if (index >= urls.length) {
      setPlaying(false);
      setCurrentAyah(-1);
      // After audio finishes, mask text and go to recite
      setTextMasked(true);
      setTimeout(() => {
        setPhase("recite");
        setRecitingAyah(0);
        setShowArabic(true);
      }, 500);
      return;
    }
    setCurrentAyah(index);
    const audio = new Audio(urls[index]);
    audioRef.current = audio;
    audio.onended = () => playAyahSequence(index + 1, urls);
    audio.onerror = () => playAyahSequence(index + 1, urls);
    audio.play().catch(() => playAyahSequence(index + 1, urls));
  }, []);

  const startListening = useCallback(async () => {
    if (!selectedSurah) return;
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      setCurrentAyah(-1);
      return;
    }
    setAudioLoading(true);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah.number}/ar.alafasy`);
      const data = await res.json();
      if (data.data?.ayahs) {
        const urls = data.data.ayahs.map((a: { audio: string }) => a.audio);
        setPlaying(true);
        setAudioLoading(false);
        // Start masking timer after 5s of playback
        maskTimerRef.current = setTimeout(() => setTextMasked(true), 5000);
        playAyahSequence(0, urls);
      }
    } catch {
      setAudioLoading(false);
    }
  }, [playing, selectedSurah, playAyahSequence]);

  const handleSelectSurah = (surah: Surah) => {
    setSelectedSurah(surah);
    setShowDropdown(false);
    setPhase("listen");
    setTextMasked(false);
    setAyahResults([]);
    setRecitingAyah(0);
    setCurrentTranscript("");
    setShowArabic(true);
    setCompletedAyahs(new Set());
  };

  const handleFinishAyah = useCallback(() => {
    if (!selectedSurah) return;
    voice.stop();
    const ayah = selectedSurah.ayahs[recitingAyah];
    const { results, score } = compareTexts(ayah.arabic, currentTranscript);
    const result: AyahResult = { ayahIndex: recitingAyah, results, score };
    setAyahResults((prev) => [...prev, result]);
    setLastAyahResult(result);
    setCompletedAyahs((prev) => new Set([...prev, recitingAyah]));
    setTimeout(() => setShowAyahResult(true), 500);
  }, [selectedSurah, recitingAyah, currentTranscript, voice]);

  const skipAyah = useCallback(() => {
    if (!selectedSurah) return;
    voice.stop();
    const ayah = selectedSurah.ayahs[recitingAyah];
    const { results, score } = compareTexts(ayah.arabic, currentTranscript || " ");
    const result: AyahResult = { ayahIndex: recitingAyah, results, score };
    setAyahResults((prev) => [...prev, result]);
    setLastAyahResult(result);
    setCompletedAyahs((prev) => new Set([...prev, recitingAyah]));
    setTimeout(() => setShowAyahResult(true), 500);
  }, [selectedSurah, recitingAyah, currentTranscript, voice]);

  const restartAyah = useCallback(() => {
    setShowAyahResult(false);
    setLastAyahResult(null);
    // Remove last result since we're redoing
    setAyahResults((prev) => prev.filter((r) => r.ayahIndex !== recitingAyah));
    setCurrentTranscript("");
    setShowArabic(true);
  }, [recitingAyah]);

  const goNextAyah = useCallback(() => {
    if (!selectedSurah) return;
    setShowAyahResult(false);
    setLastAyahResult(null);
    if (recitingAyah < selectedSurah.ayahs.length - 1) {
      setRecitingAyah((p) => p + 1);
      setCurrentTranscript("");
      setShowArabic(false); // Hide text immediately for next verse
      // Must stay synchronous in click handler (user gesture) for Web Speech API
      voice.start();
    } else {
      finishRecitation(ayahResults);
    }
  }, [selectedSurah, recitingAyah, ayahResults, voice]);

  const finishRecitation = (results: AyahResult[]) => {
    if (!selectedSurah) return;
    const avgScore = Math.round(results.reduce((a, r) => a + r.score, 0) / results.length);
    updateSurahProgress(selectedSurah.number, avgScore);
    recordSession();
    shareSuccess(selectedSurah.number, avgScore);

    if (isChildMode && avgScore >= 50) {
      setShowConfetti(true);
      if (avgScore >= 70) {
        const sticker = earnSticker(selectedSurah.number);
        setTimeout(() => setEarnedSticker(sticker), 1500);
      }
    }
    if (avgScore >= 90) {
      setShowConfetti(true);
    }
    setPhase("results");
  };

  const handleRestart = () => {
    setPhase("listen");
    setTextMasked(false);
    setRecitingAyah(0);
    setAyahResults([]);
    setCurrentTranscript("");
    setShowArabic(true);
    setShowConfetti(false);
    setEarnedSticker(null);
    setCompletedAyahs(new Set());
  };

  const handleNewSurah = () => {
    setPhase("select");
    setSelectedSurah(null);
    setTextMasked(false);
    setAyahResults([]);
    setRecitingAyah(0);
    setCurrentTranscript("");
    setShowArabic(true);
    setShowConfetti(false);
    setEarnedSticker(null);
    setCompletedAyahs(new Set());
  };

  const replayAyahAudio = async (surahNum: number, ayahIndex: number) => {
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/ar.alafasy`);
      const data = await res.json();
      if (data.data?.ayahs?.[ayahIndex]) {
        safePlay(data.data.ayahs[ayahIndex].audio);
      }
    } catch {}
  };

  const totalScore = ayahResults.length > 0
    ? Math.round(ayahResults.reduce((a, r) => a + r.score, 0) / ayahResults.length)
    : 0;
  const badge = getBadge(totalScore);
  const bodyTextClass = isChildMode ? "text-base" : "text-sm";

  return (
    <div className="min-h-screen pb-24">
      <Confetti active={showConfetti} emoji={isChildMode} />
      <StickerReward sticker={earnedSticker} onDismiss={() => setEarnedSticker(null)} />

      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`${isChildMode ? "text-2xl" : "text-xl"} font-bold text-foreground`}>
              {isChildMode ? "🎤 " : ""}{t("recitation.title")}
            </h1>
            <p className={`${bodyTextClass} text-muted-foreground mt-0.5`}>
              {t("recitation.subtitle")}
            </p>
          </div>
          {/* Streak badge */}
          <div className="flex items-center gap-1.5 bg-secondary/15 text-secondary px-3 py-1.5 rounded-full">
            <Flame size={16} />
            <span className="text-sm font-bold">{streak.currentStreak}</span>
          </div>
        </div>
      </div>

      {/* SURAH STEPPER - shown when not in select phase */}
      {phase !== "select" && selectedSurah && (
        <div className="px-4 mb-3">
          <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
            {/* Prev button */}
            <button
              disabled={selectedSurah.number <= 1}
              onClick={() => {
                const prevSurah = surahs.find(s => s.number === selectedSurah.number - 1);
                if (prevSurah) handleSelectSurah(prevSurah);
              }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <ChevronLeft size={14} />
              <span className="hidden min-[360px]:inline">{selectedSurah.number > 1 ? surahs.find(s => s.number === selectedSurah.number - 1)?.nameArabic : ""}</span>
            </button>

            {/* Current surah */}
            <div className="flex-1 text-center px-1">
              <p className="font-arabic text-sm font-bold text-foreground leading-tight">{selectedSurah.number} · {selectedSurah.nameArabic}</p>
              <p className="text-[10px] text-muted-foreground">{selectedSurah.frenchName}</p>
            </div>

            {/* Next button */}
            <button
              disabled={selectedSurah.number >= 114}
              onClick={() => {
                const nextSurah = surahs.find(s => s.number === selectedSurah.number + 1);
                if (nextSurah) handleSelectSurah(nextSurah);
              }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <span className="hidden min-[360px]:inline">{selectedSurah.number < 114 ? surahs.find(s => s.number === selectedSurah.number + 1)?.nameArabic : ""}</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* SELECT PHASE */}
      {phase === "select" && (
        <div className="px-6 space-y-6">
          {/* Streak info */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${hasPracticedToday ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                <Flame size={24} />
              </div>
              <div>
                <p className="font-bold text-foreground">
                  {streak.currentStreak > 0
                    ? `${streak.currentStreak} ${t("recitation.daysStreak")}`
                    : t("recitation.startStreak")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("recitation.record")} : {streak.longestStreak} {t("recitation.days")} · {streak.totalSessions} {t("recitation.sessions")}
                </p>
              </div>
            </div>
            {hasPracticedToday && (
              <p className="text-xs text-success font-medium">{t("recitation.practicedToday")}</p>
            )}
          </motion.div>

          {/* Difficulty selector */}
          <div>
            <p className={`${bodyTextClass} font-semibold text-foreground mb-3`}>{t("recitation.difficulty")}</p>
            <div className="flex gap-2">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => { setDifficulty(d); setSelectedSurah(null); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    difficulty === d
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {d === "easy" ? (isChildMode ? "😊 " : "") + t("recitation.easy") :
                   d === "medium" ? (isChildMode ? "🤔 " : "") + t("recitation.medium") :
                   (isChildMode ? "💪 " : "") + t("recitation.hard")}
                </button>
              ))}
            </div>
          </div>

          {/* Surah dropdown */}
          <div className="relative">
            <p className={`${bodyTextClass} font-semibold text-foreground mb-3`}>{t("recitation.chooseSurah")}</p>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3 text-left"
            >
              <span className={`${bodyTextClass} ${selectedSurah ? "text-foreground" : "text-muted-foreground"}`}>
                {selectedSurah ? `${selectedSurah.nameArabic} - ${selectedSurah.frenchName}` : t("recitation.selectSurah")}
              </span>
              <ChevronDown size={18} className={`text-muted-foreground transition-transform ${showDropdown ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-lg max-h-64 overflow-y-auto"
                >
                  {filteredSurahs.map((s) => (
                    <button
                      key={s.number}
                      onClick={() => handleSelectSurah(s)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left border-b border-border last:border-b-0"
                    >
                      <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                        {s.number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-arabic text-lg text-foreground">{s.nameArabic}</p>
                        <p className="text-xs text-muted-foreground truncate">{s.frenchName} · {s.versesCount} versets</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* LISTEN PHASE */}
      {phase === "listen" && selectedSurah && (
        <div className="px-6 space-y-5">
          {/* Audio Player */}
          <AudioPlayer
            surahNumber={selectedSurah.number}
            surahName={selectedSurah.frenchName}
            surahNameArabic={selectedSurah.nameArabic}
            totalAyahs={selectedSurah.ayahs.length}
            onAyahChange={(i) => setCurrentAyah(i)}
            onPlayStateChange={(p) => {
              setPlaying(p);
              if (p && !textMasked) {
                maskTimerRef.current = setTimeout(() => setTextMasked(true), 5000);
              }
            }}
            onFinished={() => {
              setTextMasked(true);
              setTimeout(() => { setPhase("recite"); setRecitingAyah(0); setShowArabic(true); }, 500);
            }}
          />

          {/* Mask indicator */}
          {textMasked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 text-secondary"
            >
              <EyeOff size={16} />
              <span className="text-sm font-medium">Texte masqué — mémorise bien !</span>
            </motion.div>
          )}

          {/* Skip to recitation */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                setTextMasked(true);
                setPhase("recite");
                setRecitingAyah(0);
              }}
              className="text-xs text-muted-foreground underline"
            >
              Passer à la récitation →
            </button>
          </div>

          {/* Ayahs */}
          <div className="space-y-3">
            {selectedSurah.ayahs.map((ayah, i) => (
              <motion.div
                key={ayah.number}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`bg-card border rounded-2xl p-4 transition-all ${
                  currentAyah === i ? "border-primary shadow-lg shadow-primary/10" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                    {ayah.number}
                  </span>
                  {currentAyah === i && <Volume2 size={14} className="text-primary animate-pulse mt-1" />}
                </div>
                {textMasked ? (
                  <div className="h-12 flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">••• مخفي •••</span>
                  </div>
                ) : (
                  <>
                    <p className="arabic-text text-xl text-foreground mb-2">{ayah.arabic}</p>
                    <p className="text-xs text-primary/70 italic">{ayah.transliteration}</p>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* RECITE PHASE */}
      {phase === "recite" && selectedSurah && (
        <div className="px-6">
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((recitingAyah) / selectedSurah.ayahs.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground font-semibold">
              {recitingAyah + 1}/{selectedSurah.ayahs.length}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={recitingAyah}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-5"
            >
              {/* Previously completed ayahs - shown with colored results */}
              {completedAyahs.size > 0 && (
                <div className="space-y-2 mb-4">
                  {selectedSurah.ayahs.map((ayah, i) => {
                    if (!completedAyahs.has(i)) return null;
                    const result = ayahResults.find((r) => r.ayahIndex === i);
                    if (!result) return null;
                    return (
                      <div key={`completed-${i}`} className="bg-card border border-border rounded-xl p-3 opacity-80">
                        <div className="flex items-center justify-between mb-1">
                          <span className="w-6 h-6 rounded-md bg-muted text-muted-foreground text-[10px] font-bold flex items-center justify-center">{ayah.number}</span>
                          <span className={`text-xs font-bold ${result.score >= 80 ? "text-success" : result.score >= 50 ? "text-warning" : "text-destructive"}`}>{result.score}%</span>
                        </div>
                        <div className="arabic-text text-base leading-[2] flex flex-wrap gap-x-1.5 justify-end" dir="rtl">
                          {result.results.map((wr, j) => (
                            <span key={j} className={wr.correct ? "text-success" : "text-destructive"}>{wr.word}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Current ayah card */}
              <div className={`bg-card border-2 border-primary/30 rounded-2xl ${isChildMode ? "p-8" : "p-6"}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center justify-center ${isChildMode ? "w-10 h-10 text-lg" : "w-8 h-8 text-sm"} rounded-full bg-primary text-primary-foreground font-bold`}>
                    {selectedSurah.ayahs[recitingAyah].number}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {t("detail.verses")} {recitingAyah + 1}/{selectedSurah.ayahs.length}
                  </span>
                </div>

                {/* Arabic text: visible before mic, hidden/revealed during recitation */}
                <div className={`arabic-text ${isChildMode ? "text-3xl" : "text-2xl"} leading-[2.4] flex flex-wrap gap-x-2 justify-center mb-4`} dir="rtl">
                  {showArabic ? (
                    // Full text visible before recording — with Tajwid colors
                    (() => {
                      const tajwidWords = analyzeAyahTajwid(selectedSurah.ayahs[recitingAyah].arabic);
                      return tajwidWords.map((tw, wi) => (
                        <span
                          key={wi}
                          className="inline-block px-0.5"
                          style={tw.primaryColor ? { color: `hsl(${tw.primaryColor})` } : undefined}
                        >
                          {tw.text}
                        </span>
                      ));
                    })()
                  ) : (
                    // Word-by-word reveal with Tajwid underline during recording
                    (() => {
                      const tajwidWords = analyzeAyahTajwid(selectedSurah.ayahs[recitingAyah].arabic);
                      return selectedSurah.ayahs[recitingAyah].arabic.split(/\s+/).filter(Boolean).map((word, wi) => {
                        const lw = liveWords[0]?.[wi];
                        const status = lw?.status || "pending";
                        const isRevealed = status !== "pending";
                        const colorClass = getLiveWordColor(status);
                        const tw = tajwidWords[wi];
                        const tajwidBorder = isRevealed && tw?.primaryColor
                          ? `3px solid hsl(${tw.primaryColor})`
                          : undefined;
                        return (
                          <motion.span
                            key={wi}
                            initial={isRevealed ? { scale: 1.15, opacity: 0 } : false}
                            animate={isRevealed ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            className={`inline-block px-1 py-0.5 rounded-md transition-all duration-300 ${
                              isRevealed ? colorClass : "text-transparent bg-muted/50 select-none"
                            }`}
                            style={{ borderBottom: tajwidBorder }}
                          >
                            {isRevealed ? word : "████"}
                          </motion.span>
                        );
                      });
                    })()
                  )}
                </div>

                {/* Word progress during recording */}
                {!showArabic && (
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-success rounded-full"
                        animate={{ width: `${(ayahMatched / Math.max(1, currentAyahWordCount)) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">{ayahMatched}/{currentAyahWordCount}</span>
                  </div>
                )}

                {/* Legend during recording */}
                {!showArabic && (
                  <div className="flex flex-wrap justify-center gap-3 text-[10px] mb-3">
                    <span className="flex items-center gap-1 text-success"><CheckCircle2 size={10} /> {t("dictation.legendCorrect")}</span>
                    <span className="flex items-center gap-1 text-warning">⚠️ {t("daily.almost")}</span>
                    <span className="flex items-center gap-1 text-destructive"><XCircle size={10} /> {t("dictation.legendIncorrect")}</span>
                  </div>
                )}

                {/* Translation & Phonetics — ALWAYS visible */}
                <div className="border-t border-border my-3" />
                <p className={`${bodyTextClass} text-muted-foreground mb-1`}>
                  🇫🇷 {selectedSurah.ayahs[recitingAyah].translation}
                </p>
                <p className={`text-primary/60 italic ${bodyTextClass}`}>
                  🔤 {selectedSurah.ayahs[recitingAyah].transliteration}
                </p>
              </div>

              {/* Mic controls */}
              <div className="flex flex-col items-center gap-4">
                {!voice.isSupported ? (
                  <div className="bg-destructive/10 text-destructive rounded-2xl p-4 text-sm text-center">
                    Reconnaissance vocale non supportée. Utilisez Chrome.
                  </div>
                ) : (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        if (voice.isListening) {
                          voice.stop();
                        } else {
                          setShowArabic(false); // Hide Arabic on mic press
                          setCurrentTranscript("");
                          voice.start();
                        }
                      }}
                      className={`${isChildMode ? "w-24 h-24" : "w-20 h-20"} rounded-full flex items-center justify-center transition-all ${
                        voice.isListening
                          ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/30 animate-pulse"
                          : "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      }`}
                    >
                      {voice.isListening ? <MicOff size={isChildMode ? 38 : 32} /> : <Mic size={isChildMode ? 38 : 32} />}
                    </motion.button>
                    <p className={`${bodyTextClass} text-muted-foreground`}>
                      {voice.isListening
                        ? (isChildMode ? "🎤 Récite maintenant !" : "J'écoute... Appuyez pour arrêter")
                        : showArabic
                          ? (isChildMode ? "👆 Appuie pour réciter !" : "Appuyez sur le micro — le texte disparaîtra")
                          : (isChildMode ? "👆 Appuie pour réciter !" : "Appuyez pour recommencer")}
                    </p>
                    <p className="text-xs text-muted-foreground/80">
                      {voice.mode === "server" ? "Mode micro sécurisé actif" : "Mode micro instantané actif"}
                    </p>

                    {/* Hide hint before first press */}
                    {showArabic && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <EyeOff size={12} />
                        <span>{t("daily.hideHint")}</span>
                      </div>
                    )}
                  </>
                )}

                {!showArabic && (
                  <div className="w-full max-w-xl bg-muted/30 border border-border rounded-2xl px-4 py-3">
                    <p className="arabic-text text-xl text-foreground text-right" dir="rtl">
                      {currentTranscript || "… en attente de ta récitation"}
                    </p>
                  </div>
                )}

                {currentTranscript && !voice.isListening && (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFinishAyah}
                    className={`flex items-center gap-2 bg-success text-success-foreground ${isChildMode ? "px-8 py-4 text-lg" : "px-6 py-3"} rounded-full font-semibold`}
                  >
                    ✅ {isChildMode ? "Valider !" : `Valider verset ${recitingAyah + 1}`}
                  </motion.button>
                )}

                <button onClick={skipAyah} className="text-xs text-muted-foreground underline">
                  Passer ce verset
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Ayah Result Popup */}
          <AnimatePresence>
            {showAyahResult && lastAyahResult && selectedSurah && (() => {
              const greens = lastAyahResult.results.filter((r) => r.correct).length;
              const reds = lastAyahResult.results.filter((r) => !r.correct).length;
              const wrongWords = lastAyahResult.results.filter((r) => !r.correct).map((r) => r.word);
              const isLast = recitingAyah >= selectedSurah.ayahs.length - 1;
              return (
                <motion.div
                  key="ayah-popup"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center px-4"
                >
                  <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="relative bg-card border border-border rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4"
                  >
                    {/* Score header */}
                    <div className="text-center">
                      <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                        lastAyahResult.score >= 90 ? "bg-success/15" : lastAyahResult.score >= 70 ? "bg-primary/15" : lastAyahResult.score >= 50 ? "bg-warning/15" : "bg-destructive/15"
                      }`}>
                        <span className={`text-2xl font-bold ${
                          lastAyahResult.score >= 90 ? "text-success" : lastAyahResult.score >= 70 ? "text-primary" : lastAyahResult.score >= 50 ? "text-warning" : "text-destructive"
                        }`}>
                          {lastAyahResult.score}%
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        📊 Ayah {recitingAyah + 1}/{selectedSurah.ayahs.length}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-center gap-4 text-xs">
                      <span className="flex items-center gap-1 text-success font-semibold">✅ {greens}</span>
                      <span className="flex items-center gap-1 text-destructive font-semibold">❌ {reds}</span>
                    </div>

                    {/* Wrong words focus */}
                    {wrongWords.length > 0 && (
                      <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-3 text-center" dir="rtl">
                        <p className="text-[10px] text-muted-foreground mb-1">À retravailler :</p>
                        <p className="font-arabic text-lg text-destructive">{wrongWords.join(" · ")}</p>
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={restartAyah}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-muted text-foreground font-semibold text-sm"
                      >
                        🎤 Refaire
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={goNextAyah}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm"
                      >
                        {isLast ? "📊 Résultats" : "▶️ Suivant"}
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      )}

      {/* RESULTS PHASE */}
      {phase === "results" && selectedSurah && (
        <div className="px-6 space-y-5">
          {/* Score */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-6"
          >
            <div className={`${isChildMode ? "w-32 h-32 text-4xl" : "w-24 h-24 text-3xl"} rounded-full mx-auto flex items-center justify-center font-bold mb-3 ${
              totalScore >= 80 ? "bg-success/15 text-success" : totalScore >= 50 ? "bg-secondary/15 text-secondary" : "bg-destructive/15 text-destructive"
            }`}>
              {totalScore}%
            </div>

            {/* Badge */}
            {badge && (
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="flex items-center justify-center gap-2 mb-2"
              >
                <Award size={20} className={badge.color} />
                <span className={`font-bold ${badge.color}`}>{badge.emoji} {badge.label}</span>
              </motion.div>
            )}

            <h2 className={`${isChildMode ? "text-2xl" : "text-xl"} font-bold text-foreground`}>
              {isChildMode
                ? (totalScore >= 90 ? "Super champion ! 🌟🎉" : totalScore >= 50 ? "Bien joué ! 💪😊" : "Réessaie ! 📖💚")
                : (totalScore >= 90 ? "Excellent ! 🌟" : totalScore >= 50 ? "Bien, continuez 💪" : "Réessayez 📖")}
            </h2>

            {/* Streak */}
            <div className="flex items-center justify-center gap-2 mt-3 text-secondary">
              <Flame size={18} />
              <span className="text-sm font-bold">{streak.currentStreak} jour{streak.currentStreak > 1 ? "s" : ""} de streak</span>
            </div>
          </motion.div>

          {/* Ayah-by-ayah results */}
          <div className="space-y-3">
            {ayahResults.map((ar, i) => {
              const ayah = selectedSurah.ayahs[ar.ayahIndex];
              const hasErrors = ar.results.some((r) => !r.correct);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-card border border-border rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-muted-foreground">Verset {ayah.number}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${ar.score >= 80 ? "text-success" : ar.score >= 50 ? "text-secondary" : "text-destructive"}`}>
                        {ar.score}% {isChildMode && (ar.score >= 80 ? "⭐" : ar.score >= 50 ? "👍" : "📖")}
                      </span>
                      {hasErrors && (
                        <button
                          onClick={() => replayAyahAudio(selectedSurah.number, ar.ayahIndex)}
                          className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center"
                          title="Réécouter ce verset"
                        >
                          <Volume2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className={`arabic-text ${isChildMode ? "text-xl" : "text-lg"} leading-[2.2] flex flex-wrap gap-x-2 justify-end`}>
                    {ar.results.map((wr, j) => (
                      <span
                        key={j}
                        className={`${wr.correct ? "text-success" : "text-destructive font-bold underline decoration-wavy"}`}
                      >
                        {wr.word}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2 pb-6">
            <button
              onClick={handleRestart}
              className={`flex-1 flex items-center justify-center gap-2 ${isChildMode ? "py-4 text-lg" : "py-3.5"} rounded-2xl border-2 border-border text-foreground font-semibold active:scale-[0.98] transition-transform`}
            >
              <RotateCcw size={18} /> {isChildMode ? "🔄 " : ""}{t("recitation.restart")}
            </button>
            <button
              onClick={handleNewSurah}
              className={`flex-1 flex items-center justify-center gap-2 ${isChildMode ? "py-4 text-lg" : "py-3.5"} rounded-2xl bg-primary text-primary-foreground font-semibold active:scale-[0.98] transition-transform`}
            >
              {isChildMode ? "📖 " : ""}{t("recitation.changeSurah")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
