import { useState, useRef, useCallback, useEffect } from "react";
import useAntiDoubleAudio from "@/hooks/useAntiDoubleAudio";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, Mic, MicOff, SkipForward, SkipBack, RotateCcw,
  ChevronDown, Flame, Award, Volume2, CheckCircle2, XCircle,
  Repeat, AlertCircle, BookOpen, PenTool, Search, Loader2, Headphones, Target, Bookmark,
} from "lucide-react";
import { surahs, getSurahsByDifficulty, type Surah } from "@/data/surahs";
import { useProgress } from "@/hooks/useProgress";
import { useClassSuccessShare } from "@/hooks/useClassSuccessShare";
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
import AyahRenderer from "@/components/AyahRenderer";
import MushafReader from "@/components/MushafReader";
import ActiveChildBanner from "@/components/ActiveChildBanner";
import { fetchSurahList, fetchFullSurah, type SurahMeta } from "@/lib/quranData";
import { useSearchParams, useNavigate } from "react-router-dom";

// ─── Types ──────────────────────────────────────────────────
type AyaPhase = "idle" | "playing" | "reciting" | "result";
type RecitationMode = "aya" | "dictation" | "readOnly" | "hifz" | "tahaddi" | "findAyah" | "mushaf";

// ─── Easy surahs for beginners / first-time users ───────────
const EASY_SURAH_NUMBERS = [114, 113, 112, 108, 111, 110, 109, 107, 106, 105];
const LAST_USED_KEY = "quranEasyLastSurah";
const LAST_MODE_KEY = "quranEasyLastMode";

interface AyaScore {
  ayaIndex: number;
  score: number;
  correct: boolean; // >90%
  transcript: string;
}

// ─── Component ──────────────────────────────────────────────
export default function Quran() {
  const { updateSurahProgress } = useProgress();
  const { shareSuccess } = useClassSuccessShare();
  const { playSafely: safePlay } = useAntiDoubleAudio();
  const { isChildMode, earnSticker } = useChildMode();
  const { streak, recordSession, hasPracticedToday } = useStreak();
  const { t, lang } = useLanguage();
  const { resolvedEditionId, isArabicOnly } = useTranslationPreference();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL params for deep-linking (from bookmarks)
  const urlSurahParam = searchParams.get("surah");
  const urlAyahParam = searchParams.get("ayah");
  const urlModeParam = searchParams.get("mode");

  // Selection
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recitationMode, setRecitationMode] = useState<RecitationMode>(() => {
    try {
      const stored = localStorage.getItem(LAST_MODE_KEY) as RecitationMode | null;
      if (stored && ["aya", "dictation", "readOnly", "hifz", "tahaddi"].includes(stored)) return stored;
    } catch {}
    return "aya";
  });
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

  // Auto-resume last used surah if no URL params
  useEffect(() => {
    if (!urlSurahParam && !urlModeParam && !selectedSurah && lastUsedSurah) {
      handleSelectSurah(lastUsedSurah);
    }
  }, [lastUsedSurah]);

  // Persist recitation mode
  useEffect(() => {
    if (["aya", "dictation", "readOnly", "hifz", "tahaddi"].includes(recitationMode)) {
      try { localStorage.setItem(LAST_MODE_KEY, recitationMode); } catch {}
    }
  }, [recitationMode]);

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

  // Cleanup on unmount — stop audio completely
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.src = "";
        audioRef.current = null;
      }
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
    shareSuccess(selectedSurah.number, avgScore);
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
      <div className="px-6 pt-14 pb-3">
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
            <div className="flex items-center gap-1 bg-secondary/15 text-secondary px-2.5 py-1 rounded-full">
              <span className="text-sm">🔥</span>
              <span className="text-sm font-bold">{streak.currentStreak}</span>
              {hasPracticedToday && <span className="text-xs text-green-500">✓</span>}
            </div>
          </div>
        </div>
        <div className="mt-1">
          <ActiveChildBanner />
        </div>
      </div>

      {/* ═══ SELECTION ═══ */}
      {!selectedSurah && (
        <div className="px-6 space-y-3">
          {/* ─── Modes list (full width, compact) ─── */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-1.5">
            {[
              { mode: "aya" as RecitationMode, emoji: "🎤", label: t("mode.dictVerse"), desc: t("mode.dictVerseDesc") },
              { mode: "dictation" as RecitationMode, emoji: "✍️", label: t("mode.dictSurah"), desc: t("mode.dictSurahDesc") },
              { mode: "tahaddi" as RecitationMode, emoji: "🏆", label: t("mode.tahaddi"), desc: t("mode.tahaddiDesc") },
              { mode: "hifz" as RecitationMode, emoji: "📖", label: t("mode.control"), desc: t("mode.controlDesc") },
              { mode: "findAyah" as RecitationMode, emoji: "🔍", label: t("mode.findAyah"), desc: t("mode.findAyahDesc") },
            ].map((item, i) => (
              <motion.button
                key={item.mode}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => {
                  if (item.mode === "findAyah") { navigate("/find-ayah"); return; }
                  setRecitationMode(item.mode);
                  if (lastUsedSurah) { handleSelectSurah(lastUsedSurah); }
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  recitationMode === item.mode
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border border-border text-foreground hover:bg-accent/50"
                }`}
              >
                <span className="text-base">{item.emoji}</span>
                <div className="flex-1 text-left">
                  <span className="block">{item.label}</span>
                  <span className={`block text-[10px] font-normal ${recitationMode === item.mode ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{item.desc}</span>
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* ─── Sourate + Difficulty on same row ─── */}
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-shrink-0">{t("mode.surah")}</p>
              <div className="flex gap-1 flex-1">
                {(["easy", "medium", "hard"] as const).map((d) => (
                  <button key={d}
                    onClick={() => { setDifficulty(d); setBrowseMode("local"); }}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                      browseMode === "local" && difficulty === d
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent/50"
                    }`}>
                    {d === "easy" ? t("recitation.easy") :
                     d === "medium" ? t("recitation.medium") :
                     t("recitation.hard")}
                  </button>
                ))}
                <button
                  onClick={() => setBrowseMode(browseMode === "all" ? "local" : "all")}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    browseMode === "all"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent/50"
                  }`}>
                  {t("mode.all")}
                </button>
              </div>
            </div>

            {/* Surah dropdown (local) */}
            {browseMode === "local" && (
              <div className="relative">
                <button onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full flex items-center justify-between bg-muted rounded-lg px-3 py-2.5 text-left">
                  <span className="text-sm text-muted-foreground">{t("recitation.selectSurah")}</span>
                  <ChevronDown size={16} className={`text-muted-foreground transition-transform ${showDropdown ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {difficulty === "easy" && easySurahsList.length > 0 && (
                        <>
                          <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-primary">⭐ {t("surah.recommended")}</p>
                          {easySurahsList.filter(s => filteredSurahs.some(fs => fs.number === s.number)).map((s) => (
                            <button key={`rec-${s.number}`} onClick={() => handleSelectSurah(s)}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary/5 text-left border-b border-border">
                              <span className="w-6 h-6 rounded-md bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">{s.number}</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-arabic text-sm text-foreground">{s.nameArabic}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{s.frenchName} · {s.versesCount} v.</p>
                              </div>
                            </button>
                          ))}
                          <div className="h-px bg-border mx-2 my-0.5" />
                        </>
                      )}
                      {filteredSurahs.map((s) => (
                        <button key={s.number} onClick={() => handleSelectSurah(s)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-accent/50 text-left border-b border-border last:border-b-0">
                          <span className="w-7 h-7 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{s.number}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-arabic text-base text-foreground">{s.nameArabic}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{s.frenchName} · {s.versesCount} v.</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Browse all 114 */}
            {browseMode === "all" && (
              <div>
                <div className="relative mb-2">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("mode.search")} className="w-full bg-muted rounded-lg pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary" />
                </div>
                {loadingSurah && (
                  <div className="flex items-center justify-center py-6 gap-2 text-primary">
                    <Loader2 size={18} className="animate-spin" /><span className="text-xs">{t("mode.loading")}</span>
                  </div>
                )}
                {!loadingSurah && (
                  <div className="space-y-1 max-h-[40vh] overflow-y-auto">
                    {filteredAllSurahs.map((s, i) => (
                      <motion.button key={s.number}
                        initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.01, 0.3) }}
                        onClick={() => handleSelectSurahFromApi(s)}
                        className="w-full flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg hover:bg-accent/30 text-left">
                        <span className="w-7 h-7 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{s.number}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-arabic text-sm text-foreground">{s.nameArabic}</span>
                            <span className="text-[9px] text-muted-foreground">{s.revelationType}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">{s.name} · {s.versesCount} v.</p>
                        </div>
                      </motion.button>
                    ))}
                    {filteredAllSurahs.length === 0 && (
                      <p className="text-center text-xs text-muted-foreground py-4">{t("mode.noResult")}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* ─── Reprendre (Last Used) ─── */}
          {lastUsedSurah && browseMode === "local" && (
            <motion.button initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              onClick={() => handleSelectSurah(lastUsedSurah)}
              className="w-full flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-3 py-2.5 text-left hover:bg-primary/10 transition-colors">
              <span className="w-8 h-8 rounded-lg bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">{lastUsedSurah.number}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-primary font-semibold uppercase tracking-wider">{t("surah.lastUsed")}</p>
                <p className="font-arabic text-sm text-foreground">{lastUsedSurah.nameArabic}</p>
              </div>
              <span className="text-sm font-extrabold text-primary-foreground bg-primary px-5 py-2.5 rounded-xl shrink-0 shadow-lg animate-pulse">
                {t("mode.resume")} →
              </span>
            </motion.button>
          )}

          {/* ─── Lecture seule (full width, bottom) ─── */}
          <motion.button
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            onClick={() => { setRecitationMode("readOnly"); if (lastUsedSurah) handleSelectSurah(lastUsedSurah); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              recitationMode === "readOnly"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card border border-border text-foreground hover:bg-accent/50"
            }`}>
            <span className="text-base">🔊</span>
            <div className="flex-1 text-left">
              <span className="block">{t("mode.readOnly")}</span>
              <span className={`block text-[10px] font-normal ${recitationMode === "readOnly" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{t("mode.readOnlyDesc")}</span>
            </div>
          </motion.button>

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
            onRequestNextSurah={() => {
              if (selectedSurah.number < 114) {
                const nextNum = selectedSurah.number + 1;
                const local = surahs.find(s => s.number === nextNum);
                if (local) {
                  handleSelectSurah(local);
                  setRecitationMode("dictation");
                } else {
                  fetchFullSurah(nextNum).then((full) => {
                    handleSelectSurah(full);
                    setRecitationMode("dictation");
                  }).catch(console.error);
                }
              }
            }}
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
          onRequestNextSurah={() => {
            // Auto-advance to next surah for continuous playback
            if (selectedSurah.number < 114) {
              const nextNum = selectedSurah.number + 1;
              const local = surahs.find(s => s.number === nextNum);
              if (local) {
                handleSelectSurah(local);
                setRecitationMode("readOnly");
              } else {
                fetchFullSurah(nextNum).then((full) => {
                  handleSelectSurah(full);
                  setRecitationMode("readOnly");
                }).catch(console.error);
              }
            }
          }}
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

      {/* ═══ AYA MODE (NOUVEAU TARTEEL AYA PAR AYA) ═══ */}
      {selectedSurah && recitationMode === "aya" && !surahFinished && (
        <AyahRenderer
          surah={selectedSurah}
          translations={translations}
          lang={lang}
          isChildMode={isChildMode}
          onBack={handleNewSurah}
          onFinish={(finalScores) => {
            setScores(finalScores);
            finishSurah(finalScores);
          }}
        />
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
                                if (data.data?.audio) safePlay(data.data.audio);
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

    </div>
  );
}
