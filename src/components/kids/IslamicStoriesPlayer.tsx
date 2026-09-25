import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, ArrowLeft, Volume2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { ISLAMIC_STORIES, type IslamicStory } from "@/data/islamicStories";
import { generateTTS } from "@/services/elevenLabsTTS";
import { AuthRequiredError } from "@/lib/edgeFunctionAuth";
import { toast } from "sonner";

/* ────── Voice config ────── */
const VOICE_CONFIG = {
  adult: { voiceId: "nPczCjzI2devNBz1zQrb", stability: 0.50, similarity_boost: 0.75, speed: 0.85 },
  child: { voiceId: "EXAVITQu4vr4xnSDxMaL", stability: 0.45, similarity_boost: 0.80, speed: 1.05 },
};

/* ────── Category colours ────── */
const CAT_STYLES: Record<string, string> = {
  pillars: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  prophets: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  quran: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  morals: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  history: "bg-violet-500/20 text-violet-300 border-violet-500/30",
};

/* ══════════════════════════════
   Story Card (list item)
   ══════════════════════════════ */
function StoryCard({ story, onSelect }: { story: IslamicStory; onSelect: () => void }) {
  const { t } = useLanguage();
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/10 text-left w-full"
    >
      <span className="text-3xl shrink-0">{story.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{t(story.titleKey as any)}</p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <Badge variant="outline" className={`text-[9px] border ${CAT_STYLES[story.category] ?? ""}`}>
            {t(`islamicStories.cat.${story.category}` as any)}
          </Badge>
          <span className="text-[10px] text-white/50">🎂 {story.ageRange}</span>
          <span className="text-[10px] text-white/50">⏱ {Math.ceil(story.durationSec / 60)} min</span>
        </div>
      </div>
      <Play size={18} className="text-white/40 shrink-0" />
    </motion.button>
  );
}

/* ══════════════════════════════
   Story Player (dialogue) — ElevenLabs voices
   ══════════════════════════════ */
function StoryPlayer({ story, onClose }: { story: IslamicStory; onClose: () => void }) {
  const { t } = useLanguage();
  const [currentLine, setCurrentLine] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioCache, setAudioCache] = useState<Record<number, string>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef(false);

  const line = story.dialogue[currentLine];
  const progress = ((currentLine + 1) / story.dialogue.length) * 100;

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      playingRef.current = false;
    };
  }, []);

  const getAudioUrl = useCallback(async (index: number): Promise<string> => {
    if (audioCache[index]) return audioCache[index];
    const dl = story.dialogue[index];
    const cfg = VOICE_CONFIG[dl.speaker];
    const url = await generateTTS(dl.text, cfg.voiceId, {
      stability: cfg.stability,
      similarity_boost: cfg.similarity_boost,
      speed: cfg.speed,
    });
    setAudioCache(prev => ({ ...prev, [index]: url }));
    return url;
  }, [audioCache, story.dialogue]);

  const playLine = useCallback(async (index: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsLoading(true);
    try {
      const url = await getAudioUrl(index);
      if (!playingRef.current) return; // stopped while loading

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        if (index < story.dialogue.length - 1 && playingRef.current) {
          setTimeout(() => {
            setCurrentLine(index + 1);
            playLine(index + 1);
          }, 500);
        } else {
          setIsPlaying(false);
          playingRef.current = false;
        }
      };
      audio.onerror = () => {
        setIsPlaying(false);
        playingRef.current = false;
        setIsLoading(false);
      };

      setIsLoading(false);
      await audio.play();
    } catch (err) {
      console.error("TTS playback error:", err);
      if (err instanceof AuthRequiredError) toast.error(t("stories.loginRequired"));
      setIsLoading(false);
      setIsPlaying(false);
      playingRef.current = false;
    }
  }, [getAudioUrl, story.dialogue.length, t]);

  const handlePlay = () => {
    playingRef.current = true;
    setIsPlaying(true);
    playLine(currentLine);
  };

  const handlePause = () => {
    playingRef.current = false;
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (audioRef.current) audioRef.current.pause();
    const next = Math.min(currentLine + 1, story.dialogue.length - 1);
    setCurrentLine(next);
    if (playingRef.current) playLine(next);
  };

  const handlePrev = () => {
    if (audioRef.current) audioRef.current.pause();
    const prev = Math.max(currentLine - 1, 0);
    setCurrentLine(prev);
    if (playingRef.current) playLine(prev);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      className="flex flex-col gap-4 px-4 py-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => { handlePause(); onClose(); }}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft size={20} />
        </Button>
        <p className="text-base font-bold text-white flex-1 truncate">
          {story.emoji} {t(story.titleKey as any)}
        </p>
      </div>

      {/* Progress */}
      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-400"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <p className="text-[10px] text-white/40 text-right -mt-2">
        {currentLine + 1} / {story.dialogue.length}
      </p>

      {/* Dialogue bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentLine}
          initial={{ opacity: 0, x: line.speaker === "child" ? 40 : -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-3 py-6"
        >
          <span className="text-5xl">{line.speaker === "adult" ? "👨" : "👧"}</span>
          <span className="text-[11px] font-semibold text-white/60">
            {line.speaker === "adult" ? t("islamicStories.speakerAdult" as any) : t("islamicStories.speakerChild" as any)}
          </span>
          <div
            className={`rounded-2xl px-5 py-4 max-w-[90%] ${
              line.speaker === "adult"
                ? "bg-white/10 border border-white/15"
                : "bg-amber-400/15 border border-amber-400/25"
            }`}
          >
            <p className="text-sm text-white leading-relaxed italic">"{line.text}"</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <Button size="icon" variant="ghost" onClick={handlePrev} className="text-white/60 hover:bg-white/10">
          <SkipBack size={20} />
        </Button>
        <Button
          size="icon"
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={isLoading}
          className="h-14 w-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 text-white shadow-lg"
        >
          {isLoading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={24} />
          ) : (
            <Play size={24} className="ml-0.5" />
          )}
        </Button>
        <Button size="icon" variant="ghost" onClick={handleNext} className="text-white/60 hover:bg-white/10">
          <SkipForward size={20} />
        </Button>
      </div>

      <p className="text-[10px] text-white/30 text-center flex items-center justify-center gap-1">
        <Volume2 size={12} /> 🎙️ ElevenLabs — {t("islamicStories.realVoices" as any)}
      </p>
    </motion.div>
  );
}

/* ══════════════════════════════
   Main export — List + Filters
   ══════════════════════════════ */
const FILTER_KEYS = ["all", "pillars", "prophets", "quran", "morals", "history"] as const;

export default function IslamicStoriesPlayer() {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<IslamicStory | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? ISLAMIC_STORIES : ISLAMIC_STORIES.filter((s) => s.category === filter);

  if (selected) {
    return <StoryPlayer story={selected} onClose={() => setSelected(null)} />;
  }

  return (
    <div className="flex flex-col gap-3 px-4">
      {/* Title */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">📚</span>
        <div>
          <h2 className="text-base font-extrabold text-white">{t("islamicStories.title" as any)}</h2>
          <p className="text-[10px] text-white/50">{t("islamicStories.subtitle" as any)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {FILTER_KEYS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              filter === f
                ? "bg-white/20 text-white border border-white/30"
                : "bg-white/[0.06] text-white/50 border border-transparent"
            }`}
          >
            {t(`islamicStories.filter.${f}` as any)}
          </button>
        ))}
      </div>

      {/* Story list */}
      <div className="flex flex-col gap-2">
        {filtered.map((story) => (
          <StoryCard key={story.id} story={story} onSelect={() => setSelected(story)} />
        ))}
      </div>
    </div>
  );
}
