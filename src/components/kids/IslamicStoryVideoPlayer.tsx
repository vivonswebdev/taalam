import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipForward, SkipBack, ArrowLeft,
  Subtitles, Volume2, Loader2, X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import {
  ISLAMIC_STORIES_VIDEO, VOICE_IDS, VOICE_SETTINGS,
  type IslamicStoryVideo, type SubtitleLine,
} from "@/data/islamicStoriesVideo";
import { generateTTS } from "@/services/elevenLabsTTS";

/* ────── helpers ────── */
type LangKey = "fr" | "en" | "ar" | "nl" | "tr" | "ur";
const LANG_FLAGS: Record<LangKey, string> = {
  fr: "🇫🇷", en: "🇬🇧", ar: "🇸🇦", nl: "🇳🇱", tr: "🇹🇷", ur: "🇵🇰",
};
const RTL_LANGS: LangKey[] = ["ar", "ur"];
const CAT_STYLES: Record<string, string> = {
  pillars: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  prophets: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  quran: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  morals: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  history: "bg-violet-500/20 text-violet-300 border-violet-500/30",
};
const FILTER_KEYS = ["all", "pillars", "prophets", "quran", "morals"] as const;

/* ══════════════════════════════
   Story Card
   ══════════════════════════════ */
function VideoStoryCard({
  story, onSelect,
}: { story: IslamicStoryVideo; onSelect: () => void }) {
  const { t } = useLanguage();
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className="relative overflow-hidden rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/10 text-left w-full"
    >
      {/* Poster */}
      <div className="relative h-32 w-full overflow-hidden">
        <img
          src={story.videoPoster}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
          <Badge variant="outline" className={`text-[9px] border ${CAT_STYLES[story.category] ?? ""}`}>
            {t(`islamicStories.cat.${story.category}` as any)}
          </Badge>
          <span className="text-[10px] text-white/60">🎂 {story.ageRange}</span>
          <span className="text-[10px] text-white/60">⏱ {Math.ceil(story.durationSec / 60)} min</span>
        </div>
        <div className="absolute top-2 right-2">
          <Badge className="bg-purple-500/80 text-white text-[8px] border-0">
            🌍 6 {t("videoStories.langs" as any)}
          </Badge>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play size={20} className="text-white ml-0.5" />
          </div>
        </div>
      </div>
      {/* Info */}
      <div className="p-3 flex items-center gap-2">
        <span className="text-2xl">{story.emoji}</span>
        <p className="text-sm font-bold text-white truncate flex-1">
          {t(story.titleKey as any)}
        </p>
      </div>
    </motion.button>
  );
}

/* ══════════════════════════════
   Video Player (fullscreen modal)
   ══════════════════════════════ */
function VideoPlayer({
  story, onClose,
}: { story: IslamicStoryVideo; onClose: () => void }) {
  const { t, lang } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoGenerateRef = useRef(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSubs, setShowSubs] = useState(true);
  const [subLang, setSubLang] = useState<LangKey>((lang as LangKey) || "fr");
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsLineIdx, setTtsLineIdx] = useState(-1);
  const [generatedAudios, setGeneratedAudios] = useState<Record<number, string>>({});

  // Find current subtitle
  const currentSub = story.subtitles.find(
    (s) => currentTime >= s.startSec && currentTime < s.endSec
  );

  // Update time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handler = () => setCurrentTime(video.currentTime);
    video.addEventListener("timeupdate", handler);
    return () => video.removeEventListener("timeupdate", handler);
  }, []);


  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
      // Start auto-generating all voices in background
      if (!autoGenerateRef.current) {
        autoGenerateRef.current = true;
        generateAll();
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const seek = useCallback((delta: number) => {
    const video = videoRef.current;
    if (video) video.currentTime = Math.max(0, video.currentTime + delta);
  }, []);

  // Generate TTS for one line
  const generateLineAudio = useCallback(async (line: SubtitleLine, idx: number) => {
    if (generatedAudios[idx]) return;
    setTtsLoading(true);
    setTtsLineIdx(idx);
    try {
      const voiceId = VOICE_IDS[line.speaker];
      const settings = VOICE_SETTINGS[line.speaker];
      const text = line.translations[subLang] || line.translations.en;
      const url = await generateTTS(text, voiceId, settings);
      setGeneratedAudios((prev) => ({ ...prev, [idx]: url }));
    } catch (err) {
      console.error("TTS error:", err);
    } finally {
      setTtsLoading(false);
      setTtsLineIdx(-1);
    }
  }, [generatedAudios, subLang]);

  // Generate all lines
  const generateAll = useCallback(async () => {
    setTtsLoading(true);
    for (let i = 0; i < story.subtitles.length; i++) {
      if (generatedAudios[i]) continue;
      setTtsLineIdx(i);
      try {
        const line = story.subtitles[i];
        const voiceId = VOICE_IDS[line.speaker];
        const settings = VOICE_SETTINGS[line.speaker];
        const text = line.translations[subLang] || line.translations.en;
        const url = await generateTTS(text, voiceId, settings);
        setGeneratedAudios((prev) => ({ ...prev, [i]: url }));
      } catch (err) {
        console.error("TTS error line", i, err);
      }
    }
    setTtsLoading(false);
    setTtsLineIdx(-1);
  }, [story.subtitles, generatedAudios, subLang]);

  // Play audio when subtitle changes and audio exists
  useEffect(() => {
    const idx = story.subtitles.findIndex(
      (s) => currentTime >= s.startSec && currentTime < s.endSec
    );
    if (idx >= 0 && generatedAudios[idx]) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(generatedAudios[idx]);
      audioRef.current = audio;
      audio.play().catch(() => {});
    }
  }, [currentSub?.startSec]);

  const isRtl = RTL_LANGS.includes(subLang);
  const duration = videoRef.current?.duration || story.durationSec;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Video background */}
      <video
        ref={videoRef}
        src={story.videoUrl}
        poster={story.videoPoster}
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4">
        <Button
          size="icon" variant="ghost"
          onClick={() => {
            if (audioRef.current) audioRef.current.pause();
            videoRef.current?.pause();
            onClose();
          }}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft size={20} />
        </Button>
        <p className="text-sm font-bold text-white truncate flex-1 mx-3">
          {story.emoji} {t(story.titleKey as any)}
        </p>
        <Button
          size="icon" variant="ghost"
          onClick={() => setShowSubs(!showSubs)}
          className={`text-white hover:bg-white/10 ${showSubs ? "bg-white/20" : ""}`}
        >
          <Subtitles size={18} />
        </Button>
        <Button
          size="icon" variant="ghost"
          onClick={onClose}
          className="text-white hover:bg-white/10"
        >
          <X size={18} />
        </Button>
      </div>

      {/* Language selector */}
      <div className="relative z-10 flex justify-center gap-2 mt-2 px-4">
        {(Object.keys(LANG_FLAGS) as LangKey[]).map((lang) => (
          <button
            key={lang}
            onClick={() => setSubLang(lang)}
            className={`px-2 py-1 rounded-full text-xs font-semibold transition-all ${
              subLang === lang
                ? "bg-white/25 text-white border border-white/40"
                : "bg-white/[0.06] text-white/50 border border-transparent"
            }`}
          >
            {LANG_FLAGS[lang]}
          </button>
        ))}
      </div>

      {/* Subtitle display */}
      <div className="flex-1 relative z-10 flex items-end justify-center pb-36 px-4">
        <AnimatePresence mode="wait">
          {showSubs && currentSub && (
            <motion.div
              key={`${currentSub.startSec}-${currentSub.speaker}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={`max-w-[90%] flex gap-3 items-end ${
                currentSub.speaker === "child" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <span className="text-3xl shrink-0">
                {currentSub.speaker === "adult" ? "👨" : "👧"}
              </span>
              <div
                className={`rounded-2xl px-4 py-3 backdrop-blur-md ${
                  currentSub.speaker === "adult"
                    ? "bg-black/60 border border-white/15"
                    : "bg-purple-500/40 border border-purple-400/30"
                }`}
                dir={isRtl ? "rtl" : "ltr"}
              >
                <p className={`text-sm text-white leading-relaxed ${
                  isRtl ? "font-arabic text-right" : ""
                }`}>
                  {currentSub.translations[subLang] || currentSub.translations.en}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="relative z-10 px-4 pb-6 space-y-3">
        {/* Progress bar */}
        <div
          className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            if (videoRef.current) videoRef.current.currentTime = pct * duration;
          }}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-4">
          <Button size="icon" variant="ghost" onClick={() => seek(-5)} className="text-white/60 hover:bg-white/10">
            <SkipBack size={20} />
          </Button>
          <Button
            size="icon"
            onClick={togglePlay}
            className="h-14 w-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 text-white shadow-lg"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
          </Button>
          <Button size="icon" variant="ghost" onClick={() => seek(5)} className="text-white/60 hover:bg-white/10">
            <SkipForward size={20} />
          </Button>
        </div>

        {/* Generate voice button */}
        <button
          onClick={generateAll}
          disabled={ttsLoading}
          className="w-full py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white/70 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {ttsLoading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              {t("videoStories.generating" as any)} ({ttsLineIdx + 1}/{story.subtitles.length})
            </>
          ) : (
            <>
              <Volume2 size={14} />
              {t("videoStories.generateVoice" as any)}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════
   Main Export — List + Filters
   ══════════════════════════════ */
export default function IslamicStoryVideoPlayer() {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<IslamicStoryVideo | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filtered =
    filter === "all"
      ? ISLAMIC_STORIES_VIDEO
      : ISLAMIC_STORIES_VIDEO.filter((s) => s.category === filter);

  return (
    <>
      <div className="flex flex-col gap-3 px-4 mt-6">
        {/* Title */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎬</span>
          <div>
            <h2 className="text-base font-extrabold text-white">
              {t("videoStories.title" as any)}
            </h2>
            <p className="text-[10px] text-white/50">
              {t("videoStories.subtitle" as any)}
            </p>
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

        {/* Story grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((story) => (
            <VideoStoryCard
              key={story.id}
              story={story}
              onSelect={() => setSelected(story)}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen player */}
      <AnimatePresence>
        {selected && (
          <VideoPlayer
            story={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
