import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Search, ArrowLeft, BookOpen, Volume2,
  Award, Loader2, ChevronDown, X,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

// ─── Types ──────────────────────────────────────────────────
interface FindAyahResult {
  surahNumber: number;
  ayahNumber: number;
  surahNameArabic: string;
  surahNameEnglish: string;
  ayahText: string;
  confidence: number;
}

type SearchScope = { type: "all" } | { type: "surah"; surah: number } | { type: "juz"; juz: number };
type Phase = "idle" | "recording" | "processing" | "results";

interface FindAyahProps {
  onBack: () => void;
  onOpenSurah?: (surahNumber: number, ayahNumber: number) => void;
  onStartHifz?: (surahNumber: number) => void;
  isChildMode: boolean;
}

// ─── Constants ──────────────────────────────────────────────
const RECORDING_MAX_MS = 15_000;
const TIMESLICE_MS = 2_000;

export default function FindAyah({ onBack, onOpenSurah, onStartHifz, isChildMode }: FindAyahProps) {
  const { t } = useLanguage();

  const [phase, setPhase] = useState<Phase>("idle");
  const [scope, setScope] = useState<SearchScope>({ type: "all" });
  const [showScopeDropdown, setShowScopeDropdown] = useState(false);
  const [results, setResults] = useState<FindAyahResult[]>([]);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    try { mediaRecorderRef.current?.stop(); } catch {}
    try { mediaStreamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
    mediaRecorderRef.current = null;
    mediaStreamRef.current = null;
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setResults([]);
    setTranscript("");
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        // Process the recording
        processRecording();
      };

      recorder.start(TIMESLICE_MS);
      setPhase("recording");

      // Auto-stop after max duration
      timeoutRef.current = setTimeout(() => stopRecording(), RECORDING_MAX_MS);
    } catch (e: any) {
      if (e?.name === "NotAllowedError") {
        setError(t("findAyah.micDenied"));
      } else {
        setError(t("findAyah.micError"));
      }
    }
  }, [scope]);

  const stopRecording = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    try {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    } catch {}
    try { mediaStreamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
  }, []);

  const processRecording = useCallback(async () => {
    setPhase("processing");

    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    if (blob.size < 500) {
      setError(t("findAyah.tooShort"));
      setPhase("idle");
      return;
    }

    try {
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((d, b) => d + String.fromCharCode(b), "")
      );

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/find-ayah`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseKey}`,
          "apikey": supabaseKey,
        },
        body: JSON.stringify({ audio: base64, scope }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setPhase("idle");
        return;
      }

      setTranscript(data.transcript || "");
      setResults(data.results || []);
      setPhase("results");
    } catch (e) {
      console.error("find-ayah error:", e);
      setError(t("findAyah.searchError"));
      setPhase("idle");
    }
  }, [scope]);

  const handlePlayAyah = (surahNumber: number, ayahNumber: number) => {
    fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/ar.husary`)
      .then(r => r.json())
      .then(data => {
        if (data.data?.audio) new Audio(data.data.audio).play();
      })
      .catch(() => {});
  };

  const scopeLabel = scope.type === "all" ? t("findAyah.scopeAll")
    : scope.type === "juz" ? `Juz ${scope.juz}`
    : `Sourate ${scope.surah}`;

  return (
    <div className="px-6 pb-28 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div>
          <h2 className={`${isChildMode ? "text-xl" : "text-lg"} font-bold text-foreground`}>
            {isChildMode ? "🔍 " : ""}{t("findAyah.title")}
          </h2>
          <p className="text-xs text-muted-foreground">{t("findAyah.subtitle")}</p>
        </div>
      </div>

      {/* Scope selector */}
      {phase !== "results" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {t("findAyah.searchIn")}
          </p>
          <div className="flex gap-1.5">
            {(["all", "juz", "surah"] as const).map(type => (
              <button key={type}
                onClick={() => {
                  if (type === "all") setScope({ type: "all" });
                  else if (type === "juz") setScope({ type: "juz", juz: 30 });
                  else setScope({ type: "surah", surah: 1 });
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                  scope.type === type
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent/50"
                }`}>
                {type === "all" ? t("findAyah.scopeAll")
                  : type === "juz" ? "Juz"
                  : t("findAyah.scopeSurah")}
              </button>
            ))}
          </div>

          {/* Juz/Surah number picker */}
          {scope.type === "juz" && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Juz :</span>
              <select
                value={scope.juz}
                onChange={e => setScope({ type: "juz", juz: Number(e.target.value) })}
                className="bg-muted text-foreground rounded-lg px-3 py-1.5 text-sm border border-border"
              >
                {Array.from({ length: 30 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
          )}
          {scope.type === "surah" && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{t("findAyah.scopeSurah")} :</span>
              <select
                value={scope.surah}
                onChange={e => setScope({ type: "surah", surah: Number(e.target.value) })}
                className="bg-muted text-foreground rounded-lg px-3 py-1.5 text-sm border border-border"
              >
                {Array.from({ length: 114 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
          )}
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-destructive/10 text-destructive rounded-xl p-3 text-center text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline text-xs">{t("findAyah.dismiss")}</button>
        </motion.div>
      )}

      {/* ─── IDLE / RECORDING ─── */}
      {(phase === "idle" || phase === "recording") && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-5 py-8">
          <p className="text-sm text-muted-foreground text-center max-w-[280px]">
            {t("findAyah.instruction")}
          </p>

          {/* Wave animation when recording */}
          <div className="relative">
            {phase === "recording" && (
              <>
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border-2 border-primary/30"
                    animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                    transition={{ duration: 1.8, delay: i * 0.5, repeat: Infinity }}
                  />
                ))}
              </>
            )}

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={phase === "recording" ? stopRecording : startRecording}
              className={`relative z-10 ${isChildMode ? "w-28 h-28" : "w-24 h-24"} rounded-full flex items-center justify-center transition-all ${
                phase === "recording"
                  ? "bg-destructive text-destructive-foreground shadow-xl shadow-destructive/30"
                  : "bg-primary text-primary-foreground shadow-xl shadow-primary/30"
              }`}
            >
              {phase === "recording"
                ? <MicOff size={isChildMode ? 40 : 34} />
                : <Mic size={isChildMode ? 40 : 34} />}
            </motion.button>
          </div>

          <p className={`text-sm font-medium ${phase === "recording" ? "text-destructive animate-pulse" : "text-muted-foreground"}`}>
            {phase === "recording" ? t("findAyah.listening") : t("findAyah.tapToStart")}
          </p>

          {/* Sound wave bars */}
          {phase === "recording" && (
            <div className="flex items-center gap-1 h-8">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-primary rounded-full"
                  animate={{ height: [8, 24 + Math.random() * 12, 8] }}
                  transition={{ duration: 0.5 + Math.random() * 0.4, delay: i * 0.05, repeat: Infinity }}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ─── PROCESSING ─── */}
      {phase === "processing" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 py-16">
          <Loader2 size={40} className="animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">{t("findAyah.searching")}</p>
        </motion.div>
      )}

      {/* ─── RESULTS ─── */}
      {phase === "results" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="space-y-4">
          {/* Transcript */}
          {transcript && (
            <div className="bg-accent/50 rounded-xl p-3">
              <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">
                {t("findAyah.youRecited")}
              </p>
              <p className="arabic-text text-lg text-foreground">{transcript}</p>
            </div>
          )}

          {results.length === 0 && (
            <div className="text-center py-8">
              <Search size={32} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">{t("findAyah.noResults")}</p>
            </div>
          )}

          {results.map((r, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-card border-2 rounded-2xl p-4 space-y-3 ${
                i === 0 ? "border-primary shadow-lg shadow-primary/10" : "border-border"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {r.surahNumber}
                  </span>
                  <div>
                    <p className="font-arabic text-base text-foreground">{r.surahNameArabic}</p>
                    <p className="text-[10px] text-muted-foreground">{r.surahNameEnglish} · {t("findAyah.verse")} {r.ayahNumber}</p>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  r.confidence >= 80 ? "bg-green-500/15 text-green-600"
                    : r.confidence >= 50 ? "bg-amber-500/15 text-amber-600"
                    : "bg-red-500/15 text-red-600"
                }`}>
                  {r.confidence}%
                </div>
              </div>

              {/* Ayah text */}
              <p className="arabic-text text-xl leading-loose text-foreground">{r.ayahText}</p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handlePlayAyah(r.surahNumber, r.ayahNumber)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold"
                >
                  <Volume2 size={14} />
                  {t("findAyah.listen")}
                </button>
                {onOpenSurah && (
                  <button
                    onClick={() => onOpenSurah(r.surahNumber, r.ayahNumber)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold"
                  >
                    <BookOpen size={14} />
                    {t("findAyah.openMushaf")}
                  </button>
                )}
                {onStartHifz && (
                  <button
                    onClick={() => onStartHifz(r.surahNumber)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-secondary/10 text-secondary text-xs font-semibold"
                  >
                    <Award size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          {/* Retry */}
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setPhase("idle"); setResults([]); setTranscript(""); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-border text-foreground font-semibold text-sm">
              <Search size={16} />
              {t("findAyah.searchAgain")}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
