import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import useAntiDoubleAudio from "@/hooks/useAntiDoubleAudio";
import { analyzeAyahTajwid, type TajwidWord } from "@/data/tajwidRules";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, RotateCcw, Volume2, ArrowLeft, ChevronRight, AlertCircle, BookOpen, Flame, Target,
} from "lucide-react";
import { type Surah } from "@/data/surahs";
import { useVoiceRecognition, compareSurahDictation } from "@/hooks/useVoiceRecognition";
import { useLiveWordFeedback } from "@/hooks/useLiveWordFeedback";
import { useLanguage } from "@/hooks/useLanguage";
import { useXP } from "@/hooks/useXP";
import ReciterPicker, { getStoredReciter, type ReciterOption } from "@/components/ReciterPicker";

// ─── Constants ──────────────────────────────────────────────
const BLOCK_SIZE = 10; // ayahs per block for large surahs
const SMALL_SURAH_THRESHOLD = 30;

// ─── Types ──────────────────────────────────────────────────
type Phase = "overview" | "listen" | "recording" | "feedback" | "blockSummary" | "finalSummary";

interface AyahFeedbackData {
  ayahIdx: number;
  score: number;
  wordResults: { word: string; status: "correct" | "incorrect" | "missing" | "extra" }[];
  tajwidErrors: { word: string; ruleName: string }[];
}

interface BlockDef {
  start: number; // 0-based index
  end: number;   // 0-based inclusive
  label: string;
}

interface FullSurahDictationProps {
  surah: Surah;
  onBack: () => void;
  isChildMode: boolean;
  onRequestNextSurah?: () => void;
}

// ─── Waqf symbols ───────────────────────────────────────────
const WAQF_MARKERS: Record<string, string> = {
  "ۖ": "ۖ", "ۗ": "ۗ", "ۘ": "ۘ", "ۙ": "ۙ", "ۚ": "ۚ", "ۛ": "ۛ",
  "ۜ": "ۜ", "۩": "۩",
};

function hasWaqfMarker(text: string): string | null {
  for (const marker of Object.keys(WAQF_MARKERS)) {
    if (text.includes(marker)) return marker;
  }
  return null;
}

// ─── Component ──────────────────────────────────────────────
export default function FullSurahDictation({ surah, onBack, isChildMode, onRequestNextSurah }: FullSurahDictationProps) {
  const { t } = useLanguage();
  const { playSafely: safePlay } = useAntiDoubleAudio();
  const xp = useXP();

  // Blocks
  const blocks: BlockDef[] = useMemo(() => {
    const total = surah.ayahs.length;
    if (total <= SMALL_SURAH_THRESHOLD) {
      return [{ start: 0, end: total - 1, label: `Ayat 1–${total}` }];
    }
    const result: BlockDef[] = [];
    for (let i = 0; i < total; i += BLOCK_SIZE) {
      const end = Math.min(i + BLOCK_SIZE - 1, total - 1);
      result.push({ start: i, end, label: `Ayat ${i + 1}–${end + 1}` });
    }
    return result;
  }, [surah]);

  const [currentBlockIdx, setCurrentBlockIdx] = useState(0);
  const [currentAyahIdx, setCurrentAyahIdx] = useState(0); // relative to block start
  const [phase, setPhase] = useState<Phase>("overview");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [micError, setMicError] = useState<string | null>(null);
  const [reciter, setReciter] = useState<ReciterOption>(getStoredReciter);
  const [blockResults, setBlockResults] = useState<AyahFeedbackData[]>([]);
  const [allResults, setAllResults] = useState<AyahFeedbackData[]>([]);
  const [hasListened, setHasListened] = useState(false);

  const preListenAudioRef = useRef<HTMLAudioElement | null>(null);
  const xpAwardedRef = useRef<Set<string>>(new Set());

  const currentBlock = blocks[currentBlockIdx];
  const absoluteAyahIdx = currentBlock.start + currentAyahIdx;
  const currentAyah = surah.ayahs[absoluteAyahIdx];
  const blockAyahCount = currentBlock.end - currentBlock.start + 1;

  // Live feedback
  const singleAyahTexts = useMemo(() => currentAyah ? [currentAyah.arabic] : [], [currentAyah]);
  const { liveWords, totalMatched } = useLiveWordFeedback(singleAyahTexts, liveTranscript);

  const voice = useVoiceRecognition({
    lang: "ar-SA",
    continuous: true,
    onResult: (transcript) => setLiveTranscript(transcript),
    onError: (error) => { if (error === "not-allowed") setMicError("not-allowed"); },
  });

  useEffect(() => {
    return () => {
      if (preListenAudioRef.current) { preListenAudioRef.current.pause(); preListenAudioRef.current = null; }
    };
  }, []);

  // ─── Play current ayah audio ───
  const playCurrentAyah = useCallback(() => {
    if (!currentAyah) return;
    if (preListenAudioRef.current) { preListenAudioRef.current.pause(); preListenAudioRef.current = null; }
    fetch(`https://api.alquran.cloud/v1/ayah/${surah.number}:${currentAyah.number}/${reciter.apiEdition}`)
      .then(r => r.json())
      .then(data => {
        if (data.data?.audio) {
          const audio = new Audio(data.data.audio);
          preListenAudioRef.current = audio;
          audio.onended = () => { preListenAudioRef.current = null; setHasListened(true); };
          audio.play().catch(() => setHasListened(true));
        } else { setHasListened(true); }
      })
      .catch(() => setHasListened(true));
  }, [surah.number, currentAyah, reciter]);

  // ─── Start block ───
  const startBlock = useCallback((blockIdx: number) => {
    setCurrentBlockIdx(blockIdx);
    setCurrentAyahIdx(0);
    setBlockResults([]);
    setHasListened(false);
    setLiveTranscript("");
    setPhase("listen");
  }, []);

  // ─── Start recording ───
  const startRecording = useCallback(() => {
    setLiveTranscript("");
    setMicError(null);
    setPhase("recording");
    voice.start();
  }, [voice]);

  // ─── Stop recording & compute feedback ───
  const stopRecording = useCallback(() => {
    voice.stop();
    if (!currentAyah) return;

    const result = compareSurahDictation([currentAyah.arabic], liveTranscript);
    const wordResults = result.wordResults.map(wr => ({
      word: wr.word,
      status: (wr.status === "correct" ? "correct" : wr.status === "missing" ? "missing" : wr.status === "extra" ? "extra" : "incorrect") as "correct" | "incorrect" | "missing" | "extra",
    }));

    // Tajwid analysis for incorrect words
    const tajwidWords = analyzeAyahTajwid(currentAyah.arabic);
    const tajwidErrors: { word: string; ruleName: string }[] = [];
    wordResults.forEach((wr, i) => {
      if (wr.status !== "correct" && tajwidWords[i]?.rules?.length > 0) {
        tajwidErrors.push({ word: wr.word, ruleName: tajwidWords[i].rules[0].name });
      }
    });

    const correctCount = wordResults.filter(w => w.status === "correct").length;
    const totalWords = currentAyah.arabic.split(/\s+/).filter(Boolean).length;
    const score = Math.round((correctCount / Math.max(1, totalWords)) * 100);

    const feedbackData: AyahFeedbackData = { ayahIdx: absoluteAyahIdx, score, wordResults, tajwidErrors };
    setBlockResults(prev => [...prev, feedbackData]);

    // XP
    const xpKey = `${currentBlockIdx}-${currentAyahIdx}`;
    if (!xpAwardedRef.current.has(xpKey) && score >= 50) {
      xpAwardedRef.current.add(xpKey);
      xp.addXP(Math.max(1, Math.round(correctCount / 3)));
    }

    setPhase("feedback");
  }, [voice, currentAyah, liveTranscript, absoluteAyahIdx, currentBlockIdx, currentAyahIdx]);

  // ─── Next ayah in block ───
  const nextAyah = useCallback(() => {
    if (currentAyahIdx + 1 >= blockAyahCount) {
      // Block finished
      setAllResults(prev => [...prev, ...blockResults.filter(r => !prev.some(p => p.ayahIdx === r.ayahIdx)), blockResults[blockResults.length - 1]].filter((v, i, a) => a.findIndex(x => x.ayahIdx === v.ayahIdx) === i));
      setPhase("blockSummary");
    } else {
      setCurrentAyahIdx(prev => prev + 1);
      setLiveTranscript("");
      setHasListened(false);
      setPhase("listen");
    }
  }, [currentAyahIdx, blockAyahCount, blockResults]);

  // ─── Retry ayah ───
  const retryAyah = useCallback(() => {
    setLiveTranscript("");
    setHasListened(false);
    setPhase("listen");
  }, []);

  // ─── Next block ───
  const goNextBlock = useCallback(() => {
    if (currentBlockIdx + 1 >= blocks.length) {
      // All blocks done
      const merged = [...allResults, ...blockResults].filter((v, i, a) => a.findIndex(x => x.ayahIdx === v.ayahIdx) === i);
      setAllResults(merged);
      setPhase("finalSummary");
    } else {
      startBlock(currentBlockIdx + 1);
    }
  }, [currentBlockIdx, blocks.length, allResults, blockResults, startBlock]);

  // ─── Computed summary data ───
  const computeSummary = (results: AyahFeedbackData[]) => {
    if (results.length === 0) return { avgScore: 0, tajwidScore: 0, worstAyahs: [], topTajwidErrors: [], tips: [] };
    const avgScore = Math.round(results.reduce((a, r) => a + r.score, 0) / results.length);

    // Tajwid score: % of words without tajwid errors
    const totalWords = results.reduce((a, r) => a + r.wordResults.length, 0);
    const tajwidErrorCount = results.reduce((a, r) => a + r.tajwidErrors.length, 0);
    const tajwidScore = Math.round(((totalWords - tajwidErrorCount) / Math.max(1, totalWords)) * 100);

    // Worst ayahs
    const worstAyahs = [...results].sort((a, b) => a.score - b.score).slice(0, 3).filter(a => a.score < 90);

    // Top tajwid errors by rule
    const ruleCount: Record<string, number> = {};
    results.forEach(r => r.tajwidErrors.forEach(te => { ruleCount[te.ruleName] = (ruleCount[te.ruleName] || 0) + 1; }));
    const topTajwidErrors = Object.entries(ruleCount).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([rule, count]) => ({ rule, count }));

    // Tips
    const tips: string[] = [];
    if (topTajwidErrors.length > 0) tips.push(`Revoir la règle « ${topTajwidErrors[0].rule} » – ${topTajwidErrors[0].count} erreur(s) détectée(s).`);
    if (worstAyahs.length > 0) tips.push(`Réécouter l'audio modèle pour l'Ayah ${worstAyahs[0].ayahIdx + 1} avant de refaire la dictée.`);
    if (avgScore < 70) tips.push("Essaie de réciter plus lentement en te concentrant sur chaque mot.");
    if (avgScore >= 70 && avgScore < 90) tips.push("Très bien ! Continue à pratiquer pour atteindre 90% et plus.");

    return { avgScore, tajwidScore, worstAyahs, topTajwidErrors, tips };
  };

  const getWordStatusColor = (status: string) => {
    switch (status) {
      case "correct": return "text-success bg-success/15 border-success/30";
      case "incorrect": return "text-destructive bg-destructive/15 border-destructive/30";
      case "missing": return "text-destructive/60 bg-destructive/10 line-through";
      case "extra": return "text-warning bg-warning/15";
      default: return "";
    }
  };

  const getLiveWordColor = (status: string) => {
    switch (status) {
      case "correct": return "text-success bg-success/10";
      case "almost": return "text-warning bg-warning/10";
      case "incorrect": return "text-destructive bg-destructive/10";
      case "pending": return "text-transparent select-none bg-muted/30";
      default: return "text-muted-foreground/40";
    }
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  // ─── OVERVIEW: choose block ───
  if (phase === "overview") {
    return (
      <div className="space-y-5">
        <div className="text-center">
          <p className="font-arabic text-3xl text-primary">{surah.nameArabic}</p>
          <p className="text-sm text-muted-foreground mt-1">📚 Sourate complète · {surah.ayahs.length} versets</p>
        </div>

        {blocks.length > 1 && (
          <div className="bg-accent/30 rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">Cette sourate est découpée en <span className="font-bold text-foreground">{blocks.length} blocs</span> de dictée</p>
          </div>
        )}

        <ReciterPicker selected={reciter} onChange={setReciter} compact />

        <div className="space-y-2">
          {blocks.map((block, idx) => {
            const blockDone = allResults.some(r => r.ayahIdx >= block.start && r.ayahIdx <= block.end);
            const blockScore = blockDone
              ? Math.round(allResults.filter(r => r.ayahIdx >= block.start && r.ayahIdx <= block.end).reduce((a, r) => a + r.score, 0) / Math.max(1, allResults.filter(r => r.ayahIdx >= block.start && r.ayahIdx <= block.end).length))
              : null;
            return (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => startBlock(idx)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-colors ${
                  blockDone ? "bg-success/5 border-success/30" : "bg-card border-border hover:bg-accent/30"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                  blockDone ? "bg-success/15 text-success" : "bg-primary/10 text-primary"
                }`}>
                  {blockDone ? "✓" : idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">Bloc {idx + 1} / {blocks.length}</p>
                  <p className="text-xs text-muted-foreground">{block.label}</p>
                </div>
                {blockScore !== null && (
                  <span className="text-sm font-bold text-success">{blockScore}%</span>
                )}
                <ChevronRight size={16} className="text-muted-foreground" />
              </motion.button>
            );
          })}
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onBack} className="flex-1 py-3 rounded-2xl border-2 border-border text-foreground font-semibold text-sm">
            ← Retour
          </button>
          <button onClick={() => startBlock(0)} className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm">
            Commencer la dictée
          </button>
        </div>
      </div>
    );
  }

  // ─── LISTEN PHASE ───
  if (phase === "listen" && currentAyah) {
    const tajwidWords = analyzeAyahTajwid(currentAyah.arabic);
    const waqf = hasWaqfMarker(currentAyah.arabic);
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Block progress */}
        <div className="flex items-center gap-2">
          <button onClick={() => setPhase("overview")} className="p-1.5 rounded-full bg-muted hover:bg-accent transition-colors">
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Bloc {currentBlockIdx + 1}/{blocks.length} · Ayah {currentAyahIdx + 1}/{blockAyahCount}</span>
              <span>{Math.round(((currentAyahIdx) / blockAyahCount) * 100)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${(currentAyahIdx / blockAyahCount) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Step 1: Listen */}
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">1</span>
          <span className="text-sm font-bold text-foreground">Écoute le verset</span>
        </div>

        {/* Ayah card with tajwid + ayah number + waqf */}
        <div className="bg-card border border-border rounded-2xl p-5 relative" dir="rtl">
          {/* Ayah number badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1" dir="ltr">
            <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
              {absoluteAyahIdx + 1}
            </span>
            {waqf && <span className="text-xs text-muted-foreground font-arabic">{waqf}</span>}
          </div>

          <div className="arabic-text text-xl leading-[3] text-center pt-4">
            {tajwidWords.map((tw, wi) => (
              <span key={wi} className="inline-block px-0.5"
                style={tw.primaryColor ? { color: `hsl(${tw.primaryColor})` } : undefined}>
                {tw.text}{" "}
              </span>
            ))}
          </div>

          <p className="text-[10px] text-muted-foreground text-center mt-3 border-t border-border/30 pt-2" dir="ltr">
            {surah.nameArabic} · Ayah {absoluteAyahIdx + 1}
          </p>
        </div>

        {/* Listen + Skip */}
        <div className="flex gap-3">
          <motion.button whileTap={{ scale: 0.95 }} onClick={playCurrentAyah}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm">
            <Volume2 size={18} /> Écouter
          </motion.button>
          <button onClick={() => { setHasListened(true); }}
            className="px-5 py-3.5 rounded-2xl border-2 border-border text-foreground font-semibold text-sm">
            Passer
          </button>
        </div>

        {/* Step 2: Record */}
        {hasListened && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">2</span>
              <span className="text-sm font-bold text-foreground">Récite ce verset</span>
            </div>

            {micError === "not-allowed" && (
              <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-center space-y-1">
                <AlertCircle size={18} className="inline" />
                <p className="text-sm font-semibold">Microphone refusé</p>
                <p className="text-xs opacity-80">Autorise l'accès micro dans les réglages du navigateur.</p>
              </div>
            )}

            <motion.button whileTap={{ scale: 0.95 }} onClick={startRecording}
              className={`w-full flex items-center justify-center gap-3 ${isChildMode ? "py-5 text-xl" : "py-4 text-lg"} rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20`}>
              <Mic size={24} /> Commencer
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // ─── RECORDING PHASE ───
  if (phase === "recording" && currentAyah) {
    const words = currentAyah.arabic.split(/\s+/).filter(Boolean);
    const ayahLiveWords = liveWords[0] || [];
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        {/* Recording indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((b) => (
              <motion.div key={b} animate={{ scaleY: [1, 2.5, 1] }}
                transition={{ duration: 0.6, delay: b * 0.12, repeat: Infinity }}
                className="w-1.5 h-4 bg-primary rounded-full" />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">Récite maintenant...</span>
        </div>

        {/* Live feedback card */}
        <div className="bg-card border border-border rounded-2xl p-5 relative" dir="rtl">
          <div className="absolute top-2 left-2" dir="ltr">
            <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
              {absoluteAyahIdx + 1}
            </span>
          </div>
          <div className="arabic-text text-xl leading-[3] text-center pt-4">
            {words.map((word, wi) => {
              const lw = ayahLiveWords[wi];
              const status = lw?.status || "pending";
              const isPending = status === "pending";
              return (
                <motion.span key={wi}
                  initial={!isPending ? { scale: 1.1 } : false}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={`inline-block px-1 py-0.5 mx-0.5 rounded-md transition-colors duration-300 ${
                    isPending ? "text-transparent select-none bg-muted/30" : getLiveWordColor(status)
                  }`}>
                  {isPending ? "████" : word}
                </motion.span>
              );
            })}
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full"
              animate={{ width: `${(totalMatched / Math.max(1, words.length)) * 100}%` }} />
          </div>
          <span className="text-xs text-muted-foreground font-mono">{totalMatched}/{words.length}</span>
        </div>

        {/* Stop button */}
        <motion.button whileTap={{ scale: 0.95 }} onClick={stopRecording}
          className={`w-full flex items-center justify-center gap-3 ${isChildMode ? "py-5 text-xl" : "py-4 text-lg"} rounded-2xl bg-destructive text-destructive-foreground font-bold animate-pulse`}>
          <MicOff size={24} /> Arrêter
        </motion.button>
      </motion.div>
    );
  }

  // ─── FEEDBACK PHASE (per-ayah) ───
  if (phase === "feedback" && currentAyah) {
    const lastResult = blockResults[blockResults.length - 1];
    if (!lastResult) return null;
    const isLast = currentAyahIdx + 1 >= blockAyahCount;
    const emoji = lastResult.score >= 90 ? "🌟" : lastResult.score >= 70 ? "💪" : lastResult.score >= 50 ? "📖" : "🔁";

    return (
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Score */}
        <div className="text-center py-2">
          <span className="text-3xl">{emoji}</span>
          <p className="text-sm font-semibold text-foreground mt-1">
            {lastResult.score >= 90 ? "Excellent ! Macha Allah !" : lastResult.score >= 70 ? `Très bien, ${lastResult.score}% correct !` : `${lastResult.score}% – Continue !`}
          </p>
        </div>

        {/* Color-coded ayah */}
        <div className="bg-card border border-border rounded-2xl p-4 relative" dir="rtl">
          <div className="absolute top-2 left-2" dir="ltr">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center">{absoluteAyahIdx + 1}</span>
          </div>
          <div className="arabic-text text-lg leading-[3] text-center pt-3">
            {lastResult.wordResults.map((wr, i) => (
              <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className={`inline-block px-1 py-0.5 mx-0.5 rounded-lg border ${getWordStatusColor(wr.status)}`}>
                {wr.word}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Tajwid tips */}
        {lastResult.tajwidErrors.length > 0 && (
          <div className="bg-accent/30 rounded-xl p-3 space-y-1">
            <p className="text-xs font-semibold text-foreground">💡 Conseil Tajwid</p>
            {lastResult.tajwidErrors.slice(0, 2).map((te, i) => (
              <p key={i} className="text-[11px] text-muted-foreground">
                Attention à « <span className="font-arabic text-foreground">{te.word}</span> » ({te.ruleName})
              </p>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-success">✅ Correct</span>
          <span className="flex items-center gap-1 text-destructive">❌ Erreur</span>
          <span className="flex items-center gap-1 text-destructive/60">〰️ Manquant</span>
        </div>

        {/* Listen again */}
        <button onClick={() => {
          fetch(`https://api.alquran.cloud/v1/ayah/${surah.number}:${currentAyah.number}/${reciter.apiEdition}`)
            .then(r => r.json())
            .then(data => { if (data.data?.audio) safePlay(data.data.audio); })
            .catch(() => {});
        }} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium">
          <Volume2 size={15} /> Réécouter le verset
        </button>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={retryAyah} className="flex-1 py-3 rounded-2xl border-2 border-border text-foreground font-semibold text-sm">
            Réessayer
          </button>
          <button onClick={nextAyah} className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm">
            {isLast ? "Résumé du bloc" : "Verset suivant →"}
          </button>
        </div>
      </motion.div>
    );
  }

  // ─── BLOCK SUMMARY ───
  if (phase === "blockSummary") {
    const summary = computeSummary(blockResults);
    const isLastBlock = currentBlockIdx + 1 >= blocks.length;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
        <div className="text-center py-4">
          <span className="text-4xl">{summary.avgScore >= 80 ? "🎉" : summary.avgScore >= 60 ? "💪" : "📖"}</span>
          <h2 className="text-xl font-bold text-foreground mt-2">Bloc {currentBlockIdx + 1} terminé !</h2>
          <p className="text-xs text-muted-foreground mt-1">{currentBlock.label} · {surah.nameArabic}</p>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{summary.avgScore}%</p>
            <p className="text-[11px] text-muted-foreground">Exactitude récitation</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{summary.tajwidScore}%</p>
            <p className="text-[11px] text-muted-foreground">Tajwid correct</p>
          </div>
        </div>

        {/* Worst ayahs */}
        {summary.worstAyahs.length > 0 && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3 space-y-1">
            <p className="text-xs font-semibold text-foreground">⚠️ Ayat les plus difficiles</p>
            {summary.worstAyahs.map((a, i) => (
              <p key={i} className="text-[11px] text-muted-foreground">Ayah {a.ayahIdx + 1} – {a.score}%</p>
            ))}
          </div>
        )}

        {/* Tajwid errors */}
        {summary.topTajwidErrors.length > 0 && (
          <div className="bg-accent/30 rounded-xl p-3 space-y-1">
            <p className="text-xs font-semibold text-foreground">📚 Règles Tajwid à revoir</p>
            {summary.topTajwidErrors.map((te, i) => (
              <p key={i} className="text-[11px] text-muted-foreground">{te.rule} – {te.count} erreur(s)</p>
            ))}
          </div>
        )}

        {/* Tips */}
        {summary.tips.length > 0 && (
          <div className="bg-primary/5 border border-primary/15 rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-1.5 mb-1">
              <BookOpen size={13} className="text-primary" />
              <span className="text-xs font-semibold text-foreground">Conseils pour s'améliorer</span>
            </div>
            {summary.tips.map((tip, i) => (
              <p key={i} className="text-[11px] text-muted-foreground">• {tip}</p>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => startBlock(currentBlockIdx)} className="flex-1 py-3 rounded-2xl border-2 border-border text-foreground font-semibold text-sm">
            <RotateCcw size={14} className="inline mr-1" /> Refaire ce bloc
          </button>
          <button onClick={goNextBlock} className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm">
            {isLastBlock ? "Résumé final 🎉" : `Bloc ${currentBlockIdx + 2} →`}
          </button>
        </div>

        <button onClick={() => setPhase("overview")} className="w-full py-2.5 text-sm text-muted-foreground underline">
          Voir tous les blocs
        </button>
      </motion.div>
    );
  }

  // ─── FINAL SUMMARY ───
  if (phase === "finalSummary") {
    const summary = computeSummary(allResults);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 py-4">
        <div className="text-center">
          <span className="text-5xl">🏆</span>
          <h2 className="text-xl font-bold text-foreground mt-3">Sourate terminée !</h2>
          <p className="font-arabic text-2xl text-primary mt-1">{surah.nameArabic}</p>
          <p className="text-xs text-muted-foreground mt-1">{surah.ayahs.length} versets · {blocks.length > 1 ? `${blocks.length} blocs` : "1 dictée"}</p>
        </div>

        {/* Final scores */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-foreground">{summary.avgScore}%</p>
            <p className="text-[11px] text-muted-foreground">Exactitude récitation</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-foreground">{summary.tajwidScore}%</p>
            <p className="text-[11px] text-muted-foreground">Tajwid correct</p>
          </div>
        </div>

        {/* Worst ayahs */}
        {summary.worstAyahs.length > 0 && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3 space-y-1">
            <p className="text-xs font-semibold text-foreground">⚠️ Ayat les plus difficiles</p>
            {summary.worstAyahs.map((a, i) => (
              <p key={i} className="text-[11px] text-muted-foreground">Ayah {a.ayahIdx + 1} – {a.score}%</p>
            ))}
          </div>
        )}

        {/* Tajwid errors */}
        {summary.topTajwidErrors.length > 0 && (
          <div className="bg-accent/30 rounded-xl p-3 space-y-1">
            <p className="text-xs font-semibold text-foreground">📚 Règles Tajwid à revoir</p>
            {summary.topTajwidErrors.map((te, i) => (
              <p key={i} className="text-[11px] text-muted-foreground">{te.rule} – {te.count} erreur(s)</p>
            ))}
          </div>
        )}

        {/* Tips */}
        {summary.tips.length > 0 && (
          <div className="bg-primary/5 border border-primary/15 rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-1.5 mb-1">
              <BookOpen size={13} className="text-primary" />
              <span className="text-xs font-semibold text-foreground">Conseils pour s'améliorer</span>
            </div>
            {summary.tips.map((tip, i) => (
              <p key={i} className="text-[11px] text-muted-foreground">• {tip}</p>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => { setAllResults([]); setBlockResults([]); setPhase("overview"); }}
            className="flex-1 py-3 rounded-2xl border-2 border-border text-foreground font-semibold text-sm">
            <RotateCcw size={14} className="inline mr-1" /> Recommencer
          </button>
          {onRequestNextSurah && (
            <button onClick={onRequestNextSurah}
              className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm">
              Sourate suivante →
            </button>
          )}
        </div>

        <button onClick={onBack} className="w-full py-2.5 text-sm text-muted-foreground underline">
          ← Retour
        </button>
      </motion.div>
    );
  }

  return null;
}
