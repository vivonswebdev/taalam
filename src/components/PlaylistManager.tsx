import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ListMusic, Trash2, Play } from "lucide-react";
import { useGlobalAudio, type PlaylistItem } from "@/hooks/useGlobalAudio";
import { useLanguage } from "@/hooks/useLanguage";

interface Props {
  trigger: React.ReactNode;
}

export default function PlaylistManager({ trigger }: Props) {
  const { t } = useLanguage();
  const { state, removeFromPlaylist, clearPlaylist, playFromPlaylist } = useGlobalAudio();

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="max-h-[70vh] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ListMusic size={18} />
            {t("player.playlist") || "Playlist"}
            {state.playlist.length > 0 && (
              <span className="text-xs text-muted-foreground ml-auto">
                {state.playlist.length} {t("player.surahs") || "sourate(s)"}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {state.playlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm">
            <ListMusic size={32} className="mb-2 opacity-40" />
            <p>{t("player.emptyPlaylist") || "La playlist est vide"}</p>
          </div>
        ) : (
          <div className="space-y-1 mt-3 max-h-[45vh] overflow-y-auto">
            {state.playlist.map((item: PlaylistItem, idx: number) => (
              <div
                key={`${item.surahNumber}-${idx}`}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                  idx === state.currentPlaylistIndex ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/40"
                }`}
              >
                <button
                  onClick={() => playFromPlaylist(idx)}
                  className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0"
                >
                  <Play size={14} className="ml-0.5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.surahName}</p>
                  <p className="text-xs text-muted-foreground font-arabic">{item.surahNameArabic}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.totalAyahs} āyāt</span>
                <button
                  onClick={() => removeFromPlaylist(idx)}
                  className="w-7 h-7 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {state.playlist.length > 0 && (
          <button
            onClick={clearPlaylist}
            className="mt-3 w-full text-center text-xs text-destructive hover:underline py-2"
          >
            {t("player.clearPlaylist") || "Vider la playlist"}
          </button>
        )}
      </SheetContent>
    </Sheet>
  );
}
