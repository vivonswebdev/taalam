import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoBackground } from '@/components/quran/VideoBackground';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { fetchFullSurah, fetchSurahList, type SurahMeta } from '@/lib/quranData';
import { RECITERS_LIST } from '@/data/reciters';
import { Loader2 } from 'lucide-react';
import {
  Play, Pause, SkipForward, SkipBack,
  Volume2, VolumeX, X, Settings, Search,
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
  const [showArabic, setShowArabic] = useState(true);
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

  // Surah list for picker
  const [allSurahs, setAllSurahs] = useState<SurahMeta[]>([]);
  const [surahSearch, setSurahSearch] = useState('');

  const controlsTimer = useRef<ReturnType<typeof setTimeout>>();

  // Load surah list
  useEffect(() => {
    fetchSurahList().then(setAllSurahs).catch(() => {});
  }, []);

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
        arabic: a.arabic || a.text || '',
        translation: transData?.data?.ayahs?.[i]?.text || '',
        transliteration: translitData?.data?.ayahs?.[i]?.text || '',
      }));
      setAyahs(mapped);
      setIsLoadingSurah(false);
    }).catch(() => setIsLoadingSurah(false));
  }, [surahNumber]);

  const nextAyah = useCallback(() => {
    setAudioProgress(0);
    setAyahs(prev => {
      setCurrentAyahIndex(ci => {
        if (ci < prev.length - 1) return ci + 1;
        setSurahNumber(sn => sn < 114 ? sn + 1 : 1);
        return 0;
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

  // Audio playback — advance on 'ended'
  useEffect(() => {
    if (!ayahs.length || !isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      return;
    }

    const surahStr = String(surahNumber).padStart(3, '0');
    const ayahStr = String(currentAyahIndex + 1).padStart(3, '0');
    const reciterFolder = getEveryAyahFolder(selectedReciter.id);
    const url = `https://everyayah.com/data/${reciterFolder}/${surahStr}${ayahStr}.mp3`;

    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }

    setAudioLoading(true);
    setAudioProgress(0);
    setAudioDuration(0);

    const audio = new Audio(url);
    audio.volume = isMuted ? 0 : 1;
    audioRef.current = audio;

    const onEnded = () => nextAyah();
    const onTimeUpdate = () => {
      if (audio.duration > 0) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
        setAudioDuration(audio.duration);
      }
    };
    const onCanPlay = () => setAudioLoading(false);
    const onError = () => { setAudioLoading(false); setTimeout(() => nextAyah(), 5000); };

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('canplaythrough', onCanPlay);
    audio.addEventListener('error', onError);

    audio.play().catch(() => setAudioLoading(false));

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
    if (isPlaying) audioRef.current?.pause();
    else audioRef.current?.play().catch(() => {});
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

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : 1;
  }, [isMuted]);

  const currentAyah = ayahs[currentAyahIndex];
  const arabicSizes = { md: 'text-3xl md:text-4xl', lg: 'text-4xl md:text-6xl', xl: 'text-5xl md:text-7xl' };

  const filteredSurahs = allSurahs.filter(s => {
    if (!surahSearch.trim()) return true;
    const q = surahSearch.toLowerCase();
    return s.nameArabic.includes(surahSearch) || s.name.toLowerCase().includes(q) || s.englishName.toLowerCase().includes(q) || String(s.number).includes(q);
  });

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#000',
        cursor: showControls ? 'default' : 'none',
        userSelect: 'none',
      }}
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
      onTouchStart={resetControlsTimer}
    >
      {/* Video background */}
      <VideoBackground opacity={0.65} intervalSeconds={35} autoRotate={isPlaying} />

      {/* Content — Arabic text centered */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 2rem',
          pointerEvents: 'none',
        }}
      >

        {isLoadingSurah ? (
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'rgba(255,255,255,0.5)' }} />
        ) : currentAyah ? (
          <>
            {showArabic && currentAyah.arabic && (
              <div
                key={`arabic-${surahNumber}-${currentAyahIndex}`}
                style={{ textAlign: 'center', maxWidth: '64rem' }}
              >
                <p
                  className={`font-arabic leading-loose ${arabicSizes[arabicSize]}`}
                  style={{
                    color: '#FFFFFF',
                    fontWeight: 600,
                    textShadow: '0 4px 40px rgba(0,0,0,0.9), 0 2px 15px rgba(0,0,0,0.7)',
                    fontFamily: '"Scheherazade New", "Amiri", serif',
                  }}
                  dir="rtl"
                >
                  {currentAyah.arabic}
                </p>
              </div>
            )}

            {showTranslit && currentAyah.transliteration && (
              <motion.p
                key={`translit-${currentAyahIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', fontStyle: 'italic', textAlign: 'center', marginTop: '1rem', maxWidth: '48rem' }}
              >
                {currentAyah.transliteration}
              </motion.p>
            )}

            {showTranslation && currentAyah.translation && (
              <motion.p
                key={`trans-${currentAyahIndex}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.25rem', textAlign: 'center', maxWidth: '48rem', fontWeight: 300, marginTop: '1rem', textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}
              >
                {currentAyah.translation}
              </motion.p>
            )}
          </>
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem' }}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        )}

        {/* Minimal progress bar at bottom of content area */}
        {ayahs.length > 0 && !showControls && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48">
            <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/30 rounded-full transition-all duration-200"
                style={{ width: `${audioProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Controls — appear on mouse/touch */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 p-4 md:p-6"
            style={{ zIndex: 20 }}
          >
            <div className="max-w-2xl mx-auto bg-black/50 backdrop-blur-xl rounded-2xl p-3 border border-white/10">
              {/* Main controls row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button onClick={prevAyah} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button onClick={togglePlay} className="p-3 rounded-full bg-white text-black hover:scale-105 transition shadow-lg">
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <button onClick={nextAyah} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Audio progress */}
                <div className="flex-1 mx-4">
                  <div className="relative w-full h-1 bg-white/15 rounded-full overflow-hidden">
                    {audioLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-3 h-3 text-white/50 animate-spin" />
                      </div>
                    )}
                    <div
                      className="h-full bg-white/50 rounded-full transition-all duration-200"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-white/30 text-[9px]">
                      {audioDuration > 0 ? `${Math.floor((audioProgress / 100) * audioDuration)}s` : ''}
                    </span>
                    <span className="text-white/30 text-[9px]">
                      {currentAyahIndex + 1}/{ayahs.length}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button onClick={() => setIsMuted(!isMuted)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/60 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Settings panel */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 mt-3 border-t border-white/10 grid grid-cols-2 md:grid-cols-3 gap-3">
                      {/* Reciter */}
                      <div>
                        <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1.5">{t("tv.reciter")}</p>
                        <div className="space-y-0.5 max-h-28 overflow-y-auto">
                          {TV_RECITERS.map(r => (
                            <button
                              key={r.id}
                              onClick={() => setSelectedReciter(r)}
                              className={`w-full text-left px-2 py-1 rounded text-[11px] transition ${
                                selectedReciter.id === r.id ? 'bg-white text-black font-bold' : 'text-white/60 hover:bg-white/10'
                              }`}
                            >
                              {r.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Surah picker */}
                      <div>
                        <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1.5">{t("tv.surah")}</p>
                        <div className="relative mb-1.5">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" />
                          <input
                            type="text"
                            value={surahSearch}
                            onChange={e => setSurahSearch(e.target.value)}
                            placeholder="..."
                            className="w-full bg-white/5 border border-white/10 rounded pl-6 pr-2 py-1 text-[11px] text-white outline-none focus:border-white/30"
                          />
                        </div>
                        <div className="space-y-0.5 max-h-28 overflow-y-auto">
                          {filteredSurahs.slice(0, 30).map(s => (
                            <button
                              key={s.number}
                              onClick={() => { setSurahNumber(s.number); setSurahSearch(''); }}
                              className={`w-full text-left px-2 py-1 rounded text-[11px] transition flex items-center gap-1.5 ${
                                surahNumber === s.number ? 'bg-white text-black font-bold' : 'text-white/60 hover:bg-white/10'
                              }`}
                            >
                              <span className="text-[9px] w-5 text-center opacity-60">{s.number}</span>
                              <span className="font-arabic text-xs">{s.nameArabic}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Display options */}
                      <div>
                        <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1.5">{t("tv.display")}</p>
                        <label className="flex items-center gap-1.5 cursor-pointer mb-1.5">
                          <input type="checkbox" checked={showArabic} onChange={e => setShowArabic(e.target.checked)} className="accent-white w-3 h-3" />
                          <span className="text-white/70 text-[11px]">عربي</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer mb-1.5">
                          <input type="checkbox" checked={showTranslation} onChange={e => setShowTranslation(e.target.checked)} className="accent-white w-3 h-3" />
                          <span className="text-white/70 text-[11px]">{t("tv.translation")}</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer mb-2">
                          <input type="checkbox" checked={showTranslit} onChange={e => setShowTranslit(e.target.checked)} className="accent-white w-3 h-3" />
                          <span className="text-white/70 text-[11px]">{t("tv.transliteration")}</span>
                        </label>

                        <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">{t("tv.textSize")}</p>
                        <div className="flex gap-1">
                          {(['md', 'lg', 'xl'] as const).map(size => (
                            <button
                              key={size}
                              onClick={() => setArabicSize(size)}
                              className={`px-2 py-0.5 rounded text-[10px] transition ${
                                arabicSize === size ? 'bg-white text-black font-bold' : 'text-white/50 bg-white/5 hover:bg-white/10'
                              }`}
                            >
                              {size === 'md' ? 'A' : size === 'lg' ? 'A+' : 'A++'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
