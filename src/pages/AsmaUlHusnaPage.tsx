import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause, Repeat, ChevronLeft, ChevronRight, Heart, Square, FastForward } from "lucide-react";
import { ASMA_UL_HUSNA, type AsmaName } from "@/data/asmaUlHusnaData";
import { useLanguage, type Lang } from "@/hooks/useLanguage";
import SEOHead from "@/components/SEOHead";
import { motion, AnimatePresence } from "framer-motion";

const FAVORITES_KEY = "taalam_asma_favorites";
const AUDIO_BASE = "https://cdn.islamic.network/quran/audio/128/ar.alafasy/";

function getFavorites(): number[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function toggleFavorite(id: number): number[] {
  const favs = getFavorites();
  const next = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return next;
}

function getMeaning(name: AsmaName, lang: Lang): string {
  return name.meaning[lang] || name.meaning.fr;
}

function getExplanation(name: AsmaName, lang: Lang): string {
  return name.explanation[lang] || name.explanation.fr;
}

// ─── Learn Tab ───────────────────────────────────────────────
function AsmaLearnView() {
  const { t, lang } = useLanguage();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(getFavorites);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const name = ASMA_UL_HUSNA[currentIdx];

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, []);

  const playAudio = useCallback(() => {
    stopAudio();
    // Use a simple TTS-like approach: play the name's audio
    const audio = new Audio();
    // We'll use a simple approach - generate speech from Arabic text
    audio.src = `https://cdn.islamic.network/quran/audio/64/ar.alafasy/${name.id}.mp3`;
    audioRef.current = audio;

    audio.onended = () => {
      if (isLooping) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        setIsPlaying(false);
      }
    };

    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [name.id, isLooping, stopAudio]);

  useEffect(() => {
    return () => { stopAudio(); };
  }, [stopAudio]);

  useEffect(() => {
    stopAudio();
  }, [currentIdx, stopAudio]);

  const goTo = (idx: number) => {
    if (idx >= 0 && idx < 99) setCurrentIdx(idx);
  };

  const handleFavorite = () => {
    setFavorites(toggleFavorite(name.id));
  };

  const isFav = favorites.includes(name.id);

  return (
    <div className="flex flex-col flex-1 px-4 pb-4">
      {/* Counter */}
      <div className="text-center py-2">
        <span className="text-xs font-bold text-white/50">{name.id} / 99</span>
      </div>

      {/* Main card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={name.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col items-center justify-center gap-4 rounded-3xl bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-orange-500/20 border border-white/10 p-6 backdrop-blur-md"
        >
          {/* Arabic */}
          <p className="text-5xl md:text-6xl font-bold text-white leading-relaxed" style={{ fontFamily: "'Scheherazade New', 'Amiri', serif", direction: "rtl" }}>
            {name.arabic}
          </p>

          {/* Transliteration */}
          <p className="text-lg font-semibold text-amber-300/90 tracking-wide">
            {name.transliteration}
          </p>

          {/* Translation */}
          <p className="text-base font-medium text-white/80 text-center">
            {getMeaning(name, lang)}
          </p>

          {/* Explanation */}
          <p className="text-sm text-white/60 text-center max-w-sm leading-relaxed">
            {getExplanation(name, lang)}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-3 pt-4">
        <button
          onClick={() => goTo(currentIdx - 1)}
          disabled={currentIdx === 0}
          className="p-3 rounded-xl bg-white/[0.07] border border-white/10 disabled:opacity-30"
        >
          <ChevronLeft size={20} className="text-white/70" />
        </button>

        <button
          onClick={isPlaying ? stopAudio : playAudio}
          className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30"
        >
          {isPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white" />}
        </button>

        <button
          onClick={() => setIsLooping(!isLooping)}
          className={`p-3 rounded-xl border ${isLooping ? "bg-amber-500/30 border-amber-400/50" : "bg-white/[0.07] border-white/10"}`}
        >
          <Repeat size={18} className={isLooping ? "text-amber-300" : "text-white/50"} />
        </button>

        <button
          onClick={handleFavorite}
          className={`p-3 rounded-xl border ${isFav ? "bg-rose-500/30 border-rose-400/50" : "bg-white/[0.07] border-white/10"}`}
        >
          <Heart size={18} className={isFav ? "text-rose-400 fill-rose-400" : "text-white/50"} />
        </button>

        <button
          onClick={() => goTo(currentIdx + 1)}
          disabled={currentIdx === 98}
          className="p-3 rounded-xl bg-white/[0.07] border border-white/10 disabled:opacity-30"
        >
          <ChevronRight size={20} className="text-white/70" />
        </button>
      </div>

      {/* Quick grid */}
      <div className="mt-4 max-h-32 overflow-y-auto rounded-2xl bg-white/[0.04] border border-white/10 p-2">
        <div className="flex flex-wrap gap-1.5">
          {ASMA_UL_HUSNA.map((n, i) => (
            <button
              key={n.id}
              onClick={() => setCurrentIdx(i)}
              className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                i === currentIdx
                  ? "bg-amber-500/40 text-amber-200 border border-amber-400/50"
                  : "bg-white/[0.06] text-white/50 hover:text-white/80"
              }`}
            >
              {n.id}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Phonothèque Tab ─────────────────────────────────────────
function AsmaPhonothequeView() {
  const { t, lang } = useLanguage();
  const [playingGroup, setPlayingGroup] = useState<string | null>(null);
  const [isLooping, setIsLooping] = useState(false);
  const [speed, setSpeed] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [favorites] = useState<number[]>(getFavorites);

  const stopAll = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlayingGroup(null);
  }, []);

  const playGroup = useCallback((groupId: string, startId: number, endId: number) => {
    stopAll();
    let currentId = startId;

    const playNext = () => {
      if (currentId > endId) {
        if (isLooping) {
          currentId = startId;
        } else {
          setPlayingGroup(null);
          return;
        }
      }

      const audio = new Audio(`https://cdn.islamic.network/quran/audio/64/ar.alafasy/${currentId}.mp3`);
      audio.playbackRate = speed;
      audioRef.current = audio;
      audio.onended = () => {
        currentId++;
        playNext();
      };
      audio.play().catch(() => setPlayingGroup(null));
    };

    setPlayingGroup(groupId);
    playNext();
  }, [isLooping, speed, stopAll]);

  useEffect(() => {
    return () => { stopAll(); };
  }, [stopAll]);

  const groups = Array.from({ length: 10 }, (_, i) => ({
    id: `${i * 10 + 1}-${Math.min((i + 1) * 10, 99)}`,
    start: i * 10 + 1,
    end: Math.min((i + 1) * 10, 99),
  }));

  const favNames = ASMA_UL_HUSNA.filter(n => favorites.includes(n.id));

  return (
    <div className="flex flex-col gap-4 px-4 pb-6">
      {/* All 99 */}
      <button
        onClick={() => playingGroup === "all" ? stopAll() : playGroup("all", 1, 99)}
        className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-colors ${
          playingGroup === "all"
            ? "bg-amber-500/20 border-amber-400/40"
            : "bg-white/[0.06] border-white/10 hover:border-white/20"
        }`}
      >
        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
          {playingGroup === "all" ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white" />}
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold text-white">{t("asma.playAll")}</p>
          <p className="text-[10px] text-white/50">{t("asma.playAllDesc")}</p>
        </div>
      </button>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsLooping(!isLooping)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            isLooping ? "bg-amber-500/20 border-amber-400/40 text-amber-300" : "bg-white/[0.05] border-white/10 text-white/50"
          }`}
        >
          <Repeat size={12} /> {t("asma.loop")}
        </button>
        <button
          onClick={() => setSpeed(speed === 1 ? 0.85 : 1)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            speed !== 1 ? "bg-amber-500/20 border-amber-400/40 text-amber-300" : "bg-white/[0.05] border-white/10 text-white/50"
          }`}
        >
          <FastForward size={12} /> {speed === 1 ? "1x" : "0.85x"}
        </button>
        {playingGroup && (
          <button onClick={stopAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/20 border border-red-400/40 text-red-300">
            <Square size={12} /> Stop
          </button>
        )}
      </div>

      {/* Groups */}
      <div>
        <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">{t("asma.byGroup")}</p>
        <div className="grid grid-cols-2 gap-2">
          {groups.map(g => (
            <button
              key={g.id}
              onClick={() => playingGroup === g.id ? stopAll() : playGroup(g.id, g.start, g.end)}
              className={`flex items-center gap-2 p-3 rounded-xl border transition-colors ${
                playingGroup === g.id
                  ? "bg-amber-500/20 border-amber-400/40"
                  : "bg-white/[0.06] border-white/10 hover:border-white/20"
              }`}
            >
              {playingGroup === g.id ? <Pause size={14} className="text-amber-300" /> : <Play size={14} className="text-white/50" />}
              <span className="text-xs font-semibold text-white/80">{g.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Favorites */}
      {favNames.length > 0 && (
        <div>
          <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">❤️ {t("asma.favorites")}</p>
          <div className="flex flex-col gap-1.5">
            {favNames.map(n => (
              <div key={n.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.05] border border-white/10">
                <span className="text-base font-bold text-white/80" style={{ fontFamily: "'Scheherazade New', serif", direction: "rtl" }}>{n.arabic}</span>
                <span className="text-xs text-white/50 flex-1">{n.transliteration}</span>
                <button
                  onClick={() => {
                    const audio = new Audio(`https://cdn.islamic.network/quran/audio/64/ar.alafasy/${n.id}.mp3`);
                    audio.playbackRate = speed;
                    audio.play().catch(() => {});
                  }}
                  className="p-1.5 rounded-lg bg-amber-500/20"
                >
                  <Play size={12} className="text-amber-300" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function AsmaUlHusnaPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [tab, setTab] = useState<"learn" | "phono">("learn");

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-[hsl(40,50%,10%)] via-[hsl(35,40%,14%)] to-[hsl(30,35%,8%)]">
      <SEOHead title="99 Noms d'Allah - Asma ul Husna" description="Apprenez les 99 Noms d'Allah avec audio, arabe, phonétique et traduction." path="/moods/asma-ul-husna" />

      {/* Google Font for Arabic */}
      <link href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-3">
        <button onClick={() => navigate("/moods")} className="p-2 rounded-xl bg-white/[0.07] backdrop-blur-md border border-white/15">
          <ArrowLeft size={20} className="text-white/70" />
        </button>
        <div>
          <h1 className="text-lg font-extrabold text-white">🕌 {t("asma.title")}</h1>
          <p className="text-[10px] text-white/50">{t("asma.subtitle")}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pb-3">
        <div className="flex bg-white/[0.06] backdrop-blur-md rounded-2xl p-1 gap-1 border border-white/10">
          {(["learn", "phono"] as const).map(tabId => (
            <button
              key={tabId}
              onClick={() => setTab(tabId)}
              className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                tab === tabId
                  ? "bg-white/20 text-white shadow-md border border-white/20"
                  : "text-white/50 hover:text-white/70"
              }`}
            >
              {tabId === "learn" ? `📖 ${t("asma.tabLearn")}` : `🎧 ${t("asma.tabPhono")}`}
            </button>
          ))}
        </div>
      </div>

      {tab === "learn" ? <AsmaLearnView /> : <AsmaPhonothequeView />}
    </div>
  );
}
