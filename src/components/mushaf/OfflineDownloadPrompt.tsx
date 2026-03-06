import { useState, useRef } from 'react';
import { Download, CheckCircle2, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { downloadFullQuran } from '@/lib/quranV4API';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';

interface OfflineDownloadPromptProps {
  open: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export default function OfflineDownloadPrompt({
  open,
  onComplete,
  onSkip,
}: OfflineDownloadPromptProps) {
  const { t } = useLanguage();
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadedPages, setDownloadedPages] = useState(0);
  const abortRef = useRef({ aborted: false });
  const TOTAL_PAGES = 604;

  const handleDownload = async () => {
    setIsDownloading(true);
    abortRef.current = { aborted: false };

    try {
      await downloadFullQuran((downloaded, total) => {
        setDownloadedPages(downloaded);
        setProgress(Math.round((downloaded / total) * 100));
      }, abortRef.current);

      toast.success(t("mushaf.downloadComplete" as any) || '✅ Coran téléchargé !', {
        description: t("mushaf.downloadCompleteDesc" as any) || '604 pages prêtes hors ligne'
      });

      localStorage.setItem('mushaf_v2_downloaded', 'true');
      onComplete();
    } catch (error) {
      console.error('Download failed:', error);
      if (!abortRef.current.aborted) {
        toast.error(t("mushaf.downloadError" as any) || '❌ Erreur de téléchargement', {
          description: t("mushaf.downloadErrorDesc" as any) || 'Vérifiez votre connexion'
        });
      }
      setIsDownloading(false);
    }
  };

  const handleCancel = () => {
    abortRef.current.aborted = true;
    setIsDownloading(false);
    setProgress(0);
    setDownloadedPages(0);
  };

  const handleSkip = () => {
    localStorage.setItem('mushaf_v2_download_skipped', 'true');
    onSkip();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isDownloading && onSkip()}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Download size={18} className="text-primary" />
            {t("mushaf.downloadTitle" as any) || 'Télécharger le Coran complet'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t("mushaf.downloadDesc" as any) || 'Téléchargez les 604 pages (~15 MB) pour une lecture fluide hors ligne avec tajwid, traduction et audio.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {isDownloading ? (
            <div className="space-y-3">
              <Progress value={progress} className="h-3" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {t("mushaf.page" as any)} {downloadedPages} / {TOTAL_PAGES}
                </span>
                <span className="font-bold text-primary">{progress}%</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 size={14} className="animate-spin" />
                {t("mushaf.downloading" as any) || 'Téléchargement en cours...'}
              </div>
              <Button variant="ghost" onClick={handleCancel} className="w-full" size="sm">
                <X size={14} className="mr-1" />
                {t("common.cancel" as any) || 'Annuler'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-muted">
                  <p className="text-lg font-bold text-primary">604</p>
                  <p className="text-[10px] text-muted-foreground">{t("mushaf.page" as any) || 'Pages'}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted">
                  <p className="text-lg font-bold text-primary">~15</p>
                  <p className="text-[10px] text-muted-foreground">MB</p>
                </div>
                <div className="p-3 rounded-xl bg-muted">
                  <p className="text-lg font-bold text-primary">100%</p>
                  <p className="text-[10px] text-muted-foreground">Offline</p>
                </div>
              </div>

              <Button onClick={handleDownload} className="w-full gap-2">
                <Download size={16} />
                {t("mushaf.downloadNow" as any) || 'Télécharger maintenant'}
              </Button>
              <Button variant="ghost" onClick={handleSkip} className="w-full" size="sm">
                {t("mushaf.skipDownload" as any) || 'Passer (lecture en ligne)'}
              </Button>
              <p className="text-[10px] text-muted-foreground text-center">
                {t("mushaf.downloadLater" as any) || 'Vous pourrez télécharger plus tard depuis les Paramètres'}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
