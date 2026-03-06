import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Download } from "lucide-react";

interface OfflineDownloadPromptProps {
  onDownload: (juzList: number[]) => void;
  onDismiss: () => void;
  downloadedJuz: number[];
}

export default function OfflineDownloadPrompt({ onDownload, onDismiss, downloadedJuz }: OfflineDownloadPromptProps) {
  return (
    <Sheet open onOpenChange={(open) => !open && onDismiss()}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 justify-center">
            <Download size={20} />
            Lire le Coran sans connexion
          </SheetTitle>
        </SheetHeader>

        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Téléchargez vos Juz favoris pour lire hors ligne.
            Parfait en avion, voyage, ou zone sans réseau.
          </p>
          <p className="text-xs text-muted-foreground text-center">
            ~10 MB par Juz (images)
          </p>

          {/* Quick options */}
          <div className="flex gap-2">
            <button
              onClick={() => onDownload([30])}
              disabled={downloadedJuz.includes(30)}
              className="flex-1 py-2.5 rounded-xl border border-border hover:bg-accent/40 text-sm font-medium transition-colors disabled:opacity-40"
            >
              Juz 30
            </button>
            <button
              onClick={() => onDownload([1, 2, 3, 4, 5])}
              className="flex-1 py-2.5 rounded-xl border border-border hover:bg-accent/40 text-sm font-medium transition-colors"
            >
              Juz 1-5
            </button>
            <button
              onClick={() => onDownload(Array.from({ length: 30 }, (_, i) => i + 1))}
              className="flex-1 py-2.5 rounded-xl border border-border hover:bg-accent/40 text-sm font-medium transition-colors"
            >
              Tout
            </button>
          </div>

          <button
            onClick={() => onDismiss()}
            className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Plus tard
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
