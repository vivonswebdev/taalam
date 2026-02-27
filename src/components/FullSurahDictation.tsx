import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import useAntiDoubleAudio from "@/hooks/useAntiDoubleAudio";
import { analyzeAyahTajwid, type TajwidWord } from "@/data/tajwidRules";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, RotateCcw, Volume2, ArrowLeft, ChevronRight, AlertCircle, BookOpen, Eye,
} from "lucide-react";
import { type Surah } from "@/data/surahs";
import { useVoiceRecognition, compareSurahDictation } from "@/hooks/useVoiceRecognition";
import { useLiveWordFeedback } from "@/hooks/useLiveWordFeedback";
import { useLanguage } from "@/hooks/useLanguage";
import { useXP } from "@/hooks/useXP";
import ReciterPicker, { getStoredReciter, type ReciterOption } from "@/components/ReciterPicker";

// ─── Constants ──────────────────────────────────────────────
const BLOCK_SIZE = 10;
const SMALL_SURAH_THRESHOLD = 30;

// ─── Types ──────────────────────────────────────────────────
type Phase = "overview" | "reading" | "recording" | "feedback" | "blockSummary" | "finalSummary";

interface AyahFeedbackData {
  ayahIdx: number;
  score: number;
  wordResults: { word: string; status: "correct" | "incorrect" | "missing" | "extra" }[];
  tajwidErrors: { word: string; ruleName: string }[];
}

interface BlockDef {
  start: number;
  end: number;
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
  const [phase, setPhase] = useState<Phase>(() => blocks.length === 1 ? "reading" : "overview");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [micError, setMicError] = useState<string | null>(null);
  const [reciter, setReciter] = useState<ReciterOption>(getStoredReciter);
  const [blockResults, setBlockResults] = useState<AyahFeedbackData[]>([]);
  const [allResults, setAllResults] = useState<AyahFeedbackData[]>([]);

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

  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (preListenAudioRef.current) { preListenAudioRef.current.pause(); preListenAudioRef.current = null; }
      if (autoAdvanceRef.current) { clearTimeout(autoAdvanceRef.current); autoAdvanceRef.current = null; }
    };
  }, []);

  // Auto-advance after feedback (1s delay), only if not last ayah in block
  useEffect(() => {
    if (phase === "feedback" && currentAyahIdx + 1 < blockAyahCount) {
      autoAdvanceRef.current = setTimeout(() => {
        nextAyah();
      }, 1000);
    }
    return () => {
      if (autoAdvanceRef.current) { clearTimeout(autoAdvanceRef.current); autoAdvanceRef.current = null; }
    };
  }, [phase, currentAyahIdx, blockAyahCount, nextAyah]);

  // ─── Start block (go to reading phase) ───
  const startBlock = useCallback((blockIdx: number) => {
    setCurrentBlockIdx(blockIdx);
    setCurrentAyahIdx(0);
    setBlockResults([]);
    setLiveTranscript("");
    setPhase("reading");
  }, []);

  // ─── Start dictation (from reading → recording on first ayah) ───
  const startDictation = useCallback(() => {
    setCurrentAyahIdx(0);
    setLiveTranscript("");
    setMicError(null);
    setPhase("recording");
    voice.start();
  }, [voice]);

  // ─── Start recording current ayah ───
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
      setAllResults(prev => {
        const merged = [...prev, ...blockResults];
        return merged.filter((v, i, a) => a.findIndex(x => x.ayahIdx === v.ayahIdx) === i);
      });
      setPhase("blockSummary");
    } else {
      setCurrentAyahIdx(prev => prev + 1);
      setLiveTranscript("");
      setMicError(null);
      setPhase("recording");
      voice.start();
    }
  }, [currentAyahIdx, blockAyahCount, blockResults, voice]);

  // ─── Retry ayah ───
  const retryAyah = useCallback(() => {
    setLiveTranscript("");
    setMicError(null);
    setPhase("recording");
    voice.start();
  }, [voice]);

  // ─── Next block ───
  const goNextBlock = useCallback(() => {
    if (currentBlockIdx + 1 >= blocks.length) {
      const merged = [...allResults, ...blockResults].filter((v, i, a) => a.findIndex(x => x.ayahIdx === v.ayahIdx) === i);
      setAllResults(merged);
      setPhase("finalSummary");
    } else {
      startBlock(currentBlockIdx + 1);
    }
  }, [currentBlockIdx, blocks.length, allResults, blockResults, startBlock]);

  // ─── Summary computation ───
  const computeSummary = (results: AyahFeedbackData[]) => {
    if (results.length === 0) return { avgScore: 0, tajwidScore: 0, worstAyahs: [], topTajwidErrors: [], tips: [] };
    const avgScore = Math.round(results.reduce((a, r) => a + r.score, 0) / results.length);
    const totalWords = results.reduce((a, r) => a + r.wordResults.length, 0);
    const tajwidErrorCount = results.reduce((a, r) => a + r.tajwidErrors.length, 0);
    const tajwidScore = Math.round(((totalWords - tajwidErrorCount) / Math.max(1, totalWords)) * 100);
    const worstAyahs = [...results].sort((a, b) => a.score - b.score).slice(0, 3).filter(a => a.score < 90);
    const ruleCount: Record<string, number> = {};
    results.forEach(r => r.tajwidErrors.forEach(te => { ruleCount[te.ruleName] = (ruleCount[te.ruleName] || 0) + 1; }));
    const topTajwidErrors = Object.entries(ruleCount).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([rule, count]) => ({ rule, count }));
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

  // ─── OVERVIEW: choose block (large surahs only) ───
  if (phase === "overview") {
    return (
      <div className="space-y-5">
        <div className="text-center">
          <p className="font-arabic text-3xl text-primary">{surah.nameArabic}</p>
          <p className="text-sm text-muted-foreground mt-1">📚 Sourate complète · {surah.ayahs.length} versets</p>
        </div>

        <div className="bg-accent/30 rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Cette sourate est découpée en <span className="font-bold text-foreground">{blocks.length} blocs</span> de dictée</p>
        </div>

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
            Commencer
          </button>
        </div>
      </div>
    );
  }

  // ─── READING PHASE: show full block, then start dictation ───
  if (phase === "reading") {
    const blockAyahs = surah.ayahs.slice(currentBlock.start, currentBlock.end + 1);
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <button onClick={() => blocks.length === 1 ? onBack() : setPhase("overview")} className="p-1.5 rounded-full bg-muted hover:bg-accent transition-colors">
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <div className="flex-1 text-center">
            <p className="font-arabic text-xl text-primary">{surah.nameArabic}</p>
            {blocks.length > 1 && (
              <p className="text-[11px] text-muted-foreground">Bloc {currentBlockIdx + 1} / {blocks.length} · {currentBlock.label}</p>
            )}
          </div>
          <div className="w-8" /> {/* spacer */}
        </div>

        {/* Instruction */}
        <div className="bg-accent/30 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Eye size={15} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">Lis et mémorise ce bloc</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Prends le temps de lire {blockAyahs.length === 1 ? "ce verset" : `ces ${blockAyahs.length} versets`}. 
            Quand tu es prêt, lance la dictée de mémoire.
          </p>
        </div>

        {/* Reciter picker */}
        <ReciterPicker selected={reciter} onChange={setReciter} compact />

        {/* Full block text */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-0" dir="rtl">
          {blockAyahs.map((ayah, idx) => {
            const tajwidWords = analyzeAyahTajwid(ayah.arabic);
            const waqf = hasWaqfMarker(ayah.arabic);
            const globalIdx = currentBlock.start + idx;
            return (
              <div key={globalIdx} className="py-3 border-b border-border/20 last:border-b-0">
                <div className="arabic-text text-xl leading-[2.8] text-center">
                  {tajwidWords.map((tw, wi) => (
                    <span key={wi} className="inline-block px-0.5"
                      style={tw.primaryColor ? { color: `hsl(${tw.primaryColor})` } : undefined}>
                      {tw.text}{" "}
                    </span>
                  ))}
                  {/* Ayah number inline */}
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold mx-1 align-middle" dir="ltr">
                    {globalIdx + 1}
                  </span>
                  {waqf && <span className="text-muted-foreground text-sm mx-0.5">{waqf}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Big start button - mobile friendly */}
        <div className="pt-2 pb-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={startDictation}
            className={`w-full flex items-center justify-center gap-3 ${
              isChildMode ? "py-6 text-xl" : "py-5 text-lg"
            } rounded-2xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/25`}
          >
            <Mic size={24} />
            Commencer la dictée
          </motion.button>
          <p className="text-[11px] text-muted-foreground text-center mt-2">
            Le texte sera masqué et tu réciteras de mémoire
          </p>
        </div>
      </motion.div>
    );
  }

  // ─── RECORDING PHASE (text hidden, ayah by ayah) ───
  if (phase === "recording" && currentAyah) {
    const words = currentAyah.arabic.split(/\s+/).filter(Boolean);
    const ayahLiveWords = liveWords[0] || [];
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        {/* Block progress */}
        <div className="flex items-center gap-2">
          <button onClick={() => { voice.stop(); setPhase("reading"); }} className="p-1.5 rounded-full bg-muted hover:bg-accent transition-colors">
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>{blocks.length > 1 ? `Bloc ${currentBlockIdx + 1}/${blocks.length} · ` : ""}Ayah {currentAyahIdx + 1}/{blockAyahCount}</span>
              <span>{Math.round(((currentAyahIdx) / blockAyahCount) * 100)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${(currentAyahIdx / blockAyahCount) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Recording indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((b) => (
              <motion.div key={b} animate={{ scaleY: [1, 2.5, 1] }}
                transition={{ duration: 0.6, delay: b * 0.12, repeat: Infinity }}
                className="w-1.5 h-4 bg-primary rounded-full" />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">Récite le verset {currentAyahIdx + 1}...</span>
        </div>

        {/* Hidden text with live reveal */}
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

        {micError === "not-allowed" && (
          <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-center space-y-1">
            <AlertCircle size={18} className="inline" />
            <p className="text-sm font-semibold">Microphone refusé</p>
            <p className="text-xs opacity-80">Autorise l'accès micro dans les réglages du navigateur.</p>
          </div>
        )}
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
          <p className="text-[11px] text-muted-foreground mt-0.5">Ayah {absoluteAyahIdx + 1} · {currentAyahIdx + 1}/{blockAyahCount}</p>
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
          <h2 className="text-xl font-bold text-foreground mt-2">
            {blocks.length === 1 ? "Dictée terminée !" : `Bloc ${currentBlockIdx + 1} terminé !`}
          </h2>
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
            <RotateCcw size={14} className="inline mr-1" /> Refaire
          </button>
          {blocks.length === 1 ? (
            onRequestNextSurah && (
              <button onClick={onRequestNextSurah} className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm">
                Sourate suivante →
              </button>
            )
          ) : (
            <button onClick={goNextBlock} className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm">
              {isLastBlock ? "Résumé final 🎉" : `Bloc ${currentBlockIdx + 2} →`}
            </button>
          )}
        </div>

        {blocks.length > 1 && (
          <button onClick={() => setPhase("overview")} className="w-full py-2.5 text-sm text-muted-foreground underline">
            Voir tous les blocs
          </button>
        )}
        <button onClick={onBack} className="w-full py-2 text-sm text-muted-foreground underline">← Retour</button>
      </motion.div>
    );
  }

  // ─── FINAL SUMMARY (multi-block only) ───
  if (phase === "finalSummary") {
    const summary = computeSummary(allResults);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 py-4">
        <div className="text-center">
          <span className="text-5xl">🏆</span>
          <h2 className="text-xl font-bold text-foreground mt-3">Sourate terminée !</h2>
          <p className="font-arabic text-2xl text-primary mt-1">{surah.nameArabic}</p>
          <p className="text-xs text-muted-foreground mt-1">{surah.ayahs.length} versets · {blocks.length} blocs</p>
        </div>

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

        {summary.worstAyahs.length > 0 && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3 space-y-1">
            <p className="text-xs font-semibold text-foreground">⚠️ Ayat les plus difficiles</p>
            {summary.worstAyahs.map((a, i) => (
              <p key={i} className="text-[11px] text-muted-foreground">Ayah {a.ayahIdx + 1} – {a.score}%</p>
            ))}
          </div>
        )}

        {summary.topTajwidErrors.length > 0 && (
          <div className="bg-accent/30 rounded-xl p-3 space-y-1">
            <p className="text-xs font-semibold text-foreground">📚 Règles Tajwid à revoir</p>
            {summary.topTajwidErrors.map((te, i) => (
              <p key={i} className="text-[11px] text-muted-foreground">{te.rule} – {te.count} erreur(s)</p>
            ))}
          </div>
        )}

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

        <button onClick={onBack} className="w-full py-2.5 text-sm text-muted-foreground underline">← Retour</button>
      </motion.div>
    );
  }

  return null;
}
