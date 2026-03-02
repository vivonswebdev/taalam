import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface MicPermissionHelpProps {
  open: boolean;
  onClose: () => void;
}

export default function MicPermissionHelp({ open, onClose }: MicPermissionHelpProps) {
  const { t } = useLanguage();
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <AlertCircle size={18} className="text-destructive" />
            {t("tarteel.micHelpTitle" as any)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          {/* Chrome Desktop */}
          <div className="space-y-1">
            <p className="font-bold">🖥️ Chrome / Edge</p>
            <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
              <li>{t("tarteel.micStep1" as any)}</li>
              <li>{t("tarteel.micStep2" as any)}</li>
              <li>{t("tarteel.micStep3" as any)}</li>
              <li>{t("tarteel.micStep4" as any)}</li>
            </ol>
          </div>

          {isIOS && (
            <div className="space-y-1">
              <p className="font-bold">📱 Safari (iPhone/iPad)</p>
              <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
                <li>{t("tarteel.micIOS1" as any)}</li>
                <li>{t("tarteel.micIOS2" as any)}</li>
                <li>{t("tarteel.micIOS3" as any)}</li>
                <li>{t("tarteel.micIOS4" as any)}</li>
              </ol>
            </div>
          )}

          {isAndroid && (
            <div className="space-y-1">
              <p className="font-bold">📱 Chrome (Android)</p>
              <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
                <li>{t("tarteel.micAndroid1" as any)}</li>
                <li>{t("tarteel.micAndroid2" as any)}</li>
                <li>{t("tarteel.micAndroid3" as any)}</li>
              </ol>
            </div>
          )}

          <p className="text-muted-foreground bg-muted/50 rounded-lg p-2">
            💡 {t("tarteel.micRefresh" as any)}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
