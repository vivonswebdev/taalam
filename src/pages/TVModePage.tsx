import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoBackground } from '@/components/quran/VideoBackground';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { fetchFullSurah } from '@/lib/quranData';
import { RECITERS_LIST } from '@/data/reciters';
import {
  Play, Pause, SkipForward, SkipBack,
  Volume2, VolumeX, X, Settings,
} from 'lucide-react';

const TV_RECITERS = RECITERS_LIST.filter(r => r.popular && r.category !== 'kids').slice(0, 8);

export default function TVModePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState(TV_RECITERS[0]);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTranslit, setShowTranslit] = useState(false);
  const [arabicSize, setArabicSize] = useState<'md' | 'lg' | 'xl'>('xl');
  const [ayahDuration, setAyahDuration] = useState(8);
  const [surahNumber, setSurahNumber] = useState(1);
  const [ayahs, setAyahs] = useState<{ arabic: string; translation?: string; transliteration?: string }[]>([]);
  const [surahName, setSurahName] = useState('');
  const [isLoadingSurah, setIsLoadingSurah] = useState(true);

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

  // Audio playback per ayah
  useEffect(() => {
    if (!ayahs.length || isMuted) return;
    const surahStr = String(surahNumber).padStart(3, '0');
    const ayahStr = String(currentAyahIndex + 1).padStart(3, '0');
    // Use everyayah.com CDN
    const reciterFolder = getEveryAyahFolder(selectedReciter.id);
    const url = `https://everyayah.com/data/${reciterFolder}/${surahStr}${ayahStr}.mp3`;
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play().catch(() => {});
    }
  }, [currentAyahIndex, surahNumber, selectedReciter, ayahs.length, isMuted]);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 4000);
  }, []);

  useEffect(() => {
    resetControlsTimer();
    return () => clearTimeout(controlsTimer.current);
  }, [resetControlsTimer]);

  // Auto-advance ayah
  useEffect(() => {
    if (!isPlaying || !ayahs.length) return;
    const timer = setTimeout(() => {
      if (currentAyahIndex < ayahs.length - 1) {
        setCurrentAyahIndex(prev => prev + 1);
      } else {
        // Next surah
        if (surahNumber < 114) {
          setSurahNumber(prev => prev + 1);
        } else {
          setSurahNumber(1);
        }
      }
    }, ayahDuration * 1000);
    return () => clearTimeout(timer);
  }, [isPlaying, currentAyahIndex, ayahDuration, ayahs.length, surahNumber]);

  const nextAyah = () => {
    if (currentAyahIndex < ayahs.length - 1) {
      setCurrentAyahIndex(prev => prev + 1);
    } else if (surahNumber < 114) {
      setSurahNumber(prev => prev + 1);
    }
  };

  const prevAyah = () => {
    if (currentAyahIndex > 0) {
      setCurrentAyahIndex(prev => prev - 1);
    } else if (surahNumber > 1) {
      setSurahNumber(prev => prev - 1);
    }
  };

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
      <audio ref={audioRef} />

      <VideoBackground opacity={0.45} intervalSeconds={35} autoRotate={isPlaying} />

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 z-0" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 md:px-20">
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

        {/* Progress bar */}
        {ayahs.length > 0 && (
          <div className="mt-10 w-full max-w-md">
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                key={`progress-${surahNumber}-${currentAyahIndex}`}
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: ayahDuration, ease: 'linear' }}
              />
            </div>
            <p className="text-center text-white/40 text-xs mt-2">
              {currentAyahIndex + 1} / {ayahs.length}
            </p>
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
            className="absolute bottom-0 left-0 right-0 z-20 p-4 md:p-6"
          >
            <div className="max-w-3xl mx-auto bg-black/60 backdrop-blur-2xl rounded-3xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={prevAyah} className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
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

                      {/* Speed */}
                      <div>
                        <p className="text-white/60 text-xs mb-2">{t("tv.duration")}</p>
                        {[5, 8, 12, 15].map(sec => (
                          <button
                            key={sec}
                            onClick={() => setAyahDuration(sec)}
                            className={`w-full text-left px-3 py-1 rounded-lg text-xs transition mb-1 ${
                              ayahDuration === sec ? 'bg-white text-black font-bold' : 'text-white/70 hover:bg-white/10'
                            }`}
                          >
                            {sec}s
                          </button>
                        ))}
                      </div>
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
            className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6 flex items-center justify-between"
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

// Map reciter IDs to everyayah.com folder names
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
