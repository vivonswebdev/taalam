import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, Mic, MicOff, SkipForward, SkipBack, RotateCcw,
  ChevronDown, Flame, Award, Volume2, CheckCircle2, XCircle,
  Repeat, AlertCircle, BookOpen, PenTool, Search, Loader2, Headphones, Target, Bookmark,
} from "lucide-react";
import { surahs, getSurahsByDifficulty, type Surah } from "@/data/surahs";
import { useProgress } from "@/hooks/useProgress";
import { useChildMode, type EarnedSticker } from "@/hooks/useChildMode";
import { useVoiceRecognition, compareTexts } from "@/hooks/useVoiceRecognition";
import { useStreak } from "@/hooks/useStreak";
import { useLanguage, QURAN_TRANSLATION_IDS } from "@/hooks/useLanguage";
import { useTranslationPreference } from "@/hooks/useTranslationPreference";
import Confetti from "@/components/Confetti";
import StickerReward from "@/components/StickerReward";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import DictationMode from "@/components/DictationMode";
import AudioPlayer from "@/components/AudioPlayer";
import ReadOnlyMode from "@/components/ReadOnlyMode";
import HifzControl from "@/components/HifzControl";
import TahaddiMode from "@/components/TahaddiMode";
import FindAyah from "@/components/FindAyah";
import MushafReader from "@/components/MushafReader";
import { fetchSurahList, fetchFullSurah, type SurahMeta } from "@/lib/quranData";
import { useSearchParams } from "react-router-dom";

// ─── Types ──────────────────────────────────────────────────
type AyaPhase = "idle" | "playing" | "reciting" | "result";
type RecitationMode = "aya" | "dictation" | "readOnly" | "hifz" | "tahaddi" | "findAyah" | "mushaf";

// ─── Easy surahs for beginners / first-time users ───────────
const EASY_SURAH_NUMBERS = [114, 113, 112, 108, 111, 110, 109, 107, 106, 105];
const LAST_USED_KEY = "quranEasyLastSurah";

interface AyaScore {
  ayaIndex: number;
  score: number;
  correct: boolean; // >90%
  transcript: string;
}

// ─── Component ──────────────────────────────────────────────
export default function Quran() {
  const { updateSurahProgress } = useProgress();
  const { isChildMode, earnSticker } = useChildMode();
  const { streak, recordSession, hasPracticedToday } = useStreak();
  const { t, lang } = useLanguage();
  const { resolvedEditionId, isArabicOnly } = useTranslationPreference();
  const [searchParams] = useSearchParams();

  // URL params for deep-linking (from bookmarks)
  const urlSurahParam = searchParams.get("surah");
  const urlAyahParam = searchParams.get("ayah");
  const urlModeParam = searchParams.get("mode");

  // Selection
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recitationMode, setRecitationMode] = useState<RecitationMode>("aya");
  const [mushafStartAyah, setMushafStartAyah] = useState(0);

  // Last used surah
  const [lastUsedSurahNumber, setLastUsedSurahNumber] = useState<number | null>(() => {
    try {
      const stored = localStorage.getItem(LAST_USED_KEY);
      return stored ? Number(stored) : null;
    } catch { return null; }
  });

  const lastUsedSurah = lastUsedSurahNumber
    ? surahs.find(s => s.number === lastUsedSurahNumber) || null
    : null;

  const easySurahsList = surahs.filter(s => EASY_SURAH_NUMBERS.includes(s.number));

  // Full Quran list (114 surahs)
  const [allSurahsMeta, setAllSurahsMeta] = useState<SurahMeta[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingSurah, setLoadingSurah] = useState(false);
  const [browseMode, setBrowseMode] = useState<"local" | "all">("local");

  // Aya-by-aya state
  const [currentAya, setCurrentAya] = useState(0);
  const [ayaPhase, setAyaPhase] = useState<AyaPhase>("idle");
  const [scores, setScores] = useState<AyaScore[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [repeatCount, setRepeatCount] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [surahFinished, setSurahFinished] = useState(false);
  const [autoNextTimer, setAutoNextTimer] = useState<number | null>(null);

  // Translations from API
  const [translations, setTranslations] = useState<Record<number, string>>({});

  // Audio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoNextRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Rewards
  const [showConfetti, setShowConfetti] = useState(false);
  const [earnedSticker, setEarnedSticker] = useState<EarnedSticker | null>(null);

  const filteredSurahs = getSurahsByDifficulty(difficulty);

  // Handle deep-link from bookmarks
  useEffect(() => {
    if (urlSurahParam && urlModeParam === "mushaf") {
      const num = Number(urlSurahParam);
      const local = surahs.find(s => s.number === num);
      if (local) {
        setSelectedSurah(local);
        setRecitationMode("mushaf");
        setMushafStartAyah(urlAyahParam ? Number(urlAyahParam) : 0);
      } else {
        fetchFullSurah(num).then((full) => {
          setSelectedSurah(full);
          setRecitationMode("mushaf");
          setMushafStartAyah(urlAyahParam ? Number(urlAyahParam) : 0);
        }).catch(console.error);
      }
    }
  }, []);

  // Fetch all 114 surahs metadata
  useEffect(() => {
    fetchSurahList().then(setAllSurahsMeta).catch(console.error);
  }, []);

  // Filter surahs in "all" mode
  const filteredAllSurahs = allSurahsMeta.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.nameArabic.includes(q) ||
      s.englishName.toLowerCase().includes(q) ||
      String(s.number).includes(q)
    );
  });



  const [micError, setMicError] = useState<string | null>(null);

  const voice = useVoiceRecognition({
    lang: "ar-SA",
    continuous: true,
    onResult: (transcript) => setCurrentTranscript(transcript),
    onError: (error) => {
      if (error === "not-allowed") {
        setMicError("not-allowed");
      }
    },
  });

  // Cleanup
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (autoNextRef.current) clearTimeout(autoNextRef.current);
    };
  }, []);

  // Fetch translations when surah or edition changes
  useEffect(() => {
    if (!selectedSurah || isArabicOnly) {
      setTranslations({});
      return;
    }
    fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah.number}/${resolvedEditionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.data?.ayahs) {
          const map: Record<number, string> = {};
          data.data.ayahs.forEach((a: { numberInSurah: number; text: string }, i: number) => {
            map[i] = a.text;
          });
          setTranslations(map);
        }
      })
      .catch(() => {});
  }, [selectedSurah, resolvedEditionId, isArabicOnly]);

  // ─── Handlers ─────────────────────────────────────────────

  const handleSelectSurah = (surah: Surah) => {
    setSelectedSurah(surah);
    setShowDropdown(false);
    // Save as last used
    setLastUsedSurahNumber(surah.number);
    try { localStorage.setItem(LAST_USED_KEY, String(surah.number)); } catch {}
    setCurrentAya(0);
    setAyaPhase("idle");
    setScores([]);
    setSurahFinished(false);
    setIsPaused(false);
    setRepeatCount(0);
    setCurrentTranscript("");
    setShowConfetti(false);
    setEarnedSticker(null);
    setAutoNextTimer(null);
  };

  // Select a surah from the full 114 list (fetch ayahs from API)
  const handleSelectSurahFromApi = async (meta: SurahMeta) => {
    // Check if we have it locally first
    const local = surahs.find((s) => s.number === meta.number);
    if (local) {
      handleSelectSurah(local);
      return;
    }
    // Fetch from API
    setLoadingSurah(true);
    try {
      const full = await fetchFullSurah(meta.number);
      handleSelectSurah(full);
    } catch (e) {
      console.error("Failed to load surah", e);
    } finally {
      setLoadingSurah(false);
    }
  };

  const playAyaAudio = useCallback(async (ayaIndex: number) => {
    if (!selectedSurah) return;
    setAyaPhase("playing");
    setCurrentAya(ayaIndex);
    setCurrentTranscript("");

    audioRef.current?.pause();

    try {
      const res = await fetch(
        `https://api.alquran.cloud/v1/ayah/${selectedSurah.number}:${ayaIndex + 1}/ar.husary`
      );
      const data = await res.json();
      const audioUrl = data.data?.audio;
      if (!audioUrl) {
        // Fallback: go to recite
        setAyaPhase("reciting");
        return;
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        // Audio finished → recite phase
        setAyaPhase("reciting");
      };
      audio.onerror = () => {
        setAyaPhase("reciting");
      };

      audio.play().catch(() => setAyaPhase("reciting"));
    } catch {
      setAyaPhase("reciting");
    }
  }, [selectedSurah]);

  const handlePauseResume = useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
      if (ayaPhase === "playing") {
        audioRef.current?.play();
      } else if (ayaPhase === "reciting") {
        voice.start();
      }
    } else {
      setIsPaused(true);
      if (ayaPhase === "playing") {
        audioRef.current?.pause();
      } else if (ayaPhase === "reciting") {
        voice.stop();
      }
    }
  }, [isPaused, ayaPhase, voice]);

  const handleRepeatX3 = useCallback(async () => {
    if (!selectedSurah) return;
    setRepeatCount(3);
    // Play the aya 3 times
    const playOnce = (count: number) => {
      if (count <= 0) {
        setRepeatCount(0);
        setAyaPhase("reciting");
        return;
      }
      setRepeatCount(count);
      fetch(`https://api.alquran.cloud/v1/ayah/${selectedSurah.number}:${currentAya + 1}/ar.husary`)
        .then((r) => r.json())
        .then((data) => {
          const audioUrl = data.data?.audio;
          if (!audioUrl) { setRepeatCount(0); setAyaPhase("reciting"); return; }
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          audio.onended = () => playOnce(count - 1);
          audio.onerror = () => playOnce(count - 1);
          audio.play().catch(() => playOnce(count - 1));
        })
        .catch(() => { setRepeatCount(0); setAyaPhase("reciting"); });
    };
    playOnce(3);
  }, [selectedSurah, currentAya]);

  const handleValidateRecitation = useCallback(() => {
    if (!selectedSurah) return;
    voice.stop();

    const ayah = selectedSurah.ayahs[currentAya];
    const { score } = compareTexts(ayah.arabic, currentTranscript);
    const correct = score >= 90;

    const newScore: AyaScore = {
      ayaIndex: currentAya,
      score,
      correct,
      transcript: currentTranscript,
    };
    const newScores = [...scores, newScore];
    setScores(newScores);
    setAyaPhase("result");

    if (correct) {
      // Auto-next after 2s
      let countdown = 2;
      setAutoNextTimer(countdown);
      autoNextRef.current = setInterval(() => {
        countdown--;
        setAutoNextTimer(countdown);
        if (countdown <= 0) {
          if (autoNextRef.current) clearInterval(autoNextRef.current);
          setAutoNextTimer(null);
          goToNextAya(newScores);
        }
      }, 1000);
    }
  }, [selectedSurah, currentAya, currentTranscript, scores, voice]);

  const handleSkipAya = useCallback(() => {
    if (!selectedSurah) return;
    voice.stop();
    const newScore: AyaScore = {
      ayaIndex: currentAya,
      score: 0,
      correct: false,
      transcript: "",
    };
    const newScores = [...scores, newScore];
    setScores(newScores);
    goToNextAya(newScores);
  }, [selectedSurah, currentAya, scores, voice]);

  const handleRetryAya = useCallback(() => {
    if (autoNextRef.current) clearInterval(autoNextRef.current);
    setAutoNextTimer(null);
    setCurrentTranscript("");
    playAyaAudio(currentAya);
  }, [currentAya, playAyaAudio]);

  const goToNextAya = useCallback((currentScores: AyaScore[]) => {
    if (!selectedSurah) return;
    if (currentAya < selectedSurah.ayahs.length - 1) {
      const nextAya = currentAya + 1;
      setCurrentAya(nextAya);
      setCurrentTranscript("");
      setAyaPhase("idle");
      // Auto-play next aya
      setTimeout(() => playAyaAudio(nextAya), 500);
    } else {
      // Surah finished
      finishSurah(currentScores);
    }
  }, [selectedSurah, currentAya, playAyaAudio]);

  const goToPrevAya = useCallback(() => {
    if (currentAya > 0) {
      if (autoNextRef.current) clearInterval(autoNextRef.current);
      setAutoNextTimer(null);
      const prev = currentAya - 1;
      setCurrentAya(prev);
      setCurrentTranscript("");
      setAyaPhase("idle");
    }
  }, [currentAya]);

  const goToNextAyaManual = useCallback(() => {
    if (!selectedSurah) return;
    if (autoNextRef.current) clearInterval(autoNextRef.current);
    setAutoNextTimer(null);
    if (currentAya < selectedSurah.ayahs.length - 1) {
      const next = currentAya + 1;
      setCurrentAya(next);
      setCurrentTranscript("");
      setAyaPhase("idle");
    }
  }, [selectedSurah, currentAya]);

  const finishSurah = (finalScores: AyaScore[]) => {
    if (!selectedSurah) return;
    const avgScore = Math.round(
      finalScores.reduce((a, s) => a + s.score, 0) / finalScores.length
    );
    updateSurahProgress(selectedSurah.number, avgScore);
    recordSession();
    setSurahFinished(true);
    setAyaPhase("idle");

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
  };

  const handleNewSurah = () => {
    setSelectedSurah(null);
    setCurrentAya(0);
    setAyaPhase("idle");
    setScores([]);
    setSurahFinished(false);
    setCurrentTranscript("");
    setShowConfetti(false);
    setEarnedSticker(null);
    setIsPaused(false);
  };

  const handleRestart = () => {
    setCurrentAya(0);
    setAyaPhase("idle");
    setScores([]);
    setSurahFinished(false);
    setCurrentTranscript("");
    setShowConfetti(false);
    setEarnedSticker(null);
    setIsPaused(false);
  };

  // ─── Computed ─────────────────────────────────────────────
  const perfectCount = scores.filter((s) => s.correct).length;
  const totalScore = scores.length > 0
    ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length)
    : 0;
  const errorAyas = scores.filter((s) => !s.correct);
  const bodyTextClass = isChildMode ? "text-base" : "text-sm";

  // Gamification badges
  const badges: string[] = [];
  if (perfectCount >= 5) badges.push(t("aya.badge5"));
  if (perfectCount >= 10) badges.push(t("aya.badge10"));
  if (selectedSurah && perfectCount === selectedSurah.ayahs.length) badges.push(t("aya.badgeAll"));

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-28">
      <Confetti active={showConfetti} emoji={isChildMode} />
      <StickerReward sticker={earnedSticker} onDismiss={() => setEarnedSticker(null)} />

      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`${isChildMode ? "text-2xl" : "text-xl"} font-bold text-foreground`}>
              {isChildMode ? "📖 " : ""}{t("nav.quran")}
            </h1>
            <p className={`${bodyTextClass} text-muted-foreground mt-0.5`}>
              {t("recitation.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <div className="flex items-center gap-1.5 bg-secondary/15 text-secondary px-3 py-1.5 rounded-full">
              <Flame size={16} />
              <span className="text-sm font-bold">{streak.currentStreak}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SELECTION ═══ */}
      {!selectedSurah && (
        <div className="px-6 space-y-5">
          {/* Streak card */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${hasPracticedToday ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                <Flame size={24} />
              </div>
              <div>
                <p className="font-bold text-foreground">
                  {streak.currentStreak > 0 ? `${streak.currentStreak} ${t("recitation.daysStreak")}` : t("recitation.startStreak")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("recitation.record")} : {streak.longestStreak} {t("recitation.days")} · {streak.totalSessions} {t("recitation.sessions")}
                </p>
              </div>
            </div>
            {hasPracticedToday && (
              <p className="text-xs text-success font-medium mt-2">{t("recitation.practicedToday")}</p>
            )}
          </motion.div>

          {/* ─── Quick Pick Card ─── */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("recitation.chooseSurah")}</p>

            {/* Difficulty pills */}
            <div className="flex gap-1.5">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <button key={d}
                  onClick={() => { setDifficulty(d); setBrowseMode("local"); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                    browseMode === "local" && difficulty === d
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-accent/50"
                  }`}>
                  {d === "easy" ? (isChildMode ? "😊 " : "") + t("recitation.easy") :
                   d === "medium" ? (isChildMode ? "🤔 " : "") + t("recitation.medium") :
                   (isChildMode ? "💪 " : "") + t("recitation.hard")}
                </button>
              ))}
            </div>

            {/* Browse all link */}
            <button
              onClick={() => setBrowseMode(browseMode === "all" ? "local" : "all")}
              className={`w-full text-xs font-medium py-1.5 transition-colors ${
                browseMode === "all" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}>
              📖 {browseMode === "all" ? t("recitation.difficulty") : "114 sourates"}
            </button>
          </motion.div>

          {/* ─── Last Used Surah Card ─── */}
          {lastUsedSurah && browseMode === "local" && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              <button
                onClick={() => handleSelectSurah(lastUsedSurah)}
                className="w-full flex items-center gap-3 bg-primary/5 border-2 border-primary/20 rounded-2xl px-4 py-3 text-left hover:bg-primary/10 transition-colors"
              >
                <span className="w-10 h-10 rounded-xl bg-primary/15 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                  {lastUsedSurah.number}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-primary font-semibold uppercase tracking-wider">{t("surah.lastUsed")}</p>
                  <p className="font-arabic text-lg text-foreground">{lastUsedSurah.nameArabic}</p>
                  <p className="text-xs text-muted-foreground truncate">{lastUsedSurah.frenchName} · {lastUsedSurah.versesCount} {t("detail.verses")}</p>
                </div>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg shrink-0">
                  {t("surah.continueWith")} →
                </span>
              </button>
            </motion.div>
          )}

          {/* ─── Surah Selector ─── */}
          {browseMode === "local" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className={`${bodyTextClass} font-semibold text-foreground`}>Sourate</p>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  difficulty === "easy" ? "bg-green-500/15 text-green-600" :
                  difficulty === "medium" ? "bg-amber-500/15 text-amber-600" :
                  "bg-red-500/15 text-red-600"
                }`}>
                  {t(`recitation.${difficulty}`)}
                </span>
              </div>

              <div className="relative">
                <button onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3 text-left">
                  <span className={`${bodyTextClass} text-muted-foreground`}>{t("recitation.selectSurah")}</span>
                  <ChevronDown size={18} className={`text-muted-foreground transition-transform ${showDropdown ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-lg max-h-72 overflow-y-auto">

                      {/* Recommended easy surahs section (only in easy mode) */}
                      {difficulty === "easy" && easySurahsList.length > 0 && (
                        <>
                          <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                            ⭐ {t("surah.recommended")}
                          </p>
                          {easySurahsList
                            .filter(s => filteredSurahs.some(fs => fs.number === s.number))
                            .map((s) => (
                            <button key={`rec-${s.number}`}
                              onClick={() => handleSelectSurah(s)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary/5 transition-colors text-left border-b border-border">
                              <span className="w-7 h-7 rounded-lg bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                                {s.number}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-arabic text-base text-foreground">{s.nameArabic}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{s.frenchName} · {s.versesCount} {t("detail.verses")}</p>
                              </div>
                              <span className="text-[10px] text-primary">⭐</span>
                            </button>
                          ))}
                          <div className="h-px bg-border mx-3 my-1" />
                        </>
                      )}

                      {filteredSurahs.map((s) => (
                        <button key={s.number}
                          onClick={() => handleSelectSurah(s)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left border-b border-border last:border-b-0">
                          <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                            {s.number}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-arabic text-lg text-foreground">{s.nameArabic}</p>
                            <p className="text-xs text-muted-foreground truncate">{s.frenchName} · {s.versesCount} {t("detail.verses")}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {browseMode === "all" && (
            <div>
              {/* Search bar */}
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une sourate..."
                  className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {loadingSurah && (
                <div className="flex items-center justify-center py-8 gap-2 text-primary">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-sm font-medium">Chargement...</span>
                </div>
              )}

              {!loadingSurah && (
                <div className="space-y-1.5 max-h-[50vh] overflow-y-auto">
                  {filteredAllSurahs.map((s, i) => (
                    <motion.button
                      key={s.number}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.01, 0.5) }}
                      onClick={() => handleSelectSurahFromApi(s)}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl hover:bg-accent/30 transition-colors text-left"
                    >
                      <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                        {s.number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-arabic text-lg text-foreground">{s.nameArabic}</span>
                          <span className="text-[10px] text-muted-foreground">{s.revelationType}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{s.name} · {s.englishName} · {s.versesCount} versets</p>
                      </div>
                    </motion.button>
                  ))}
                  {filteredAllSurahs.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-6">Aucun résultat</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ─── Mode Toggle Card ─── */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t("dictation.title")}</p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setRecitationMode("aya")}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  recitationMode === "aya" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-accent/50"
                }`}>
                <BookOpen size={14} />
                {t("dictation.modeAya")}
              </button>
              <button
                onClick={() => setRecitationMode("dictation")}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  recitationMode === "dictation" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-accent/50"
                }`}>
                <PenTool size={14} />
                {t("dictation.modeSurah")}
              </button>
              <button
                onClick={() => setRecitationMode("readOnly")}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  recitationMode === "readOnly" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-accent/50"
                }`}>
                <Headphones size={14} />
                {t("quran.readOnly")}
              </button>
              <button
                onClick={() => setRecitationMode("hifz")}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  recitationMode === "hifz" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-accent/50"
                }`}>
                <Award size={14} />
                {t("hifz.modeLabel")}
              </button>
                <button
                onClick={() => setRecitationMode("tahaddi")}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  recitationMode === "tahaddi" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-accent/50"
                }`}>
                <Target size={14} />
                {t("tahaddi.modeLabel")}
              </button>
              <button
                onClick={() => setRecitationMode("findAyah")}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  recitationMode === "findAyah" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-accent/50"
                }`}>
                <Search size={14} />
                {t("findAyah.modeLabel")}
              </button>
              <button
                onClick={() => setRecitationMode("mushaf")}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  recitationMode === "mushaf" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-accent/50"
                }`}>
                <Bookmark size={14} />
                {t("mushaf.modeLabel")}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ═══ FIND AYAH MODE ═══ */}
      {recitationMode === "findAyah" && !selectedSurah && (
        <FindAyah
          onBack={() => setRecitationMode("aya")}
          onOpenSurah={async (surahNumber, ayahNumber) => {
            // Load the surah and switch to readOnly mode
            const local = surahs.find(s => s.number === surahNumber);
            if (local) {
              handleSelectSurah(local);
              setRecitationMode("readOnly");
            } else {
              setLoadingSurah(true);
              try {
                const full = await fetchFullSurah(surahNumber);
                handleSelectSurah(full);
                setRecitationMode("readOnly");
              } catch (e) {
                console.error("Failed to load surah", e);
              } finally {
                setLoadingSurah(false);
              }
            }
          }}
          onStartHifz={async (surahNumber) => {
            const local = surahs.find(s => s.number === surahNumber);
            if (local) {
              handleSelectSurah(local);
              setRecitationMode("hifz");
            } else {
              setLoadingSurah(true);
              try {
                const full = await fetchFullSurah(surahNumber);
                handleSelectSurah(full);
                setRecitationMode("hifz");
              } catch (e) {
                console.error("Failed to load surah", e);
              } finally {
                setLoadingSurah(false);
              }
            }
          }}
          isChildMode={isChildMode}
        />
      )}
      {/* ═══ MUSHAF MODE ═══ */}
      {selectedSurah && recitationMode === "mushaf" && (
        <MushafReader
          surah={selectedSurah}
          translations={translations}
          isArabicOnly={isArabicOnly}
          onBack={handleNewSurah}
          t={t}
          startAtAyah={mushafStartAyah}
        />
      )}

      {/* ═══ DICTATION MODE ═══ */}
      {selectedSurah && recitationMode === "dictation" && !surahFinished && (
        <div className="px-6">
          <DictationMode
            surah={selectedSurah}
            onBack={handleNewSurah}
            isChildMode={isChildMode}
          />
        </div>
      )}

      {/* ═══ READ-ONLY MODE ═══ */}
      {selectedSurah && recitationMode === "readOnly" && (
        <ReadOnlyMode
          surah={selectedSurah}
          translations={translations}
          isArabicOnly={isArabicOnly}
          lang={lang}
          onBack={handleNewSurah}
          isChildMode={isChildMode}
          t={t}
        />
      )}

      {/* ═══ HIFZ CONTROL MODE ═══ */}
      {selectedSurah && recitationMode === "hifz" && (
        <HifzControl
          surah={selectedSurah}
          onBack={handleNewSurah}
          isChildMode={isChildMode}
          t={t}
        />
      )}

      {/* ═══ TAHADDI MODE ═══ */}
      {selectedSurah && recitationMode === "tahaddi" && (
        <TahaddiMode
          surah={selectedSurah}
          onBack={handleNewSurah}
          isChildMode={isChildMode}
          t={t}
        />
      )}

      {/* ═══ AYA LIST + ACTIVE AYA ═══ */}
      {selectedSurah && recitationMode === "aya" && !surahFinished && (
        <div className="px-6 space-y-4">
          {/* Surah header */}
          <div className="text-center mb-2">
            <p className="font-arabic text-2xl text-primary">{selectedSurah.nameArabic}</p>
            <p className="text-xs text-muted-foreground">{selectedSurah.frenchName} · {t("aya.progress")} {currentAya + 1}/{selectedSurah.ayahs.length}</p>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${((currentAya + (ayaPhase === "result" ? 1 : 0)) / selectedSurah.ayahs.length) * 100}%` }}
            />
          </div>

          {/* Aya cards - scrollable list */}
          <div className="space-y-3">
            {selectedSurah.ayahs.map((ayah, i) => {
              const isActive = i === currentAya;
              const scoreForAya = scores.find((s) => s.ayaIndex === i);
              const isDone = !!scoreForAya;
              const isCorrect = scoreForAya?.correct;

              return (
                <motion.div
                  key={ayah.number}
                  id={`aya-${i}`}
                  initial={isActive ? { opacity: 0, y: 10 } : { opacity: 1 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-card border-2 rounded-2xl transition-all ${
                    isActive
                      ? "border-primary shadow-lg shadow-primary/10"
                      : isDone
                        ? isCorrect
                          ? "border-success/50 bg-success/5"
                          : "border-destructive/50 bg-destructive/5"
                        : "border-border opacity-60"
                  } ${isActive ? (isChildMode ? "p-6" : "p-5") : "p-3"}`}
                >
                  {/* Aya number + status */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`${isActive ? (isChildMode ? "w-10 h-10 text-base" : "w-8 h-8 text-sm") : "w-6 h-6 text-[10px]"} rounded-full flex items-center justify-center font-bold ${
                      isDone
                        ? isCorrect ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                        : isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {isDone ? (isCorrect ? "✓" : "✗") : ayah.number}
                    </span>
                    {isDone && (
                      <span className={`text-xs font-bold ${isCorrect ? "text-success" : "text-destructive"}`}>
                        {scoreForAya.score}%
                      </span>
                    )}
                    {isActive && ayaPhase === "playing" && (
                      <Volume2 size={16} className="text-primary animate-pulse" />
                    )}
                  </div>

                  {/* Arabic text */}
                  <p className={`arabic-text ${isActive ? (isChildMode ? "text-3xl" : "text-2xl") : "text-lg"} text-foreground mb-1 ${
                    isActive && ayaPhase === "reciting" ? "blur-sm select-none transition-all duration-500" : ""
                  }`}>
                    {ayah.arabic}
                  </p>

                  {/* Transliteration + translation only for active aya */}
                  {isActive && (
                    <>
                      <p className={`${bodyTextClass} text-primary/70 italic mb-1`}>
                        {ayah.transliteration}
                      </p>
                      <p className={`${bodyTextClass} text-muted-foreground`}>
                        {lang === "ar" ? ayah.translation : (translations[i] || ayah.translation)}
                      </p>
                    </>
                  )}

                  {/* ── Active aya controls ── */}
                  {isActive && ayaPhase === "idle" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex justify-center">
                      <button
                        onClick={() => playAyaAudio(i)}
                        className={`flex items-center gap-2 ${isChildMode ? "px-6 py-3 text-lg" : "px-5 py-2.5"} rounded-2xl bg-primary text-primary-foreground font-semibold active:scale-[0.97] transition-transform`}
                      >
                        <Play size={18} />
                        {t("aya.playAya")}
                      </button>
                    </motion.div>
                  )}

                  {/* Playing indicator */}
                  {isActive && ayaPhase === "playing" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="mt-4 flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2 text-primary">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((b) => (
                            <motion.div key={b}
                              animate={{ scaleY: [1, 2, 1] }}
                              transition={{ duration: 0.6, delay: b * 0.15, repeat: Infinity }}
                              className="w-1 h-3 bg-primary rounded-full"
                            />
                          ))}
                        </div>
                        <span className={`${bodyTextClass} font-medium`}>
                          {repeatCount > 0 ? `${t("aya.repeatX3")} (${repeatCount})` : "..."}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Reciting UI */}
                  {isActive && ayaPhase === "reciting" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="mt-4 space-y-4">
                      <p className={`text-center font-semibold ${bodyTextClass} text-secondary`}>
                        {t("aya.reciteNow")}
                      </p>

                      {!voice.isSupported ? (
                        <div className="bg-destructive/10 text-destructive rounded-xl p-3 text-center text-sm">
                          <AlertCircle size={16} className="inline mr-1" />
                          {t("aya.voiceUnsupported")}
                        </div>
                      ) : voice.permissionDenied || micError === "not-allowed" ? (
                        <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-center space-y-2">
                          <AlertCircle size={20} className="inline" />
                          <p className="text-sm font-semibold">{t("aya.micDenied") || "Microphone permission denied"}</p>
                          <p className="text-xs opacity-80">{t("aya.micDeniedHint") || "Go to your browser settings and allow microphone access for this site, then try again."}</p>
                          <button
                            onClick={() => { setMicError(null); voice.start(); }}
                            className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold"
                          >
                            {t("aya.retryMic") || "Retry"}
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={voice.isListening ? voice.stop : voice.start}
                            className={`${isChildMode ? "w-20 h-20" : "w-16 h-16"} rounded-full flex items-center justify-center transition-all ${
                              voice.isListening
                                ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/30 animate-pulse"
                                : "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                            }`}
                          >
                            {voice.isListening ? <MicOff size={isChildMode ? 32 : 26} /> : <Mic size={isChildMode ? 32 : 26} />}
                          </motion.button>
                          <p className={`text-xs text-muted-foreground`}>
                            {voice.isListening ? t("aya.listening") : t("aya.tapToRecite")}
                          </p>
                        </div>
                      )}

                      {/* Live transcript */}
                      {currentTranscript && (
                        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                          className="bg-accent/50 rounded-xl p-3">
                          <p className={`arabic-text ${isChildMode ? "text-xl" : "text-lg"} text-foreground`}>
                            {currentTranscript}
                          </p>
                        </motion.div>
                      )}

                      {/* Validate + Skip */}
                      <div className="flex items-center justify-center gap-3">
                        {currentTranscript && (
                          <button onClick={handleValidateRecitation}
                            className={`flex items-center gap-2 bg-success text-success-foreground ${isChildMode ? "px-6 py-3" : "px-4 py-2.5"} rounded-xl font-semibold text-sm`}>
                            <CheckCircle2 size={16} />
                            {t("detail.validate")}
                          </button>
                        )}
                        <button onClick={handleSkipAya}
                          className="text-xs text-muted-foreground underline">
                          {t("aya.skip")}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Result for this aya */}
                  {isActive && ayaPhase === "result" && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="mt-4 space-y-3">
                      {/* Feedback banner */}
                      <div className={`rounded-xl p-4 text-center font-bold ${
                        scores[scores.length - 1]?.correct
                          ? "bg-success/15 text-success"
                          : "bg-destructive/15 text-destructive"
                      }`}>
                        <p className={`${isChildMode ? "text-xl" : "text-lg"}`}>
                          {scores[scores.length - 1]?.correct
                            ? (isChildMode ? "🌟 Bravo ! Correct !" : t("aya.correct"))
                            : (isChildMode ? "📖 Réessaie !" : t("aya.incorrect"))}
                        </p>
                        <p className="text-sm mt-1">
                          {scores[scores.length - 1]?.score}%
                        </p>
                      </div>

                      {/* Auto-next countdown */}
                      {autoNextTimer !== null && autoNextTimer > 0 && (
                        <p className="text-center text-xs text-muted-foreground">
                          {t("aya.autoNext")} {autoNextTimer}s
                        </p>
                      )}

                      {/* Retry / Skip buttons for incorrect */}
                      {!scores[scores.length - 1]?.correct && (
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={handleRetryAya}
                            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-sm">
                            <RotateCcw size={14} />
                            {t("aya.retry")}
                          </button>
                          <button onClick={() => goToNextAya(scores)}
                            className="text-xs text-muted-foreground underline">
                            {t("aya.skip")}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ SURAH FINISHED ═══ */}
      {selectedSurah && surahFinished && (
        <div className="px-6 space-y-5">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="text-center py-6">
            <div className={`${isChildMode ? "w-32 h-32 text-4xl" : "w-24 h-24 text-3xl"} rounded-full mx-auto flex items-center justify-center font-bold mb-4 ${
              totalScore >= 80 ? "bg-success/15 text-success" : totalScore >= 50 ? "bg-secondary/15 text-secondary" : "bg-destructive/15 text-destructive"
            }`}>
              {totalScore}%
            </div>

            <h2 className={`${isChildMode ? "text-2xl" : "text-xl"} font-bold text-foreground`}>
              {t("aya.surahComplete")}
            </h2>

            <p className="text-muted-foreground text-sm mt-1">
              {perfectCount} {t("aya.perfectAyas")}
            </p>

            {/* Badges */}
            {badges.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {badges.map((badge, i) => (
                  <motion.div key={i}
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3 + i * 0.2, type: "spring" }}
                    className="bg-secondary/15 text-secondary px-4 py-2 rounded-full text-sm font-bold">
                    {badge}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Streak */}
            <div className="flex items-center justify-center gap-2 mt-4 text-secondary">
              <Flame size={18} />
              <span className="text-sm font-bold">{streak.currentStreak} {t("recitation.daysOfStreak")}</span>
            </div>
          </motion.div>

          {/* Error list */}
          {errorAyas.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {t("aya.errors")} ({errorAyas.length})
              </h3>
              <div className="space-y-2">
                {errorAyas.map((err) => {
                  const ayah = selectedSurah.ayahs[err.ayaIndex];
                  return (
                    <div key={err.ayaIndex}
                      className="bg-card border border-destructive/30 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-destructive">
                          {t("aya.progress")} {ayah.number} — {err.score}%
                        </span>
                        <button
                          onClick={() => {
                            fetch(`https://api.alquran.cloud/v1/ayah/${selectedSurah.number}:${ayah.number}/ar.husary`)
                              .then((r) => r.json())
                              .then((data) => {
                                if (data.data?.audio) new Audio(data.data.audio).play();
                              }).catch(() => {});
                          }}
                          className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          <Volume2 size={12} />
                        </button>
                      </div>
                      <p className="arabic-text text-lg text-destructive">{ayah.arabic}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 pb-6">
            <button onClick={handleRestart}
              className={`flex-1 flex items-center justify-center gap-2 ${isChildMode ? "py-4 text-lg" : "py-3.5"} rounded-2xl border-2 border-border text-foreground font-semibold active:scale-[0.98] transition-transform`}>
              <RotateCcw size={18} />
              {t("recitation.restart")}
            </button>
            <button onClick={handleNewSurah}
              className={`flex-1 flex items-center justify-center gap-2 ${isChildMode ? "py-4 text-lg" : "py-3.5"} rounded-2xl bg-primary text-primary-foreground font-semibold active:scale-[0.98] transition-transform`}>
              {t("recitation.changeSurah")}
            </button>
          </div>
        </div>
      )}

      {/* ═══ BOTTOM CONTROLS BAR ═══ */}
      {selectedSurah && recitationMode === "aya" && !surahFinished && (
        <div className="fixed bottom-16 left-0 right-0 z-40">
          <div className="max-w-lg mx-auto px-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-card border border-border rounded-2xl shadow-xl p-3 flex items-center justify-between gap-2"
            >
              {/* Prev */}
              <button onClick={goToPrevAya} disabled={currentAya === 0}
                className="w-10 h-10 rounded-full bg-muted text-foreground flex items-center justify-center disabled:opacity-30">
                <SkipBack size={18} />
              </button>

              {/* Play / Pause */}
              <button onClick={() => {
                if (ayaPhase === "idle") playAyaAudio(currentAya);
                else handlePauseResume();
              }}
                className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                {ayaPhase === "playing" && !isPaused ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
              </button>

              {/* Next */}
              <button onClick={goToNextAyaManual} disabled={currentAya >= (selectedSurah?.ayahs.length || 1) - 1}
                className="w-10 h-10 rounded-full bg-muted text-foreground flex items-center justify-center disabled:opacity-30">
                <SkipForward size={18} />
              </button>

              {/* Repeat x3 */}
              <button onClick={handleRepeatX3}
                className="w-10 h-10 rounded-full bg-muted text-foreground flex items-center justify-center">
                <Repeat size={16} />
              </button>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
