import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoBackground } from '@/components/quran/VideoBackground';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { fetchFullSurah } from '@/lib/quranData';
import { RECITERS_LIST } from '@/data/reciters';
import { Loader2 } from 'lucide-react';
import {
  Play, Pause, SkipForward, SkipBack,
  Volume2, VolumeX, X, Settings,
} from 'lucide-react';

const TV_RECITERS = RECITERS_LIST.filter(r => r.popular && r.category !== 'kids').slice(0, 8);

export default function TVModePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState(TV_RECITERS[0]);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showTranslit, setShowTranslit] = useState(false);
  const [arabicSize, setArabicSize] = useState<'md' | 'lg' | 'xl'>('xl');
  const [surahNumber, setSurahNumber] = useState(1);
  const [ayahs, setAyahs] = useState<{ arabic: string; translation?: string; transliteration?: string }[]>([]);
  const [surahName, setSurahName] = useState('');
  const [isLoadingSurah, setIsLoadingSurah] = useState(true);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const controlsTimer = useRef<ReturnType<typeof setTimeout>>();

  // Load surah data
  useEffect(() => {
    setIsLoadingSurah(true);
    setCurrentAyahIndex(0);
    Promise.all([
      fetchFullSurah(surahNumber),
      fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/fr.hamidullah`).then(r => r.json()).catch(() => null),
      fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.transliteration`).then(r => r.json()).catch(() => null),
    ]).then(([surah, transData, translitData]) => {
      setSurahName(surah.nameArabic || `سورة ${surahNumber}`);
      const mapped = surah.ayahs.map((a: any, i: number) => ({
        arabic: a.text,
        translation: transData?.data?.ayahs?.[i]?.text || '',
        transliteration: translitData?.data?.ayahs?.[i]?.text || '',
      }));
      setAyahs(mapped);
      setIsLoadingSurah(false);
    }).catch(() => setIsLoadingSurah(false));
  }, [surahNumber]);

  // Next/Prev ayah with useCallback to avoid stale closures
  const nextAyah = useCallback(() => {
    setAudioProgress(0);
    setAyahs(prev => {
      // Use functional updates to read latest state
      setCurrentAyahIndex(ci => {
        if (ci < prev.length - 1) {
          return ci + 1;
        } else {
          setSurahNumber(sn => sn < 114 ? sn + 1 : 1);
          return 0;
        }
      });
      return prev;
    });
  }, []);

  const prevAyah = useCallback(() => {
    setAudioProgress(0);
    setCurrentAyahIndex(prev => {
      if (prev > 0) return prev - 1;
      setSurahNumber(sn => sn > 1 ? sn - 1 : sn);
      return 0;
    });
  }, []);

  // Audio playback — listen to 'ended' event instead of fixed timer
  useEffect(() => {
    if (!ayahs.length || !isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    const surahStr = String(surahNumber).padStart(3, '0');
    const ayahStr = String(currentAyahIndex + 1).padStart(3, '0');
    const reciterFolder = getEveryAyahFolder(selectedReciter.id);
    const url = `https://everyayah.com/data/${reciterFolder}/${surahStr}${ayahStr}.mp3`;

    // Clean up previous
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    setAudioLoading(true);
    setAudioProgress(0);
    setAudioDuration(0);

    const audio = new Audio(url);
    audio.volume = isMuted ? 0 : 1;
    audioRef.current = audio;

    const onEnded = () => {
      nextAyah();
    };

    const onTimeUpdate = () => {
      if (audio.duration > 0) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
        setAudioDuration(audio.duration);
      }
    };

    const onCanPlay = () => {
      setAudioLoading(false);
    };

    const onError = () => {
      setAudioLoading(false);
      // Fallback: advance after 5s on error
      setTimeout(() => nextAyah(), 5000);
    };

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('canplaythrough', onCanPlay);
    audio.addEventListener('error', onError);

    audio.play().catch(() => {
      setAudioLoading(false);
    });

    return () => {
      audio.pause();
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('canplaythrough', onCanPlay);
      audio.removeEventListener('error', onError);
      audio.src = '';
    };
  }, [currentAyahIndex, surahNumber, selectedReciter, ayahs.length, isMuted, isPlaying, nextAyah]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(() => {});
    }
    setIsPlaying(prev => !prev);
  }, [isPlaying]);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 4000);
  }, []);

  useEffect(() => {
    resetControlsTimer();
    return () => clearTimeout(controlsTimer.current);
  }, [resetControlsTimer]);

  // Update mute on existing audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 1;
    }
  }, [isMuted]);

  const currentAyah = ayahs[currentAyahIndex];
  const arabicSizes = { md: 'text-3xl md:text-4xl', lg: 'text-4xl md:text-6xl', xl: 'text-5xl md:text-7xl' };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-black select-none"
      style={{ cursor: showControls ? 'default' : 'none' }}
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
      onTouchStart={resetControlsTimer}
    >
      {/* Video background — z-index 0 */}
      <VideoBackground opacity={0.45} intervalSeconds={35} autoRotate={isPlaying} />

      {/* Overlay — z-index 1 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" style={{ zIndex: 1 }} />

      {/* Content — z-index 10 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 md:px-20" style={{ zIndex: 10 }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
        >
          <span className="text-white/70 text-sm font-medium">
            📺 {t("tv.title")} — {selectedReciter.name}
          </span>
        </motion.div>

        {/* Surah + Ayah ref */}
        <motion.div
          key={`ref-${surahNumber}-${currentAyahIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 text-white/60 text-lg font-arabic"
        >
          {surahName} — {t("detail.verse" as any)} {currentAyahIndex + 1}
        </motion.div>

        {/* Arabic text */}
        {isLoadingSurah ? (
          <div className="text-white/50 text-lg">{t("common.loading")}</div>
        ) : currentAyah ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`arabic-${surahNumber}-${currentAyahIndex}`}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 1.05 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="text-center max-w-5xl mb-6"
              >
                <p
                  className={`font-arabic text-white font-semibold leading-relaxed ${arabicSizes[arabicSize]}`}
                  style={{
                    textShadow: '0 4px 30px rgba(0,0,0,0.9), 0 2px 10px rgba(0,0,0,0.8)',
                    fontFamily: '"Scheherazade New", "Amiri", serif',
                  }}
                  dir="rtl"
                >
                  {currentAyah.arabic}
                </p>
              </motion.div>
            </AnimatePresence>

            {showTranslit && currentAyah.transliteration && (
              <AnimatePresence mode="wait">
                <motion.p
                  key={`translit-${currentAyahIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-white/60 text-base md:text-lg italic text-center mb-3 max-w-3xl"
                >
                  {currentAyah.transliteration}
                </motion.p>
              </AnimatePresence>
            )}

            {showTranslation && currentAyah.translation && (
              <AnimatePresence mode="wait">
                <motion.p
                  key={`trans-${currentAyahIndex}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-white/80 text-lg md:text-2xl text-center max-w-3xl font-light"
                  style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
                >
                  {currentAyah.translation}
                </motion.p>
              </AnimatePresence>
            )}
          </>
        ) : null}

        {/* Real audio progress bar */}
        {ayahs.length > 0 && (
          <div className="mt-10 w-full max-w-md">
            <div className="relative w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              {audioLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white/60 animate-spin" />
                </div>
              )}
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full transition-all duration-200"
                style={{ width: `${audioProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-white/40 text-[10px]">
                {audioDuration > 0 ? `${Math.floor((audioProgress / 100) * audioDuration)}s` : '--'}
              </span>
              <span className="text-white/40 text-[10px]">
                {currentAyahIndex + 1} / {ayahs.length}
              </span>
              <span className="text-white/40 text-[10px]">
                {audioDuration > 0 ? `${Math.floor(audioDuration)}s` : '--'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 p-4 md:p-6"
            style={{ zIndex: 20 }}
          >
            <div className="max-w-3xl mx-auto bg-black/60 backdrop-blur-2xl rounded-3xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={prevAyah} className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="p-3.5 rounded-full bg-white text-black hover:scale-105 transition shadow-lg"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </button>
                  <button onClick={nextAyah} className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-center hidden md:block">
                  <p className="text-white font-semibold text-sm">{selectedReciter.name}</p>
                  <p className="text-white/60 text-xs">{selectedReciter.nameArabic}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setIsMuted(!isMuted)} className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <button onClick={() => setShowSettings(!showSettings)} className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
                    <Settings className="w-5 h-5" />
                  </button>
                  <button onClick={() => navigate(-1)} className="p-2.5 rounded-full bg-red-500/30 hover:bg-red-500/50 text-white transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Reciter */}
                      <div>
                        <p className="text-white/60 text-xs mb-2">{t("tv.reciter")}</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {TV_RECITERS.map(r => (
                            <button
                              key={r.id}
                              onClick={() => setSelectedReciter(r)}
                              className={`w-full text-left px-3 py-1 rounded-lg text-xs transition ${
                                selectedReciter.id === r.id
                                  ? 'bg-white text-black font-bold'
                                  : 'text-white/70 hover:bg-white/10'
                              }`}
                            >
                              {r.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Text size */}
                      <div>
                        <p className="text-white/60 text-xs mb-2">{t("tv.textSize")}</p>
                        {(['md', 'lg', 'xl'] as const).map(size => (
                          <button
                            key={size}
                            onClick={() => setArabicSize(size)}
                            className={`w-full text-left px-3 py-1 rounded-lg text-xs transition mb-1 ${
                              arabicSize === size ? 'bg-white text-black font-bold' : 'text-white/70 hover:bg-white/10'
                            }`}
                          >
                            {size === 'md' ? '🔡 Normal' : size === 'lg' ? '🔠 Grand' : '⬛ XL'}
                          </button>
                        ))}
                      </div>

                      {/* Display options */}
                      <div>
                        <p className="text-white/60 text-xs mb-2">{t("tv.display")}</p>
                        <label className="flex items-center gap-2 cursor-pointer mb-2">
                          <input type="checkbox" checked={showTranslation} onChange={e => setShowTranslation(e.target.checked)} className="accent-white" />
                          <span className="text-white/80 text-xs">{t("tv.translation")}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={showTranslit} onChange={e => setShowTranslit(e.target.checked)} className="accent-white" />
                          <span className="text-white/80 text-xs">{t("tv.transliteration")}</span>
                        </label>
                      </div>

                      {/* Empty placeholder for grid alignment */}
                      <div />
                    </div>

                    {/* Surah selector */}
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-white/60 text-xs mb-2">{t("tv.surah")}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => surahNumber > 1 && setSurahNumber(prev => prev - 1)}
                          className="px-3 py-1 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20 transition"
                        >
                          ◀
                        </button>
                        <span className="text-white text-sm font-semibold flex-1 text-center">
                          {surahNumber}. {surahName}
                        </span>
                        <button
                          onClick={() => surahNumber < 114 && setSurahNumber(prev => prev + 1)}
                          className="px-3 py-1 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20 transition"
                        >
                          ▶
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between"
            style={{ zIndex: 20 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
                <span className="text-white text-lg">📺</span>
              </div>
              <div>
                <p className="text-white font-bold text-base">{t("tv.title")}</p>
                <p className="text-white/50 text-xs">Taaloum</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getEveryAyahFolder(reciterId: string): string {
  const map: Record<string, string> = {
    'ar.alafasy': 'Alafasy_128kbps',
    'ar.husary': 'Husary_128kbps',
    'ar.minshawi': 'Minshawy_Murattal_128kbps',
    'ar.abdulbasitmurattal': 'Abdul_Basit_Murattal_192kbps',
    'ar.abdurrahmaansudais': 'Abdurrahmaan_As-Sudais_192kbps',
    'ar.ghamadi': 'Ghamadi_40kbps',
    'ar.shuraim': 'Saood_ash-Shuraym_128kbps',
    'ar.ajmi': 'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net',
    'ar.rifai': 'Hani_Rifai_192kbps',
    'ar.shatri': 'Abu_Bakr_Ash-Shaatree_128kbps',
  };
  return map[reciterId] || 'Alafasy_128kbps';
}
