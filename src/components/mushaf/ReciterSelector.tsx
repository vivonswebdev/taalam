import { useState, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Play, Pause, Check } from "lucide-react";
import { RECITERS } from "@/hooks/useMushafAudio";

interface ReciterSelectorProps {
  onSelect: (id: string) => void;
  onDismiss: () => void;
}

export default function ReciterSelector({ onSelect, onDismiss }: ReciterSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const previewReciter = (id: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    if (previewId === id) {
      setPreviewId(null);
      return;
    }
    setPreviewId(id);
    const audio = new Audio(`https://everyayah.com/data/${id}/001001.mp3`);
    audioRef.current = audio;
    audio.onended = () => setPreviewId(null);
    audio.play().catch(() => setPreviewId(null));
    // Auto-stop after 5s
    setTimeout(() => {
      if (audioRef.current === audio) {
        audio.pause();
        setPreviewId(null);
      }
    }, 5000);
  };

  const handleConfirm = () => {
    if (selected) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
      onSelect(selected);
    }
  };

  return (
    <Sheet open onOpenChange={(open) => {
      if (!open) {
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
        onDismiss();
      }
    }}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh]">
        <SheetHeader>
          <SheetTitle className="text-center">Choisissez votre récitant</SheetTitle>
          <p className="text-xs text-muted-foreground text-center">Vous pourrez le changer à tout moment</p>
        </SheetHeader>

        <div className="py-4 space-y-2 max-h-[50vh] overflow-y-auto">
          {RECITERS.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelected(r.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                selected === r.id
                  ? "border-green-500 bg-green-500/10"
                  : "border-border hover:bg-accent/40"
              }`}
            >
              <span className="text-xl">{r.flag}</span>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold">{r.name}</p>
                <p className="text-[11px] text-muted-foreground">{r.style}</p>
              </div>

              {/* Preview button */}
              <button
                onClick={(e) => { e.stopPropagation(); previewReciter(r.id); }}
                className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0"
              >
                {previewId === r.id ? <Pause size={14} className="text-primary" /> : <Play size={14} className="text-primary" />}
              </button>

              {/* Selected check */}
              {selected === r.id && (
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selected}
          className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Confirmer
        </button>
      </SheetContent>
    </Sheet>
  );
}
