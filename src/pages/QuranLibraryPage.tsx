import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import PageBackground from "@/components/PageBackground";
import SEOHead from "@/components/SEOHead";
import { YouTubePlayer } from "@/components/library/YouTubePlayer";
import {
  QURAN_PLAYLISTS,
  PLAYLIST_LANGUAGE_CONFIG,
  type QuranPlaylist,
  type PlaylistCategory,
} from "@/data/quranEducationPlaylists";

const CATEGORY_CONFIG: Record<PlaylistCategory, { icon: string; labelKey: string }> = {
  tajweed: { icon: "🎵", labelKey: "library.catTajweed" },
  tafsir: { icon: "📖", labelKey: "library.catTafsir" },
  memorization: { icon: "🧠", labelKey: "library.catMemorization" },
  history: { icon: "🕌", labelKey: "library.catHistory" },
  kids: { icon: "🌟", labelKey: "library.catKids" },
  general: { icon: "📚", labelKey: "library.catGeneral" },
};

export default function QuranLibraryPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedLang, setSelectedLang] = useState("all");
  const [selectedCat, setSelectedCat] = useState("all");
  const [search, setSearch] = useState("");
  const [playing, setPlaying] = useState<{ playlistId: string; title: string } | null>(null);

  const filtered = useMemo(() => {
    return QURAN_PLAYLISTS.filter((p) => {
      if (selectedLang !== "all" && p.language !== selectedLang) return false;
      if (selectedCat !== "all" && p.category !== selectedCat) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q) && !p.channel.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [selectedLang, selectedCat, search]);

  const totalVideos = QURAN_PLAYLISTS.reduce((acc, p) => acc + p.videoCount, 0);

  return (
    <PageBackground intensity="subtle">
      <SEOHead title={t("library.title")} description={t("library.subtitle")} path="/library" />
      <div className="min-h-screen pb-24">
        {/* Header */}
        <div className="px-5 pt-12 pb-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <ArrowLeft size={14} /> {t("common.back")}
          </button>
          <h1 className="text-xl font-bold text-foreground">📚 {t("library.title")}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {QURAN_PLAYLISTS.length} {t("library.playlists")} · {totalVideos}+ {t("library.videos")}
          </p>
        </div>

        {/* Search */}
        <div className="px-5 mb-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("library.search")}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Lang filter */}
        <div className="px-5 mb-2 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <FilterChip active={selectedLang === "all"} onClick={() => setSelectedLang("all")}>🌍 {t("library.allLanguages")}</FilterChip>
          {Object.entries(PLAYLIST_LANGUAGE_CONFIG).map(([code, cfg]) => (
            <FilterChip key={code} active={selectedLang === code} onClick={() => setSelectedLang(code)}>
              {cfg.flag} {cfg.nativeName}
            </FilterChip>
          ))}
        </div>

        {/* Category filter */}
        <div className="px-5 mb-4 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <FilterChip active={selectedCat === "all"} onClick={() => setSelectedCat("all")}>📚 {t("library.allCategories")}</FilterChip>
          {Object.entries(CATEGORY_CONFIG).map(([code, cfg]) => (
            <FilterChip key={code} active={selectedCat === code} onClick={() => setSelectedCat(code)}>
              {cfg.icon} {t(cfg.labelKey)}
            </FilterChip>
          ))}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <span className="text-4xl mb-2">🔍</span>
            <p className="text-sm">{t("library.noResults")}</p>
          </div>
        ) : (
          <div className="px-5 grid grid-cols-1 gap-3">
            {filtered.map((pl, i) => (
              <PlaylistCard key={pl.id} playlist={pl} index={i} t={t} onPlay={() => setPlaying({ playlistId: pl.youtubePlaylistId, title: pl.title })} />
            ))}
          </div>
        )}
      </div>

      {playing && (
        <YouTubePlayer playlistId={playing.playlistId} title={playing.title} onClose={() => setPlaying(null)} />
      )}
    </PageBackground>
  );
}

function PlaylistCard({ playlist, index, t, onPlay }: { playlist: QuranPlaylist; index: number; t: (k: string) => string; onPlay: () => void }) {
  const catCfg = CATEGORY_CONFIG[playlist.category];
  const langCfg = PLAYLIST_LANGUAGE_CONFIG[playlist.language];
  const levelLabel = t(`library.${playlist.level}`);

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileTap={{ scale: 0.98 }}
      onClick={onPlay}
      className="flex gap-3 rounded-xl bg-card border border-border p-3 text-left w-full hover:border-primary/40 transition-colors"
    >
      {/* Thumbnail */}
      <div className="relative w-28 h-20 shrink-0 rounded-lg overflow-hidden bg-muted">
        <img
          src={playlist.thumbnail}
          alt={playlist.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Play size={20} className="text-white fill-white" />
        </div>
        <span className="absolute bottom-1 right-1 text-[9px] bg-black/70 text-white px-1 rounded">
          {playlist.videoCount} {t("library.videos")}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-foreground line-clamp-2">{playlist.title}</p>
        <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">📺 {playlist.channel}</p>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{catCfg.icon} {t(catCfg.labelKey)}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{langCfg.flag}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{levelLabel}</span>
        </div>
      </div>
    </motion.button>
  );
}

function FilterChip({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap text-[10px] px-3 py-1.5 rounded-full border transition-colors shrink-0 ${
        active ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/40"
      }`}
    >
      {children}
    </button>
  );
}
