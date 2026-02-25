import { useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Square, Volume2, Mic, MicOff, RotateCcw, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { getSurahByNumber } from "@/data/surahs";
import { useProgress } from "@/hooks/useProgress";
import { useVoiceRecognition, compareTexts, type WordResult } from "@/hooks/useVoiceRecognition";

type Phase = "listen" | "recite" | "results";

export default function LearnDetail() {
  const { surahNumber } = useParams();
  const navigate = useNavigate();
  const { updateSurahProgress } = useProgress();
  const [playing, setPlaying] = useState(false);
  const [currentAyah, setCurrentAyah] = useState(-1);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Recitation state
  const [phase, setPhase] = useState<Phase>("listen");
  const [recitingAyah, setRecitingAyah] = useState(0);
  const [ayahResults, setAyahResults] = useState<{ ayahIndex: number; results: WordResult[]; score: number }[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");

  const surah = getSurahByNumber(Number(surahNumber));

  const voice = useVoiceRecognition({
    lang: "ar-SA",
    continuous: true,
    onResult: (transcript) => setCurrentTranscript(transcript),
  });

  const playAyah = useCallback((index: number, urls: string[], surahNum: number) => {
    if (index >= urls.length) {
      setPlaying(false);
      setCurrentAyah(-1);
      // After full listen, switch to recite phase
      setPhase("recite");
      setRecitingAyah(0);
      return;
    }
    setCurrentAyah(index);
    const audio = new Audio(urls[index]);
    audioRef.current = audio;
    audio.onended = () => playAyah(index + 1, urls, surahNum);
    audio.onerror = () => playAyah(index + 1, urls, surahNum);
    audio.play().catch(() => playAyah(index + 1, urls, surahNum));
  }, []);

  const fetchAndPlayAudio = useCallback(async () => {
    if (!surah) return;
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      setCurrentAyah(-1);
      return;
    }
    setAudioLoading(true);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/ar.alafasy`);
      const data = await res.json();
      if (data.data?.ayahs) {
        const urls = data.data.ayahs.map((a: { audio: string }) => a.audio);
        setPlaying(true);
        setAudioLoading(false);
        playAyah(0, urls, surah.number);
      }
    } catch {
      setAudioLoading(false);
    }
  }, [playing, surah, playAyah]);

  const handleFinishAyahRecitation = useCallback(() => {
    if (!surah) return;
    voice.stop();
    const ayah = surah.ayahs[recitingAyah];
    const { results, score } = compareTexts(ayah.arabic, currentTranscript);
    const newResults = [...ayahResults, { ayahIndex: recitingAyah, results, score }];
    setAyahResults(newResults);

    if (recitingAyah < surah.ayahs.length - 1) {
      setRecitingAyah((prev) => prev + 1);
      setCurrentTranscript("");
    } else {
      // All ayahs done
      const avgScore = Math.round(newResults.reduce((a, r) => a + r.score, 0) / newResults.length);
      updateSurahProgress(surah.number, avgScore);
      setPhase("results");
    }
  }, [surah, recitingAyah, currentTranscript, ayahResults, voice, updateSurahProgress]);

  const handleRestart = () => {
    setPhase("listen");
    setRecitingAyah(0);
    setAyahResults([]);
    setCurrentTranscript("");
  };

  if (!surah) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Sourate introuvable</p>
      </div>
    );
  }

  const totalScore = ayahResults.length > 0
    ? Math.round(ayahResults.reduce((a, r) => a + r.score, 0) / ayahResults.length)
    : 0;

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="px-6 pt-14 pb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft size={20} />
          <span className="text-sm">Retour</span>
        </button>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-arabic text-3xl text-primary mb-1">{surah.nameArabic}</p>
          <h1 className="text-xl font-bold text-foreground">{surah.frenchName}</h1>
          <p className="text-xs text-muted-foreground mt-1">{surah.versesCount} versets · Sourate n°{surah.number}</p>
        </motion.div>
      </div>

      {/* Phase indicator */}
      <div className="flex justify-center gap-2 mb-5 px-6">
        {(["listen", "recite", "results"] as Phase[]).map((p, i) => (
          <div key={p} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              phase === p ? "bg-primary text-primary-foreground" : 
              (["listen", "recite", "results"].indexOf(phase) > i ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground")
            }`}>
              {i + 1}
            </div>
            {i < 2 && <div className="w-6 h-0.5 bg-border" />}
          </div>
        ))}
      </div>
      <div className="text-center text-xs text-muted-foreground mb-4 px-6">
        {phase === "listen" && "Étape 1 : Écoutez la récitation"}
        {phase === "recite" && `Étape 2 : Récitez le verset ${recitingAyah + 1}/${surah.ayahs.length}`}
        {phase === "results" && "Étape 3 : Résultats"}
      </div>

      {/* LISTEN PHASE */}
      {phase === "listen" && (
        <>
          <div className="flex justify-center gap-3 mb-6">
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={fetchAndPlayAudio}
              disabled={audioLoading}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-full font-semibold transition-colors ${
                playing ? "bg-destructive/10 text-destructive border-2 border-destructive" : "bg-primary text-primary-foreground"
              }`}
            >
              {audioLoading ? (
                <><div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Chargement...</>
              ) : playing ? (
                <><Square size={18} /> Arrêter</>
              ) : (
                <><Play size={18} /> Écouter la récitation</>
              )}
            </motion.button>
          </div>

          {/* Skip to recite button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => { setPhase("recite"); setRecitingAyah(0); }}
              className="text-xs text-muted-foreground underline"
            >
              Passer à la récitation →
            </button>
          </div>

          <div className="px-6 space-y-4">
            {surah.ayahs.map((ayah, i) => (
              <motion.div
                key={ayah.number}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-card border rounded-2xl p-5 transition-all ${currentAyah === i ? "border-primary shadow-lg shadow-primary/10" : "border-border"}`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{ayah.number}</span>
                  {currentAyah === i && <Volume2 size={16} className="text-primary animate-pulse mt-1" />}
                </div>
                <p className="arabic-text text-2xl text-foreground mb-3 leading-[2.6]">{ayah.arabic}</p>
                <p className="text-sm text-primary/80 italic mb-1">{ayah.transliteration}</p>
                <p className="text-sm text-muted-foreground">{ayah.translation}</p>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* RECITE PHASE */}
      {phase === "recite" && (
        <div className="px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={recitingAyah}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-5"
            >
              {/* Current ayah to recite */}
              <div className="bg-card border-2 border-primary/30 rounded-2xl p-6 text-center">
                <span className="inline-block w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold leading-8 mb-4">
                  {surah.ayahs[recitingAyah].number}
                </span>
                {/* Show transliteration as hint, hide Arabic until results */}
                <p className="text-primary/70 italic text-sm mb-3">{surah.ayahs[recitingAyah].transliteration}</p>
                <p className="text-sm text-muted-foreground">{surah.ayahs[recitingAyah].translation}</p>
              </div>

              {/* Mic controls */}
              <div className="flex flex-col items-center gap-4">
                {!voice.isSupported ? (
                  <div className="bg-destructive/10 text-destructive rounded-2xl p-4 text-sm text-center">
                    La reconnaissance vocale n'est pas supportée par votre navigateur. Utilisez Chrome pour une meilleure expérience.
                  </div>
                ) : (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={voice.isListening ? voice.stop : voice.start}
                      className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                        voice.isListening
                          ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/30 animate-pulse"
                          : "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      }`}
                    >
                      {voice.isListening ? <MicOff size={32} /> : <Mic size={32} />}
                    </motion.button>
                    <p className="text-sm text-muted-foreground">
                      {voice.isListening ? "Récitez maintenant... Appuyez pour arrêter" : "Appuyez pour commencer"}
                    </p>
                  </>
                )}

                {/* Live transcript */}
                {currentTranscript && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full bg-accent/50 rounded-2xl p-4"
                  >
                    <p className="text-xs text-muted-foreground mb-1">Votre récitation :</p>
                    <p className="arabic-text text-lg text-foreground">{currentTranscript}</p>
                  </motion.div>
                )}

                {/* Validate button */}
                {currentTranscript && !voice.isListening && (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFinishAyahRecitation}
                    className="flex items-center gap-2 bg-success text-success-foreground px-6 py-3 rounded-full font-semibold"
                  >
                    <CheckCircle2 size={18} />
                    Valider le verset {recitingAyah + 1}
                  </motion.button>
                )}

                {/* Skip button */}
                <button
                  onClick={() => {
                    voice.stop();
                    setCurrentTranscript(""); 
                    // Submit empty = 0 score
                    const { results, score } = compareTexts(surah.ayahs[recitingAyah].arabic, currentTranscript || " ");
                    const newResults = [...ayahResults, { ayahIndex: recitingAyah, results, score }];
                    setAyahResults(newResults);
                    if (recitingAyah < surah.ayahs.length - 1) {
                      setRecitingAyah(prev => prev + 1);
                      setCurrentTranscript("");
                    } else {
                      const avgScore = Math.round(newResults.reduce((a, r) => a + r.score, 0) / newResults.length);
                      updateSurahProgress(surah.number, avgScore);
                      setPhase("results");
                    }
                  }}
                  className="text-xs text-muted-foreground underline"
                >
                  Passer ce verset
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* RESULTS PHASE */}
      {phase === "results" && (
        <div className="px-6 space-y-5">
          {/* Score */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-6"
          >
            <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center text-3xl font-bold mb-3 ${
              totalScore >= 80 ? "bg-success/15 text-success" : totalScore >= 50 ? "bg-secondary/15 text-secondary" : "bg-destructive/15 text-destructive"
            }`}>
              {totalScore}%
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {totalScore >= 80 ? "Excellent ! 🌟" : totalScore >= 50 ? "Bien ! Continuez 💪" : "Réessayez 📖"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {totalScore >= 80
                ? "Vous maîtrisez cette sourate !"
                : "Réécoutez et réessayez les versets en rouge"}
            </p>
          </motion.div>

          {/* Per-ayah results */}
          <div className="space-y-3">
            {ayahResults.map((ar, i) => {
              const ayah = surah.ayahs[ar.ayahIndex];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card border border-border rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-muted-foreground">Verset {ayah.number}</span>
                    <span className={`text-sm font-bold ${ar.score >= 80 ? "text-success" : ar.score >= 50 ? "text-secondary" : "text-destructive"}`}>
                      {ar.score}%
                    </span>
                  </div>
                  <div className="arabic-text text-xl leading-[2.4] flex flex-wrap gap-x-2 justify-end">
                    {ar.results.map((wr, j) => (
                      <span
                        key={j}
                        className={`inline-flex items-center gap-0.5 ${wr.correct ? "text-success" : "text-destructive"}`}
                      >
                        {wr.word}
                        {wr.correct ? <CheckCircle2 size={10} className="inline" /> : <XCircle size={10} className="inline" />}
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
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-border text-foreground font-semibold active:scale-[0.98] transition-transform"
            >
              <RotateCcw size={18} /> Répéter
            </button>
            <button
              onClick={() => navigate("/learn")}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold active:scale-[0.98] transition-transform"
            >
              Sourate suivante <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
